"use client"

import { useMemo, useReducer, useState, type ChangeEvent } from "react"
import { ChevronLeft, ChevronRight, Download, PackageSearch } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchProductos } from "@/lib/api/productos"
import { useProductos } from "@/lib/hooks/use-productos"
import { useDebounced } from "@/lib/hooks/use-debounced"
import type { FiltrosProductos, OrdenCampo } from "@/lib/api/types"

import { CatalogoDetailDialog } from "./catalogo-detail-dialog"
import { CatalogoFilters } from "./catalogo-filters"
import { CatalogoTable } from "./catalogo-table"
import { productosToCsv } from "./export-csv"
import { filtrosIniciales, filtrosReducer } from "./filtros-reducer"
import type { EstadoFiltro } from "./types"

const PAGE_SIZE = 20

export function CatalogoView() {
  const [filtros, dispatch] = useReducer(filtrosReducer, filtrosIniciales)
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null)
  const [exportando, setExportando] = useState(false)

  const queryDebounced = useDebounced(filtros.query, 300)

  const params = useMemo<FiltrosProductos>(
    () => ({
      query: queryDebounced,
      sistema: filtros.sistema,
      categoria: filtros.categoria,
      estado: filtros.estado,
      ordenCampo: filtros.orden.campo,
      ordenDir: filtros.orden.dir,
      page: filtros.page,
      pageSize: PAGE_SIZE,
    }),
    [
      queryDebounced,
      filtros.sistema,
      filtros.categoria,
      filtros.estado,
      filtros.orden,
      filtros.page,
    ]
  )

  const { data, isLoading, isError } = useProductos(params)
  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPaginas = data?.totalPaginas ?? 1
  const paginaActual = data?.page ?? filtros.page

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    dispatch({ type: "query", value: event.target.value })
  }

  function handleSistemaFilter(value: string) {
    dispatch({ type: "sistema", value })
  }

  function handleCategoriaFilter(event: ChangeEvent<HTMLSelectElement>) {
    dispatch({ type: "categoria", value: event.target.value })
  }

  function handleEstadoFilter(value: EstadoFiltro) {
    dispatch({ type: "estado", value })
  }

  function handleSort(campo: OrdenCampo) {
    dispatch({ type: "sort", campo })
  }

  function handleSelectProducto(producto: { id: number }) {
    setSeleccionadoId(producto.id)
  }

  function handleCloseDetalle() {
    setSeleccionadoId(null)
  }

  async function handleExportCsv() {
    setExportando(true)
    try {
      // Exporta TODO el resultado filtrado (no solo la página visible).
      const todos = await fetchProductos({ ...params, page: 1, pageSize: 100_000 })
      const csv = productosToCsv(todos.items)
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const enlace = document.createElement("a")
      enlace.href = url
      enlace.download = "catalogo-ferreteria.csv"
      enlace.click()
      URL.revokeObjectURL(url)
    } finally {
      setExportando(false)
    }
  }

  function handlePrevPage() {
    dispatch({ type: "page", value: Math.max(1, paginaActual - 1) })
  }

  function handleNextPage() {
    dispatch({ type: "page", value: Math.min(totalPaginas, paginaActual + 1) })
  }

  const desde = total === 0 ? 0 : (paginaActual - 1) * PAGE_SIZE + 1
  const hasta = Math.min(paginaActual * PAGE_SIZE, total)

  return (
    <div className="flex min-h-full flex-col bg-background">
      <main className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="flex flex-col gap-1">
          <h1 className="flex items-center gap-2 font-heading text-4xl font-normal text-foreground">
            <PackageSearch className="size-8 text-primary" aria-hidden="true" />
            Catálogo maestro
          </h1>
          <p className="text-sm text-muted-foreground">
            SKUs internos propios. Las listas de proveedor son tarifarios vinculados, no el
            inventario.
          </p>
        </section>

        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <CardTitle>Artículos</CardTitle>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {isLoading ? "cargando…" : `${total} SKUs`}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportCsv}
                  disabled={total === 0 || exportando}
                >
                  <Download className="size-3.5" aria-hidden="true" />
                  {exportando ? "Exportando…" : "Exportar CSV"}
                </Button>
              </div>
              <CatalogoFilters
                query={filtros.query}
                sistema={filtros.sistema}
                categoria={filtros.categoria}
                estado={filtros.estado}
                onSearchChange={handleSearchChange}
                onSistemaChange={handleSistemaFilter}
                onCategoriaChange={handleCategoriaFilter}
                onEstadoChange={handleEstadoFilter}
              />
            </div>
          </CardHeader>

          <CardContent className="px-0">
            {isError ? (
              <p className="px-6 py-16 text-center text-sm text-destructive">
                No se pudo cargar el catálogo. Reintentá en unos segundos.
              </p>
            ) : (
              <CatalogoTable
                productos={items}
                orden={filtros.orden}
                onSort={handleSort}
                onSelectProducto={handleSelectProducto}
              />
            )}
          </CardContent>

          {total > 0 ? (
            <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
              <span className="text-xs text-muted-foreground tabular-nums">
                {desde}-{hasta} de {total}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground tabular-nums">
                  Página {paginaActual} de {totalPaginas}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Página anterior"
                  disabled={paginaActual <= 1}
                  onClick={handlePrevPage}
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Página siguiente"
                  disabled={paginaActual >= totalPaginas}
                  onClick={handleNextPage}
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      </main>

      <CatalogoDetailDialog productoId={seleccionadoId} onClose={handleCloseDetalle} />
    </div>
  )
}
