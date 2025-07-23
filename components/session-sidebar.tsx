"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Plus, MessageSquare, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface Session {
  id: number
  title: string
  created_at: string
  updated_at: string
}

interface SessionSidebarProps {
  currentSessionId?: number
  onSessionSelect: (sessionId: number) => void
  onNewSession: () => void
}

export function SessionSidebar({ currentSessionId, onSessionSelect, onNewSession }: SessionSidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadSessions = async () => {
    try {
      const response = await fetch("/api/protected/sessions")
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error("Error loading sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const handleNewSession = async () => {
    try {
      const response = await fetch("/api/protected/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Session" }),
      })

      if (response.ok) {
        const data = await response.json()
        setSessions((prev) => [data.session, ...prev])
        onNewSession()
        onSessionSelect(data.session.id)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new session",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <Button onClick={handleNewSession} className="w-full">
          <Plus size={16} className="mr-2" />
          New Session
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            <div className="text-center text-sm text-muted-foreground py-8">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No sessions yet. Create your first one!
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <Button
                  key={session.id}
                  variant={currentSessionId === session.id ? "default" : "ghost"}
                  className="w-full justify-start h-auto p-3"
                  onClick={() => onSessionSelect(session.id)}
                >
                  <div className="flex items-start gap-2 w-full">
                    <MessageSquare size={16} className="mt-0.5 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm truncate">{session.title}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(session.updated_at)}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button variant="outline" onClick={handleLogout} className="w-full bg-transparent">
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
      </div>
    </Card>
  )
}
