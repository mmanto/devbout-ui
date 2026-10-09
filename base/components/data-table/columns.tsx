"use client"

import {
  createColumnHelper,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { type DataTableFeatures } from "./features"
import type { RowActionDTO, TableActionContext } from "./types"

export function buildSelectColumn<TData extends RowData>(labels: {
  selectAll: string
  selectRow: string
}): ColumnDef<DataTableFeatures, TData> {
  return createColumnHelper<DataTableFeatures, TData>().display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label={labels.selectAll}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={labels.selectRow}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  })
}

export function buildRowActionsColumn<TData extends RowData>(
  actions: readonly RowActionDTO<TData>[],
  ctx: TableActionContext<TData>,
  labels: { menu: string; open: string }
): ColumnDef<DataTableFeatures, TData> {
  return createColumnHelper<DataTableFeatures, TData>().display({
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" />}>
          <span className="sr-only">{labels.open}</span>
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{labels.menu}</DropdownMenuLabel>
            {actions.map((action) => (
              <DropdownMenuItem
                key={action.id}
                variant={action.variant}
                onClick={() => action.run(row.original, ctx)}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  })
}
