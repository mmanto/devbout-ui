"use client"

/**
 * Entidad Proyectos.
 *
 * Identificadores, tipos y valores almacenados en inglés; todo el texto que ve
 * el usuario, en español. El detalle incluye las tareas del proyecto (lista,
 * tablero y gantt) y el progreso se deriva de ellas.
 */

import { createColumnHelper } from "@mmanto/devbout-ui"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpDownIcon } from "@hugeicons/core-free-icons"

import { type DataTableFeatures } from "@mmanto/devbout-ui"
import {
  defineTableDTO,
  type CreateDTO,
  type DetailDTO,
  type EditDTO,
  type FieldDTO,
  type FieldValues,
} from "@mmanto/devbout-ui"
import { Button } from "@mmanto/devbout-ui"

import { ProjectDetail } from "./project-detail"
import {
  PriorityBadge,
  ProgressBar,
  ProjectStatusBadge,
} from "./project-badges"
import { ProjectsHeader } from "./projects-header"
import {
  BUSINESSES,
  PRIORITY_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  formatDate,
  newId,
  parseTags,
  projectProgress,
  type Priority,
  type Project,
  type ProjectStatus,
} from "./project-types"

function SortHeader({
  label,
  column,
}: {
  label: string
  column: {
    getIsSorted: () => false | "asc" | "desc"
    toggleSorting: (desc?: boolean) => void
  }
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} />
    </Button>
  )
}

// ── Grilla ───────────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<DataTableFeatures, Project>()

