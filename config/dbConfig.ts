/**
 * Centralized Database Configuration
 * Store all database table names and configurations in one place for easy management
 */

export const dbConfig = {
  // Table names
  tables: {
    users: 'users',
    profiles: 'profiles',
    addresses: 'addresses',
    payment_methods: 'payment_methods',
    orders: 'orders',
    order_items: 'order_items',
    products: 'products',
    categories: 'categories',
    reviews: 'reviews',
    notifications: 'notifications',
    sessions: 'sessions',
    user_preferences: 'user_preferences',
    security_settings: 'security_settings',
    connected_apps: 'connected_apps',
    devices: 'devices',
    activity_logs: 'activity_logs',
    subscriptions: 'subscriptions',
    wishlist: 'wishlist',
    cart: 'cart',
    wallet: 'wallet',
    rewards: 'rewards',
  },

  // Column names for common tables
  columns: {
    users: {
      id: 'id',
      email: 'email',
      username: 'username',
      password_hash: 'password_hash',
      created_at: 'created_at',
      updated_at: 'updated_at',
      last_login: 'last_login',
      is_active: 'is_active',
      email_verified: 'email_verified',
      phone_verified: 'phone_verified',
    },
    profiles: {
      id: 'id',
      user_id: 'user_id',
      first_name: 'first_name',
      last_name: 'last_name',
      display_name: 'display_name',
      bio: 'bio',
      avatar_url: 'avatar_url',
      birth_date: 'birth_date',
      gender: 'gender',
      timezone: 'timezone',
      locale: 'locale',
    },
    addresses: {
      id: 'id',
      user_id: 'user_id',
      street: 'street',
      city: 'city',
      state: 'state',
      zip_code: 'zip_code',
      country: 'country',
      is_default: 'is_default',
      address_type: 'address_type',
    },
    payment_methods: {
      id: 'id',
      user_id: 'user_id',
      type: 'type',
      provider: 'provider',
      masked_number: 'masked_number',
      expiry_month: 'expiry_month',
      expiry_year: 'expiry_year',
      is_default: 'is_default',
      created_at: 'created_at',
    },
    orders: {
      id: 'id',
      user_id: 'user_id',
      order_number: 'order_number',
      status: 'status',
      total_amount: 'total_amount',
      currency: 'currency',
      created_at: 'created_at',
      updated_at: 'updated_at',
    },
  },

  // Database connection settings
  connection: {
    host: 'localhost', // Default host - can be overridden in environment
    port: 5432, // Default PostgreSQL port
    database: 'zpria_account_db', // Default database name
    username: 'postgres', // Default username
    password: '', // Default password
    ssl: false, // SSL setting
  },

  // Supabase configuration
  supabase: {
    url: 'https://ojiswabilogpeidzhidu.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaXN3YWJpbG9ncGVpZHpoaWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNzQ4NDAsImV4cCI6MjA4NDg1MDg0MH0.VF0JsThZjrGgCe9kQHrf5mdrwpwE4ZWwmtn20B64l30',
  },

  // Query configuration
  query: {
    defaultLimit: 20,
    maxLimit: 100,
    timeout: 30000, // 30 seconds
  },

  // Indexes configuration
  indexes: {
    users: {
      email: 'idx_users_email',
      username: 'idx_users_username',
      created_at: 'idx_users_created_at',
    },
    profiles: {
      user_id: 'idx_profiles_user_id',
    },
    addresses: {
      user_id: 'idx_addresses_user_id',
      is_default: 'idx_addresses_is_default',
    },
  },
};

// Export specific table names as constants for convenience
export const TABLES = dbConfig.tables;

// Export commonly used column sets
export const USER_COLUMNS = dbConfig.columns.users;
export const PROFILE_COLUMNS = dbConfig.columns.profiles;
export const ADDRESS_COLUMNS = dbConfig.columns.addresses;
export const PAYMENT_METHOD_COLUMNS = dbConfig.columns.payment_methods;
export const ORDER_COLUMNS = dbConfig.columns.orders;