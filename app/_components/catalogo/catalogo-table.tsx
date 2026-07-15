import { ChevronDown, ChevronsUpDown, ChevronUp, PackageX } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { OrdenCampo } from "@/lib/api/types"
import type { ProductoListItem } from "@/lib/api/types"

import { formatArs } from "./format"
import { StockBadge } from "./stock-badge"
import { estadoMeta, type Orden } from "./types"

const sistemaTone: Record<string, string> = {
  "Galvanizado (agua)": "bg-info/10 text-info",
  "Epoxi (gas)": "bg-warning/15 text-warning-foreground",
  "SIGAS Thermofusión": "bg-primary/10 text-primary",
}

type SortableHeadProps = {
  campo: OrdenCampo
  label: string
  orden: Orden
  onSort: (campo: OrdenCampo) => void
  align?: "left" | "right"
}

function SortableHead({ campo, label, orden, onSort, align = "left" }: SortableHeadProps) {
  const activo = orden.campo === campo
  const Icon = !activo ? ChevronsUpDown : orden.dir === "asc" ? ChevronUp : ChevronDown
  return (
    <TableHead className={align === "right" ? "text-right" : undefined}>
      <button
        type="button"
        onClick={() => onSort(campo)}
        aria-label={`Ordenar por ${label}`}
        className={cn(
          "inline-flex items-center gap-1 rounded-md text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          align === "right" && "flex-row-reverse"
        )}
      >
        {label}
        <Icon
          className={cn("size-3.5", activo ? "text-primary" : "text-muted-foreground")}
          aria-hidden="true"
        />
      </button>
    </TableHead>
  )
}

function EstadoPill({ estado }: { estado: ProductoListItem["estado"] }) {
  const meta = estadoMeta[estado]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        meta.toneClass
      )}
    >
      {meta.label}
    </span>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
      <PackageX className="size-8 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">Sin resultados</p>
      <p className="text-xs text-muted-foreground">
        Probá con otro código (interno o de proveedor), sistema o estado.
      </p>
    </div>
  )
}

type CatalogoTableProps = {
  productos: ProductoListItem[]
  orden: Orden
  onSort: (campo: OrdenCampo) => void
  onSelectProducto: (producto: ProductoListItem) => void
}

export function CatalogoTable({
  productos,
  orden,
  onSort,
  onSelectProducto,
}: CatalogoTableProps) {
  if (productos.length === 0) {
    return <EmptyState />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHead campo="codigoInterno" label="SKU interno" orden={orden} onSort={onSort} />
          <TableHead>Artículo</TableHead>
          <TableHead className="hidden md:table-cell">Sistema</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="hidden text-right lg:table-cell">Prov.</TableHead>
          <SortableHead
            campo="mejorPrecio"
            label="Mejor precio"
            orden={orden}
            onSort={onSort}
            align="right"
          />
          <SortableHead campo="stock" label="Stock" orden={orden} onSort={onSort} align="right" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {productos.map((p) => (
          <TableRow
            key={p.id}
            role="button"
            tabIndex={0}
            aria-label={`Ver detalle de ${p.familia} ${p.medida}`}
            className="cursor-pointer"
            onClick={() => onSelectProducto(p)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onSelectProducto(p)
              }
            }}
          >
            <TableCell className="text-xs tracking-wider text-muted-foreground">
              {p.codigoInterno}
            </TableCell>
            <TableCell>
              <span className="font-medium text-foreground">{p.familia}</span>{" "}
              <span className="text-muted-foreground">{p.medida}</span>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  sistemaTone[p.sistema] ?? "bg-muted text-muted-foreground"
                )}
              >
                {p.sistema}
              </span>
            </TableCell>
            <TableCell>
              <EstadoPill estado={p.estado} />
            </TableCell>
            <TableCell className="hidden text-right tabular-nums text-muted-foreground lg:table-cell">
              {p.numProveedores}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {p.mejorPrecio === null ? (
                <span className="text-muted-foreground">—</span>
              ) : (
                formatArs(p.mejorPrecio)
              )}
            </TableCell>
            <TableCell className="text-right">
              <StockBadge stock={p.stock} stockMinimo={p.stockMinimo} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
