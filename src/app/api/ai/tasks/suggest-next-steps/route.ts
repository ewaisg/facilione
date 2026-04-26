/**
 * AI Next Steps Suggestion - Generate next steps based on project context
 */

import { NextResponse } from "next/server"
import { invokeAiText } from "@/lib/ai/client"
import { getProject } from "@/lib/firebase/firestore"

interface SuggestNextStepsRequest {
  projectId: string
  taskProjectId?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SuggestNextStepsRequest

    if (!body.projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    // Fetch project data
    const project = await getProject(body.projectId)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const prompt = `Suggest 5-7 prioritized next steps for project ${project.storeNumber} — ${project.storeName}.

Context:
- Project type: ${project.projectType}
- Status: ${project.status}
- Health status: ${project.healthStatus}
- Current phase: ${project.currentPhaseIndex || 0}
- Grand Opening: ${project.grandOpeningDate || "Not set"}
- Budget: $${project.totalBudget?.toLocaleString() || "0"}
- Committed: $${project.committedCost?.toLocaleString() || "0"}

Each step should be:
1. Specific (who, what, when)
2. Actionable (starts with verb)
3. Traceable (references milestone or gate if applicable)

Return as ordered list, most urgent first. Format as plain text numbered list.`

    const { text: summary } = await invokeAiText({
      feature: "next-actions",
      systemPrompt:
        "You are a PM assistant suggesting next steps for construction projects. Prioritize by urgency and impact.",
      userPrompt: prompt,
      temperature: 0.3,
      maxTokens: 600,
    })

    // Parse numbered list into array
    const nextSteps = summary
      .split("\n")
      .filter((line) => /^\d+[.)]/.test(line.trim()))
      .map((line) => line.replace(/^\d+[.)]/, "").trim())
      .filter((step) => step.length > 0)

    return NextResponse.json({ nextSteps })
  } catch (error) {
    console.error("Next steps suggestion error:", error)
    return NextResponse.json({ error: "Failed to generate next steps" }, { status: 500 })
  }
}
