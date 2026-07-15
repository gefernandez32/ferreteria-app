import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  FileText,
  Package,
  PackagePlus,
  PlusCircle,
  Truck,
} from "lucide-react"

import type {
  CatalogHealthMetric,
  Kpi,
  Receiving,
  ReorderGroup,
} from "./types"

export const ownerName = "Yomara"
export const today = "Martes 15 de julio"
export const tenant = "Sucursal Centro"

export const kpis: Kpi[] = [
  {
    id: "skus-activos",
    label: "SKUs activos",
    value: "3.842",
    caption: "18 ocultos hoy por baja rotación",
    tone: "primary",
    icon: Package,
  },
  {
    id: "valor-stock",
    label: "Valor de stock",
    value: "$48.250.500",
    caption: "+1,4% vs ayer",
    tone: "info",
    icon: DollarSign,
  },
  {
    id: "ingresos-pendientes",
    label: "Ingresos sin validar",
    value: "7",
    caption: "2 con diferencias contra factura",
    tone: "warning",
    icon: ClipboardCheck,
  },
  {
    id: "sugeridos-pedido",
    label: "Sugeridos para pedir",
    value: "41 SKUs",
    caption: "≈ $3.120.500 a 3 proveedores",
    tone: "primary",
    icon: Truck,
  },
]

export const receivings: Receiving[] = [
  {
    id: "rec-1",
    remito: "R-00421",
    proveedor: "Bulonera Centro",
    articulo: "Tornillo autoperforante 1/4\" x 2\"",
    cantidad: "200 un.",
    estado: "validado",
  },
  {
    id: "rec-2",
    remito: "R-00422",
    proveedor: "Acindar",
    articulo: "Hierro ADN 420 — 12 mm x 12 m",
    cantidad: "30 barras",
    estado: "diferencia",
  },
  {
    id: "rec-3",
    remito: "R-00423",
    proveedor: "Klaukol",
    articulo: "Adhesivo de contacto x 1 L",
    cantidad: "12 un.",
    estado: "sin-factura",
  },
  {
    id: "rec-4",
    remito: "R-00424",
    proveedor: "Sintec",
    articulo: "Cinta aisladora 20 m",
    cantidad: "50 un.",
    estado: "equivocado",
  },
  {
    id: "rec-5",
    remito: "R-00425",
    proveedor: "Acindar",
    articulo: "Malla electrosoldada 15x15 — 4 mm",
    cantidad: "20 paños",
    estado: "validado",
  },
  {
    id: "rec-6",
    remito: "R-00426",
    proveedor: "Bulonera Centro",
    articulo: "Tuerca hexagonal 3/8\"",
    cantidad: "500 un.",
    estado: "validado",
  },
  {
    id: "rec-7",
    remito: "R-00427",
    proveedor: "Klaukol",
    articulo: "Pastina x 5 kg",
    cantidad: "24 un.",
    estado: "diferencia",
  },
]

export const reorderGroups: ReorderGroup[] = [
  {
    id: "reorder-1",
    proveedor: "Bulonera Centro",
    skuCount: 18,
    monto: "$890.500",
  },
  {
    id: "reorder-2",
    proveedor: "Acindar",
    skuCount: 12,
    monto: "$1.530.000",
  },
  {
    id: "reorder-3",
    proveedor: "Klaukol",
    skuCount: 11,
    monto: "$700.000",
  },
]

export const reorderTotalSkus = reorderGroups.reduce(
  (sum, group) => sum + group.skuCount,
  0
)

export const catalogHealth: CatalogHealthMetric[] = [
  {
    id: "consolidados",
    label: "SKUs consolidados este mes",
    value: 124,
    total: 200,
    tone: "success",
  },
  {
    id: "sin-proveedor",
    label: "SKUs sin proveedor asignado",
    value: 6,
    total: 6,
    tone: "warning",
  },
  {
    id: "no-comercializa",
    label: "Marcados como «no se comercializan»",
    value: 312,
    total: 600,
    tone: "info",
  },
]

export const quickActions = [
  { id: "nuevo-ingreso", label: "Nuevo ingreso", icon: PackagePlus, href: "#nuevo-ingreso", variant: "default" as const },
  { id: "nuevo-producto", label: "Nuevo producto", icon: PlusCircle, href: "#nuevo-producto", variant: "outline" as const },
  { id: "generar-pedidos", label: "Generar pedidos", icon: FileText, href: "#generar-pedidos", variant: "outline" as const },
  { id: "ver-ventas", label: "Ventas del día", icon: BarChart3, href: "#ver-ventas", variant: "ghost" as const },
]

export const receivingStatusMeta: Record<
  Receiving["estado"],
  { label: string; toneClass: string; icon: typeof CheckCircle2 }
> = {
  validado: {
    label: "Validado",
    toneClass: "bg-success/10 text-success",
    icon: CheckCircle2,
  },
  diferencia: {
    label: "Diferencia en cantidad",
    toneClass: "bg-warning/15 text-warning-foreground",
    icon: AlertTriangle,
  },
  "sin-factura": {
    label: "Sin factura",
    toneClass: "bg-info/10 text-info",
    icon: AlertTriangle,
  },
  equivocado: {
    label: "Artículo equivocado",
    toneClass: "bg-destructive/10 text-destructive",
    icon: AlertTriangle,
  },
}
