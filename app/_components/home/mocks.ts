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

import {
  productoPorCodigo,
  productosBajoStock,
  resumenCatalogo,
  sistemas,
} from "@/lib/data"

import type {
  CatalogHealthMetric,
  Kpi,
  Receiving,
  ReorderGroup,
} from "./types"

export const ownerName = "Yomara"
export const today = "Martes 15 de julio"
export const tenant = "Sucursal Centro"

/** Único proveedor real de ambos catálogos (Grupo DEMA / FERVA S.A.). */
const PROVEEDOR = "Grupo DEMA"

const ARS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

const nombreDe = (codigo: string) => productoPorCodigo[codigo]?.nombre ?? codigo

// Ingresos armados con SKUs reales del catálogo, provistos por Grupo DEMA.
export const receivings: Receiving[] = [
  {
    id: "rec-1",
    remito: "R-00421",
    proveedor: PROVEEDOR,
    articulo: nombreDe("60-100050000"),
    cantidad: "40 tiras",
    estado: "validado",
  },
  {
    id: "rec-2",
    remito: "R-00422",
    proveedor: PROVEEDOR,
    articulo: nombreDe("01-090025000"),
    cantidad: "120 un.",
    estado: "diferencia",
  },
  {
    id: "rec-3",
    remito: "R-00423",
    proveedor: PROVEEDOR,
    articulo: nombreDe("03-130050000"),
    cantidad: "60 un.",
    estado: "sin-factura",
  },
  {
    id: "rec-4",
    remito: "R-00424",
    proveedor: PROVEEDOR,
    articulo: nombreDe("60-161025000"),
    cantidad: "24 un.",
    estado: "equivocado",
  },
  {
    id: "rec-5",
    remito: "R-00425",
    proveedor: PROVEEDOR,
    articulo: nombreDe("01-240050025"),
    cantidad: "150 un.",
    estado: "validado",
  },
  {
    id: "rec-6",
    remito: "R-00426",
    proveedor: PROVEEDOR,
    articulo: nombreDe("60-130063000"),
    cantidad: "80 un.",
    estado: "validado",
  },
  {
    id: "rec-7",
    remito: "R-00427",
    proveedor: PROVEEDOR,
    articulo: nombreDe("08-900111008"),
    cantidad: "3 un.",
    estado: "diferencia",
  },
]

// Sugeridos agrupados por línea/sistema del catálogo (hay un solo proveedor).
export const reorderGroups: ReorderGroup[] = sistemas
  .map((sistema) => {
    const items = productosBajoStock.filter((p) => p.sistema === sistema)
    const monto = items.reduce((sum, p) => sum + p.precioLista, 0)
    return {
      id: `reorder-${sistema}`,
      linea: sistema,
      skuCount: items.length,
      monto: ARS.format(monto),
    }
  })
  .filter((group) => group.skuCount > 0)

export const reorderTotalSkus = productosBajoStock.length

export const reorderTotalMonto = ARS.format(
  productosBajoStock.reduce((sum, p) => sum + p.precioLista, 0)
)

const ingresosConDiferencia = receivings.filter(
  (r) => r.estado === "diferencia"
).length

export const kpis: Kpi[] = [
  {
    id: "skus-activos",
    label: "SKUs activos",
    value: resumenCatalogo.totalSkus.toLocaleString("es-AR"),
    caption: `${sistemas.length} líneas: galvanizado, epoxi y SIGAS`,
    tone: "primary",
    icon: Package,
  },
  {
    id: "valor-stock",
    label: "Valor de stock",
    value: ARS.format(resumenCatalogo.valorStock),
    caption: "Sobre el stock mock del catálogo",
    tone: "info",
    icon: DollarSign,
  },
  {
    id: "ingresos-pendientes",
    label: "Ingresos sin validar",
    value: String(receivings.length),
    caption: `${ingresosConDiferencia} con diferencias contra factura`,
    tone: "warning",
    icon: ClipboardCheck,
  },
  {
    id: "sugeridos-pedido",
    label: "Sugeridos para pedir",
    value: `${reorderTotalSkus} SKUs`,
    caption: `≈ ${reorderTotalMonto} · ${reorderGroups.length} líneas`,
    tone: "primary",
    icon: Truck,
  },
]

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
