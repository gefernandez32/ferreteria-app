import { sql } from "drizzle-orm"
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core"

/**
 * Schema del dominio de la ferretería (SQLite / Drizzle).
 *
 * Resuelve los 3 problemas del análisis de preventa:
 *  P1 — Catálogo Maestro: `productos` son SKUs internos propios; las listas de
 *       proveedor viven en `precios_proveedor` (vistas/tarifarios vinculados).
 *  P2 — Recepción: `remitos` (ingreso físico) se concilian contra `facturas`
 *       antes de impactar `movimientos_stock`.
 *  P3 — Pedidos: `ordenes_compra` se generan por punto de pedido (mín/máx) y
 *       eligen proveedor por mejor precio vigente en `precios_proveedor`.
 */

/* ------------------------------------------------------------------ */
/* Catálogo Maestro (P1)                                              */
/* ------------------------------------------------------------------ */

/** Estados de un SKU en el catálogo maestro. */
export const ESTADOS_PRODUCTO = ["activo", "limbo", "no_comercializa"] as const
export type EstadoProducto = (typeof ESTADOS_PRODUCTO)[number]

export const productos = sqliteTable(
  "productos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** SKU interno propio de la ferretería (no el del proveedor). */
    codigoInterno: text("codigo_interno").notNull(),
    nombre: text("nombre").notNull(),
    familia: text("familia").notNull(),
    categoria: text("categoria").notNull(),
    sistema: text("sistema").notNull(),
    material: text("material").notNull(),
    marca: text("marca").notNull(),
    medida: text("medida").notNull(),
    /** true = genérico (la marca da igual); false = la marca exige SKU separado. */
    esGenerico: integer("es_generico", { mode: "boolean" }).notNull().default(true),
    /** activo = en inventario; limbo = importado sin alta; no_comercializa = ruido. */
    estado: text("estado", { enum: ESTADOS_PRODUCTO }).notNull().default("activo"),
    ubicacion: text("ubicacion").notNull().default(""),
    stock: integer("stock").notNull().default(0),
    stockMinimo: integer("stock_minimo").notNull().default(0),
    stockMaximo: integer("stock_maximo").notNull().default(0),
  },
  (t) => [
    unique("productos_codigo_interno_uq").on(t.codigoInterno),
    index("productos_estado_idx").on(t.estado),
    index("productos_sistema_idx").on(t.sistema),
    index("productos_categoria_idx").on(t.categoria),
  ]
)

export const proveedores = sqliteTable(
  "proveedores",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    nombre: text("nombre").notNull(),
    /** Proveedor preferido por defecto al sugerir pedidos (desempate). */
    esHabitual: integer("es_habitual", { mode: "boolean" }).notNull().default(false),
  },
  (t) => [unique("proveedores_nombre_uq").on(t.nombre)]
)

/**
 * Equivalencias Producto ↔ Proveedor + tarifario. Una fila por (producto,
 * proveedor): mapea el código del proveedor (alias) al SKU interno y guarda su
 * precio vigente. Así "muchos códigos de proveedor → 1 SKU interno" (P2) y se
 * puede elegir el más barato (P3).
 */
export const preciosProveedor = sqliteTable(
  "precios_proveedor",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productoId: integer("producto_id")
      .notNull()
      .references(() => productos.id, { onDelete: "cascade" }),
    proveedorId: integer("proveedor_id")
      .notNull()
      .references(() => proveedores.id, { onDelete: "cascade" }),
    /** Código del proveedor para este SKU (alias). Formatos heterogéneos. */
    codigoProveedor: text("codigo_proveedor").notNull(),
    precio: real("precio").notNull(),
    vigenciaDesde: text("vigencia_desde")
      .notNull()
      .default(sql`(CURRENT_DATE)`),
  },
  (t) => [
    // Un proveedor no repite el mismo alias; permite resolver alias → SKU.
    unique("precios_prov_alias_uq").on(t.proveedorId, t.codigoProveedor),
    unique("precios_prov_prod_uq").on(t.proveedorId, t.productoId),
    index("precios_prov_codigo_idx").on(t.codigoProveedor),
    index("precios_prov_producto_idx").on(t.productoId),
  ]
)

/* ------------------------------------------------------------------ */
/* Recepción en 2 pasos (P2)                                          */
/* ------------------------------------------------------------------ */

export const ESTADOS_REMITO = ["borrador", "conciliado", "consolidado"] as const
export type EstadoRemito = (typeof ESTADOS_REMITO)[number]

