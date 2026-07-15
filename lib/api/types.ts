import type { EstadoProducto } from "@/lib/db/schema"

/**
 * DTOs compartidos entre la capa server (queries + route handlers) y el cliente
 * (fetchers + hooks). Solo tipos, sin dependencias de la DB ni del browser.
 */

export type OrdenCampo = "codigoInterno" | "nombre" | "stock" | "mejorPrecio"
export type OrdenDir = "asc" | "desc"

export type FiltrosProductos = {
  query?: string
  sistema?: string
  categoria?: string
  estado?: EstadoProducto | "todos"
  ordenCampo?: OrdenCampo
  ordenDir?: OrdenDir
  page?: number
  pageSize?: number
}

/** Fila del listado de catálogo: SKU maestro + resumen de ofertas. */
export type ProductoListItem = {
  id: number
  codigoInterno: string
  nombre: string
  familia: string
  categoria: string
  sistema: string
  marca: string
  medida: string
  esGenerico: boolean
  estado: EstadoProducto
  ubicacion: string
  stock: number
  stockMinimo: number
  stockMaximo: number
  /** Menor precio vigente entre los proveedores que lo ofrecen (null si ninguno). */
  mejorPrecio: number | null
  numProveedores: number
}

export type ListaProductosResponse = {
  items: ProductoListItem[]
  total: number
  page: number
  pageSize: number
  totalPaginas: number
}

/** Oferta de un proveedor para un SKU (equivalencia + precio). */
export type Oferta = {
  proveedorId: number
  proveedor: string
  esHabitual: boolean
  codigoProveedor: string
  precio: number
  vigenciaDesde: string
  /** Marca la oferta más barata del SKU. */
  esMasBarato: boolean
}

export type ProductoDetalle = ProductoListItem & {
  material: string
  ofertas: Oferta[]
}

export type ResumenCatalogo = {
  totalSkus: number
  activos: number
  limbo: number
  noComercializa: number
  sinProveedor: number
  bajoStock: number
  valorStock: number
}
