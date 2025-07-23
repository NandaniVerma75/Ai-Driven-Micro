import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token!)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { sessionId, jsxCode, cssCode } = await request.json()

    // Verify session belongs to user
    const session = await db.getSession(sessionId, user.id)
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const component = await db.saveComponentVersion(sessionId, jsxCode, cssCode)

    return NextResponse.json({ component })
  } catch (error) {
    console.error("Save component error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
