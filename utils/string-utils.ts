/**
 * Normalizes a county name by capitalizing the first letter of each word
 * and ensuring consistent formatting
 */
export function normalizeCountyName(county: string): string {
  if (!county) return ""

  // Trim whitespace and split into words
  const words = county.trim().split(/\s+/)

  // Capitalize first letter of each word
  const normalized = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")

  return normalized
}

/**
 * Compares two strings ignoring case
 */
export function equalsIgnoreCase(str1: string, str2: string): boolean {
  return str1.toLowerCase() === str2.toLowerCase()
}
