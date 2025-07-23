"use client"

import { useState, useEffect } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { ComponentPreview } from "@/components/component-preview"
import { SessionSidebar } from "@/components/session-sidebar"
import { toast } from "@/hooks/use-toast"

interface ChatMessage {
  id: number
  role: "user" | "assistant"
  content: string
  created_at: string
}

interface ComponentVersion {
  jsx_code?: string
  css_code?: string
}

interface SessionData {
  session: {
    id: number
    title: string
  }
  messages: ChatMessage[]
  component: ComponentVersion | null
}

export default function PlaygroundPage() {
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [jsxCode, setJsxCode] = useState("")
  const [cssCode, setCssCode] = useState("")
  const [loading, setLoading] = useState(false)

  const loadSession = async (sessionId: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/protected/sessions/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSessionData(data)
        setJsxCode(data.component?.jsx_code || "")
        setCssCode(data.component?.css_code || "")
        setCurrentSessionId(sessionId)
      } else {
        toast({
          title: "Error",
          description: "Failed to load session",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading session:", error)
      toast({
        title: "Error",
        description: "Failed to load session",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSessionSelect = (sessionId: number) => {
    loadSession(sessionId)
  }

  const handleNewSession = () => {
    setSessionData(null)
    setJsxCode("")
    setCssCode("")
    setCurrentSessionId(null)
  }

  const handleComponentGenerated = (jsx: string, css: string) => {
    setJsxCode(jsx)
    setCssCode(css)
  }

  // Load first session on mount
  useEffect(() => {
    const loadInitialSession = async () => {
      try {
        const response = await fetch("/api/protected/sessions")
        if (response.ok) {
          const data = await response.json()
          if (data.sessions.length > 0) {
            loadSession(data.sessions[0].id)
          }
        }
      } catch (error) {
        console.error("Error loading initial session:", error)
      }
    }

    loadInitialSession()
  }, [])

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white">
        <SessionSidebar
          currentSessionId={currentSessionId || undefined}
          onSessionSelect={handleSessionSelect}
          onNewSession={handleNewSession}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat Interface */}
        <div className="w-96 border-r bg-white">
          {currentSessionId && sessionData ? (
            <ChatInterface
              sessionId={currentSessionId}
              initialMessages={sessionData.messages}
              onComponentGenerated={handleComponentGenerated}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Welcome to AI Playground</h3>
                <p className="text-sm">Select a session or create a new one to get started</p>
              </div>
            </div>
          )}
        </div>

        {/* Component Preview */}
        <div className="flex-1 bg-white">
          {jsxCode ? (
            <ComponentPreview jsxCode={jsxCode} cssCode={cssCode} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">No Component Yet</h3>
                <p className="text-sm">Start a conversation to generate your first component</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
