import { PackageX } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { Producto, Sistema } from "@/lib/data"

import { formatArs } from "./format"
import { StockBadge } from "./stock-badge"

const sistemaTone: Record<Sistema, string> = {
  "Galvanizado (agua)": "bg-info/10 text-info",
  "Epoxi (gas)": "bg-warning/15 text-warning-foreground",
  "SIGAS Thermofusión": "bg-primary/10 text-primary",
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
      <PackageX className="size-8 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">Sin resultados</p>
      <p className="text-xs text-muted-foreground">
        Probá con otro código, sistema o categoría.
      </p>
    </div>
  )
}

export function CatalogoTable({ productos }: { productos: Producto[] }) {
  if (productos.length === 0) {
    return <EmptyState />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Artículo</TableHead>
          <TableHead>Sistema</TableHead>
          <TableHead className="hidden lg:table-cell">Categoría</TableHead>
          <TableHead className="hidden xl:table-cell">Proveedor</TableHead>
          <TableHead className="hidden md:table-cell">Ubic.</TableHead>
          <TableHead className="text-right">Precio</TableHead>
          <TableHead className="text-right">Stock</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {productos.map((p) => (
          <TableRow key={p.codigo}>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {p.codigo}
            </TableCell>
            <TableCell>
              <span className="font-medium text-foreground">{p.familia}</span>{" "}
              <span className="text-muted-foreground">{p.medida}</span>
            </TableCell>
            <TableCell>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  sistemaTone[p.sistema]
                )}
              >
                {p.sistema}
              </span>
            </TableCell>
            <TableCell className="hidden text-muted-foreground lg:table-cell">
              {p.categoria}
            </TableCell>
            <TableCell className="hidden text-muted-foreground xl:table-cell">
              {p.proveedor}
            </TableCell>
            <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
              {p.ubicacion}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatArs(p.precioLista)}
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
