"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { EditEntity } from "@mmanto/devbout-ui"
import { buttonVariants } from "@mmanto/devbout-ui"

import { projectEntity } from "../../project-dto"
import { ProjectSummary } from "../../project-summary"
import { useProjects } from "../../projects-store"

/**
 * Pantalla propia de edición de un proyecto. Comparte la lista con la grilla
 * (mismo store del layout de `/projects`), así que al guardar la fila queda
 * actualizada cuando se vuelve a la lista. El resumen de arriba se actualiza
 * mientras se editan los campos (slot `header`).
 */
export function EditProjectScreen({ id }: { id: string }) {
  const router = useRouter()
  const { projects, updateProject } = useProjects()
  const project = projects.find((current) => current.id === id)

  if (!project) {
    return (
      <div className="flex flex-1 flex-col items-start gap-4 p-4 pt-0">
        <p className="text-sm text-muted-foreground">
          El proyecto no existe o fue eliminado.
        </p>
        <Link
          href="/projects"
          className={buttonVariants({ variant: "outline" })}
        >
          Volver a proyectos
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <EditEntity
        // Reinicia el formulario al pasar de un proyecto a otro.
        key={project.id}
        entity={projectEntity}
        row={project}
        open
        mode="page"
        onOpenChange={(open) => {
          if (!open) router.push("/projects")
        }}
        onSaved={(next) => {
          if (next) updateProject(next)
          router.push("/projects")
        }}
        header={(_values, preview) =>
          preview ? <ProjectSummary project={preview} /> : null
        }
      />
    </div>
  )
}
