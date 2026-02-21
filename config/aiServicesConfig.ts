/**
 * Centralized AI Services Configuration
 * Store all AI service configurations in one place for easy management
 */

export const aiServicesConfig = {
  // Image Generator AI Service
  imageGenerator: {
    apiKey: '', // Default API key - can be overridden in environment
    endpoint: 'https://api.example-image-ai.com/v1/images',
    rateLimit: 10, // requests per minute
    maxRetries: 3,
    timeout: 30000, // 30 seconds
    defaultModel: 'image-generator-v3',
    supportedFormats: ['png', 'jpg', 'jpeg', 'webp'],
    maxSizeMB: 10,
    maxResolution: '4096x4096',
  },

  // Text Analysis AI Service
  textAnalysis: {
    apiKey: '', // Default API key - can be overridden in environment
    endpoint: 'https://api.example-text-ai.com/v1/analyze',
    rateLimit: 50, // requests per minute
    maxRetries: 2,
    timeout: 15000, // 15 seconds
    defaultModel: 'text-analysis-pro-v2',
    supportedLanguages: ['en', 'bn', 'es', 'fr', 'de', 'ja', 'ko', 'zh'],
  },

  // Voice/Speech AI Service
  voiceService: {
    apiKey: '', // Default API key - can be overridden in environment
    endpoint: 'https://api.example-voice-ai.com/v1/speech',
    rateLimit: 20, // requests per minute
    maxRetries: 3,
    timeout: 25000, // 25 seconds
    defaultModel: 'voice-service-v4',
    supportedLanguages: ['en-US', 'en-GB', 'bn-BD', 'es-ES', 'fr-FR'],
    supportedVoices: ['male', 'female', 'neutral'],
  },

  // Recommendation Engine AI
  recommendationEngine: {
    apiKey: '', // Default API key - can be overridden in environment
    endpoint: 'https://api.example-rec-ai.com/v1/recommend',
    rateLimit: 100, // requests per minute
    maxRetries: 1,
    timeout: 10000, // 10 seconds
    defaultModel: 'recommendation-engine-v5',
    maxRecommendations: 20,
  },

  // Natural Language Processing AI
  nlpProcessor: {
    apiKey: '', // Default API key - can be overridden in environment
    endpoint: 'https://api.example-nlp-ai.com/v1/nlp',
    rateLimit: 75, // requests per minute
    maxRetries: 2,
    timeout: 20000, // 20 seconds
    defaultModel: 'nlp-processor-v3',
    supportedFeatures: ['sentiment', 'entities', 'keywords', 'summarization'],
  },

  // Gemini AI Service
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '', // Use environment variable or empty string
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/',
    rateLimit: 60, // requests per minute
    maxRetries: 3,
    timeout: 30000, // 30 seconds
    defaultModel: 'gemini-pro',
    supportedModels: ['gemini-pro', 'gemini-pro-vision'],
  },
};

// Export individual AI service configurations for convenience
export const {
  imageGenerator,
  textAnalysis,
  voiceService,
  recommendationEngine,
  nlpProcessor,
  gemini
} = aiServicesConfig;

// Export API keys separately if needed
export const aiApiKeys = {
  imageGenerator: aiServicesConfig.imageGenerator.apiKey,
  textAnalysis: aiServicesConfig.textAnalysis.apiKey,
  voiceService: aiServicesConfig.voiceService.apiKey,
  recommendationEngine: aiServicesConfig.recommendationEngine.apiKey,
  nlpProcessor: aiServicesConfig.nlpProcessor.apiKey,
  gemini: aiServicesConfig.gemini.apiKey,
};

// Export endpoints separately if needed
export const aiEndpoints = {
  imageGenerator: aiServicesConfig.imageGenerator.endpoint,
  textAnalysis: aiServicesConfig.textAnalysis.endpoint,
  voiceService: aiServicesConfig.voiceService.endpoint,
  recommendationEngine: aiServicesConfig.recommendationEngine.endpoint,
  nlpProcessor: aiServicesConfig.nlpProcessor.endpoint,
  gemini: aiServicesConfig.gemini.endpoint,
};