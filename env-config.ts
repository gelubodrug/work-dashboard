// Environment variables configuration

// Database URLs
export const DATABASE_URL = process.env.DATABASE_URL
export const POSTGRES_URL = process.env.POSTGRES_URL
export const POSTGRES_PRISMA_URL = process.env.POSTGRES_PRISMA_URL
export const POSTGRES_URL_NON_POOLING = process.env.POSTGRES_URL_NON_POOLING

// Database credentials
export const POSTGRES_USER = process.env.POSTGRES_USER
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD
export const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE

// Additional Postgres-related variables
export const PGHOST = process.env.PGHOST
export const PGPASSWORD = process.env.PGPASSWORD
export const PGDATABASE = process.env.PGDATABASE
export const PGHOST_UNPOOLED = process.env.PGHOST_UNPOOLED
export const PGUSER = process.env.PGUSER

// Other configuration variables
export const POSTGRES_URL_NO_SSL = process.env.POSTGRES_URL_NO_SSL
export const POSTGRES_HOST = process.env.POSTGRES_HOST
export const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
export const VERCEL_ENV = process.env.VERCEL_ENV
export const VERCEL_URL = process.env.VERCEL_URL
export const NEXT_PUBLIC_VERCEL_URL = process.env.NEXT_PUBLIC_VERCEL_URL

// Function to validate required environment variables
export function validateEnvVariables() {
  const requiredVariables = [
    "DATABASE_URL",
    "POSTGRES_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL_NON_POOLING",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_DATABASE",
  ]

  const missingVariables = requiredVariables.filter((variable) => !process.env[variable])

  if (missingVariables.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVariables.join(", ")}`)
  }
}

// Example usage of the validation function
// Uncomment the following line to use it
// validateEnvVariables()

