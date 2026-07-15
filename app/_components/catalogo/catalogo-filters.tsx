"use client"

import type { ChangeEvent } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { categorias, sistemas } from "@/lib/data"

import type { CategoriaFiltro, SistemaFiltro } from "./types"

const sistemaOpciones: SistemaFiltro[] = ["todos", ...sistemas]

type CatalogoFiltersProps = {
  query: string
  sistema: SistemaFiltro
  categoria: CategoriaFiltro
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void
  onSistemaChange: (value: SistemaFiltro) => void
  onCategoriaChange: (event: ChangeEvent<HTMLSelectElement>) => void
}

export function CatalogoFilters({
  query,
  sistema,
  categoria,
  onSearchChange,
  onSistemaChange,
  onCategoriaChange,
}: CatalogoFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="catalogo-buscar"
          className="text-xs font-medium text-muted-foreground"
        >
          Buscar
        </label>
        <div className="relative w-full lg:w-80">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="catalogo-buscar"
            type="search"
            value={query}
            onChange={onSearchChange}
            placeholder="Código, familia o medida"
            className="pl-8"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
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
            className="h-8 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="todas">Todas</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
