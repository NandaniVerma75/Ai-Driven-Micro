"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Send, User, Bot, Loader2 } from "lucide-react"
import { useChat } from "@ai-sdk/react"

interface ChatMessage {
  id: number
  role: "user" | "assistant"
  content: string
  created_at: string
}

interface ChatInterfaceProps {
  sessionId: number
  initialMessages: ChatMessage[]
  onComponentGenerated: (jsx: string, css: string) => void
}

export function ChatInterface({ sessionId, initialMessages, onComponentGenerated }: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { messages, handleSubmit, isLoading } = useChat({
    api: "/api/protected/chat",
    body: { sessionId },
    initialMessages: initialMessages.map((msg) => ({
      id: msg.id.toString(),
      role: msg.role,
      content: msg.content,
    })),
    onFinish: async (message) => {
      try {
        // Try to parse the AI response as JSON to extract component code
        const content = message.content
        const jsonMatch = content.match(/\{[\s\S]*\}/)

        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          if (parsed.jsx) {
            onComponentGenerated(parsed.jsx, parsed.css || "")

            // Save component to database
            await fetch("/api/protected/components", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId,
                jsxCode: parsed.jsx,
                cssCode: parsed.css || "",
              }),
            })
          }
        }
      } catch (error) {
        console.error("Error parsing AI response:", error)
      }
    },
  })

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    handleSubmit(e)
    setInput("")
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">AI Assistant</h3>
        <p className="text-sm text-muted-foreground">Describe the component you want to create or modify</p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 size={16} className="animate-spin" />
                  Generating component...
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={onSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your component..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </Button>
        </div>
      </form>
    </Card>
  )
}
