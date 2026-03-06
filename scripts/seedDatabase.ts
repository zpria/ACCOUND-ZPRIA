/**
 * Database Seed Scripts
 * Populate database with development/test data
 */

import { supabase } from '../services/supabaseService';
import { dbConfig } from '../config';

// Seed data generators
const generateId = () => `seed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const sampleUsers = [
  {
    username: 'john.doe',
    login_id: 'john.doe@prigod.com',
    email: 'john.doe@example.com',
    first_name: 'John',
    last_name: 'Doe',
    password_hash: 'a'.repeat(64),
    address: '123 Main St, New York, NY 10001',
    dob: '1990-05-15',
    gender: 'Male',
    country: 'United States',
    city: 'New York',
    is_email_verified: true,
    account_status: 'active'
  },
  {
    username: 'jane.smith',
    login_id: 'jane.smith@prigod.com',
    email: 'jane.smith@example.com',
    first_name: 'Jane',
    last_name: 'Smith',
    password_hash: 'a'.repeat(64),
    address: '456 Oak Ave, Los Angeles, CA 90001',
    dob: '1992-08-22',
    gender: 'Female',
    country: 'United States',
    city: 'Los Angeles',
    is_email_verified: true,
    account_status: 'active'
  },
  {
    username: 'bob.wilson',
    login_id: 'bob.wilson@prigod.com',
    email: 'bob.wilson@example.com',
    first_name: 'Bob',
    last_name: 'Wilson',
    password_hash: 'a'.repeat(64),
    address: '789 Pine Rd, Chicago, IL 60601',
    dob: '1988-12-10',
    gender: 'Male',
    country: 'United States',
    city: 'Chicago',
    is_email_verified: false,
    account_status: 'active'
  }
];

const sampleProducts = [
  {
    product_id: 'prod-ai-assistant',
    product_name: 'AI Assistant Pro',
    product_url: 'https://example.com/ai-assistant',
    description: 'Advanced AI-powered assistant for productivity',
    product_type: 'software',
    type_label: 'Software',
    tags: 'ai,productivity,assistant',
    is_active: true,
    is_featured: true,
    display_order: 1,
    pricing_type: 'freemium',
    price: 9.99,
    currency: 'USD'
  },
  {
    product_id: 'prod-analytics',
    product_name: 'Analytics Dashboard',
    product_url: 'https://example.com/analytics',
    description: 'Comprehensive analytics and reporting tool',
    product_type: 'software',
    type_label: 'Software',
    tags: 'analytics,dashboard,reporting',
    is_active: true,
    is_featured: false,
    display_order: 2,
    pricing_type: 'paid',
    price: 29.99,
    currency: 'USD'
  }
];

// Seed functions
export const seedUsers = async () => {
  console.log('Seeding users...');
  
  for (const userData of sampleUsers) {
    try {
      const { data, error } = await supabase
        .from(dbConfig.tables.users)
        .insert(userData)
        .select()
        .single();
      
      if (error) throw error;
      console.log(`✓ Created user: ${data.username}`);
    } catch (error) {
      console.error(`✗ Failed to create user ${userData.username}:`, error);
    }
  }
};

export const seedProducts = async () => {
  console.log('Seeding products...');
  
  for (const productData of sampleProducts) {
    try {
      const { data, error } = await supabase
        .from(dbConfig.tables.zipra_products)
        .insert(productData)
        .select()
        .single();
      
      if (error) throw error;
      console.log(`✓ Created product: ${data.product_name}`);
    } catch (error) {
      console.error(`✗ Failed to create product ${productData.product_name}:`, error);
    }
  }
};

export const seedAddresses = async (userId: string) => {
  console.log(`Seeding addresses for user ${userId}...`);
  
  const addresses = [
    {
      user_id: userId,
      full_name: 'John Doe',
      phone: '+1234567890',
      address_line_1: '123 Main Street',
      address_line_2: 'Apt 4B',
      city: 'New York',
      area: 'Manhattan',
      postal_code: '10001',
      country: 'United States',
      is_default: true,
      is_commercial: false
    },
    {
      user_id: userId,
      full_name: 'John Doe',
      phone: '+1987654321',
      address_line_1: '456 Office Park',
      city: 'New York',
      area: 'Brooklyn',
      postal_code: '11201',
      country: 'United States',
      is_default: false,
      is_commercial: true
    }
  ];
  
  for (const addressData of addresses) {
    try {
      const { data, error } = await supabase
        .from(dbConfig.tables.user_addresses)
        .insert(addressData)
        .select()
        .single();
      
      if (error) throw error;
      console.log(`✓ Created address in ${data.city}`);
    } catch (error) {
      console.error(`✗ Failed to create address:`, error);
    }
  }
};

export const seedCartItems = async (userId: string) => {
  console.log(`Seeding cart items for user ${userId}...`);
  
  const cartItems = [
    {
      user_id: userId,
      product_id: 'prod-ai-assistant',
      quantity: 1,
      max_quantity: 5
    },
    {
      user_id: userId,
      product_id: 'prod-analytics',
      quantity: 2,
      max_quantity: 10
    }
  ];
  
  for (const item of cartItems) {
    try {
      const { data, error } = await supabase
        .from(dbConfig.tables.user_carts)
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      console.log(`✓ Added to cart: ${item.product_id}`);
    } catch (error) {
      console.error(`✗ Failed to add cart item:`, error);
    }
  }
};

export const seedAIConversations = async (userId: string) => {
  console.log(`Seeding AI conversations for user ${userId}...`);
  
  const conversations = [
    {
      user_id: userId,
      title: 'Getting Started with AI',
      model: 'gpt-4',
      total_messages: 5,
      total_tokens: 1500,
      is_pinned: true
    },
    {
      user_id: userId,
      title: 'Code Review Help',
      model: 'gpt-4',
      total_messages: 12,
      total_tokens: 3500,
      is_pinned: false
    }
  ];
  
  for (const conv of conversations) {
    try {
      const { data, error } = await supabase
        .from(dbConfig.tables.ai_conversations)
        .insert(conv)
        .select()
        .single();
      
      if (error) throw error;
      console.log(`✓ Created conversation: ${data.title}`);
    } catch (error) {
      console.error(`✗ Failed to create conversation:`, error);
    }
  }
};

// Main seed function
export const runAllSeeds = async () => {
  console.log('\n🌱 Starting database seeding...\n');
  
  try {
    // Seed users
    await seedUsers();
    
    // Seed products
    await seedProducts();
    
    // Get a user ID for related seeds
    const { data: user } = await supabase
      .from(dbConfig.tables.users)
      .select('id')
      .eq('username', 'john.doe')
      .maybeSingle();
    
    if (user) {
      // Seed addresses
      await seedAddresses(user.id);
      
      // Seed cart items
      await seedCartItems(user.id);
      
      // Seed AI conversations
      await seedAIConversations(user.id);
    }
    
    console.log('\n✅ Database seeding completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
};

// Clear all seed data
export const clearSeeds = async () => {
  console.log('\n🗑️  Clearing seed data...\n');
  
  try {
    // Delete in reverse order of dependencies
    await supabase.from(dbConfig.tables.ai_messages).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from(dbConfig.tables.ai_conversations).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from(dbConfig.tables.user_carts).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from(dbConfig.tables.user_addresses).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from(dbConfig.tables.zipra_products).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from(dbConfig.tables.users).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('✅ Seed data cleared successfully!\n');
  } catch (error) {
    console.error('❌ Failed to clear seed data:', error);
    throw error;
  }
};
