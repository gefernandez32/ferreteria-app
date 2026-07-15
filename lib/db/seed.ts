/**
 * Seed de la base: reutiliza el catálogo determinista de `lib/data.ts` para
 * poblar los SKUs internos y FABRICA 3 proveedores adicionales con listas de
 * precio propias y códigos alias heterogéneos sobre los mismos SKUs. Así se
 * pueden demostrar los problemas de duplicados (P1), equivalencias (P2) y
 * "mejor precio" (P3).
 *
 * Uso: `pnpm db:seed` (idempotente: limpia y recarga todas las tablas).
 */
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

// tsx no carga .env.local: hacerlo antes de leer DATABASE_URL.
config({ path: ".env.local" })

import { productos as catalogoMock, type Producto as ProductoMock } from "../data"
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

async function seed() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL no está definida (.env.local).")

  const client = postgres(url, { max: 1 })
  const db = drizzle(client)

  console.log(`Sembrando ${catalogoMock.length} SKUs y ${PROVEEDORES.length} proveedores...`)

  await db.transaction(async (tx) => {
    // Inserta en lotes para no saturar el límite de parámetros de Postgres
    // (~65535) ni hacer un round-trip por fila sobre el proxy público.
    // Usa `tx` (no `db`): con el pool en max:1 una conexión aparte deadlockearía.
    async function insertarEnLotes<T>(
      tabla: Parameters<typeof tx.insert>[0],
      filas: T[],
      porLote = 500
    ) {
      for (let i = 0; i < filas.length; i += porLote) {
        await tx.insert(tabla).values(filas.slice(i, i + porLote) as never)
      }
    }

    // Limpieza (respetando FKs: hijos antes que padres).
    await tx.delete(ordenLineas)
    await tx.delete(ordenesCompra)
    await tx.delete(movimientosStock)
    await tx.delete(facturaLineas)
    await tx.delete(facturas)
    await tx.delete(remitoLineas)
    await tx.delete(remitos)
    await tx.delete(preciosProveedor)
    await tx.delete(productos)
    await tx.delete(proveedores)

    // Proveedores (un solo insert, ids en orden).
    const provIds = (
      await tx.insert(proveedores).values([...PROVEEDORES]).returning({ id: proveedores.id })
    ).map((r) => r.id)

    // Productos (SKU maestro interno) en un único insert con returning.
    const filasProductos = catalogoMock.map((p) => {
      const estado = estadoInicial(p.codigo)
      return {
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
        stock: estado === "limbo" ? 0 : p.stock,
        stockMinimo: p.stockMinimo,
        stockMaximo: Math.max(p.stockMinimo * 4, p.stockMinimo + 20),
      }
    })
    const insertados = await tx
      .insert(productos)
      .values(filasProductos)
      .returning({ id: productos.id, codigoInterno: productos.codigoInterno })
    const idPorCodigo = new Map(insertados.map((r) => [r.codigoInterno, r.id]))

    // Listas de precio: DEMA (habitual) siempre; los demás según hash.
    const filasPrecios = catalogoMock.flatMap((p) => {
      const id = idPorCodigo.get(p.codigo)!
      const filas = []
      for (let pi = 0; pi < provIds.length; pi++) {
        const ofrece = pi === 0 || (hash(p.codigo + "prov" + pi) & 1) === 1
        if (!ofrece) continue
        const factor = 0.85 + (hash(p.codigo + "precio" + pi) % 31) / 100 // 0.85..1.15
        filas.push({
          productoId: id,
          proveedorId: provIds[pi],
          codigoProveedor: aliasDe(pi, id, p.codigo),
          precio: Math.round((p.precioLista * factor) / 10) * 10,
          vigenciaDesde: AHORA.slice(0, 10),
        })
      }
      return filas
    })

    await insertarEnLotes(preciosProveedor, filasPrecios)
  })

  await client.end()
  console.log("Seed completo.")
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
