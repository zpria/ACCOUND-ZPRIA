
import { createClient } from '@supabase/supabase-js';
import { dbConfig, TABLES } from '../config';

export const supabase = createClient(dbConfig.supabase.url, dbConfig.supabase.anonKey);

export async function hashPassword(password: string): Promise<string> {
  // Always trim password before hashing to prevent hidden space issues
  const msgUint8 = new TextEncoder().encode(password.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const checkAvailability = async (field: 'username' | 'email' | 'mobile', value: string) => {
  const normalizedValue = value.trim().toLowerCase();
  
  // For mobile: allow up to 3 accounts per mobile number
  if (field === 'mobile') {
    const { data: users, error } = await supabase.from(TABLES.users).select('id').eq(field, normalizedValue);
    if (error) return false;
    return (users?.length || 0) < 3; // Allow if less than 3 accounts
  }
  
  // For username and email: must be unique
  const { data: user } = await supabase.from(TABLES.users).select('id').eq(field, normalizedValue).maybeSingle();
  return !user;
};

export const handleLoginAttempt = async (identifier: string, passwordHash: string) => {
  const normalizedId = identifier.trim().toLowerCase();

  // Find user by username, login_id, mobile, OR email
  const { data: user, error } = await supabase
    .from(TABLES.users)
    .select('*')
    .or(`username.eq.${normalizedId},login_id.eq.${normalizedId},mobile.eq.${normalizedId},email.eq.${normalizedId}`)
    .maybeSingle();

  if (!user) throw new Error('ZPRIA Account not found. Please check your credentials.');

  // Check if account is deactivated but within recovery window
  if (user.account_status === 'deactivated' && user.scheduled_for_permanent_deletion) {
    const scheduledDeletionDate = new Date(user.scheduled_for_permanent_deletion);
    if (scheduledDeletionDate > new Date()) {
      // Reactivate the account since user is logging in within the recovery window
      await supabase.from(TABLES.users).update({ 
        account_status: 'active',
        deactivated_at: null,
        scheduled_for_permanent_deletion: null,
        failed_login_attempts: 0, 
        locked_until: null, 
        last_login_at: new Date().toISOString(),  // Fixed: Use correct column name 'last_login_at' instead of 'last_login'
        updated_at: new Date().toISOString()
      }).eq('id', user.id);
      
      // Update the user object to reflect the reactivated status
      user.account_status = 'active';
      user.deactivated_at = null;
      user.scheduled_for_permanent_deletion = null;
      user.last_login_at = new Date().toISOString();  // Fixed: Use correct column name 'last_login_at' instead of 'last_login'
      user.updated_at = new Date().toISOString();
    }
  }

  // Check lockout status
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const diff = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000);
    throw new Error(`Account locked for ${diff} minutes due to multiple failures.`);
  }

  // Check if account is still not active after potential reactivation
  if (user.account_status !== 'active') {
    throw new Error('Account is deactivated and may have passed the recovery window. Please contact support.');
  }

  if (user.password_hash === passwordHash) {
    // Reset attempts on success
    await supabase.from(TABLES.users).update({ 
      failed_login_attempts: 0, 
      locked_until: null, 
      last_login_at: new Date().toISOString()  // Fixed: Use correct column name 'last_login_at' instead of 'last_login'
    }).eq('id', user.id);
    return user;
  } else {
    // Increment failed attempts
    const newAttempts = (user.failed_login_attempts || 0) + 1;
    let update: any = { failed_login_attempts: newAttempts };
    
    if (newAttempts >= 5) {
      const lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      update.locked_until = lockUntil;
      throw new Error('Security Protocol: Account locked for 15 minutes.');
    }
    
    await supabase.from(TABLES.users).update(update).eq('id', user.id);
    throw new Error(`Invalid credentials. ${5 - newAttempts} attempts remaining.`);
  }
};
