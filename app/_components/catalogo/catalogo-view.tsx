"use client"

import { useMemo, useState, type ChangeEvent } from "react"
import { ChevronLeft, ChevronRight, Download, PackageSearch } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { productos, type Producto } from "@/lib/data"

import { CatalogoDetailDialog } from "./catalogo-detail-dialog"
import { CatalogoFilters } from "./catalogo-filters"
import { CatalogoTable } from "./catalogo-table"
import { productosToCsv } from "./export-csv"
import type { CategoriaFiltro, Orden, OrdenCampo, SistemaFiltro } from "./types"

const PAGE_SIZE = 20
const ORDEN_INICIAL: Orden = { campo: "codigo", dir: "asc" }

export function CatalogoView() {
  const [query, setQuery] = useState("")
  const [sistema, setSistema] = useState<SistemaFiltro>("todos")
  const [categoria, setCategoria] = useState<CategoriaFiltro>("todas")
  const [orden, setOrden] = useState<Orden>(ORDEN_INICIAL)
  const [page, setPage] = useState(1)
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null)

  // Filtrado por sistema + búsqueda (sin categoría) — base para los conteos.
  const baseSinCategoria = useMemo(() => {
    const q = query.trim().toLowerCase()
    return productos.filter((p) => {
      if (sistema !== "todos" && p.sistema !== sistema) return false
      if (q && !`${p.codigo} ${p.nombre}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [query, sistema])

  const conteoCategorias = useMemo(() => {
    return baseSinCategoria.reduce<Record<string, number>>((acc, p) => {
      acc[p.categoria] = (acc[p.categoria] ?? 0) + 1
      return acc
    }, {})
  }, [baseSinCategoria])

  const ordenados = useMemo(() => {
    const filtrados =
      categoria === "todas"
        ? baseSinCategoria
        : baseSinCategoria.filter((p) => p.categoria === categoria)
    const factor = orden.dir === "asc" ? 1 : -1
    return filtrados.toSorted((a, b) => {
      if (orden.campo === "codigo") return a.codigo.localeCompare(b.codigo) * factor
      return (a[orden.campo] - b[orden.campo]) * factor
    })
  }, [baseSinCategoria, categoria, orden])

  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / PAGE_SIZE))
  const paginaActual = Math.min(page, totalPaginas)

  const visibles = useMemo(() => {
    const inicio = (paginaActual - 1) * PAGE_SIZE
    return ordenados.slice(inicio, inicio + PAGE_SIZE)
  }, [ordenados, paginaActual])

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value)
    setPage(1)
  }

  function handleSistemaFilter(value: SistemaFiltro) {
    setSistema(value)
    setPage(1)
  }

  function handleCategoriaFilter(event: ChangeEvent<HTMLSelectElement>) {
    setCategoria(event.target.value as CategoriaFiltro)
    setPage(1)
  }

  function handleSort(campo: OrdenCampo) {
    setOrden((prev) =>
      prev.campo === campo
        ? { campo, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { campo, dir: "asc" }
    )
  }

  function handleSelectProducto(producto: Producto) {
    setSeleccionado(producto)
  }

  function handleCloseDetalle() {
    setSeleccionado(null)
  }

  function handleExportCsv() {
    const csv = productosToCsv(ordenados)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const enlace = document.createElement("a")
    enlace.href = url
    enlace.download = "catalogo-ferreteria.csv"
    enlace.click()
    URL.revokeObjectURL(url)
  }

  function handlePrevPage() {
    setPage((prev) => Math.max(1, prev - 1))
  }

  function handleNextPage() {
    setPage((prev) => Math.min(totalPaginas, prev + 1))
  }

  const desde = ordenados.length === 0 ? 0 : (paginaActual - 1) * PAGE_SIZE + 1
  const hasta = Math.min(paginaActual * PAGE_SIZE, ordenados.length)

  return (
    <div className="flex min-h-full flex-col bg-background">
      <main className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="flex flex-col gap-1">
          <h1 className="flex items-center gap-2 font-heading text-4xl font-normal text-foreground">
            <PackageSearch className="size-8 text-primary" aria-hidden="true" />
            Catálogo
          </h1>
          <p className="text-sm text-muted-foreground">
            Accesorios DEMA (galvanizado y epoxi) y sistema SIGAS Thermofusión.
          </p>
        </section>

        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <CardTitle>Artículos</CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {ordenados.length} de {productos.length}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportCsv}
                  disabled={ordenados.length === 0}
                >
                  <Download className="size-3.5" aria-hidden="true" />
                  Exportar CSV
                </Button>
              </div>
              <CatalogoFilters
                query={query}
                sistema={sistema}
                categoria={categoria}
                conteoCategorias={conteoCategorias}
                totalFiltrado={baseSinCategoria.length}
                onSearchChange={handleSearchChange}
                onSistemaChange={handleSistemaFilter}
                onCategoriaChange={handleCategoriaFilter}
              />
            </div>
          </CardHeader>

          <CardContent className="px-0">
            <CatalogoTable
              productos={visibles}
              orden={orden}
              onSort={handleSort}
              onSelectProducto={handleSelectProducto}
            />
          </CardContent>

          {ordenados.length > 0 ? (
            <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
              <span className="text-xs text-muted-foreground tabular-nums">
                {desde}-{hasta} de {ordenados.length}
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

      <CatalogoDetailDialog producto={seleccionado} onClose={handleCloseDetalle} />
    </div>
  )
}
