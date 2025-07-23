import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface User {
  id: number
  email: string
  name?: string
  created_at: string
}

export interface Session {
  id: number
  user_id: number
  title: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: number
  session_id: number
  role: "user" | "assistant"
  content: string
  created_at: string
}

export interface ComponentVersion {
  id: number
  session_id: number
  jsx_code?: string
  css_code?: string
  version: number
  created_at: string
}

export const db = {
  // User operations
  async createUser(email: string, passwordHash: string, name?: string): Promise<User> {
    const result = await sql`
      INSERT INTO users (email, password_hash, name)
      VALUES (${email}, ${passwordHash}, ${name})
      RETURNING id, email, name, created_at
    `
    return result[0] as User
  },

  async getUserByEmail(email: string) {
    const result = await sql`
      SELECT id, email, password_hash, name, created_at
      FROM users
      WHERE email = ${email}
    `
    return result[0]
  },

  async getUserById(id: number): Promise<User | null> {
    const result = await sql`
      SELECT id, email, name, created_at
      FROM users
      WHERE id = ${id}
    `
    return (result[0] as User) || null
  },

  // Session operations
  async createSession(userId: number, title = "Untitled Session"): Promise<Session> {
    const result = await sql`
      INSERT INTO sessions (user_id, title)
      VALUES (${userId}, ${title})
      RETURNING id, user_id, title, created_at, updated_at
    `
    return result[0] as Session
  },

  async getUserSessions(userId: number): Promise<Session[]> {
    const result = await sql`
      SELECT id, user_id, title, created_at, updated_at
      FROM sessions
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC
    `
    return result as Session[]
  },

  async getSession(sessionId: number, userId: number): Promise<Session | null> {
    const result = await sql`
      SELECT id, user_id, title, created_at, updated_at
      FROM sessions
      WHERE id = ${sessionId} AND user_id = ${userId}
    `
    return (result[0] as Session) || null
  },

  async updateSessionTitle(sessionId: number, title: string) {
    await sql`
      UPDATE sessions
      SET title = ${title}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${sessionId}
    `
  },

  // Chat message operations
  async addChatMessage(sessionId: number, role: "user" | "assistant", content: string): Promise<ChatMessage> {
    const result = await sql`
      INSERT INTO chat_messages (session_id, role, content)
      VALUES (${sessionId}, ${role}, ${content})
      RETURNING id, session_id, role, content, created_at
    `

    // Update session timestamp
    await sql`
      UPDATE sessions
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ${sessionId}
    `

    return result[0] as ChatMessage
  },

  async getChatMessages(sessionId: number): Promise<ChatMessage[]> {
    const result = await sql`
      SELECT id, session_id, role, content, created_at
      FROM chat_messages
      WHERE session_id = ${sessionId}
      ORDER BY created_at ASC
    `
    return result as ChatMessage[]
  },

  // Component version operations
  async saveComponentVersion(sessionId: number, jsxCode?: string, cssCode?: string): Promise<ComponentVersion> {
    // Get the next version number
    const versionResult = await sql`
      SELECT COALESCE(MAX(version), 0) + 1 as next_version
      FROM component_versions
      WHERE session_id = ${sessionId}
    `
    const nextVersion = versionResult[0].next_version

    const result = await sql`
      INSERT INTO component_versions (session_id, jsx_code, css_code, version)
      VALUES (${sessionId}, ${jsxCode}, ${cssCode}, ${nextVersion})
      RETURNING id, session_id, jsx_code, css_code, version, created_at
    `

    // Update session timestamp
    await sql`
      UPDATE sessions
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ${sessionId}
    `

    return result[0] as ComponentVersion
  },

  async getLatestComponentVersion(sessionId: number): Promise<ComponentVersion | null> {
    const result = await sql`
      SELECT id, session_id, jsx_code, css_code, version, created_at
      FROM component_versions
      WHERE session_id = ${sessionId}
      ORDER BY version DESC
      LIMIT 1
    `
    return (result[0] as ComponentVersion) || null
  },

  async getComponentVersions(sessionId: number): Promise<ComponentVersion[]> {
    const result = await sql`
      SELECT id, session_id, jsx_code, css_code, version, created_at
      FROM component_versions
      WHERE session_id = ${sessionId}
      ORDER BY version DESC
    `
    return result as ComponentVersion[]
  },
}
