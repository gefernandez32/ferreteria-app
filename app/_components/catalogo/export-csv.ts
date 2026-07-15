import type { Producto } from "@/lib/data"

const COLUMNAS: { key: keyof Producto; label: string }[] = [
  { key: "codigo", label: "Código" },
  { key: "familia", label: "Familia" },
  { key: "medida", label: "Medida" },
  { key: "sistema", label: "Sistema" },
  { key: "categoria", label: "Categoría" },
  { key: "material", label: "Material" },
  { key: "marca", label: "Marca" },
  { key: "proveedor", label: "Proveedor" },
  { key: "precioLista", label: "Precio de lista" },
  { key: "stock", label: "Stock" },
  { key: "stockMinimo", label: "Stock mínimo" },
  { key: "ubicacion", label: "Ubicación" },
]

// Separador `;` y BOM UTF-8 (﻿) para que Excel en es-AR abra bien los acentos.
const BOM = "﻿"
const NECESITA_COMILLAS = /[";\n]/

function escapar(value: string | number): string {
  const s = String(value)
  return NECESITA_COMILLAS.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function productosToCsv(productos: Producto[]): string {
  const header = COLUMNAS.map((c) => c.label).join(";")
  const filas = productos.map((p) =>
    COLUMNAS.map((c) => escapar(p[c.key])).join(";")
  )
  return BOM + [header, ...filas].join("\r\n")
}
