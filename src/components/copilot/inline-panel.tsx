"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useAuth } from "@/lib/firebase/auth-context"
import {
  createSession,
  getSessionMessages,
  addMessage,
  updateSessionTitle,
} from "@/lib/firebase/ai-sessions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { AiMessage, ProjectType } from "@/types"
import {
  Bot,
  Send,
  Loader2,
  X,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

interface InlinePanelProps {
  projectId: string
  projectName: string
  projectType: ProjectType
  currentPhase?: string
  onClose: () => void
}

export function CopilotInlinePanel({
  projectId,
  projectName,
  projectType,
  currentPhase,
  onClose,
}: InlinePanelProps) {
  const { user } = useAuth()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState("")
  const [streamCitations, setStreamCitations] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamText])

  const handleSend = useCallback(async () => {
    if (!input.trim() || streaming || !user) return

    let sid = sessionId

    // Create session on first message
    if (!sid) {
      sid = await createSession({
        userId: user.uid,
        title: `${projectName} — ${input.trim().slice(0, 40)}`,
        projectId,
        projectType,
      })
      setSessionId(sid)
      await updateSessionTitle(sid, `${projectName} — ${input.trim().slice(0, 40)}`)
    }

    const userMessage = input.trim()
    setInput("")

    const userMsg: AiMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    await addMessage(sid, { role: "user", content: userMessage })

    setStreaming(true)
    setStreamText("")
    setStreamCitations([])

    try {
      const history = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sid,
          message: userMessage,
          projectId,
          projectType,
          history,
        }),
      })

      if (!res.ok) throw new Error("Failed to get response")

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No reader")

      const decoder = new TextDecoder()
      let fullText = ""
      let citations: string[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === "text") {
                fullText += parsed.content
                setStreamText(fullText)
              } else if (parsed.type === "citations") {
                citations = parsed.content
                setStreamCitations(citations)
              }
            } catch {
              // skip
            }
          }
        }
      }

      const assistantMsg: AiMessage = {
        id: `temp-${Date.now()}-a`,
        role: "assistant",
        content: fullText,
        citations: citations.length > 0 ? citations : undefined,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMsg])
      await addMessage(sid, {
        role: "assistant",
        content: fullText,
        citations: citations.length > 0 ? citations : undefined,
      })
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}-err`,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setStreaming(false)
      setStreamText("")
      setStreamCitations([])
    }
  }, [input, streaming, user, sessionId, messages, projectId, projectName, projectType])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full border-l bg-background w-80 lg:w-96 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-11 border-b shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Bot className="size-4 text-brand-600 shrink-0" />
          <span className="text-xs font-semibold truncate">Copilot — {projectName}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {sessionId && (
            <Link href={`/fe-copilot?session=${sessionId}`}>
              <Button variant="ghost" size="icon" className="size-6">
                <ExternalLink className="size-3" />
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="icon" className="size-6" onClick={onClose}>
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Context Banner */}
      <div className="px-3 py-2 border-b bg-muted/50 text-[10px] text-muted-foreground">
        {projectType} project{currentPhase ? ` · ${currentPhase}` : ""}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && !streaming && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <Bot className="size-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">
              Ask about this {projectType} project&apos;s SOPs, next actions, or gate requirements.
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <InlineMessage key={msg.id} message={msg} />
        ))}
        {streaming && streamText && (
          <InlineMessage
            message={{
              id: "streaming",
              role: "assistant",
              content: streamText,
              citations: streamCitations.length > 0 ? streamCitations : undefined,
              timestamp: new Date().toISOString(),
            }}
          />
        )}
        {streaming && !streamText && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-2 shrink-0">
        <div className="flex items-end gap-1.5">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this project..."
            className="min-h-[36px] max-h-[100px] resize-none text-xs"
            rows={1}
            disabled={streaming}
          />
          <Button
            size="icon"
            className="shrink-0 size-8"
            onClick={handleSend}
            disabled={!input.trim() || streaming}
          >
            {streaming ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Send className="size-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function InlineMessage({ message }: { message: AiMessage }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-2", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "rounded-lg px-3 py-2 max-w-[85%] text-xs",
          isUser ? "bg-brand-600 text-white" : "bg-muted text-foreground",
        )}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        {message.citations && message.citations.length > 0 && (
          <div className="mt-1.5 pt-1.5 border-t border-foreground/10 flex flex-wrap gap-1">
            {message.citations.map((cite, i) => (
              <span
                key={i}
                className="text-[9px] px-1 py-0.5 rounded bg-foreground/10 text-foreground/60"
              >
                {cite}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
