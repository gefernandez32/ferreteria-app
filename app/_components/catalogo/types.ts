import type { EstadoProducto } from "@/lib/db/schema"
import type { OrdenCampo, OrdenDir } from "@/lib/api/types"

/** Valor del filtro de sistema: un sistema concreto o "todos". */
export type SistemaFiltro = string

/** Valor del filtro de categoría: una categoría concreta o "todas". */
export type CategoriaFiltro = string

/** Valor del filtro de estado del catálogo. */
export type EstadoFiltro = EstadoProducto | "todos"

/** Estado de ordenamiento de la tabla (campos que soporta la API). */
export type Orden = { campo: OrdenCampo; dir: OrdenDir }

/** Metadatos de presentación por estado del SKU. */
export const estadoMeta: Record<
  EstadoProducto,
  { label: string; toneClass: string }
> = {
  activo: { label: "Activo", toneClass: "bg-success/10 text-success" },
  limbo: { label: "En limbo", toneClass: "bg-warning/15 text-warning-foreground" },
  no_comercializa: {
    label: "No se comercializa",
    toneClass: "bg-muted text-muted-foreground",
  },
}
