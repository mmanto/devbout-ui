"use client"

import * as React from "react"
import {
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type RowData,
  type SortingState,
} from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  MoreHorizontalIcon,
  PlusSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "../ui/button"
import { useEntityNavigate } from "../lib/navigate"
import { useEntityViewMode } from "../entity-view"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Separator } from "../ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"

import { buildRowActionsColumn, buildSelectColumn } from "./columns"
import { ConfirmDialog } from "./confirm-dialog"
import { DetailEntity } from "./entity-detail"
import { CreateEntity, EditEntity } from "./entity-form"
import { features, type DataTableFeatures } from "./features"
import type {
  BulkActionDTO,
  RowActionDTO,
  TableActionContext,
  TableDTO,
} from "./types"

interface DataTableProps<TData extends RowData> {
  dto: TableDTO<TData>
  data: TData[]
}

type ConfirmRequest<TData> = {
  rows: TData[]
  run: (rows: TData[]) => void
}

export function DataTable<TData extends RowData>({
  dto,
  data,
}: DataTableProps<TData>) {
  // With `onDataChange` the owner keeps the rows and the table renders `data`;
  // without it the table owns a local copy.
  const [localRows, setLocalRows] = React.useState<TData[]>(() => data)
  const rows = dto.onDataChange ? data : localRows
  const { mode } = useEntityViewMode()
  const navigate = useEntityNavigate()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>(() =>
      Object.fromEntries((dto.hiddenColumns ?? []).map((id) => [id, false]))
    )
  const [rowSelection, setRowSelection] = React.useState({})
  const [confirmRequest, setConfirmRequest] =
    React.useState<ConfirmRequest<TData> | null>(null)
  const [panel, setPanel] = React.useState<
    { kind: "create" } | { kind: "edit" | "detail"; row: TData } | null
  >(null)

  const labels = dto.labels
  const confirm = dto.confirm
  const rowId = dto.rowId
  const onDataChange = dto.onDataChange

  const ctx = React.useMemo<TableActionContext<TData>>(() => {
    const commit = (next: TData[]) => {
      if (onDataChange) {
        onDataChange(next)
        return
      }
      setLocalRows(next)
    }

    return {
      add: (row) => commit([row, ...rows]),
      update: (row, updated) =>
        commit(rows.map((current) => (current === row ? updated : current))),
      remove: (removed) => commit(rows.filter((row) => !removed.includes(row))),
      clearSelection: () => setRowSelection({}),
    }
  }, [rows, onDataChange])

  // The detail and edit panels always work on the live row, so a surface that
  // mutates the row (e.g. adding tasks) keeps rendering current data.
  const panelRow =
    panel && panel.kind !== "create"
      ? rowId
        ? rows.find((row) => rowId(row) === rowId(panel.row))
        : panel.row
      : undefined

  const rowActions = React.useMemo<RowActionDTO<TData>[]>(() => {
    const actions: RowActionDTO<TData>[] = []

    if (dto.detail) {
      const href = dto.detail.href
      actions.push({
        id: "detail",
        label: dto.detail.label,
        run: (row) => {
          if (href) {
            navigate(href(row))
            return
          }
          setPanel({ kind: "detail", row })
        },
      })
    }
    if (dto.edit) {
      const href = dto.edit.href
      actions.push({
        id: "edit",
        label: dto.edit.label,
        run: (row) => {
          if (href) {
            navigate(href(row))
            return
          }
          setPanel({ kind: "edit", row })
        },
      })
    }

    for (const action of dto.rowActions ?? []) {
      // Destructive actions ask for confirmation before touching the rows.
      if (action.variant === "destructive" && confirm) {
        actions.push({
          ...action,
          run: (row) =>
            setConfirmRequest({
              rows: [row],
              run: (rows) => action.run(rows[0], ctx),
            }),
        })
        continue
      }
      actions.push(action)
    }

    return actions
  }, [dto.detail, dto.edit, dto.rowActions, confirm, ctx, navigate])

  const columns = React.useMemo(() => {
    const result: ColumnDef<DataTableFeatures, TData>[] = []

    if (dto.selectable !== false) {
      result.push(
        buildSelectColumn<TData>({
          selectAll: labels?.selectAll ?? "Select all",
          selectRow: labels?.selectRow ?? "Select row",
        })
      )
    }
    result.push(...dto.columns)
    if (rowActions.length) {
      result.push(
        buildRowActionsColumn(rowActions, ctx, {
          menu: dto.rowActionsMenuLabel ?? "Actions",
          open: labels?.openRowMenu ?? "Open menu",
        })
      )
    }

    return result
  }, [
    dto.columns,
    dto.selectable,
    dto.rowActionsMenuLabel,
    rowActions,
    ctx,
    labels,
  ])

  const table = useTable({
    features,
    data: rows,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const search = dto.search
  const bulkRows = dto.bulkActions?.length
    ? table.getFilteredSelectedRowModel().rows
    : []
  const bulkActions = dto.bulkActions ?? []
  const destructiveBulkActions = bulkActions.filter(
    (action) => action.variant === "destructive"
  )
  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const filteredCount = table.getFilteredRowModel().rows.length

  const runBulkAction = (action: BulkActionDTO<TData>) => {
    const selected = bulkRows.map((row) => row.original)
    if (action.variant === "destructive" && confirm) {
      setConfirmRequest({
        rows: selected,
        run: (rows) => action.run(rows, ctx),
      })
      return
    }
    action.run(selected, ctx)
  }

  const searchInputRef = React.useRef<HTMLInputElement>(null)

  /**
   * The grid already filters while typing; this commits the query on demand
   * (magnifier click or Enter) and hands the caret back to the field.
   */
  const runSearch = () => {
    const column = search ? table.getColumn(search.columnId) : undefined
    if (!column) {
      return
    }

    column.setFilterValue(searchInputRef.current?.value ?? "")
    searchInputRef.current?.focus()
  }

  const panels = (
    <>
      {dto.create && panel?.kind === "create" ? (
        <CreateEntity
          create={dto.create}
          open
          onOpenChange={(open) => {
            if (!open) setPanel(null)
          }}
          onSubmit={(row) => {
            ctx.add(row)
            setPanel(null)
          }}
        />
      ) : null}
      {dto.edit && panel?.kind === "edit" && panelRow ? (
        <EditEntity
          edit={dto.edit}
          row={panelRow}
          open
          onOpenChange={(open) => {
            if (!open) setPanel(null)
          }}
          onSubmit={(next) => {
            ctx.update(panelRow, next)
            setPanel(null)
          }}
        />
      ) : null}
      {panel?.kind === "detail" && panelRow ? (
        dto.detailSurface ? (
          dto.detailSurface({
            row: panelRow,
            ctx,
            close: () => setPanel(null),
          })
        ) : dto.detail ? (
          <DetailEntity
            detail={dto.detail}
            row={panelRow}
            open
            onOpenChange={(open) => {
              if (!open) setPanel(null)
            }}
          />
        ) : null
      ) : null}
      {confirm && confirmRequest ? (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) setConfirmRequest(null)
          }}
          title={confirm.title}
          message={confirm.message(confirmRequest.rows.length)}
          confirmLabel={confirm.confirmLabel}
          cancelLabel={confirm.cancelLabel}
          onConfirm={() => {
            confirmRequest.run(confirmRequest.rows)
            setConfirmRequest(null)
          }}
        />
      ) : null}
    </>
  )

  // A page view takes over the whole content area instead of the table.
  if (mode === "page" && panel) {
    return <div className="flex w-full flex-1 flex-col">{panels}</div>
  }

  return (
    <div className="w-full">
      {dto.header ? <div className="pt-4">{dto.header(rows)}</div> : null}
      <div className="flex items-center gap-2 py-4">
        {search ? (
          <div className="relative w-full max-w-sm">
            <Input
              ref={searchInputRef}
              placeholder={search.placeholder}
              value={
                (table.getColumn(search.columnId)?.getFilterValue() as
                  string | undefined) ?? ""
              }
              onChange={(event) =>
                table
                  .getColumn(search.columnId)
                  ?.setFilterValue(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  runSearch()
                }
              }}
              className="pr-7"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={labels?.searchAction ?? "Buscar"}
              onClick={runSearch}
              className="absolute top-1/2 right-0.5 -translate-y-1/2"
            >
              <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
            </Button>
          </div>
        ) : null}
        {search && dto.create ? (
          <Separator
            orientation="vertical"
            className="data-vertical:h-4 data-vertical:self-auto"
          />
        ) : null}
        {dto.create ? (
          <Button
            variant={dto.create.triggerVariant ?? "outline"}
            onClick={() => setPanel({ kind: "create" })}
          >
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
            {dto.create.triggerLabel}
          </Button>
        ) : null}
        {bulkRows.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
              {dto.bulkMenuLabel ?? "Op Mas"}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  {labels?.selectedCount?.(bulkRows.length) ??
                    `${bulkRows.length} selected`}
                </DropdownMenuLabel>
                {bulkActions
                  .filter((action) => action.variant !== "destructive")
                  .map((action) => (
                    <DropdownMenuItem
                      key={action.id}
                      variant={action.variant}
                      onClick={() => runBulkAction(action)}
                    >
                      {action.label}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuGroup>
              {destructiveBulkActions.length ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {destructiveBulkActions.map((action) => (
                      <DropdownMenuItem
                        key={action.id}
                        variant={action.variant}
                        onClick={() => runBulkAction(action)}
                      >
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        {/* El selector se explica solo; la etiqueta queda solo para lectores
            de pantalla. */}
        <label htmlFor="table-page-size" className="sr-only">
          {labels?.rowsPerPage ?? "Rows per page"}
        </label>
        <Select
          id="table-page-size"
          value={table.state.pagination.pageSize}
          onValueChange={(value) => {
            if (value != null) table.setPageSize(value)
          }}
        >
          <SelectTrigger className="ml-auto w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(dto.pageSizeOptions ?? [10, 20, 30, 40, 50]).map((pageSize) => (
              <SelectItem key={pageSize} value={pageSize}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            {labels?.columns ?? "Columns"}
            <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuGroup>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {dto.columnLabels?.[column.id] ?? column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={dto.detail ? "cursor-pointer" : undefined}
                  onClick={
                    dto.detail
                      ? (event) => {
                          // Let the checkbox, menus, links and other controls keep
                          // their own behaviour.
                          const target = event.target as HTMLElement
                          if (
                            target.closest(
                              "button, a, input, select, textarea, label, [role='checkbox'], [role='menuitem'], [data-slot='checkbox']"
                            )
                          ) {
                            return
                          }
                          if (dto.detail?.href) {
                            navigate(dto.detail.href(row.original))
                            return
                          }
                          setPanel({ kind: "detail", row: row.original })
                        }
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  {labels?.noResults ?? "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2 py-4">
        {dto.selectable !== false ? (
          <div className="flex-1 text-sm text-muted-foreground">
            {labels?.selectedRows?.(selectedCount, filteredCount) ??
              `${selectedCount} of ${filteredCount} row(s) selected.`}
          </div>
        ) : null}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {labels?.previous ?? "Previous"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {labels?.next ?? "Next"}
          </Button>
        </div>
      </div>
      {panels}
    </div>
  )
}
