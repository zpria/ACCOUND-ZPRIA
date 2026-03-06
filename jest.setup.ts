/**
 * Jest Setup File
 * Global test configuration and mocks
 */

// Mock Supabase client
jest.mock('./services/supabaseService', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis()
  }
}));

// Mock environment variables
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

// Global timeout for async tests
jest.setTimeout(30000);

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Helper function to create mock user data
global.createMockUser = () => ({
  id: `user-${Date.now()}`,
  username: `testuser${Date.now()}`,
  login_id: `test${Date.now()}@prigod.com`,
  email: `test${Date.now()}@example.com`,
  first_name: 'Test',
  last_name: 'User',
  password_hash: 'a'.repeat(64), // SHA-256 hash
  address: '123 Test Street',
  dob: '2000-01-01',
  gender: 'Male',
  country: 'Test Country',
  city: 'Test City'
});

// Helper function to create mock product data
global.createMockProduct = () => ({
  product_id: `prod-${Date.now()}`,
  product_name: 'Test Product',
  product_url: 'https://example.com/product',
  description: 'Test product description',
  product_type: 'software',
  type_label: 'Software',
  tags: 'test,demo',
  is_active: true,
  display_order: 1
});

console.log('✓ Jest setup complete');
