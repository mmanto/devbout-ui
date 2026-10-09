"use client"

/**
 * Entidad Tarea (pertenece a un Proyecto). Reutiliza el framework de tablas
 * para la vista de lista: ordenamiento, búsqueda, acciones y formularios.
 */

import { createColumnHelper } from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpDownIcon } from "@hugeicons/core-free-icons"

import { type DataTableFeatures } from "@/components/data-table/features"
import {
  defineTableDTO,
  type CreateDTO,
  type DetailDTO,
  type EditDTO,
  type FieldDTO,
  type FieldValues,
} from "@/components/data-table/types"
import { Button } from "@/components/ui/button"

import { PriorityBadge, TaskStatusBadge } from "./project-badges"
import {
  PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  formatDate,
  newId,
  parseTags,
  type Task,
  type Priority,
  type TaskStatus,
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

const columnHelper = createColumnHelper<DataTableFeatures, Task>()

const columns = columnHelper.columns([
  columnHelper.accessor((row) => `${row.title} ${row.description}`, {
    id: "search",
    header: "",
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor("title", {
    header: ({ column }) => <SortHeader label="Tarea" column={column} />,
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="font-medium">{row.original.title}</div>
        {row.original.tags.length ? (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {row.original.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-1.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    ),
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => <SortHeader label="Estado" column={column} />,
    cell: ({ row }) => <TaskStatusBadge status={row.original.status} />,
  }),
  columnHelper.accessor("priority", {
    header: ({ column }) => <SortHeader label="Prioridad" column={column} />,
    cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
  }),
  columnHelper.accessor("assignee", {
    header: ({ column }) => <SortHeader label="Asignada a" column={column} />,
    cell: ({ row }) =>
      row.original.assignee || (
        <span className="text-muted-foreground">Sin asignar</span>
      ),
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
  columnHelper.accessor("estimatedHours", {
    header: ({ column }) => <SortHeader label="Horas" column={column} />,
    cell: ({ row }) =>
      row.original.estimatedHours === null ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        <span className="tabular-nums">{row.original.estimatedHours} h</span>
      ),
  }),
])

// Texto libre primero y controles compactos después: así el reparto en filas
// (dos por fila con texto, tres sin él) cierra sin huecos.
const fields: readonly FieldDTO[] = [
  {
    kind: "text",
    name: "title",
    label: "Título",
    placeholder: "Relevamiento de requisitos",
    required: true,
  },
  {
    kind: "textarea",
    name: "description",
    label: "Descripción",
    placeholder: "Detalle de la tarea",
    rows: 3,
  },
  {
    kind: "text",
    name: "assignee",
    label: "Asignada a",
    placeholder: "Juan Pérez",
  },
  {
    kind: "tags",
    name: "tags",
    label: "Etiquetas (separadas por comas)",
    placeholder: "frontend, ui, bug",
  },
  {
    kind: "select",
    name: "status",
    label: "Estado",
    options: TASK_STATUS_OPTIONS,
    defaultValue: "todo",
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
    kind: "number",
    name: "estimatedHours",
    label: "Horas estimadas",
    min: 0,
    step: 0.5,
  },
]

const buildTask = (values: FieldValues): Omit<Task, "id"> => ({
  title: values.title.trim(),
  description: (values.description ?? "").trim(),
  status: values.status as TaskStatus,
  priority: values.priority as Priority,
  assignee: (values.assignee ?? "").trim(),
  startDate: values.startDate ?? "",
  endDate: values.endDate ?? "",
  estimatedHours: values.estimatedHours ? Number(values.estimatedHours) : null,
  tags: parseTags(values.tags ?? ""),
})

export const taskCreate: CreateDTO<Task> = {
  triggerLabel: "Nueva tarea",
  title: "Nueva tarea",
  description: "La tarea se agrega al proyecto y actualiza su progreso.",
  submitLabel: "Crear tarea",
  cancelLabel: "Cancelar",
  fields,
  build: (values) => ({ id: newId(), ...buildTask(values) }),
}

export const taskEdit: EditDTO<Task> = {
  label: "Editar tarea",
  title: (row) => `Editar ${row.title}`,
  description: "Actualizá los datos de la tarea.",
  submitLabel: "Guardar cambios",
  cancelLabel: "Cancelar",
  fields,
  toValues: (row) => ({
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assignee: row.assignee,
    startDate: row.startDate,
    endDate: row.endDate,
    estimatedHours:
      row.estimatedHours === null ? "" : String(row.estimatedHours),
    tags: row.tags.join(", "),
  }),
  build: (values, row) => ({ id: row.id, ...buildTask(values) }),
}

export const taskDetail: DetailDTO<Task> = {
  label: "Ver detalle",
  title: (row) => row.title,
  description: (row) => row.description || "Sin descripción",
  closeLabel: "Cerrar",
}

export const taskDelete = {
  title: "Eliminar tarea",
  message: (count: number) =>
    count === 1
      ? "¿Eliminar la tarea seleccionada? Esta acción no se puede deshacer."
      : `¿Eliminar ${count} tareas? Esta acción no se puede deshacer.`,
  confirmLabel: "Eliminar",
  cancelLabel: "Cancelar",
}

export const taskDTO = defineTableDTO<Task>({
  columns,
  rowId: (row) => row.id,
  hiddenColumns: ["search", "endDate", "estimatedHours"],
  columnLabels: {
    title: "Tarea",
    status: "Estado",
    priority: "Prioridad",
    assignee: "Asignada a",
    startDate: "Inicio",
    endDate: "Fin",
    estimatedHours: "Horas",
  },
  search: { columnId: "search", placeholder: "Buscar tareas..." },
  pageSizeOptions: [5, 10, 20],
  labels: {
    selectAll: "Seleccionar todo",
    selectRow: "Seleccionar fila",
    openRowMenu: "Abrir acciones de la tarea",
    rowsPerPage: "Filas por página",
    columns: "Columnas",
    noResults: "Sin tareas para mostrar.",
    previous: "Anterior",
    next: "Siguiente",
    selectedRows: (selected, total) =>
      `${selected} de ${total} tarea(s) seleccionada(s).`,
    selectedCount: (count) => `${count} seleccionadas`,
  },
  create: taskCreate,
  edit: taskEdit,
  detail: taskDetail,
  rowActionsMenuLabel: "Acciones",
  rowActions: [
    {
      id: "delete",
      label: "Eliminar tarea",
      variant: "destructive",
      run: (row, ctx) => ctx.remove([row]),
    },
  ],
  bulkMenuLabel: "Acciones",
  bulkActions: [
    {
      id: "delete-selected",
      label: "Eliminar seleccionadas",
      variant: "destructive",
      run: (rows, ctx) => {
        ctx.remove(rows)
        ctx.clearSelection()
      },
    },
  ],
  confirm: taskDelete,
})
