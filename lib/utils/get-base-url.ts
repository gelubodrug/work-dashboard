export function getBaseUrl() {
  // Check for VERCEL_URL first (production)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Check for NEXT_PUBLIC_VERCEL_URL (preview deployments)
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }

  // Default to localhost in development
  return process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://your-production-url.vercel.app" // Replace with your actual production URL
}

