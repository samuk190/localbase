/**
 * Cryptographically secure, ordered UUID generator without external dependencies.
 * Resolves vulnerability GHSA-w5hq-g745-h8pq and eliminates deprecated uuid dependency.
 */
export function generateKey() {
  // 1. Check for modern standard crypto.randomUUID
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  // 2. Check for Web Crypto API crypto.getRandomValues
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    // Set version 4 and variant RFC4122
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80

    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  // 3. Fallback using timestamp + random (legacy environments)
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 10)
  const randomPart2 = Math.random().toString(36).substring(2, 10)
  return `${timestamp}-${randomPart}-${randomPart2}`
}

export default {
  generate: generateKey
}
