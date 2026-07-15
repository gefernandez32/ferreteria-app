CREATE TABLE "factura_lineas" (
	"id" serial PRIMARY KEY NOT NULL,
	"factura_id" integer NOT NULL,
	"producto_id" integer NOT NULL,
	"cantidad_facturada" integer NOT NULL,
	"precio_unitario" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facturas" (
	"id" serial PRIMARY KEY NOT NULL,
	"numero" text NOT NULL,
	"proveedor_id" integer NOT NULL,
	"remito_id" integer,
	"fecha" text DEFAULT (CURRENT_TIMESTAMP::text) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movimientos_stock" (
	"id" serial PRIMARY KEY NOT NULL,
	"producto_id" integer NOT NULL,
	"tipo" text NOT NULL,
	"cantidad" integer NOT NULL,
	"remito_id" integer,
	"fecha" text DEFAULT (CURRENT_TIMESTAMP::text) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orden_lineas" (
	"id" serial PRIMARY KEY NOT NULL,
	"orden_id" integer NOT NULL,
	"producto_id" integer NOT NULL,
	"cantidad_sugerida" integer NOT NULL,
	"precio_vigente" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ordenes_compra" (
	"id" serial PRIMARY KEY NOT NULL,
	"proveedor_id" integer NOT NULL,
	"fecha" text DEFAULT (CURRENT_TIMESTAMP::text) NOT NULL,
	"estado" text DEFAULT 'sugerida' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "precios_proveedor" (
	"id" serial PRIMARY KEY NOT NULL,
	"producto_id" integer NOT NULL,
	"proveedor_id" integer NOT NULL,
	"codigo_proveedor" text NOT NULL,
	"precio" real NOT NULL,
	"vigencia_desde" text DEFAULT (CURRENT_DATE::text) NOT NULL,
	CONSTRAINT "precios_prov_alias_uq" UNIQUE("proveedor_id","codigo_proveedor"),
	CONSTRAINT "precios_prov_prod_uq" UNIQUE("proveedor_id","producto_id")
);
--> statement-breakpoint
CREATE TABLE "productos" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo_interno" text NOT NULL,
	"nombre" text NOT NULL,
	"familia" text NOT NULL,
	"categoria" text NOT NULL,
	"sistema" text NOT NULL,
	"material" text NOT NULL,
	"marca" text NOT NULL,
	"medida" text NOT NULL,
	"es_generico" boolean DEFAULT true NOT NULL,
	"estado" text DEFAULT 'activo' NOT NULL,
	"ubicacion" text DEFAULT '' NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"stock_minimo" integer DEFAULT 0 NOT NULL,
	"stock_maximo" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "productos_codigo_interno_uq" UNIQUE("codigo_interno")
);
--> statement-breakpoint
CREATE TABLE "proveedores" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"es_habitual" boolean DEFAULT false NOT NULL,
	CONSTRAINT "proveedores_nombre_uq" UNIQUE("nombre")
);
--> statement-breakpoint
CREATE TABLE "remito_lineas" (
	"id" serial PRIMARY KEY NOT NULL,
	"remito_id" integer NOT NULL,
	"producto_id" integer,
	"codigo_ingresado" text NOT NULL,
	"cantidad_fisica" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "remitos" (
	"id" serial PRIMARY KEY NOT NULL,
	"numero" text NOT NULL,
	"proveedor_id" integer NOT NULL,
	"fecha" text DEFAULT (CURRENT_TIMESTAMP::text) NOT NULL,
	"estado" text DEFAULT 'borrador' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "factura_lineas" ADD CONSTRAINT "factura_lineas_factura_id_facturas_id_fk" FOREIGN KEY ("factura_id") REFERENCES "public"."facturas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factura_lineas" ADD CONSTRAINT "factura_lineas_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_proveedor_id_proveedores_id_fk" FOREIGN KEY ("proveedor_id") REFERENCES "public"."proveedores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_remito_id_remitos_id_fk" FOREIGN KEY ("remito_id") REFERENCES "public"."remitos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimientos_stock" ADD CONSTRAINT "movimientos_stock_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimientos_stock" ADD CONSTRAINT "movimientos_stock_remito_id_remitos_id_fk" FOREIGN KEY ("remito_id") REFERENCES "public"."remitos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orden_lineas" ADD CONSTRAINT "orden_lineas_orden_id_ordenes_compra_id_fk" FOREIGN KEY ("orden_id") REFERENCES "public"."ordenes_compra"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orden_lineas" ADD CONSTRAINT "orden_lineas_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_proveedor_id_proveedores_id_fk" FOREIGN KEY ("proveedor_id") REFERENCES "public"."proveedores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "precios_proveedor" ADD CONSTRAINT "precios_proveedor_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "precios_proveedor" ADD CONSTRAINT "precios_proveedor_proveedor_id_proveedores_id_fk" FOREIGN KEY ("proveedor_id") REFERENCES "public"."proveedores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remito_lineas" ADD CONSTRAINT "remito_lineas_remito_id_remitos_id_fk" FOREIGN KEY ("remito_id") REFERENCES "public"."remitos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remito_lineas" ADD CONSTRAINT "remito_lineas_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remitos" ADD CONSTRAINT "remitos_proveedor_id_proveedores_id_fk" FOREIGN KEY ("proveedor_id") REFERENCES "public"."proveedores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "factura_lineas_factura_idx" ON "factura_lineas" USING btree ("factura_id");--> statement-breakpoint
CREATE INDEX "movimientos_producto_idx" ON "movimientos_stock" USING btree ("producto_id");--> statement-breakpoint
CREATE INDEX "orden_lineas_orden_idx" ON "orden_lineas" USING btree ("orden_id");--> statement-breakpoint
CREATE INDEX "precios_prov_codigo_idx" ON "precios_proveedor" USING btree ("codigo_proveedor");--> statement-breakpoint
CREATE INDEX "precios_prov_producto_idx" ON "precios_proveedor" USING btree ("producto_id");--> statement-breakpoint
CREATE INDEX "productos_estado_idx" ON "productos" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "productos_sistema_idx" ON "productos" USING btree ("sistema");--> statement-breakpoint
CREATE INDEX "productos_categoria_idx" ON "productos" USING btree ("categoria");--> statement-breakpoint
CREATE INDEX "remito_lineas_remito_idx" ON "remito_lineas" USING btree ("remito_id");--> statement-breakpoint
CREATE INDEX "remitos_estado_idx" ON "remitos" USING btree ("estado");