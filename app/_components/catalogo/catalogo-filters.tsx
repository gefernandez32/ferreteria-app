"use client"

import type { ChangeEvent } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { categorias, sistemas } from "@/lib/data"
import type { EstadoProducto } from "@/lib/db/schema"

import { estadoMeta, type EstadoFiltro } from "./types"

const sistemaOpciones: string[] = ["todos", ...sistemas]
const estadoOpciones: EstadoFiltro[] = [
  "todos",
  "activo",
  "limbo",
  "no_comercializa",
]

const SELECT_CLASS =
  "h-8 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

type CatalogoFiltersProps = {
  query: string
  sistema: string
  categoria: string
  estado: EstadoFiltro
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void
  onSistemaChange: (value: string) => void
  onCategoriaChange: (event: ChangeEvent<HTMLSelectElement>) => void
  onEstadoChange: (value: EstadoFiltro) => void
}

function etiquetaEstado(e: EstadoFiltro): string {
  return e === "todos" ? "Todos" : estadoMeta[e as EstadoProducto].label
}

export function CatalogoFilters({
  query,
  sistema,
  categoria,
  estado,
  onSearchChange,
  onSistemaChange,
  onCategoriaChange,
  onEstadoChange,
}: CatalogoFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="catalogo-buscar"
            className="text-xs font-medium text-muted-foreground"
          >
            Buscar
          </label>
          <div className="relative w-full lg:w-96">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="catalogo-buscar"
              type="search"
              value={query}
              onChange={onSearchChange}
              placeholder="SKU interno, nombre o código de proveedor"
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="catalogo-categoria"
            className="text-xs font-medium text-muted-foreground"
          >
            Categoría
          </label>
          <select
            id="catalogo-categoria"
            value={categoria}
            onChange={onCategoriaChange}
            className={SELECT_CLASS}
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Sistema</span>
          <div className="flex flex-wrap gap-1.5">
            {sistemaOpciones.map((opcion) => {
              const activo = opcion === sistema
              return (
                <Button
                  key={opcion}
                  type="button"
                  size="sm"
                  variant={activo ? "default" : "outline"}
                  aria-pressed={activo}
                  onClick={() => onSistemaChange(opcion)}
                >
                  {opcion === "todos" ? "Todos" : opcion}
                </Button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Estado</span>
          <div className="flex flex-wrap gap-1.5">
            {estadoOpciones.map((opcion) => {
              const activo = opcion === estado
              return (
                <Button
                  key={opcion}
                  type="button"
                  size="sm"
                  variant={activo ? "default" : "outline"}
                  aria-pressed={activo}
                  onClick={() => onEstadoChange(opcion)}
                >
                  {etiquetaEstado(opcion)}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
