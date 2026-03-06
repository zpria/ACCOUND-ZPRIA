/**
 * Database Operations Test Suite
 * Comprehensive tests for all database operations
 */

import { supabase } from '../services/supabaseService';
import { dbConfig } from '../config';

describe('Database Operations', () => {
  
  describe('User Operations', () => {
    
    test('should create a new user', async () => {
      const mockUser = global.createMockUser();
      
      const result = await supabase
        .from(dbConfig.tables.users)
        .insert(mockUser)
        .select()
        .single();
      
      expect(result.data).toBeDefined();
      expect(result.data?.username).toBe(mockUser.username);
      expect(result.data?.email).toBe(mockUser.email);
    });
    
    test('should find user by username', async () => {
      const mockUser = global.createMockUser();
      
      const result = await supabase
        .from(dbConfig.tables.users)
        .select('*')
        .eq('username', mockUser.username)
        .maybeSingle();
      
      expect(result).toBeDefined();
    });
    
    test('should update user profile', async () => {
      const mockUser = global.createMockUser();
      const updateData = {
        first_name: 'Updated Name',
        updated_at: new Date().toISOString()
      };
      
      const result = await supabase
        .from(dbConfig.tables.users)
        .update(updateData)
        .eq('id', mockUser.id)
        .select()
        .single();
      
      expect(result.data?.first_name).toBe(updateData.first_name);
    });
    
    test('should delete user', async () => {
      const mockUser = global.createMockUser();
      
      const result = await supabase
        .from(dbConfig.tables.users)
        .delete()
        .eq('id', mockUser.id);
      
      expect(result.error).toBeNull();
    });
  });
  
  describe('Product Operations', () => {
    
    test('should create a new product', async () => {
      const mockProduct = global.createMockProduct();
      
      const result = await supabase
        .from(dbConfig.tables.zipra_products)
        .insert(mockProduct)
        .select()
        .single();
      
      expect(result.data).toBeDefined();
      expect(result.data?.product_name).toBe(mockProduct.product_name);
    });
    
    test('should get all active products', async () => {
      const result = await supabase
        .from(dbConfig.tables.zipra_products)
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
    
    test('should update product inventory', async () => {
      const mockProduct = global.createMockProduct();
      
      const result = await supabase
        .from(dbConfig.tables.zipra_products)
        .update({ total_users: 100 })
        .eq('product_id', mockProduct.product_id)
        .select()
        .single();
      
      expect(result.data?.total_users).toBe(100);
    });
  });
  
  describe('Order Operations', () => {
    
    test('should create a new order', async () => {
      const mockUser = global.createMockUser();
      const orderData = {
        user_id: mockUser.id,
        order_number: `ORD-${Date.now()}`,
        status: 'pending',
        total_amount: 99.99,
        subtotal: 89.99,
        tax_amount: 10.00,
        shipping_cost: 0,
        discount_amount: 0,
        payment_status: 'pending'
      };
      
      const result = await supabase
        .from(dbConfig.tables.orders)
        .insert(orderData)
        .select()
        .single();
      
      expect(result.data).toBeDefined();
      expect(result.data?.order_number).toBe(orderData.order_number);
      expect(result.data?.total_amount).toBe(orderData.total_amount);
    });
    
    test('should add items to order', async () => {
      const mockProduct = global.createMockProduct();
      const orderData = {
        order_id: 'test-order-id',
        product_id: mockProduct.product_id,
        quantity: 2,
        unit_price: 49.99,
        total_price: 99.98
      };
      
      const result = await supabase
        .from(dbConfig.tables.order_items)
        .insert(orderData)
        .select()
        .single();
      
      expect(result.data).toBeDefined();
      expect(result.data?.quantity).toBe(2);
    });
  });
  
  describe('AI Operations', () => {
    
    test('should create AI conversation', async () => {
      const mockUser = global.createMockUser();
      const conversationData = {
        user_id: mockUser.id,
        title: 'Test Conversation',
        model: 'gpt-4',
        total_messages: 1,
        total_tokens: 100
      };
      
      const result = await supabase
        .from(dbConfig.tables.ai_conversations)
        .insert(conversationData)
        .select()
        .single();
      
      expect(result.data).toBeDefined();
      expect(result.data?.title).toBe('Test Conversation');
    });
    
    test('should save chat message', async () => {
      const conversationId = 'test-conversation-id';
      const messageData = {
        conversation_id: conversationId,
        role: 'user',
        content: 'Test message',
        tokens_used: 50
      };
      
      const result = await supabase
        .from(dbConfig.tables.ai_messages)
        .insert(messageData)
        .select()
        .single();
      
      expect(result.data).toBeDefined();
      expect(result.data?.content).toBe('Test message');
    });
    
    test('should get user chat history', async () => {
      const mockUser = global.createMockUser();
      
      const result = await supabase
        .from(dbConfig.tables.ai_chat_history)
        .select('*')
        .eq('user_id', mockUser.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
  
  describe('Authentication Operations', () => {
    
    test('should create OTP verification', async () => {
      const otpData = {
        email: 'test@example.com',
        otp_code: '123456',
        purpose: 'registration',
        expires_at: new Date(Date.now() + 300000).toISOString() // 5 minutes
      };
      
      const result = await supabase
        .from(dbConfig.tables.otp_verifications)
        .insert(otpData)
        .select()
        .single();
      
      expect(result.data).toBeDefined();
      expect(result.data?.otp_code).toBe('123456');
    });
    
    test('should create user session', async () => {
      const mockUser = global.createMockUser();
      const sessionData = {
        user_id: mockUser.id,
        session_token: `token-${Date.now()}`,
        is_current: true,
        expires_at: new Date(Date.now() + 86400000).toISOString() // 24 hours
      };
      
      const result = await supabase
        .from(dbConfig.tables.user_sessions)
        .insert(sessionData)
        .select()
        .single();
      
      expect(result.data).toBeDefined();
      expect(result.data?.session_token).toContain('token-');
    });
    
    test('should register user device', async () => {
      const mockUser = global.createMockUser();
      const deviceData = {
        user_id: mockUser.id,
        device_name: 'Test Device',
        device_type: 'desktop',
        browser: 'Chrome',
        os: 'Windows',
        is_trusted: true,
        is_current: true
      };
      
      const result = await supabase
        .from(dbConfig.tables.user_devices)
        .insert(deviceData)
        .select()
        .single();
      
      expect(result.data).toBeDefined();
      expect(result.data?.device_name).toBe('Test Device');
    });
  });
  
  describe('Cart Operations', () => {
    
    test('should add item to cart', async () => {
      const mockUser = global.createMockUser();
      const mockProduct = global.createMockProduct();
      const cartData = {
        user_id: mockUser.id,
        product_id: mockProduct.product_id,
        quantity: 1
      };
      
      const result = await supabase
        .from(dbConfig.tables.user_carts)
        .insert(cartData)
        .select()
        .single();
      
      expect(result.data).toBeDefined();
      expect(result.data?.quantity).toBe(1);
    });
    
    test('should update cart item quantity', async () => {
      const cartItemId = 'test-cart-item-id';
      
      const result = await supabase
        .from(dbConfig.tables.user_carts)
        .update({ 
          quantity: 3,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartItemId)
        .select()
        .single();
      
      expect(result.data?.quantity).toBe(3);
    });
    
    test('should get user cart items', async () => {
      const mockUser = global.createMockUser();
      
      const result = await supabase
        .from(dbConfig.tables.user_carts)
        .select('*')
        .eq('user_id', mockUser.id);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
  
  describe('Address Operations', () => {
    
    test('should add user address', async () => {
      const mockUser = global.createMockUser();
      const addressData = {
        user_id: mockUser.id,
        full_name: 'John Doe',
        phone: '+1234567890',
        address_line_1: '123 Main St',
        city: 'Test City',
        country: 'Test Country',
        is_default: true
      };
      
      const result = await supabase
        .from(dbConfig.tables.user_addresses)
        .insert(addressData)
        .select()
        .single();
      
      expect(result.data).toBeDefined();
      expect(result.data?.full_name).toBe('John Doe');
    });
    
    test('should get default address', async () => {
      const mockUser = global.createMockUser();
      
      const result = await supabase
        .from(dbConfig.tables.user_addresses)
        .select('*')
        .eq('user_id', mockUser.id)
        .eq('is_default', true)
        .maybeSingle();
      
      expect(result).toBeDefined();
    });
  });
  
  describe('Notification Operations', () => {
    
    test('should send notification', async () => {
      const mockUser = global.createMockUser();
      const notificationData = {
        user_id: mockUser.id,
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test notification',
        priority: 'medium'
      };
      
      const result = await supabase
        .from(dbConfig.tables.notifications)
        .insert(notificationData)
        .select()
        .single();
      
      expect(result.data).toBeDefined();
      expect(result.data?.title).toBe('Test Notification');
    });
    
    test('should mark notification as read', async () => {
      const notificationId = 'test-notification-id';
      
      const result = await supabase
        .from(dbConfig.tables.notifications)
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .select()
        .single();
      
      expect(result.data?.is_read).toBe(true);
    });
  });
  
  describe('Analytics Operations', () => {
    
    test('should log system health', async () => {
      const healthData = {
        service_name: 'api',
        status: 'healthy',
        response_time_ms: 150,
        checked_at: new Date().toISOString()
      };
      
      const result = await supabase
        .from(dbConfig.tables.system_health_logs)
        .insert(healthData)
        .select()
        .single();
      
      expect(result.data).toBeDefined();
      expect(result.data?.status).toBe('healthy');
    });
    
    test('should log user activity', async () => {
      const mockUser = global.createMockUser();
      const activityData = {
        user_id: mockUser.id,
        action: 'login',
        ip_address: '192.168.1.1'
      };
      
      const result = await supabase
        .from(dbConfig.tables.user_activity_logs)
        .insert(activityData)
        .select()
        .single();
      
      expect(result.data).toBeDefined();
      expect(result.data?.action).toBe('login');
    });
  });
});
