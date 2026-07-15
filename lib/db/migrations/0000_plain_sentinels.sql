CREATE TABLE `factura_lineas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`factura_id` integer NOT NULL,
	`producto_id` integer NOT NULL,
	`cantidad_facturada` integer NOT NULL,
	`precio_unitario` real NOT NULL,
	FOREIGN KEY (`factura_id`) REFERENCES `facturas`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `factura_lineas_factura_idx` ON `factura_lineas` (`factura_id`);--> statement-breakpoint
CREATE TABLE `facturas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`numero` text NOT NULL,
	`proveedor_id` integer NOT NULL,
	`remito_id` integer,
	`fecha` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`remito_id`) REFERENCES `remitos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `movimientos_stock` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`producto_id` integer NOT NULL,
	`tipo` text NOT NULL,
	`cantidad` integer NOT NULL,
	`remito_id` integer,
	`fecha` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`remito_id`) REFERENCES `remitos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `movimientos_producto_idx` ON `movimientos_stock` (`producto_id`);--> statement-breakpoint
CREATE TABLE `orden_lineas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`orden_id` integer NOT NULL,
	`producto_id` integer NOT NULL,
	`cantidad_sugerida` integer NOT NULL,
	`precio_vigente` real NOT NULL,
	FOREIGN KEY (`orden_id`) REFERENCES `ordenes_compra`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `orden_lineas_orden_idx` ON `orden_lineas` (`orden_id`);--> statement-breakpoint
CREATE TABLE `ordenes_compra` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`proveedor_id` integer NOT NULL,
	`fecha` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`estado` text DEFAULT 'sugerida' NOT NULL,
	FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `precios_proveedor` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`producto_id` integer NOT NULL,
	`proveedor_id` integer NOT NULL,
	`codigo_proveedor` text NOT NULL,
	`precio` real NOT NULL,
	`vigencia_desde` text DEFAULT (CURRENT_DATE) NOT NULL,
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `precios_prov_codigo_idx` ON `precios_proveedor` (`codigo_proveedor`);--> statement-breakpoint
CREATE INDEX `precios_prov_producto_idx` ON `precios_proveedor` (`producto_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `precios_prov_alias_uq` ON `precios_proveedor` (`proveedor_id`,`codigo_proveedor`);--> statement-breakpoint
CREATE UNIQUE INDEX `precios_prov_prod_uq` ON `precios_proveedor` (`proveedor_id`,`producto_id`);--> statement-breakpoint
CREATE TABLE `productos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codigo_interno` text NOT NULL,
	`nombre` text NOT NULL,
	`familia` text NOT NULL,
	`categoria` text NOT NULL,
	`sistema` text NOT NULL,
	`material` text NOT NULL,
	`marca` text NOT NULL,
	`medida` text NOT NULL,
	`es_generico` integer DEFAULT true NOT NULL,
	`estado` text DEFAULT 'activo' NOT NULL,
	`ubicacion` text DEFAULT '' NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`stock_minimo` integer DEFAULT 0 NOT NULL,
	`stock_maximo` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `productos_estado_idx` ON `productos` (`estado`);--> statement-breakpoint
CREATE INDEX `productos_sistema_idx` ON `productos` (`sistema`);--> statement-breakpoint
CREATE INDEX `productos_categoria_idx` ON `productos` (`categoria`);--> statement-breakpoint
CREATE UNIQUE INDEX `productos_codigo_interno_uq` ON `productos` (`codigo_interno`);--> statement-breakpoint
CREATE TABLE `proveedores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`es_habitual` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `proveedores_nombre_uq` ON `proveedores` (`nombre`);--> statement-breakpoint
CREATE TABLE `remito_lineas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`remito_id` integer NOT NULL,
	`producto_id` integer,
	`codigo_ingresado` text NOT NULL,
	`cantidad_fisica` integer NOT NULL,
	FOREIGN KEY (`remito_id`) REFERENCES `remitos`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `remito_lineas_remito_idx` ON `remito_lineas` (`remito_id`);--> statement-breakpoint
CREATE TABLE `remitos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`numero` text NOT NULL,
	`proveedor_id` integer NOT NULL,
	`fecha` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`estado` text DEFAULT 'borrador' NOT NULL,
	FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `remitos_estado_idx` ON `remitos` (`estado`);