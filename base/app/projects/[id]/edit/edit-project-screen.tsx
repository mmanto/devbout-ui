"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  EntityFormFields,
  FormFooter,
} from "@mmanto/devbout-ui"
import { type FieldValues } from "@mmanto/devbout-ui"
import { EntityView } from "@mmanto/devbout-ui"
import { buttonVariants } from "@mmanto/devbout-ui"
import { Separator } from "@mmanto/devbout-ui"

import { projectEdit } from "../../project-dto"
import { ProjectSummary } from "../../project-summary"
import { useProjects } from "../../projects-store"
import { type Project } from "../../project-types"

/**
 * Pantalla propia de edición de un proyecto. Comparte la lista con la grilla
 * (mismo store del layout de `/projects`), así que al guardar la fila queda
 * actualizada cuando se vuelve a la lista.
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
      <EditProjectForm
        // Reinicia el formulario al pasar de un proyecto a otro.
        key={project.id}
        project={project}
        onSave={(next) => {
          updateProject(next)
          router.push("/projects")
        }}
        onCancel={() => router.push("/projects")}
      />
    </div>
  )
}

/**
 * Formulario de edición con la misma cabecera que el detalle del proyecto: las
 * métricas, el estado y los datos generales se ven arriba del formulario y se
 * actualizan mientras se editan.
 */
function EditProjectForm({
  project,
  onSave,
  onCancel,
}: {
  project: Project
  onSave: (next: Project) => void
  onCancel: () => void
}) {
  const [values, setValues] = React.useState<FieldValues>(() =>
    projectEdit.toValues(project)
  )
  const preview = projectEdit.build(values, project)

  return (
    <EntityView
      open
      mode="page"
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
      title={
        typeof projectEdit.title === "function"
          ? projectEdit.title(project)
          : projectEdit.title
      }
      description={projectEdit.description}
      backLabel={projectEdit.cancelLabel}
      onSubmit={(event) => {
        event.preventDefault()
        onSave(preview)
      }}
      footer={
        <FormFooter
          onCancel={onCancel}
          cancelLabel={projectEdit.cancelLabel ?? "Cancelar"}
          submitLabel={projectEdit.submitLabel}
        />
      }
    >
      <ProjectSummary project={preview} />

      <Separator />

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Datos del proyecto</h3>
        <EntityFormFields
          fields={projectEdit.fields}
          values={values}
          onChange={(name, value) =>
            setValues((previous) => ({ ...previous, [name]: value }))
          }
        />
      </section>
    </EntityView>
  )
}
