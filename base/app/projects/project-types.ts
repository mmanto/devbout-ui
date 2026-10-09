/**
 * Modelo de Proyectos y Tareas.
 *
 * Identificadores, tipos y valores almacenados en inglés; etiquetas visibles en
 * español. Sin JSX: lo comparten la grilla, el detalle, el tablero y el gantt.
 */

// ── Tipos de dominio ─────────────────────────────────────────────────────────

export type ProjectStatus = "planning" | "active" | "paused" | "completed"
export type Priority = "low" | "medium" | "high"
export type TaskStatus = "todo" | "in_progress" | "done"

export type Task = {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  assignee: string
  /** ISO `YYYY-MM-DD`. */
  startDate: string
  /** ISO `YYYY-MM-DD`. */
  endDate: string
  /** `null` = sin estimar. */
  estimatedHours: number | null
  tags: string[]
}

export type Project = {
  id: string
  name: string
  business: string
  description: string
  status: ProjectStatus
  priority: Priority
  /** ISO `YYYY-MM-DD`. */
  startDate: string
  /** ISO `YYYY-MM-DD`. */
  endDate: string
  team: string[]
  /** Hex `#rrggbb` usado como acento del proyecto. */
  color: string
  tasks: Task[]
}

// ── Texto visible ────────────────────────────────────────────────────────────

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: "Planificación",
  active: "Activo",
  paused: "Pausado",
  completed: "Completado",
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Por hacer",
  in_progress: "En progreso",
  done: "Completada",
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
}

/** Variante de `Badge` por estado del proyecto. */
export const PROJECT_STATUS_VARIANT: Record<
  ProjectStatus,
  "secondary" | "info" | "success" | "warning"
> = {
  planning: "secondary",
  active: "success",
  paused: "warning",
  completed: "info",
}

export const TASK_STATUS_VARIANT: Record<
  TaskStatus,
  "secondary" | "info" | "success"
> = {
  todo: "secondary",
  in_progress: "info",
  done: "success",
}

export const PRIORITY_VARIANT: Record<
  Priority,
  "secondary" | "warning" | "destructive"
> = {
  low: "secondary",
  medium: "warning",
  high: "destructive",
}

const toOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }))

export const PROJECT_STATUS_OPTIONS = toOptions(PROJECT_STATUS_LABELS)
export const TASK_STATUS_OPTIONS = toOptions(TASK_STATUS_LABELS)
export const PRIORITY_OPTIONS = toOptions(PRIORITY_LABELS)

export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"]

/** Negocios disponibles en el selector (muestra: aún no hay entidad Negocio). */
export const BUSINESSES = ["AgileTeam Corp", "NovaSoft", "TechCorp"]

// ── Fechas ───────────────────────────────────────────────────────────────────

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** `2026-03-01` → `01/03/2026`; vacío → `—`. Sin depender de la zona horaria. */
export function formatDate(iso: string) {
  const [year, month, day] = iso.split("-")
  if (!year || !month || !day) {
    return "—"
  }
  return `${day}/${month}/${year}`
}

/** `2026-03-01` → `01/03` (día y mes), para espacios compactos. */
export function formatShortDate(iso: string) {
  const [year, month, day] = iso.split("-")
  if (!year || !month || !day) {
    return "—"
  }
  return `${day}/${month}`
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

/** Suma días a una fecha ISO (negativo resta). */
export function shiftDate(iso: string, days: number) {
  const [year, month, day] = iso.split("-").map(Number)
  if (!year || !month || !day) {
    return ""
  }
  const shifted = new Date(Date.UTC(year, month - 1, day) + days * MS_PER_DAY)
  return shifted.toISOString().slice(0, 10)
}

/** Días entre dos fechas ISO (positivo si `to` es posterior a `from`). */
export function daysBetween(from: string, to: string) {
  const fromMs = Date.parse(`${from}T00:00:00Z`)
  const toMs = Date.parse(`${to}T00:00:00Z`)
  if (Number.isNaN(fromMs) || Number.isNaN(toMs)) {
    return 0
  }
  return Math.round((toMs - fromMs) / MS_PER_DAY)
}

// ── Derivados ────────────────────────────────────────────────────────────────

/** Progreso 0-100: tareas completadas sobre el total. */
export function projectProgress(project: Project) {
  if (project.tasks.length === 0) {
    return 0
  }
  const done = project.tasks.filter((task) => task.status === "done").length
  return Math.round((done / project.tasks.length) * 100)
}

export function countTasks(project: Project, status: TaskStatus) {
  return project.tasks.filter((task) => task.status === status).length
}

export function newId() {
  return crypto.randomUUID()
}

/** Etiquetas separadas por coma → lista sin vacíos. */
export function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}
