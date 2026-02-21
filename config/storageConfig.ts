/**
 * Centralized Storage Configuration
 * Store all storage system configurations in one place for easy management
 */

export const storageConfig = {
  // Primary Storage System (Cloud-based)
  primaryStorage: {
    provider: 'aws-s3', // Options: aws-s3, google-cloud, azure-blob
    bucketName: 'zpria-primary-storage', // Default bucket name - can be overridden in environment
    region: 'us-east-1', // Default region - can be overridden in environment
    accessKeyId: '', // Default access key - can be overridden in environment
    secretAccessKey: '', // Default secret key - can be overridden in environment
    endpoint: 'https://s3.amazonaws.com', // Default endpoint - can be overridden in environment
    maxFileSizeMB: 50,
    allowedFileTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/zip'
    ],
    corsPolicy: [
      {
        allowedOrigins: ['*'],
        allowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        allowedHeaders: ['*'],
        maxAgeSeconds: 3000
      }
    ],
    cacheControl: 'public, max-age=31536000', // 1 year
    compressionEnabled: true,
    encryptionEnabled: true,
  },

  // Secondary Storage System (Local/File System)
  secondaryStorage: {
    provider: 'local', // Options: local, ftp, scp
    basePath: './uploads', // Default path - can be overridden in environment
    maxFileSizeMB: 100,
    allowedFileTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/zip', 'video/mp4', 'video/quicktime'
    ],
    cleanupIntervalHours: 24, // Hours between cleanup operations
    retentionDays: 30, // Days to retain files before auto-deletion
    backupEnabled: true,
    backupFrequency: 'daily', // Options: hourly, daily, weekly
  },

  // CDN Configuration
  cdn: {
    enabled: true,
    provider: 'cloudflare', // Options: cloudflare, akamai, aws-cloudfront
    domain: 'cdn.zpria.com', // Default domain - can be overridden in environment
    cacheTtl: 3600, // Time to live in seconds
    maxAge: 2592000, // Max age in seconds (30 days)
    gzipCompression: true,
    imageOptimization: true,
    videoStreaming: true,
  },

  // Upload Configuration
  upload: {
    chunkSizeMB: 5, // Size of chunks for multipart uploads
    maxConcurrentUploads: 3, // Maximum number of concurrent uploads
    retryAttempts: 3, // Number of retry attempts for failed uploads
    progressUpdateInterval: 1000, // Interval in milliseconds for progress updates
    tempDir: './temp-uploads', // Temporary directory for processing
  },

  // Asset Management
  assets: {
    imageCompressionQuality: 85, // Quality percentage for image compression
    thumbnailSizes: ['150x150', '300x300', '600x600'], // Predefined thumbnail sizes
    videoThumbnailInterval: 5, // Seconds interval for video thumbnails
    metadataExtraction: true,
    automaticTagging: true,
  }
};

// Export storage configuration shortcuts
export const {
  primaryStorage,
  secondaryStorage,
  cdn,
  upload,
  assets
} = storageConfig;

// Export storage paths and settings
export const storagePaths = {
  images: 'assets/images/',
  documents: 'assets/documents/',
  videos: 'assets/videos/',
  avatars: 'user/avatars/',
  backgrounds: 'user/backgrounds/',
  temp: 'temp/',
};

// Export file size limits
export const fileSizeLimits = {
  image: storageConfig.upload.chunkSizeMB * 1024 * 1024, // Convert MB to bytes
  document: storageConfig.primaryStorage.maxFileSizeMB * 1024 * 1024,
  video: storageConfig.secondaryStorage.maxFileSizeMB * 1024 * 1024,
};

// Export allowed file types
export const allowedFileTypes = {
  image: storageConfig.primaryStorage.allowedFileTypes.filter(type => type.startsWith('image')),
  document: storageConfig.primaryStorage.allowedFileTypes.filter(type => type.startsWith('application') || type.startsWith('text')),
  video: ['video/mp4', 'video/quicktime', 'video/webm', 'video/avi']
};