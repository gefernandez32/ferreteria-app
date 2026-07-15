import { ArrowRight, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { reorderGroups, reorderTotalMonto, reorderTotalSkus } from "./mocks"

export function ReorderSuggestions() {
  const lineas = reorderGroups.length
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2">
              <Truck className="size-4 text-primary" aria-hidden="true" />
              Pedido sugerido
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              SKUs por debajo del mínimo · agrupación automática por línea
            </span>
          </div>
          <Button
            size="sm"
            nativeButton={false}
            render={(props) => (
              <a href="#generar-pedidos" {...props}>
                Generar pedidos
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            )}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2 pb-3">
          <span className="text-2xl font-semibold tracking-tight">{reorderTotalSkus} SKUs</span>
          <span className="text-sm text-muted-foreground">· {lineas} líneas</span>
          <span className="ml-auto text-base font-medium tabular-nums">{reorderTotalMonto}</span>
        </div>
        <Separator />
        <ul className="divide-y divide-border">
          {reorderGroups.map((group) => (
            <li
              key={group.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="flex flex-col">
                <span className="font-medium">{group.linea}</span>
                <span className="text-xs text-muted-foreground">
                  {group.skuCount} SKUs bajo mínimo
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium tabular-nums text-foreground">
                  {group.monto}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={(props) => (
                    <a href={`#pedido-${group.id}`} {...props}>
                      Revisar
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </a>
                  )}
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