/** Paso 1: ingreso físico provisorio, cargado por el playero. */
export const remitos = sqliteTable(
  "remitos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    numero: text("numero").notNull(),
    proveedorId: integer("proveedor_id")
      .notNull()
      .references(() => proveedores.id),
    fecha: text("fecha")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    estado: text("estado", { enum: ESTADOS_REMITO }).notNull().default("borrador"),
  },
  (t) => [index("remitos_estado_idx").on(t.estado)]
)

export const remitoLineas = sqliteTable(
  "remito_lineas",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    remitoId: integer("remito_id")
      .notNull()
      .references(() => remitos.id, { onDelete: "cascade" }),
    /** SKU interno resuelto vía alias; null si el código no se pudo resolver. */
    productoId: integer("producto_id").references(() => productos.id),
    /** Código tal cual lo tipeó/escaneó el operario (para auditoría). */
    codigoIngresado: text("codigo_ingresado").notNull(),
    cantidadFisica: integer("cantidad_fisica").notNull(),
  },
  (t) => [index("remito_lineas_remito_idx").on(t.remitoId)]
)

/** Paso 2: factura del proveedor, para conciliar contra el remito. */
export const facturas = sqliteTable("facturas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  numero: text("numero").notNull(),
  proveedorId: integer("proveedor_id")
    .notNull()
    .references(() => proveedores.id),
  remitoId: integer("remito_id").references(() => remitos.id),
  fecha: text("fecha")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
})

export const facturaLineas = sqliteTable(
  "factura_lineas",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    facturaId: integer("factura_id")
      .notNull()
      .references(() => facturas.id, { onDelete: "cascade" }),
    productoId: integer("producto_id")
      .notNull()
      .references(() => productos.id),
    cantidadFacturada: integer("cantidad_facturada").notNull(),
    precioUnitario: real("precio_unitario").notNull(),
  },
  (t) => [index("factura_lineas_factura_idx").on(t.facturaId)]
)

export const TIPOS_MOVIMIENTO = ["ingreso", "ajuste"] as const
export type TipoMovimiento = (typeof TIPOS_MOVIMIENTO)[number]

/** Log de cambios de stock; se escribe recién al consolidar un remito. */
export const movimientosStock = sqliteTable(
  "movimientos_stock",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productoId: integer("producto_id")
      .notNull()
      .references(() => productos.id),
    tipo: text("tipo", { enum: TIPOS_MOVIMIENTO }).notNull(),
    cantidad: integer("cantidad").notNull(),
    remitoId: integer("remito_id").references(() => remitos.id),
    fecha: text("fecha")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => [index("movimientos_producto_idx").on(t.productoId)]
)

/* ------------------------------------------------------------------ */
/* Motor de pedidos (P3)                                              */
/* ------------------------------------------------------------------ */

export const ESTADOS_ORDEN = ["sugerida", "emitida"] as const
export type EstadoOrden = (typeof ESTADOS_ORDEN)[number]

export const ordenesCompra = sqliteTable("ordenes_compra", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  proveedorId: integer("proveedor_id")
    .notNull()
    .references(() => proveedores.id),
  fecha: text("fecha")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  estado: text("estado", { enum: ESTADOS_ORDEN }).notNull().default("sugerida"),
})

export const ordenLineas = sqliteTable(
  "orden_lineas",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ordenId: integer("orden_id")
      .notNull()
      .references(() => ordenesCompra.id, { onDelete: "cascade" }),
    productoId: integer("producto_id")
      .notNull()
      .references(() => productos.id),
    cantidadSugerida: integer("cantidad_sugerida").notNull(),
    precioVigente: real("precio_vigente").notNull(),
  },
  (t) => [index("orden_lineas_orden_idx").on(t.ordenId)]
)

/* ------------------------------------------------------------------ */
/* Tipos inferidos (para la capa de API y hooks)                      */
/* ------------------------------------------------------------------ */

export type Producto = typeof productos.$inferSelect
export type NuevoProducto = typeof productos.$inferInsert
export type Proveedor = typeof proveedores.$inferSelect
export type PrecioProveedor = typeof preciosProveedor.$inferSelect
export type Remito = typeof remitos.$inferSelect
export type RemitoLinea = typeof remitoLineas.$inferSelect
export type Factura = typeof facturas.$inferSelect
export type FacturaLinea = typeof facturaLineas.$inferSelect
export type MovimientoStock = typeof movimientosStock.$inferSelect
export type OrdenCompra = typeof ordenesCompra.$inferSelect
export type OrdenLinea = typeof ordenLineas.$inferSelect
