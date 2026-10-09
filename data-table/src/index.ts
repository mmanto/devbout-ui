/**
 * @mmanto/devbout-ui — primitivas base-mira + data-table declarativo.
 *
 * Punto de entrada único. Todo el paquete es cliente (`"use client"` va en el
 * bundle): son componentes de UI con estado, pensados para React 19.
 */

// ── utilidades ────────────────────────────────────────────────────────────────
export { cn } from "./lib/utils"
export { EntityNavigateProvider, useEntityNavigate } from "./lib/navigate"
export type { NavigateFn } from "./lib/navigate"

// ── data-table ────────────────────────────────────────────────────────────────
export * from "./data-table/types"
export { DataTable } from "./data-table/data-table"
export { features } from "./data-table/features"
export type { DataTableFeatures } from "./data-table/features"
export { buildRowActionsColumn, buildSelectColumn } from "./data-table/columns"
export { ConfirmDialog } from "./data-table/confirm-dialog"
export { DetailEntity } from "./data-table/entity-detail"
export {
  CreateEntity,
  EditEntity,
  EntityFormFields,
  FormFooter,
} from "./data-table/entity-form"

// ── vista de entidad (modal / drawer / página) ────────────────────────────────
export { EntityView, EntityViewProvider, useEntityViewMode } from "./entity-view"
export type { EntityViewMode } from "./entity-view"

// ── primitivas base-mira ──────────────────────────────────────────────────────
export { Button, buttonVariants } from "./ui/button"
export { Checkbox } from "./ui/checkbox"
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
export { Input } from "./ui/input"
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
export { Separator } from "./ui/separator"
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
export { Textarea } from "./ui/textarea"
