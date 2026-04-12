// Barrel re-export — all types from sub-modules per blueprint Section 10
export * from "./user"
export * from "./project"
export * from "./schedule"
export * from "./budget"
export * from "./smart-tools"
export * from "./customization"
export * from "./sop"
export * from "./estimate"
export * from "./ai-session"

// Re-export constants for backward compatibility with existing imports
export {
  ORACLE_PARENT_PROJECTS,
  PROJECT_TYPE_LABELS,
  PROJECT_TYPE_DURATIONS,
} from "@/constants/project-types"