const columns = columnHelper.columns([
  // Oculta: alimenta el buscador con nombre + descripción.
  columnHelper.accessor((row) => `${row.name} ${row.description}`, {
    id: "search",
    header: "",
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor("name", {
    header: ({ column }) => <SortHeader label="Proyecto" column={column} />,
    cell: ({ row }) => (
      <div className="flex items-start gap-2">
        <span
          className="mt-1 size-2.5 shrink-0 rounded-sm"
          style={{ backgroundColor: row.original.color }}
        />
        <div className="min-w-0">
          <div className="font-medium">{row.original.name}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">
              {row.original.business || "Sin negocio"}
            </span>
            {row.original.description ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate">{row.original.description}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    ),
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => <SortHeader label="Estado" column={column} />,
    cell: ({ row }) => <ProjectStatusBadge status={row.original.status} />,
  }),
  columnHelper.accessor("priority", {
    header: ({ column }) => <SortHeader label="Prioridad" column={column} />,
    cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
  }),
  columnHelper.accessor("startDate", {
    header: ({ column }) => <SortHeader label="Inicio" column={column} />,
    cell: ({ row }) => (
      <span className="tabular-nums">{formatDate(row.original.startDate)}</span>
    ),
  }),
  columnHelper.accessor("endDate", {
    header: ({ column }) => <SortHeader label="Fin" column={column} />,
    cell: ({ row }) => (
      <span className="tabular-nums">{formatDate(row.original.endDate)}</span>
    ),
  }),
  columnHelper.accessor("team", {
    header: "Equipo",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.team.length === 0 ? (
        <span className="text-muted-foreground">Sin equipo</span>
      ) : row.original.team.length === 1 ? (
        <span className="text-muted-foreground">{row.original.team[0]}</span>
      ) : (
        <span className="text-muted-foreground">
          {row.original.team.length} miembros
        </span>
      ),
  }),
  columnHelper.accessor((row) => projectProgress(row), {
    id: "progress",
    header: ({ column }) => <SortHeader label="Progreso" column={column} />,
    cell: ({ row }) => <ProgressBar value={projectProgress(row.original)} />,
  }),
])

// ── Formulario ───────────────────────────────────────────────────────────────

// El orden define las filas del formulario (dos campos por fila con texto
// libre, tres sin él): acá da Nombre+Negocio, Prioridad+Fechas, Equipo+Estado y
// Descripción sola al final.
const fields: readonly FieldDTO[] = [
  {
    kind: "text",
    name: "name",
    label: "Nombre",
    placeholder: "Rediseño del portal",
    required: true,
  },
  {
    kind: "select",
    name: "business",
    label: "Negocio",
    placeholder: "Elegí un negocio",
    options: BUSINESSES,
  },
  {
    kind: "select",
    name: "priority",
    label: "Prioridad",
    options: PRIORITY_OPTIONS,
    defaultValue: "medium",
  },
  { kind: "date", name: "startDate", label: "Fecha de inicio" },
  { kind: "date", name: "endDate", label: "Fecha de fin" },
  {
    kind: "tags",
    name: "team",
    label: "Equipo (separado por comas)",
    placeholder: "Juan Pérez, María García",
  },
  {
    kind: "select",
    name: "status",
    label: "Estado",
    options: PROJECT_STATUS_OPTIONS,
    defaultValue: "planning",
  },
  {
    kind: "textarea",
    name: "description",
    label: "Descripción",
    placeholder: "Objetivo del proyecto",
    rows: 3,
  },
]

const buildProjectFields = (values: FieldValues) => ({
  name: values.name.trim(),
  business: (values.business ?? "").trim(),
  description: (values.description ?? "").trim(),
  status: values.status as ProjectStatus,
  priority: values.priority as Priority,
  startDate: values.startDate ?? "",
  endDate: values.endDate ?? "",
  team: parseTags(values.team ?? ""),
})

export const projectCreate: CreateDTO<Project> = {
  triggerLabel: "Nuevo",
  triggerVariant: "default",
  title: "Nuevo proyecto",
  description:
    "Cargá los datos del proyecto. Se agrega al inicio de la grilla.",
  submitLabel: "Crear proyecto",
  cancelLabel: "Cancelar",
  fields,
  build: (values) => ({
    id: newId(),
    ...buildProjectFields(values),
    // Sin selector de color en el formulario: todo proyecto nuevo nace con el
    // acento base. La grilla sigue usando `color` como indicador.
    color: "#2563eb",
    tasks: [],
  }),
}

export const projectEdit: EditDTO<Project> = {
  label: "Editar proyecto",
  // La edición vive en su propia pantalla, no sobre la grilla.
  href: (row) => `/projects/${row.id}/edit`,
  title: (row) => `Editar ${row.name}`,
  description: "Actualizá los datos del proyecto. Las tareas no se modifican.",
  submitLabel: "Guardar cambios",
  cancelLabel: "Cancelar",
  fields,
  toValues: (row) => ({
    name: row.name,
    business: row.business,
    description: row.description,
    startDate: row.startDate,
    endDate: row.endDate,
    status: row.status,
    priority: row.priority,
    team: row.team.join(", "),
  }),
  // El color no se edita: se conserva el de la fila.
  build: (values, row) => ({ ...row, ...buildProjectFields(values) }),
}

export const projectDetail: DetailDTO<Project> = {
  label: "Ver detalle",
  title: (row) => row.name,
  description: (row) => row.description || "Sin descripción",
  closeLabel: "Cerrar",
}

export const projectDTO = defineTableDTO<Project>({
  columns,
  rowId: (row) => row.id,
  hiddenColumns: ["search"],
  // Sin columna de checks: la grilla se opera fila por fila.
  selectable: false,
  header: (rows) => <ProjectsHeader projects={rows} />,
  detailSurface: ({ row, ctx, close }) => (
    <ProjectDetail
      project={row}
      onChange={(next) => ctx.update(row, next)}
      close={close}
    />
  ),
  columnLabels: {
    name: "Proyecto",
    status: "Estado",
    priority: "Prioridad",
    startDate: "Inicio",
    endDate: "Fin",
    team: "Equipo",
    progress: "Progreso",
  },
  search: { columnId: "search", placeholder: "Buscar proyectos..." },
  labels: {
    openRowMenu: "Abrir acciones de la fila",
    rowsPerPage: "Filas por página",
    columns: "Columnas",
    noResults: "Sin resultados.",
    previous: "Anterior",
    next: "Siguiente",
  },
  create: projectCreate,
  edit: projectEdit,
  detail: projectDetail,
  rowActionsMenuLabel: "Acciones",
  rowActions: [
    {
      id: "duplicate",
      label: "Duplicar proyecto",
      run: (row, ctx) =>
        ctx.add({
          ...row,
          id: newId(),
          name: `${row.name} (copia)`,
          status: "planning",
          tasks: row.tasks.map((task) => ({ ...task, id: newId() })),
        }),
    },
    {
      id: "delete",
      label: "Eliminar proyecto",
      variant: "destructive",
      run: (row, ctx) => ctx.remove([row]),
    },
  ],
  confirm: {
    title: "Eliminar proyecto",
    message: (count) =>
      count === 1
        ? "¿Eliminar el proyecto seleccionado? Se eliminarán también sus tareas. Esta acción no se puede deshacer."
        : `¿Eliminar ${count} proyectos? Se eliminarán también sus tareas. Esta acción no se puede deshacer.`,
    confirmLabel: "Eliminar",
    cancelLabel: "Cancelar",
  },
})
