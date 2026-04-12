"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useAuth } from "@/lib/firebase/auth-context"
import {
  createSession,
  listUserSessions,
  deleteSession,
  getSessionMessages,
  addMessage,
  updateSessionTitle,
} from "@/lib/firebase/ai-sessions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { AiSession, AiMessage } from "@/types"
import {
  Bot,
  Send,
  Plus,
  Trash2,
  Loader2,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react"

const STARTER_QUESTIONS = [
  "What are the steps for a New Store project?",
  "Am I ready for Phase 3 of my WIW?",
  "What documents are needed for a Pre-Bid meeting?",
  "Explain the Oracle setup process for a new project.",
]

export default function FeCopilotPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<AiSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState("")
  const [streamCitations, setStreamCitations] = useState<string[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load sessions on mount
  useEffect(() => {
    if (!user) return
    listUserSessions(user.uid).then((s) => {
      setSessions(s)
      setSessionsLoading(false)
    })
  }, [user])

  // Load messages when active session changes
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([])
      return
    }
    setMessagesLoading(true)
    getSessionMessages(activeSessionId).then((m) => {
      setMessages(m)
      setMessagesLoading(false)
    })
  }, [activeSessionId])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamText])

  const handleNewChat = useCallback(async () => {
    if (!user) return
    const sessionId = await createSession({
      userId: user.uid,
      title: "New Chat",
    })
    const newSession: AiSession = {
      id: sessionId,
      userId: user.uid,
      title: "New Chat",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSessions((prev) => [newSession, ...prev])
    setActiveSessionId(sessionId)
    setMessages([])
    setInput("")
  }, [user])

  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      await deleteSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      if (activeSessionId === sessionId) {
        setActiveSessionId(null)
        setMessages([])
      }
    },
    [activeSessionId],
  )

  const handleSend = useCallback(async () => {
    if (!input.trim() || streaming || !user) return

    let sessionId = activeSessionId

    // Create session if none active
    if (!sessionId) {
      sessionId = await createSession({
        userId: user.uid,
        title: input.trim().slice(0, 60),
      })
      const newSession: AiSession = {
        id: sessionId,
        userId: user.uid,
        title: input.trim().slice(0, 60),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setSessions((prev) => [newSession, ...prev])
      setActiveSessionId(sessionId)
    }

    // Auto-generate title from first message
    if (messages.length === 0) {
      const title = input.trim().slice(0, 60)
      await updateSessionTitle(sessionId, title)
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title } : s)),
      )
    }

    const userMessage = input.trim()
    setInput("")

    // Add user message to UI immediately
    const userMsg: AiMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])

    // Save user message to Firestore
    await addMessage(sessionId, { role: "user", content: userMessage })

    // Stream assistant response
    setStreaming(true)
    setStreamText("")
    setStreamCitations([])

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: userMessage,
          history,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to get response")
      }

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
              // skip malformed chunks
            }
          }
        }
      }

      // Add assistant message
      const assistantMsg: AiMessage = {
        id: `temp-${Date.now()}-a`,
        role: "assistant",
        content: fullText,
        citations: citations.length > 0 ? citations : undefined,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMsg])

      // Save to Firestore
      await addMessage(sessionId, {
        role: "assistant",
        content: fullText,
        citations: citations.length > 0 ? citations : undefined,
      })
    } catch {
      const errorMsg: AiMessage = {
        id: `temp-${Date.now()}-err`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setStreaming(false)
      setStreamText("")
      setStreamCitations([])
    }
  }, [input, streaming, user, activeSessionId, messages])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Session Sidebar */}
      <div
        className={cn(
          "flex flex-col border-r bg-muted/30 transition-all duration-200 shrink-0",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden",
        )}
      >
        <div className="flex items-center justify-between p-3 border-b">
          <span className="text-sm font-semibold">Chats</span>
          <Button variant="ghost" size="icon" className="size-7" onClick={handleNewChat}>
            <Plus className="size-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No chats yet</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "group flex items-center gap-2 px-2.5 py-2 rounded-md cursor-pointer text-sm transition-colors",
                  activeSessionId === session.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setActiveSessionId(session.id)}
              >
                <MessageSquare className="size-3.5 shrink-0" />
                <span className="flex-1 truncate">{session.title}</span>
                <button
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteSession(session.id)
                  }}
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 h-12 border-b shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </Button>
          <Bot className="size-4 text-brand-600" />
          <span className="text-sm font-semibold">FE Copilot</span>
          {activeSessionId && (
            <span className="text-xs text-muted-foreground ml-2 truncate">
              {sessions.find((s) => s.id === activeSessionId)?.title}
            </span>
          )}
        </div>

        {/* Messages or Empty State */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!activeSessionId && messages.length === 0 && !messagesLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="flex flex-col items-center gap-3">
                <div className="size-16 rounded-2xl bg-brand-100 flex items-center justify-center">
                  <Sparkles className="size-8 text-brand-600" />
                </div>
                <h2 className="text-xl font-semibold">FE Copilot</h2>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Your SOP-grounded AI assistant. Ask about project processes, get next actions,
                  draft communications, or review documents.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    className="text-left text-sm px-4 py-3 rounded-lg border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setInput(q)
                      textareaRef.current?.focus()
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : messagesLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {streaming && streamText && (
                <MessageBubble
                  message={{
                    id: "streaming",
                    role: "assistant",
                    content: streamText,
                    citations: streamCitations.length > 0 ? streamCitations : undefined,
                    timestamp: new Date().toISOString(),
                  }}
                  isStreaming
                />
              )}
              {streaming && !streamText && (
                <div className="flex items-start gap-3">
                  <div className="size-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                    <Bot className="size-3.5 text-brand-600" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <Loader2 className="size-3.5 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-4 shrink-0">
          <div className="flex items-end gap-2 max-w-3xl mx-auto">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about SOPs, project processes, next actions..."
              className="min-h-[44px] max-h-[160px] resize-none"
              rows={1}
              disabled={streaming}
            />
            <Button
              size="icon"
              className="shrink-0 size-10"
              onClick={handleSend}
              disabled={!input.trim() || streaming}
            >
              {streaming ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            FE Copilot is advisory only. Always verify recommendations against official SOPs.
          </p>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({
  message,
  isStreaming,
}: {
  message: AiMessage
  isStreaming?: boolean
}) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "size-7 rounded-full flex items-center justify-center shrink-0",
          isUser ? "bg-foreground/10" : "bg-brand-100",
        )}
      >
        {isUser ? (
          <span className="text-xs font-semibold text-foreground/70">U</span>
        ) : (
          <Bot className="size-3.5 text-brand-600" />
        )}
      </div>
      <div
        className={cn(
          "flex flex-col max-w-[75%] rounded-xl px-4 py-2.5",
          isUser
            ? "bg-brand-600 text-white"
            : "bg-muted text-foreground",
        )}
      >
        <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
        {message.citations && message.citations.length > 0 && (
          <div className="mt-2 pt-2 border-t border-foreground/10 flex flex-wrap gap-1">
            {message.citations.map((cite, i) => (
              <span
                key={i}
                className="text-[10px] px-1.5 py-0.5 rounded bg-foreground/10 text-foreground/60"
              >
                {cite}
              </span>
            ))}
          </div>
        )}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-brand-600 animate-pulse ml-0.5" />
        )}
      </div>
    </div>
  )
}
