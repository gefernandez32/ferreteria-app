import type { LucideIcon } from "lucide-react"

export type KpiTone = "primary" | "success" | "warning" | "info" | "destructive"

export type Kpi = {
  id: string
  label: string
  value: string
  caption: string
  tone: KpiTone
  icon: LucideIcon
}

export type ReceivingStatus =
  | "validado"
  | "diferencia"
  | "sin-factura"
  | "equivocado"

export type Receiving = {
  id: string
  remito: string
  proveedor: string
  articulo: string
  cantidad: string
  estado: ReceivingStatus
}

export type ReorderGroup = {
  id: string
  proveedor: string
  skuCount: number
  monto: string
}

export type CatalogHealthMetric = {
  id: string
  label: string
  value: number
  total: number
  tone: "success" | "warning" | "info"
}
