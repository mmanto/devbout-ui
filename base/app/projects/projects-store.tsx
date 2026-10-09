"use client"

import * as React from "react"

import { PROJECTS } from "./projects-data"
import { type Project } from "./project-types"

interface ProjectsContextValue {
  projects: Project[]
  /** Reemplaza la lista completa; lo usa la grilla en cada alta, baja o cambio. */
  setProjects: (projects: Project[]) => void
  /** Reemplaza una fila por su versión editada (pantalla de edición). */
  updateProject: (project: Project) => void
}

const ProjectsContext = React.createContext<ProjectsContextValue | null>(null)

/**
 * Estado de los proyectos de `/projects`. Vive en el layout de la ruta para
 * que la grilla y la pantalla de edición —rutas distintas— operen sobre la
 * misma lista mientras se navega entre ellas.
 */
export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = React.useState<Project[]>(PROJECTS)

  const updateProject = React.useCallback((project: Project) => {
    setProjects((current) =>
      current.map((row) => (row.id === project.id ? project : row))
    )
  }, [])

  const value = React.useMemo(
    () => ({ projects, setProjects, updateProject }),
    [projects, updateProject]
  )

  return (
    <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
  )
}

export function useProjects() {
  const context = React.useContext(ProjectsContext)
  if (!context) {
    throw new Error("useProjects must be used within a ProjectsProvider")
  }
  return context
}
