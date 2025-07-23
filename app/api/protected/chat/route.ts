import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/db"
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 30

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

    const { message, sessionId } = await request.json()

    // Verify session belongs to user
    const session = await db.getSession(sessionId, user.id)
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Save user message
    await db.addChatMessage(sessionId, "user", message)

    // Get chat history for context
    const chatHistory = await db.getChatMessages(sessionId)
    const latestComponent = await db.getLatestComponentVersion(sessionId)

    // Prepare system prompt
    const systemPrompt = `You are an expert React component generator. Generate clean, modern React components based on user requests.

Rules:
1. Always return valid JSX/TSX code
2. Use modern React patterns (functional components, hooks)
3. Include proper TypeScript types when applicable
4. Use Tailwind CSS for styling
5. Make components responsive and accessible
6. If modifying existing code, apply only the requested changes

Current component context:
${latestComponent ? `JSX: ${latestComponent.jsx_code}\nCSS: ${latestComponent.css_code}` : "No existing component"}

Format your response as JSON with this structure:
{
  "jsx": "// Your JSX/TSX code here",
  "css": "/* Your CSS code here (if needed) */",
  "explanation": "Brief explanation of what you created/changed"
}`

    // Prepare messages for AI
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...chatHistory.slice(-10).map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ]

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages,
      temperature: 0.7,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
