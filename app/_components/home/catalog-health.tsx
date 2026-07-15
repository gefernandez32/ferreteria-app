import { ArrowRight, BookCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { catalogHealth } from "./mocks"
import type { CatalogHealthMetric } from "./types"

const toneStyles: Record<
  CatalogHealthMetric["tone"],
  { bar: string; text: string }
> = {
  success: { bar: "bg-success", text: "text-foreground" },
  warning: { bar: "bg-warning", text: "text-warning-foreground" },
  info: { bar: "bg-info", text: "text-foreground" },
}

function Metric({ metric }: { metric: CatalogHealthMetric }) {
  const styles = toneStyles[metric.tone]
  const pct = metric.total > 0 ? Math.round((metric.value / metric.total) * 100) : 0
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">{metric.label}</span>
        <span className={cn("text-sm font-semibold tabular-nums", styles.text)}>
          {metric.value}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", styles.bar)}
          style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
        />
      </div>
    </div>
  )
}

export function CatalogHealthPanel() {
  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <CardTitle className="flex items-center gap-2">
              <BookCheck className="size-4 text-primary" aria-hidden="true" />
              Salud del catálogo
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              Una sola lista maestra · múltiples proveedores
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={(props) => (
              <a href="#catalogo" {...props}>
                Ir al catálogo
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </a>
            )}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {catalogHealth.map((metric) => (
          <Metric key={metric.id} metric={metric} />
        ))}
      </CardContent>
    </Card>
  )
}
