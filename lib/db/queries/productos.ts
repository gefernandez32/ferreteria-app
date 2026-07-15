import "server-only"

import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  like,
  min,
  or,
  sql,
} from "drizzle-orm"

import { db } from "@/lib/db/client"
import { preciosProveedor, productos, proveedores } from "@/lib/db/schema"
import type {
  FiltrosProductos,
  ListaProductosResponse,
  Oferta,
  ProductoDetalle,
  ProductoListItem,
  ResumenCatalogo,
} from "@/lib/api/types"

const DEFAULT_PAGE_SIZE = 20

/**
 * Subquery agregado de ofertas por SKU (mejor precio + nº de proveedores).
 * Se usa vía JOIN — NO como subconsulta correlacionada dentro de un `sql`,
 * porque interpolar una Column en `sql` la renderiza sin calificar la tabla
 * y rompe la correlación.
 */
function aggOfertas() {
  return db
    .select({
      productoId: preciosProveedor.productoId,
      mejorPrecio: min(preciosProveedor.precio).as("mejor_precio"),
      numProveedores: count().as("num_proveedores"),
    })
    .from(preciosProveedor)
    .groupBy(preciosProveedor.productoId)
    .as("agg")
}

function construirFiltros(f: FiltrosProductos) {
  const conds = []
  const q = f.query?.trim()
  if (q) {
    const patron = `%${q}%`
    conds.push(
      or(
        like(productos.codigoInterno, patron),
        like(productos.nombre, patron),
        // También resuelve por código de proveedor (alias). "productos"."id"
        // va literal (no interpolado) para conservar la calificación de tabla.
        sql`EXISTS (SELECT 1 FROM ${preciosProveedor} pp
          WHERE pp.producto_id = "productos"."id"
          AND pp.codigo_proveedor LIKE ${patron})`
      )
    )
  }
  if (f.sistema && f.sistema !== "todos") conds.push(eq(productos.sistema, f.sistema))
  if (f.categoria && f.categoria !== "todas")
    conds.push(eq(productos.categoria, f.categoria))
  if (f.estado && f.estado !== "todos") conds.push(eq(productos.estado, f.estado))
  return conds.length ? and(...conds) : undefined
}

export function listarProductos(f: FiltrosProductos): ListaProductosResponse {
  const page = Math.max(1, f.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, f.pageSize ?? DEFAULT_PAGE_SIZE))
  const where = construirFiltros(f)
  const agg = aggOfertas()

  const columnaOrden = {
    nombre: productos.nombre,
    stock: productos.stock,
    mejorPrecio: agg.mejorPrecio,
    codigoInterno: productos.codigoInterno,
  }[f.ordenCampo ?? "codigoInterno"]
  const ordenar =
    (f.ordenDir ?? "asc") === "asc" ? asc(columnaOrden) : desc(columnaOrden)

  const items = db
    .select({
      ...getTableColumns(productos),
      mejorPrecio: agg.mejorPrecio,
      numProveedores: agg.numProveedores,
    })
    .from(productos)
    .leftJoin(agg, eq(agg.productoId, productos.id))
    .where(where)
    .orderBy(ordenar)
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .all()

  const [{ total }] = db
    .select({ total: count() })
    .from(productos)
    .where(where)
    .all()

  return {
    items: items.map(mapListItem),
    total,
    page,
    pageSize,
    totalPaginas: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export function obtenerProducto(id: number): ProductoDetalle | null {
  const row = db.select().from(productos).where(eq(productos.id, id)).get()
  if (!row) return null

  const ofertasRaw = db
    .select({
      proveedorId: proveedores.id,
      proveedor: proveedores.nombre,
      esHabitual: proveedores.esHabitual,
      codigoProveedor: preciosProveedor.codigoProveedor,
      precio: preciosProveedor.precio,
      vigenciaDesde: preciosProveedor.vigenciaDesde,
    })
    .from(preciosProveedor)
    .innerJoin(proveedores, eq(proveedores.id, preciosProveedor.proveedorId))
    .where(eq(preciosProveedor.productoId, id))
    .orderBy(asc(preciosProveedor.precio))
    .all()

  const minPrecio = ofertasRaw.length ? ofertasRaw[0].precio : null
  const ofertas: Oferta[] = ofertasRaw.map((o) => ({
    ...o,
    esMasBarato: o.precio === minPrecio,
  }))

  return {
    ...mapListItem({
      ...row,
      mejorPrecio: minPrecio,
      numProveedores: ofertas.length,
    }),
    material: row.material,
    ofertas,
  }
}

/** Actualiza estado y/o esGenerico de un SKU (alta manual, marcar genérico). */
export function actualizarProducto(
  id: number,
  cambios: { estado?: ProductoDetalle["estado"]; esGenerico?: boolean }
): ProductoDetalle | null {
  const patch: Record<string, unknown> = {}
  if (cambios.estado !== undefined) patch.estado = cambios.estado
  if (cambios.esGenerico !== undefined) patch.esGenerico = cambios.esGenerico
  if (Object.keys(patch).length > 0) {
    db.update(productos).set(patch).where(eq(productos.id, id)).run()
  }
  return obtenerProducto(id)
}

export function resumenCatalogo(): ResumenCatalogo {
  const conteos = db
    .select({
      totalSkus: count(),
      activos: sql<number>`SUM(CASE WHEN ${productos.estado} = 'activo' THEN 1 ELSE 0 END)`,
      limbo: sql<number>`SUM(CASE WHEN ${productos.estado} = 'limbo' THEN 1 ELSE 0 END)`,
      noComercializa: sql<number>`SUM(CASE WHEN ${productos.estado} = 'no_comercializa' THEN 1 ELSE 0 END)`,
      bajoStock: sql<number>`SUM(CASE WHEN ${productos.stock} <= ${productos.stockMinimo} AND ${productos.estado} = 'activo' THEN 1 ELSE 0 END)`,
    })
    .from(productos)
    .get()

  const agg = aggOfertas()
  const valor = db
    .select({
      valorStock: sql<number>`COALESCE(SUM(${productos.stock} * ${agg.mejorPrecio}), 0)`,
      sinProveedor: sql<number>`SUM(CASE WHEN ${agg.productoId} IS NULL THEN 1 ELSE 0 END)`,
    })
    .from(productos)
    .leftJoin(agg, eq(agg.productoId, productos.id))
    .get()

  return {
    totalSkus: conteos?.totalSkus ?? 0,
    activos: conteos?.activos ?? 0,
    limbo: conteos?.limbo ?? 0,
    noComercializa: conteos?.noComercializa ?? 0,
    sinProveedor: valor?.sinProveedor ?? 0,
    bajoStock: conteos?.bajoStock ?? 0,
    valorStock: Math.round(valor?.valorStock ?? 0),
  }
}

type ProductoRow = typeof productos.$inferSelect & {
  mejorPrecio: number | null
  numProveedores: number | null
}

function mapListItem(row: ProductoRow): ProductoListItem {
  return {
    id: row.id,
    codigoInterno: row.codigoInterno,
    nombre: row.nombre,
    familia: row.familia,
    categoria: row.categoria,
    sistema: row.sistema,
    marca: row.marca,
    medida: row.medida,
    esGenerico: row.esGenerico,
    estado: row.estado,
    ubicacion: row.ubicacion,
    stock: row.stock,
    stockMinimo: row.stockMinimo,
    stockMaximo: row.stockMaximo,
    mejorPrecio: row.mejorPrecio,
    numProveedores: row.numProveedores ?? 0,
  }
}
