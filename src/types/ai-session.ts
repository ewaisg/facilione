import type { ProjectType } from "./project"

export interface AiSession {
  id: string
  userId: string
  title: string
  projectId?: string
  projectType?: ProjectType
  createdAt: string
  updatedAt: string
}

export interface AiMessage {
  id: string
  role: "user" | "assistant"
  content: string
  citations?: string[]
  timestamp: string
}
