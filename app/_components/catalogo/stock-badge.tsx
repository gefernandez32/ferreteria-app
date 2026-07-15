import { cn } from "@/lib/utils"

import { nivelStock, type NivelStock } from "./format"

const nivelMeta: Record<NivelStock, { label: string; toneClass: string }> = {
  ok: { label: "En stock", toneClass: "bg-success/10 text-success" },
  bajo: { label: "Bajo", toneClass: "bg-warning/15 text-warning-foreground" },
  "sin-stock": { label: "Sin stock", toneClass: "bg-destructive/10 text-destructive" },
}

export function StockBadge({
  stock,
  stockMinimo,
}: {
  stock: number
  stockMinimo: number
}) {
  const nivel = nivelStock({ stock, stockMinimo })
  const meta = nivelMeta[nivel]
  return (
    <span className="inline-flex items-center justify-end gap-2">
      <span className="tabular-nums font-medium text-foreground">{stock}</span>
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
          meta.toneClass
        )}
      >
        {meta.label}
      </span>
    </span>
  )
}
