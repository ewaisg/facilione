/**
 * User session management types
 */

export interface UserSession {
  id: string // sessionId
  userId: string
  createdAt: string // ISO timestamp
  lastActiveAt: string // ISO timestamp
  deviceInfo: {
    userAgent: string
    platform: string
    browser: string
    os: string
  }
  ipAddress?: string
}
