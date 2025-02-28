/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        sqlite3: false,
        "better-sqlite3": false,
      }
    }
    config.externals.push("sqlite3", "better-sqlite3")
    return config
  },
}

module.exports = nextConfig

