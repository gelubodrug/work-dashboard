/**
 * Normalizes a county name by capitalizing the first letter of each word
 * and converting the rest to lowercase
 */
export function normalizeCountyName(county: string): string {
  if (!county) return ""

  return county
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

/**
 * Performs a case-insensitive comparison of two strings
 */
export function equalsIgnoreCase(str1: string, str2: string): boolean {
  return str1.toLowerCase() === str2.toLowerCase()
}
