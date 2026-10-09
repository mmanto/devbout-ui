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

// ── hooks ─────────────────────────────────────────────────────────────────────
export { useIsMobile } from "./hooks/use-mobile"

// ── data-table ────────────────────────────────────────────────────────────────
// La API de columnas de TanStack se re-exporta desde acá: el consumidor escribe
// sus DTOs sin instalar `@tanstack/react-table` por su cuenta y, sobre todo,
// queda una sola instancia de `@tanstack/table-core` en la app (dos copias
// producen tipos nominalmente incompatibles).
export { createColumnHelper } from "@tanstack/react-table"
export type { ColumnDef, RowData } from "@tanstack/react-table"

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
export {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "./ui/avatar"
export { Badge, badgeVariants } from "./ui/badge"
export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb"
export { Button, buttonVariants } from "./ui/button"
export { Checkbox } from "./ui/checkbox"
export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible"
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
export { Progress } from "./ui/progress"
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
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "./ui/sidebar"
export { Skeleton } from "./ui/skeleton"
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
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
