"use client"

import { createColumnHelper } from "@mmanto/devbout-ui"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpDownIcon } from "@hugeicons/core-free-icons"

import { type DataTableFeatures } from "@mmanto/devbout-ui"
import {
  defineEntitySchema,
  defineEntity,
  defineTableDTO,
  type EntityDTO,
  type FieldDTO,
} from "@mmanto/devbout-ui"
import { Button } from "@mmanto/devbout-ui"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Deployment = {
  project: string
  branch: string
  status: "Ready" | "Building" | "Failed"
  duration: string
}

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, Deployment>()

const columns = columnHelper.columns([
  columnHelper.accessor("project", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project
          <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("project")}</div>
    ),
  }),
  columnHelper.accessor("branch", {
    header: "Branch",
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")}</div>
    ),
  }),
  columnHelper.accessor("duration", {
    header: () => <div className="text-right">Duration</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("duration")}</div>
    ),
  }),
])

// Una sola declaración de campos: de acá salen el alta, la edición y el detalle.
const fields: readonly FieldDTO[] = [
  {
    kind: "text",
    name: "project",
    label: "Project",
    placeholder: "acme-web",
    required: true,
    rules: { maxLength: 40 },
  },
  {
    kind: "text",
    name: "branch",
    label: "Branch",
    placeholder: "main",
    defaultValue: "main",
    rules: { pattern: "^[A-Za-z0-9._/-]+$" },
  },
  {
    kind: "select",
    name: "status",
    label: "Status",
    defaultValue: "Building",
    display: "badge",
    options: [
      { value: "Ready", label: "Ready", variant: "success" },
      { value: "Building", label: "Building", variant: "warning" },
      { value: "Failed", label: "Failed", variant: "destructive" },
    ],
  },
  // Derivado por el build: se ve en el detalle, no se edita.
  { kind: "text", name: "duration", label: "Duration", formHidden: true },
]

export const deployEntity: EntityDTO<Deployment> = defineEntity<Deployment>({
  schema: defineEntitySchema({
    fields,
    labels: {
      createLabel: "Add project",
      createTitle: "Add project",
      createDescription:
        "Create a new project deployment. It will be added to the table.",
      createSubmit: "Create project",
      editLabel: "Edit deployment",
      editDescription: "Update the deployment metadata.",
      editSubmit: "Save changes",
      detailLabel: "View deployment",
    },
  }),
  build: (values, row) => ({
    project: values.project.trim(),
    branch: values.branch.trim() || "main",
    status: values.status as Deployment["status"],
    duration: row?.duration ?? "—",
  }),
  create: { variant: "default" },
  edit: { title: (row) => `Edit ${row.project}` },
  detail: {
    title: (row) => row.project,
    description: "Read-only summary of the selected deployment.",
  },
})

export const deployDTO = defineTableDTO<Deployment>({
  columns,
  search: { columnId: "project", placeholder: "Filter projects..." },
  entity: deployEntity,
  rowActionsMenuLabel: "Actions",
  rowActions: [
    {
      id: "copy-project",
      label: "Copy project name",
      run: (row) => void navigator.clipboard.writeText(row.project),
    },
    { id: "view-logs", label: "View logs", run: () => {} },
  ],
  bulkMenuLabel: "Op Mas",
  bulkActions: [
    {
      id: "copy-names",
      label: "Copy project names",
      run: (rows) =>
        void navigator.clipboard.writeText(
          rows.map((row) => row.project).join("\n")
        ),
    },
    {
      id: "delete-selected",
      label: "Delete selected",
      variant: "destructive",
      run: (rows, ctx) => {
        ctx.remove(rows)
        ctx.clearSelection()
      },
    },
  ],
})
