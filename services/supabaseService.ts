
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ojiswabilogpeidzhidu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaXN3YWJpbG9ncGVpZHpoaWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNzQ4NDAsImV4cCI6MjA4NDg1MDg0MH0.VF0JsThZjrGgCe9kQHrf5mdrwpwE4ZWwmtn20B64l30';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function hashPassword(password: string): Promise<string> {
  // Always trim password before hashing to prevent hidden space issues
  const msgUint8 = new TextEncoder().encode(password.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const checkAvailability = async (field: 'username' | 'email', value: string) => {
  const normalizedValue = value.trim().toLowerCase();
  const { data: user } = await supabase.from('users').select('id').eq(field, normalizedValue).maybeSingle();
  return !user;
};

export const handleLoginAttempt = async (identifier: string, passwordHash: string) => {
  const normalizedId = identifier.trim().toLowerCase();
  
  // Find user by username, login_id, mobile, OR email
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .or(`username.eq.${normalizedId},login_id.eq.${normalizedId},mobile.eq.${normalizedId},email.eq.${normalizedId}`)
    .maybeSingle();

  if (!user) throw new Error('ZPRIA Account not found. Please check your credentials.');

  // Check lockout status
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const diff = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000);
    throw new Error(`Account locked for ${diff} minutes due to multiple failures.`);
  }

  if (user.password_hash === passwordHash) {
    // Reset attempts on success
    await supabase.from('users').update({ 
      failed_login_attempts: 0, 
      locked_until: null, 
      last_login: new Date().toISOString() 
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
    
    await supabase.from('users').update(update).eq('id', user.id);
    throw new Error(`Invalid credentials. ${5 - newAttempts} attempts remaining.`);
  }
};
