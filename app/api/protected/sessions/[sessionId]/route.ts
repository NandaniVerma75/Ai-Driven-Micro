import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token!)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const sessionId = Number.parseInt(params.sessionId)
    const session = await db.getSession(sessionId, user.id)

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const messages = await db.getChatMessages(sessionId)
    const latestComponent = await db.getLatestComponentVersion(sessionId)

    return NextResponse.json({
      session,
      messages,
      component: latestComponent,
    })
  } catch (error) {
    console.error("Get session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
