/**
 * AI Task Extraction - Extract actionable tasks from text
 */

import { NextResponse } from "next/server"
import { invokeAiText } from "@/lib/ai/client"

interface ExtractTasksRequest {
  content: string
  projectContext?: {
    projectId: string
    projectType: string
    currentPhase?: string
  }
}

function buildPrompt(content: string, context?: ExtractTasksRequest["projectContext"]): string {
  let prompt = `Extract actionable tasks from the following text.

For each task, provide:
1. Task description (verb-first, specific)
2. Suggested status:
   - "DO NOW": Immediate action required, blocking, overdue
   - "PENDING": Waiting on external input or future date
   - "ONGOING": Recurring or continuous work
3. Notes: Context, dependencies, constraints
4. Due date (if mentioned)
5. Assignee (if mentioned)

Return ONLY tasks that require PM action. Omit FYI items or completed work.

`

  if (context) {
    prompt += `Context:
- Project: ${context.projectId}
- Project Type: ${context.projectType}
${context.currentPhase ? `- Current Phase: ${context.currentPhase}` : ""}

`
  }

  prompt += `Text to analyze:
${content}

Return as JSON array with format:
[
  {
    "text": "Task description",
    "suggestedStatus": "DO NOW" | "PENDING" | "ONGOING",
    "notes": "Context and dependencies",
    "suggestedDueDate": "YYYY-MM-DD" (optional),
    "suggestedAssignee": "Name" (optional)
  }
]`

  return prompt
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ExtractTasksRequest

    if (!body.content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const prompt = buildPrompt(body.content, body.projectContext)

    const { text: responseText } = await invokeAiText({
      feature: "forms-generate-minutes",
      systemPrompt:
        "You are a construction project task extractor. Extract actionable tasks from meeting notes, emails, and documents. Return valid JSON only.",
      userPrompt: prompt,
      temperature: 0.2,
      maxTokens: 1500,
    })

    // Parse JSON response
    let tasks
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        tasks = JSON.parse(jsonMatch[0])
      } else {
        tasks = JSON.parse(responseText)
      }
    } catch (_parseErr) {
      console.error("Failed to parse AI response:", responseText)
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Task extraction error:", error)
    return NextResponse.json({ error: "Failed to extract tasks" }, { status: 500 })
  }
}
