"use client"

import * as React from "react"

import { DataTable } from "@/components/data-table/data-table"

import { projectDTO } from "./project-dto"
import { useProjects } from "./projects-store"

export function ProjectsTable() {
  const { projects, setProjects } = useProjects()

  // La grilla reporta cada cambio para que el store —y la pantalla de
  // edición— vean la lista actualizada.
  const dto = React.useMemo(
    () => ({ ...projectDTO, onDataChange: setProjects }),
    [setProjects]
  )

  return <DataTable dto={dto} data={projects} />
}
