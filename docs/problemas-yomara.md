## 1. El Caos del Catálogo: Duplicación y Ruido

> **El síntoma:** Lista con artículos duplicados (por marca o proveedor), listas importadas con productos sin stock real que generan confusión, y falta de criterio para unificar o separar.

### Qué está pasando de fondo:

* **Falta de un "Catálogo Maestro" (Master Data):** La cliente está usando las listas de los proveedores como si fuera su propio inventario. Al importar planillas enteras para no cargar a mano, mete "ruido" (miles de productos que jamás va a tener físicamente) y duplica el mismo tornillo o pinza cinco veces porque lo venden cinco proveedores distintos.
* **Falta de categorización flexible:** No tiene cómo diferenciar cuándo un producto es genérico (ej. *Tornillo Parker 14x1"*, da igual la marca) y cuándo la marca sí aporta valor y exige un SKU separado (ej. *Taladro de mano DeWalt* vs. *Dowen Pagio*).

### La solución a nivel sistema:

* **Catálogo Maestro Único vs. Catálogo de Proveedores:** El sistema debe tener una base de productos propia (SKUs internos). Las listas de los proveedores deben ser "vistas" o "tarifarios" que se vinculan a nuestro SKU, no el inventario en sí.
* **Filtro de "Artículos Activos" o "Visualizables":** Al importar una lista de proveedor, esos productos deben quedar en un "limbo" de consulta. Solo pasan al inventario activo de la ferretería cuando se realiza la primera compra o se los da de alta manualmente.

---

## 2. El cuello de botella en la Recepción de Mercadería

> **El síntoma:** Cargan stock usando el código del proveedor (lo que fragmenta el stock de un mismo producto comprado a distintas manos), errores humanos al tipear/seleccionar el artículo que ingresa, y diferencias físicas entre lo recibido y lo facturado.

### Qué está pasando de fondo:

* **Relación "Muchos a Uno" rota:** El sistema actual asume que un producto tiene un solo código (el de compra). Si le comprás un destornillador a *Proveedor A* (Código: `DST-01`) y el mismo a *Proveedor B* (Código: `10024`), el sistema cree que son dos cosas distintas.
* **Falta de control de calidad (Auditoría de Recepción):** La carga de mercadería se hace "a ciegas", impactando directo en el stock sin un paso intermedio de validación.

### La solución a nivel sistema:

* **Mapeo de Códigos de Proveedor (Equivalencias):** El sistema debe permitir que un único producto interno (ej. `COD-INTERNO: 5020`) tenga múltiples "Alias" o códigos de proveedor asociados.
* *Ejemplo:* Si escaneás o cargás `DST-01` de *Proveedor A* o `10024` de *Proveedor B*, el sistema entiende que ambos suman stock al casillero `5020`.


* **Flujo de Recepción en dos pasos (Remito vs. Factura):** 1. **Paso 1 (Ingreso Físico):** El playero o recepcionista cuenta lo que llegó y lo carga en un "Remito de Ingreso" provisorio.
2. **Paso 2 (Conciliación):** El sistema contrasta automáticamente ese ingreso físico contra la Factura del proveedor. Si hay discrepancias (ej. la factura dice 10 y llegaron 8), el sistema genera una alerta de "Diferencia de Recepción" y permite emitir un reclamo o nota de crédito antes de consolidar el stock.
* **Búsqueda inteligente y código de barras:** Minimizar el error humano usando lectores de código de barras para el ingreso o, en su defecto, un buscador predictivo que muestre foto, marca y ubicación en góndola para que el operario confirme visualmente qué está ingresando.

---

## 3. Compras "a ojo" y sin automatización

> **El síntoma:** Como no hay un control de stock confiable, no se pueden programar alertas de máximos y mínimos. Compran mirando lo que se vendió recientemente y deduciendo a quién pedirle de memoria.

### Qué está pasando de fondo:

* **Círculo vicioso:** Como el paso 1 (catálogo) y el paso 2 (ingresos) fallan, el stock lógico del sistema es mentira. Al no haber stock real confiable en el sistema, es imposible calcular puntos de reposición.
* **Inactividad operativa:** La cliente pierde horas valiosas cruzando ventas manuales contra listas de precios para armar un pedido de reposición.

### La solución a nivel sistema:

* **Motor de Sugerencia de Pedidos (MRP básico):** Una vez saneado el stock (gracias a los puntos 1 y 2), el sistema puede aplicar una regla simple de **Punto de Pedido**:

$$\text{Stock Actual} \le \text{Mínimo} \implies \text{Gatillar pedido hasta alcanzar el Máximo}$$


* **Asociación de Proveedor Predeterminado / Más Barato:** El sistema debe sugerir a quién comprarle el faltante. Al procesar la orden de compra automática, el software puede agrupar los artículos faltantes por el "Proveedor Habitual" o, mejor aún, comparar quién tiene el mejor precio vigente en sus listas importadas para optimizar el gasto.

---

### En resumen, ¿por dónde empezar?

Para venderle o armarle este sistema, el orden de prioridad es destructivo: **no podés resolver el problema 3 (pedidos) si primero no resolvés el 2 (ingresos), y no podés resolver el 2 si no ordenás el 1 (catálogo).** El foco inicial de la preventa o del desarrollo tiene que ser la **normalización de su base de datos de artículos** (crear la estructura de equivalencias Producto $\leftrightarrow$ Proveedores) y asegurar un módulo de **ingreso de mercadería robusto y a prueba de errores**.