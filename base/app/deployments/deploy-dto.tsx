"use client"

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

const fields: readonly FieldDTO[] = [
  {
    kind: "text",
    name: "project",
    label: "Project",
    placeholder: "acme-web",
    required: true,
  },
  {
    kind: "text",
    name: "branch",
    label: "Branch",
    placeholder: "main",
    defaultValue: "main",
  },
  {
    kind: "select",
    name: "status",
    label: "Status",
    options: ["Ready", "Building", "Failed"],
    defaultValue: "Building",
  },
]

export const deployCreate: CreateDTO<Deployment> = {
  triggerLabel: "Add project",
  title: "Add project",
  description:
    "Create a new project deployment. It will be added to the table.",
  submitLabel: "Create project",
  fields,
  build: (values) => ({
    project: values.project.trim(),
    branch: values.branch.trim() || "main",
    status: values.status as Deployment["status"],
    duration: "—",
  }),
}

export const deployEdit: EditDTO<Deployment> = {
  label: "Edit deployment",
  title: (row) => `Edit ${row.project}`,
  description: "Update the deployment metadata.",
  submitLabel: "Save changes",
  fields,
  toValues: (row) => ({
    project: row.project,
    branch: row.branch,
    status: row.status,
  }),
  build: (values, row) => ({
    ...row,
    project: values.project.trim(),
    branch: values.branch.trim() || "main",
    status: values.status as Deployment["status"],
  }),
}

export const deployDetail: DetailDTO<Deployment> = {
  label: "View deployment",
  title: (row) => row.project,
  description: "Read-only summary of the selected deployment.",
  fields: [
    { label: "Project", value: (row) => row.project },
    { label: "Branch", value: (row) => row.branch },
    {
      label: "Status",
      value: (row) => <span className="capitalize">{row.status}</span>,
    },
    { label: "Duration", value: (row) => row.duration },
  ],
}

export const deployDTO = defineTableDTO<Deployment>({
  columns,
  search: { columnId: "project", placeholder: "Filter projects..." },
  create: deployCreate,
  edit: deployEdit,
  detail: deployDetail,
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
