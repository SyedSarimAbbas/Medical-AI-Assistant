/**
 * Client-side JWT token storage.
 * Uses localStorage so the token persists across tabs and refreshes.
 * Do not store secret keys or sensitive data other than the JWT.
 */

const TOKEN_KEY = 'medical_ai_access_token'

/**
 * Get the stored JWT access token.
 * @returns {string|null} Token or null if not set
 */
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch (e) {
    return null
  }
}

/**
 * Store the JWT access token after successful login.
 * @param {string} token - JWT access token from /login response
 */
export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch (e) {
    console.warn('Could not store token', e)
  }
}

/**
 * Remove the stored token (e.g. on logout).
 */
export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch (e) {
    console.warn('Could not clear token', e)
  }
}

/**
 * Check if the user is considered logged in (has a token).
 * Does not validate the token; that happens on the server.
 * @returns {boolean}
 */
export function isAuthenticated() {
  return Boolean(getToken())
}
