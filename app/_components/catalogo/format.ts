import type { Producto } from "@/lib/data"

/** Formateador de moneda hoisteado a nivel de módulo (regla js-hoist-intl). */
const ARS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

export const formatArs = (n: number) => ARS.format(n)

export type NivelStock = "sin-stock" | "bajo" | "ok"

export function nivelStock(p: Pick<Producto, "stock" | "stockMinimo">): NivelStock {
  if (p.stock === 0) return "sin-stock"
  if (p.stock <= p.stockMinimo) return "bajo"
  return "ok"
}
