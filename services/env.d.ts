interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_STABILITY_API_KEY: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}