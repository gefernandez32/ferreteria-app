/**
 * Seed de la base: reutiliza el catálogo determinista de `lib/data.ts` para
 * poblar los SKUs internos y FABRICA 3 proveedores adicionales con listas de
 * precio propias y códigos alias heterogéneos sobre los mismos SKUs. Así se
 * pueden demostrar los problemas de duplicados (P1), equivalencias (P2) y
 * "mejor precio" (P3).
 *
 * Uso: `pnpm db:seed` (idempotente: limpia y recarga todas las tablas).
 */
import { productos as catalogoMock, type Producto as ProductoMock } from "../data"
import { db } from "./client"
import {
  facturaLineas,
  facturas,
  movimientosStock,
  ordenesCompra,
  ordenLineas,
  preciosProveedor,
  productos,
  proveedores,
  remitoLineas,
  remitos,
} from "./schema"

/** Hash FNV-1a estable (mismo criterio que lib/data.ts). */
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** La marca aporta valor (SKU separado) en herramientas y válvulas. */
function esGenerico(p: ProductoMock): boolean {
  return p.categoria !== "Herramientas y accesorios" && p.categoria !== "Válvulas"
}

/** Estado inicial: mayoría activo, un subconjunto en limbo/no_comercializa. */
function estadoInicial(codigo: string): "activo" | "limbo" | "no_comercializa" {
  const r = hash(codigo + "estado") % 100
  if (r < 12) return "limbo" // listas importadas sin alta real
  if (r < 17) return "no_comercializa" // ruido marcado
  return "activo"
}

const AHORA = new Date().toISOString()

/* ------------------------------------------------------------------ */
/* Proveedores fabricados                                             */
/* ------------------------------------------------------------------ */

const PROVEEDORES = [
  { nombre: "Grupo DEMA", esHabitual: true },
  { nombre: "Ferretería Central", esHabitual: false },
  { nombre: "Distribuidora Sur", esHabitual: false },
  { nombre: "Aceros del Plata", esHabitual: false },
] as const

/** Código alias determinista por proveedor (formatos heterogéneos, únicos por id). */
function aliasDe(provIndex: number, id: number, codigoInterno: string): string {
  switch (provIndex) {
    case 0:
      return codigoInterno.replace(/-/g, "") // DEMA: SKU sin guiones
    case 1:
      return String(100000 + id) // Central: numérico corrido
    case 2:
      return `X-${id}` // Sur: prefijo X
    default:
      return `AP${(id * 7).toString(36).toUpperCase()}` // Aceros: base36
  }
}

function seed() {
  console.log(`Sembrando ${catalogoMock.length} SKUs y ${PROVEEDORES.length} proveedores...`)

  db.transaction((tx) => {
    // Limpieza (respetando FKs: hijos antes que padres).
    tx.delete(ordenLineas).run()
    tx.delete(ordenesCompra).run()
    tx.delete(movimientosStock).run()
    tx.delete(facturaLineas).run()
    tx.delete(facturas).run()
    tx.delete(remitoLineas).run()
    tx.delete(remitos).run()
    tx.delete(preciosProveedor).run()
    tx.delete(productos).run()
    tx.delete(proveedores).run()

    // Proveedores.
    const provIds = PROVEEDORES.map(
      (p) => tx.insert(proveedores).values(p).returning({ id: proveedores.id }).get().id
    )

    // Productos (SKU maestro interno).
    for (const p of catalogoMock) {
      const estado = estadoInicial(p.codigo)
      const stock = estado === "limbo" ? 0 : p.stock
      const stockMaximo = Math.max(p.stockMinimo * 4, p.stockMinimo + 20)
      const { id } = tx
        .insert(productos)
        .values({
          codigoInterno: p.codigo,
          nombre: p.nombre,
          familia: p.familia,
          categoria: p.categoria,
          sistema: p.sistema,
          material: p.material,
          marca: p.marca,
          medida: p.medida,
          esGenerico: esGenerico(p),
          estado,
          ubicacion: p.ubicacion,
          stock,
          stockMinimo: p.stockMinimo,
          stockMaximo,
        })
        .returning({ id: productos.id })
        .get()

      // Listas de precio: DEMA (habitual) siempre; los demás según hash.
      for (let pi = 0; pi < provIds.length; pi++) {
        const ofrece = pi === 0 || (hash(p.codigo + "prov" + pi) & 1) === 1
        if (!ofrece) continue
        const factor = 0.85 + (hash(p.codigo + "precio" + pi) % 31) / 100 // 0.85..1.15
        const precio = Math.round((p.precioLista * factor) / 10) * 10
        tx.insert(preciosProveedor)
          .values({
            productoId: id,
            proveedorId: provIds[pi],
            codigoProveedor: aliasDe(pi, id, p.codigo),
            precio,
            vigenciaDesde: AHORA.slice(0, 10),
          })
          .run()
      }
    }

    return provIds
  })

  console.log("Seed completo.")
}

seed()
