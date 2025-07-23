import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify, type JWTPayload } from "jose"
import { db } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"
const secret = new TextEncoder().encode(JWT_SECRET)

export interface AuthUser {
  id: number
  email: string
  name?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashed: string) {
  return bcrypt.compare(password, hashed)
}

export async function generateToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
  } as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret)
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify<JWTPayload>(token, secret)
    return {
      id: payload.id as number,
      email: payload.email as string,
      name: payload.name as string | undefined,
    }
  } catch {
    return null
  }
}

export async function authenticateUser(email: string, password: string) {
  const user = await db.getUserByEmail(email)
  if (!user) return null
  if (!(await verifyPassword(password, user.password_hash))) return null
  return { id: user.id, email: user.email, name: user.name }
}
