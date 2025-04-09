// Environment variables helper
export const env = {
  // NOTE: This hardcoded fallback is for TESTING ONLY and should be removed for production
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
} 