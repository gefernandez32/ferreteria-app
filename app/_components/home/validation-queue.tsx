import type { ComponentType, SVGProps } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { receivingStatusMeta, receivings } from "./mocks"
import type { Receiving } from "./types"

function StatusPill({ estado }: { estado: Receiving["estado"] }) {
  const meta = receivingStatusMeta[estado]
  const Icon = meta.icon as ComponentType<SVGProps<SVGSVGElement>>
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium " +
        meta.toneClass
      }
    >
      <Icon className="size-3" aria-hidden="true" />
      {meta.label}
    </span>
  )
}

export function ValidationQueue() {
  const diffCount = receivings.filter((r) => r.estado === "diferencia").length
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <CardTitle>Ingresos sin validar</CardTitle>
            <span className="text-xs text-muted-foreground">
              {receivings.length} ingresos recientes · {diffCount} con diferencia contra factura
            </span>
          </div>
          <Badge variant="outline" className="font-normal text-warning-foreground">
            Acción requerida
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Remito</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Artículo</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receivings.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-xs tracking-wider text-muted-foreground">
                  {row.remito}
                </TableCell>
                <TableCell className="font-medium">{row.proveedor}</TableCell>
                <TableCell className="text-muted-foreground">{row.articulo}</TableCell>
                <TableCell className="text-right tabular-nums">{row.cantidad}</TableCell>
                <TableCell>
                  <StatusPill estado={row.estado} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
