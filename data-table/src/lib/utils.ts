import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge de clases condicionales con resolución de conflictos de Tailwind.
 *
 * El paquete lo implementa con `clsx` + `tailwind-merge` (en vez de depender del
 * paquete `cn`, que exige su plugin de Vite/Next en cada consumidor) para que
 * instalar `@mmanto/devbout-ui` no cambie el pipeline de build de la app.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
