import { getJson, patchJson, toQuery } from "./http"
import type {
  FiltrosProductos,
  ListaProductosResponse,
  ProductoDetalle,
  ResumenCatalogo,
} from "./types"

export function fetchProductos(
  filtros: FiltrosProductos
): Promise<ListaProductosResponse> {
  const qs = toQuery({
    query: filtros.query,
    sistema: filtros.sistema,
    categoria: filtros.categoria,
    estado: filtros.estado,
    ordenCampo: filtros.ordenCampo,
    ordenDir: filtros.ordenDir,
    page: filtros.page,
    pageSize: filtros.pageSize,
  })
  return getJson<ListaProductosResponse>(`/api/productos${qs}`)
}

export function fetchProducto(id: number): Promise<ProductoDetalle> {
  return getJson<ProductoDetalle>(`/api/productos/${id}`)
}

export function fetchResumenCatalogo(): Promise<ResumenCatalogo> {
  return getJson<ResumenCatalogo>("/api/catalogo/resumen")
}

export function actualizarProducto(
  id: number,
  cambios: { estado?: ProductoDetalle["estado"]; esGenerico?: boolean }
): Promise<ProductoDetalle> {
  return patchJson<ProductoDetalle>(`/api/productos/${id}`, cambios)
}
