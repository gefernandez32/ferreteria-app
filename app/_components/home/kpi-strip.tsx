import type { ComponentType, SVGProps } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { kpis } from "./mocks"
import type { Kpi, KpiTone } from "./types"

const toneStyles: Record<KpiTone, { tile: string; text: string }> = {
  primary: { tile: "bg-primary/10 text-primary", text: "text-foreground" },
  success: { tile: "bg-success/10 text-success", text: "text-foreground" },
  warning: { tile: "bg-warning/15 text-warning-foreground", text: "text-foreground" },
  info: { tile: "bg-info/10 text-info", text: "text-foreground" },
  destructive: { tile: "bg-destructive/10 text-destructive", text: "text-foreground" },
}

function KpiTile({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon as ComponentType<SVGProps<SVGSVGElement>>
  const styles = toneStyles[kpi.tone]
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {kpi.label}
          </span>
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-md",
              styles.tile
            )}
            aria-hidden="true"
          >
            <Icon className="size-4" />
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className={cn("text-2xl font-semibold tracking-tight", styles.text)}>
            {kpi.value}
          </span>
          <span className="text-xs text-muted-foreground">{kpi.caption}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function KpiStrip() {
  return (
    <section
      aria-label="Indicadores clave"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {kpis.map((kpi) => (
        <KpiTile key={kpi.id} kpi={kpi} />
      ))}
    </section>
  )
}
