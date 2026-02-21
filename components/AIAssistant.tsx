
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, User, Bot } from 'lucide-react';
import { supabase } from '../services/supabaseService';
import { dataIds, colors } from '../config';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  userId: string;
  userName: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ userId, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history
  useEffect(() => {
    if (userId) {
      loadChatHistory();
    }
  }, [userId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const { data } = await supabase
        .from('ai_chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (data) {
        setMessages(data.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at)
        })));
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simple rule-based responses (replace with actual AI API call)
    const lowerMsg = userMessage.toLowerCase();
    
    // Account-related responses
    if (lowerMsg.includes('password') || lowerMsg.includes('ভুলে গেছি')) {
      return 'পাসওয়ার্ড রিসেট করতে চাইলে "Forgot Password" অপশনে ক্লিক করুন অথবা আমি আপনাকে Security Settings এ নিয়ে যেতে পারি।';
    }
    
    if (lowerMsg.includes('email') || lowerMsg.includes('ইমেইল')) {
      return 'আপনার ইমেইল পরিবর্তন করতে চান? Profile Settings এ গিয়ে Email section এ আপডেট করতে পারবেন।';
    }
    
    if (lowerMsg.includes('order') || lowerMsg.includes('অর্ডার')) {
      return 'আপনার অর্ডার দেখতে চান? Order History পেজে আপনার সব অর্ডারের তথ্য পাবেন।';
    }
    
    if (lowerMsg.includes('payment') || lowerMsg.includes('পেমেন্ট')) {
      return 'Payment Methods এ গিয়ে আপনি bKash, Nagad, অথবা Card যোগ করতে পারবেন।';
    }
    
    if (lowerMsg.includes('security') || lowerMsg.includes('নিরাপত্তা')) {
      return 'আপনার অ্যাকাউন্টের নিরাপত্তা বাড়াতে Two-Factor Authentication চালু করুন। Security Settings এ পাবেন।';
    }
    
    if (lowerMsg.includes('profile picture') || lowerMsg.includes('ছবি')) {
      return 'আপনার প্রোফাইল ছবি AI দ্বারা অটো-জেনারেট হয়েছে। চাইলে Profile পেজ থেকে পরিবর্তন করতে পারবেন।';
    }
    
    if (lowerMsg.includes('hello') || lowerMsg.includes('হাই') || lowerMsg.includes('আসসালামু')) {
      return `আসসালামু আলাইকুম ${userName}! আমি ZPRIA AI Assistant। আমি কিভাবে সাহায্য করতে পারি?`;
    }
    
    if (lowerMsg.includes('help') || lowerMsg.includes('সাহায্য')) {
      return 'আমি আপনাকে সাহায্য করতে পারি:\n• অ্যাকাউন্ট সেটিংস\n• পাসওয়ার্ড রিসেট\n• অর্ডার ট্র্যাকিং\n• পেমেন্ট মেথড\n• নিরাপত্তা সেটিংস\n\nকী জানতে চান?';
    }
    
    // Default response
    return 'দুঃখিত, আমি সঠিকভাবে বুঝতে পারিনি। আপনি কি অ্যাকাউন্ট, অর্ডার, পেমেন্ট, নাকি নিরাপত্তা সম্পর্কে জানতে চান? অথবা Support পেজে যেতে পারেন।';
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Rate limiting: 1 second between messages
    const now = Date.now();
    if (now - lastMessageTime < 1000) {
      setError('Please wait a moment before sending another message');
      return;
    }

    setError(null);
    setLastMessageTime(now);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Save user message
      const { error: saveError } = await supabase.from('ai_chat_history').insert([{
        user_id: userId,
        role: 'user',
        content: userMessage.content,
        created_at: userMessage.timestamp.toISOString()
      }]);

      if (saveError) throw saveError;

      // Generate AI response
      const aiContent = await generateAIResponse(userMessage.content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save AI message
      const { error: aiSaveError } = await supabase.from('ai_chat_history').insert([{
        user_id: userId,
        role: 'assistant',
        content: aiContent,
        created_at: aiMessage.timestamp.toISOString()
      }]);

      if (aiSaveError) throw aiSaveError;
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#0071e3] to-[#00c6ff] rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform z-50"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0071e3] to-[#00c6ff] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">ZPRIA AI Assistant</h3>
                <p className="text-xs text-white/80">সবসময় সাহায্যে প্রস্তুত</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>আসসালামু আলাইকুম!</p>
                <p className="text-sm">আমি কিভাবে সাহায্য করতে পারি?</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-[#0071e3]'
                      : 'bg-gradient-to-r from-[#0071e3] to-[#00c6ff]'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                    message.role === 'user'
                      ? 'bg-[#0071e3] text-white rounded-br-none'
                      : 'bg-gray-100 text-[#1d1d1f] rounded-bl-none'
                  }`}
                >
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-1' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0071e3] to-[#00c6ff] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-100">
              <p className="text-xs text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(null); }}
                onKeyPress={handleKeyPress}
                placeholder="আপনার প্রশ্ন লিখুন..."
                className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 bg-[#0071e3] text-white rounded-full flex items-center justify-center hover:bg-[#0051a3] transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
