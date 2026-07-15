"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  actualizarProducto,
  fetchProducto,
  fetchProductos,
  fetchResumenCatalogo,
} from "@/lib/api/productos"
import type { FiltrosProductos, ProductoDetalle } from "@/lib/api/types"

/** Query keys centralizadas para invalidación consistente. */
export const productosKeys = {
  all: ["productos"] as const,
  list: (filtros: FiltrosProductos) => ["productos", "list", filtros] as const,
  detail: (id: number) => ["productos", "detail", id] as const,
  resumen: ["catalogo", "resumen"] as const,
}

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: productosKeys.list(filtros),
    queryFn: () => fetchProductos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useProducto(id: number | null) {
  return useQuery({
    queryKey: productosKeys.detail(id ?? 0),
    queryFn: () => fetchProducto(id as number),
    enabled: id !== null,
  })
}

export function useResumenCatalogo() {
  return useQuery({
    queryKey: productosKeys.resumen,
    queryFn: fetchResumenCatalogo,
  })
}

export function useActualizarProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      cambios,
    }: {
      id: number
      cambios: { estado?: ProductoDetalle["estado"]; esGenerico?: boolean }
    }) => actualizarProducto(id, cambios),
    onSuccess: (producto) => {
      queryClient.setQueryData(productosKeys.detail(producto.id), producto)
      queryClient.invalidateQueries({ queryKey: productosKeys.all })
      queryClient.invalidateQueries({ queryKey: productosKeys.resumen })
    },
  })
}
