/**
 * API service for backend communication.
 * Handles login and chat requests with JWT Bearer token for protected routes.
 */

import { getToken } from './auth'

const API_BASE = '/api/v1'
const TIMEOUT_MS = 90000 // 90 seconds - model inference can take 30-60s

/**
 * Build headers for authenticated requests (includes Bearer token).
 * @returns {Record<string, string>}
 */
function authHeaders() {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/**
 * Register a new user account.
 * @param {string} username - Username (3-50 characters)
 * @param {string} email - Email address
 * @param {string} password - Password (minimum 8 characters)
 * @returns {Promise<{username: string, email: string, message: string, is_active: boolean}>}
 * @throws {Error} On invalid input or duplicate username/email
 */
export async function register(username, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  })

  if (!res.ok) {
    let detail = `Registration failed (${res.status})`
    try {
      const data = await res.json()
      if (data.detail) {
        detail = typeof data.detail === 'string'
          ? data.detail
          : Array.isArray(data.detail)
            ? data.detail.map((x) => x.msg || x.loc?.join('.')).filter(Boolean).join('; ') || detail
            : detail
      }
    } catch (_) {}
    throw new Error(detail)
  }

  const data = await res.json()
  if (!data.username) throw new Error('Invalid registration response')
  return {
    username: data.username,
    email: data.email,
    message: data.message,
    is_active: data.is_active,
  }
}

/**
 * Login with username and password. Returns access token from server.
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise<{access_token: string, token_type: string}>}
 * @throws {Error} On invalid credentials or network error
 */
export async function login(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    let detail = `Login failed (${res.status})`
    try {
      const data = await res.json()
      if (data.detail) {
        detail = typeof data.detail === 'string'
          ? data.detail
          : Array.isArray(data.detail)
            ? data.detail.map((x) => x.msg || x.loc?.join('.')).filter(Boolean).join('; ') || detail
            : detail
      }
    } catch (_) {}
    throw new Error(detail)
  }

  const data = await res.json()
  if (!data.access_token) throw new Error('Invalid login response')
  return {
    access_token: data.access_token,
    token_type: data.token_type || 'bearer',
  }
}

/**
 * Sends a chat message to the backend (requires JWT).
 * @param {string} message - User message (3–1000 chars)
 * @param {Array} history - Array of previous message objects {role, content}
 * @returns {Promise<{response: string, blocked: boolean}>}
 * @throws {Error} On network failure, server error, or invalid response. 401 throws with message suitable for redirect to login.
 */
export async function sendChatMessage(message, history = []) {
  if (!message || typeof message !== 'string') {
    throw new Error('Invalid message format')
  }

  const cleanHistory = history.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const res = await fetch(`${API_BASE}/chat/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ message, history: cleanHistory }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Handle non-OK response
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      let errMsg = `Server error (${res.status})`
      try {
        const text = await res.text()
        if (text) {
          const json = JSON.parse(text)
          if (json.detail) {
            errMsg = Array.isArray(json.detail)
              ? json.detail[0]?.msg || errMsg
              : json.detail
          }
        }
      } catch (_) {
        errMsg = res.statusText || errMsg
      }
      throw new Error(errMsg)
    }

    // Validate and parse response
    const data = await res.json()
    validateChatResponse(data)

    return {
      response: data.response,
      blocked: Boolean(data.blocked),
    }
  } catch (err) {
    // Handle specific error types
    if (err.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.')
    }

    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.')
    }

    throw err
  }
}

/**
 * Validate the chat response structure.
 * @param {any} data - Response data to validate
 * @throws {Error} If response is invalid
 */
function validateChatResponse(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response format from server')
  }

  if (typeof data.response !== 'string') {
    throw new Error('Response missing or invalid')
  }

  if (data.response.length === 0) {
    throw new Error('Empty response received from server')
  }
}
