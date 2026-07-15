"use client"

import { useMemo, useState, type ChangeEvent } from "react"
import { ChevronLeft, ChevronRight, PackageSearch } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { productos } from "@/lib/data"

import { CatalogoFilters } from "./catalogo-filters"
import { CatalogoTable } from "./catalogo-table"
import type { CategoriaFiltro, SistemaFiltro } from "./types"

const PAGE_SIZE = 20

export function CatalogoView() {
  const [query, setQuery] = useState("")
  const [sistema, setSistema] = useState<SistemaFiltro>("todos")
  const [categoria, setCategoria] = useState<CategoriaFiltro>("todas")
  const [page, setPage] = useState(1)

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    return productos.filter((p) => {
      if (sistema !== "todos" && p.sistema !== sistema) return false
      if (categoria !== "todas" && p.categoria !== categoria) return false
      if (q && !`${p.codigo} ${p.nombre}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [query, sistema, categoria])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE))
  const paginaActual = Math.min(page, totalPaginas)

  const visibles = useMemo(() => {
    const inicio = (paginaActual - 1) * PAGE_SIZE
    return filtrados.slice(inicio, inicio + PAGE_SIZE)
  }, [filtrados, paginaActual])

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

  function handlePrevPage() {
    setPage((prev) => Math.max(1, prev - 1))
  }

  function handleNextPage() {
    setPage((prev) => Math.min(totalPaginas, prev + 1))
  }

  const desde = filtrados.length === 0 ? 0 : (paginaActual - 1) * PAGE_SIZE + 1
  const hasta = Math.min(paginaActual * PAGE_SIZE, filtrados.length)

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
              <div className="flex items-baseline justify-between gap-3">
                <CardTitle>Artículos</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {filtrados.length} de {productos.length} artículos
                </span>
              </div>
              <CatalogoFilters
                query={query}
                sistema={sistema}
                categoria={categoria}
                onSearchChange={handleSearchChange}
                onSistemaChange={handleSistemaFilter}
                onCategoriaChange={handleCategoriaFilter}
              />
            </div>
          </CardHeader>

          <CardContent className="px-0">
            <CatalogoTable productos={visibles} />
          </CardContent>

          {filtrados.length > 0 ? (
            <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
              <span className="text-xs text-muted-foreground tabular-nums">
                {desde}-{hasta} de {filtrados.length}
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
    </div>
  )
}
