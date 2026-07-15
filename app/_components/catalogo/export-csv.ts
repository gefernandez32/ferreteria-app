import type { ProductoListItem } from "@/lib/api/types"

const COLUMNAS: { key: keyof ProductoListItem; label: string }[] = [
  { key: "codigoInterno", label: "SKU interno" },
  { key: "familia", label: "Familia" },
  { key: "medida", label: "Medida" },
  { key: "sistema", label: "Sistema" },
  { key: "categoria", label: "Categoría" },
  { key: "marca", label: "Marca" },
  { key: "estado", label: "Estado" },
  { key: "numProveedores", label: "Proveedores" },
  { key: "mejorPrecio", label: "Mejor precio" },
  { key: "stock", label: "Stock" },
  { key: "stockMinimo", label: "Stock mínimo" },
  { key: "ubicacion", label: "Ubicación" },
]

// Separador `;` y BOM UTF-8 (﻿) para que Excel en es-AR abra bien los acentos.
const BOM = "﻿"
const NECESITA_COMILLAS = /[";\n]/

function escapar(value: string | number | boolean | null): string {
  const s = value === null ? "" : String(value)
  return NECESITA_COMILLAS.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function productosToCsv(productos: ProductoListItem[]): string {
  const header = COLUMNAS.map((c) => c.label).join(";")
  const filas = productos.map((p) =>
    COLUMNAS.map((c) => escapar(p[c.key])).join(";")
  )
  return BOM + [header, ...filas].join("\r\n")
}
