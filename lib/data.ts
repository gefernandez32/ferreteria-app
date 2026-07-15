/**
 * Datos mock del catálogo — generados a partir de docs/catalogos/.
 *
 * Fuentes:
 *  - "Catalogo- GALVANIZADO Y EPOXI.pdf" — Accesorios DEMA de fundición maleable.
 *      Línea galvanizada (código 01-, conducción de AGUA) y línea con pintura
 *      epoxi (código 03-, conducción de GAS). Mismas familias, distinto recubrimiento.
 *  - "CATALOGO SIGAS.pdf" (Manual Técnico, Ed. 15 - 2025) — Sistema SIGAS
 *      Thermofusión (código 60-): tubos acero-polietileno, conexiones por
 *      termofusión, válvulas y herramientas (código 08-/60-9xx).
 *
 * Los códigos son reales y siguen el patrón `prefijo + familia + medida` del
 * catálogo. Las medidas en pulgadas (líneas 01/03) y en mm (línea 60) se
 * codifican como en el impreso. Los campos de inventario (precio, stock,
 * proveedor, ubicación) son MOCK deterministas derivados del código.
 */

export type Sistema =
  | "Galvanizado (agua)"
  | "Epoxi (gas)"
  | "SIGAS Thermofusión"

export type Categoria =
  | "Curvas y codos"
  | "Tes, cruces y derivaciones"
  | "Reducciones"
  | "Uniones y tuercas"
  | "Tapas, tapones y bridas"
  | "Roscas y niples"
  | "Tubos y vainas"
  | "Válvulas"
  | "Herramientas y accesorios"

export type Producto = {
  /** Código real del catálogo (SKU) */
  codigo: string
  /** Nombre para mostrar: familia + medida */
  nombre: string
  /** Familia de producto, tal cual el catálogo */
  familia: string
  categoria: Categoria
  sistema: Sistema
  material: string
  marca: string
  medida: string
  proveedor: string
  /** Precio de lista mock, en pesos argentinos */
  precioLista: number
  stock: number
  stockMinimo: number
  /** Ubicación mock en depósito (Pasillo-Estante) */
  ubicacion: string
}

/* ------------------------------------------------------------------ */
/* Tablas de codificación de medidas (según catálogo)                 */
/* ------------------------------------------------------------------ */

/** Medida en pulgadas → segmento de 3 dígitos del código (líneas 01/03) */
const PULG: Record<string, string> = {
  '1/8"': "006",
  '1/4"': "008",
  '3/8"': "010",
  '1/2"': "015",
  '3/4"': "020",
  '1"': "025",
  '1 1/4"': "032",
  '1 1/2"': "040",
  '2"': "050",
  '2 1/2"': "065",
  '3"': "080",
  '4"': "100",
  '6"': "150",
}
const PULG_REV: Record<string, string> = Object.fromEntries(
  Object.entries(PULG).map(([label, code]) => [code, label])
)

/** Medida en mm → segmento de 3 dígitos del código (línea 60) */
const mmc = (mm: number) => String(mm).padStart(3, "0")

/** Set completo de medidas en pulgadas, de menor a mayor */
const FULL = [
  '1/4"',
  '3/8"',
  '1/2"',
  '3/4"',
  '1"',
  '1 1/4"',
  '1 1/2"',
  '2"',
  '2 1/2"',
  '3"',
  '4"',
  '6"',
] as const

const MM = [20, 25, 32, 40, 50, 63, 75, 90, 110]

/* ------------------------------------------------------------------ */
/* Definición de las líneas de producto                               */
/* ------------------------------------------------------------------ */

type Linea = {
  prefix: string
  sistema: Sistema
  material: string
  marca: string
}

const GALV: Linea = {
  prefix: "01-",
  sistema: "Galvanizado (agua)",
  material: "Fundición maleable galvanizada",
  marca: "DEMA",
}
const EPOXI: Linea = {
  prefix: "03-",
  sistema: "Epoxi (gas)",
  material: "Fundición maleable c/ pintura epoxi",
  marca: "DEMA",
}
const SIGAS: Linea = {
  prefix: "60-",
  sistema: "SIGAS Thermofusión",
  material: "Acero-polietileno (unión por termofusión)",
  marca: "SIGAS",
}

/* ------------------------------------------------------------------ */
/* Enriquecimiento mock (determinista a partir del código)            */
/* ------------------------------------------------------------------ */

const PROVEEDORES = [
  "Grupo DEMA",
  "FERVA S.A.",
  "Sanitarios del Centro SRL",
  "Gas y Agua Mayorista",
] as const

/** Hash simple y estable de una cadena (sin depender de Date/Math.random). */
function seed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const redondear = (n: number) => Math.round(n / 50) * 50

function mk(
  codigo: string,
  familia: string,
  categoria: Categoria,
  linea: Linea,
  medida: string
): Producto {
  const a = seed(codigo)
  const b = seed(codigo + "·")
  return {
    codigo,
    nombre: `${familia} ${medida}`.trim(),
    familia,
    categoria,
    sistema: linea.sistema,
    material: linea.material,
    marca: linea.marca,
    medida,
    proveedor: PROVEEDORES[b % PROVEEDORES.length],
    precioLista: redondear(350 + (a % 84000)),
    stock: a % 140,
    stockMinimo: 5 + (b % 25),
    ubicacion: `P${1 + (a % 8)}-E${1 + (b % 5)}`,
  }
}

/* ------------------------------------------------------------------ */
/* Constructores por tipo de código                                   */
/* ------------------------------------------------------------------ */

/** Familia de una sola medida, en pulgadas: `prefijo + fam + medida + 000`. */
function famPulg(
  linea: Linea,
  fam: string,
  familia: string,
  categoria: Categoria,
  medidas: readonly string[]
): Producto[] {
  return medidas.map((m) =>
    mk(`${linea.prefix}${fam}${PULG[m]}000`, familia, categoria, linea, m)
  )
}

/** Reducción en pulgadas: `prefijo + fam + medidaA + medidaB`. */
function redPulg(
  linea: Linea,
  fam: string,
  familia: string,
  categoria: Categoria,
  pares: readonly [string, string][]
): Producto[] {
  return pares.map(([a, b]) =>
    mk(
      `${linea.prefix}${fam}${a}${b}`,
      familia,
      categoria,
      linea,
      `${PULG_REV[a]} x ${PULG_REV[b]}`
    )
  )
}

/** La línea de gas (epoxi) no fabrica medidas menores a 1/2" (código ≥ 015). */
const soloGas = (pares: readonly [string, string][]) =>
  pares.filter(([a, b]) => Number(a) >= 15 && Number(b) >= 15)

/** Familia de una sola medida, en mm: `60- + fam + medida + 000`. */
function famMm(
  fam: string,
  familia: string,
  categoria: Categoria,
  mms: number[]
): Producto[] {
  return mms.map((mm) =>
    mk(`${SIGAS.prefix}${fam}${mmc(mm)}000`, familia, categoria, SIGAS, `${mm}mm`)
  )
}

/** Codo SIGAS: familia de 6 dígitos, sin sufijo `000`. */
function codoMm(
  fam6: string,
  familia: string,
  mms: number[]
): Producto[] {
  return mms.map((mm) =>
    mk(
      `${SIGAS.prefix}${fam6}${mmc(mm)}`,
      familia,
      "Curvas y codos",
      SIGAS,
      `${mm}mm`
    )
  )
}

/** Reducción SIGAS en mm: `60- + fam + mmA + mmB`. */
function redMm(
  fam: string,
  familia: string,
  categoria: Categoria,
  pares: [number, number][]
): Producto[] {
  return pares.map(([a, b]) =>
    mk(
      `${SIGAS.prefix}${fam}${mmc(a)}${mmc(b)}`,
      familia,
      categoria,
      SIGAS,
      `${a}x${b}mm`
    )
  )
}

/* Pares de medidas de las familias de reducción (líneas 01/03) ------- */

const RED_TE: [string, string][] = [
  ["015", "010"], ["020", "010"], ["020", "015"], ["025", "010"], ["025", "015"], ["025", "020"],
  ["032", "015"], ["032", "020"], ["032", "025"], ["040", "015"], ["040", "020"], ["040", "025"], ["040", "032"],
  ["050", "015"], ["050", "020"], ["050", "025"], ["050", "032"], ["050", "040"],
  ["065", "020"], ["065", "025"], ["065", "032"], ["065", "040"], ["065", "050"],
  ["080", "025"], ["080", "032"], ["080", "040"], ["080", "050"], ["080", "065"],
  ["100", "040"], ["100", "050"], ["100", "065"], ["100", "080"],
]

const RED_CUPLA: [string, string][] = [
  ["010", "008"], ["015", "008"], ["015", "010"], ["020", "006"], ["020", "008"], ["020", "010"], ["020", "015"],
  ["025", "010"], ["025", "015"], ["025", "020"],
  ["032", "015"], ["032", "020"], ["032", "025"],
  ["040", "020"], ["040", "025"], ["040", "032"],
  ["050", "020"], ["050", "025"], ["050", "032"], ["050", "040"],
  ["065", "032"], ["065", "040"], ["065", "050"],
  ["080", "032"], ["080", "040"], ["080", "050"], ["080", "065"],
  ["100", "050"], ["100", "065"], ["100", "080"],
  ["150", "080"], ["150", "100"],
]

const RED_BUJE: [string, string][] = [
  ["010", "008"], ["015", "008"], ["015", "010"], ["020", "008"], ["020", "010"], ["020", "015"],
  ["025", "010"], ["025", "015"], ["025", "020"],
  ["032", "015"], ["032", "020"], ["032", "025"],
  ["040", "020"], ["040", "025"], ["040", "032"],
  ["050", "015"], ["050", "020"], ["050", "025"], ["050", "032"], ["050", "040"],
  ["065", "025"], ["065", "032"], ["065", "040"], ["065", "050"],
  ["080", "025"], ["080", "032"], ["080", "040"], ["080", "050"], ["080", "065"],
  ["100", "025"], ["100", "032"], ["100", "040"], ["100", "050"], ["100", "065"], ["100", "080"],
  ["150", "080"], ["150", "100"],
]

const RED_CODO: [string, string][] = [
  ["020", "015"], ["025", "015"], ["025", "020"], ["032", "025"],
]

/* ================================================================== */
/* LÍNEA GALVANIZADA (01-) — conducción de agua                       */
/* ================================================================== */

const galvanizado: Producto[] = [
  // Curvas y codos
  ...famPulg(GALV, "001", "Curva M-H 90°", "Curvas y codos", FULL),
  ...famPulg(GALV, "002", "Curva H-H 90°", "Curvas y codos", FULL),
  ...famPulg(GALV, "003", "Curva M-M 90°", "Curvas y codos", FULL.slice(2, 10)),
  ...famPulg(GALV, "040", "Curva M-H 45°", "Curvas y codos", FULL.slice(2, 11)),
  ...famPulg(GALV, "041", "Curva H-H 45°", "Curvas y codos", FULL.slice(1, 11)),
  ...famPulg(GALV, "090", "Codo H-H 90°", "Curvas y codos", FULL),
  ...famPulg(GALV, "092", "Codo M-H 90°", "Curvas y codos", FULL),
  ...redPulg(GALV, "091", "Codo de reducción", "Reducciones", RED_CODO),
  // Tes, cruces y derivaciones
  ...famPulg(GALV, "130", "Te", "Tes, cruces y derivaciones", FULL),
  ...famPulg(GALV, "165", "Te 45°", "Tes, cruces y derivaciones", FULL.slice(2, 10)),
  ...famPulg(GALV, "180", "Cruz", "Tes, cruces y derivaciones", FULL.slice(2, 11)),
  ...redPulg(GALV, "131", "Te de reducción", "Tes, cruces y derivaciones", RED_TE),
  ...[
    mk("01-120015015", "Te caballito", "Tes, cruces y derivaciones", GALV, '3/4" x 1/2" x 1/2"'),
    mk("01-120020015", "Te caballito", "Tes, cruces y derivaciones", GALV, '3/4" x 3/4" x 1/2"'),
    mk("01-085020015", "Puente con rosca", "Tes, cruces y derivaciones", GALV, '3/4" x 1/2"'),
    mk("01-085025020", "Puente con rosca", "Tes, cruces y derivaciones", GALV, '1" x 3/4"'),
  ],
  // Reducciones
  ...redPulg(GALV, "240", "Cupla de reducción", "Reducciones", RED_CUPLA),
  ...redPulg(GALV, "241", "Buje de reducción", "Reducciones", RED_BUJE),
  // Uniones y tuercas
  ...famPulg(GALV, "270", "Cupla con borde", "Uniones y tuercas", FULL),
  ...famPulg(GALV, "310", "Tuerca simple", "Uniones y tuercas", FULL),
  ...famPulg(GALV, "330", "Unión doble plana", "Uniones y tuercas", FULL.slice(0, 11)),
  ...famPulg(GALV, "340", "Unión doble cónica", "Uniones y tuercas", FULL),
  ...famPulg(GALV, "341", "Unión doble cónica M-H", "Uniones y tuercas", FULL.slice(2, 11)),
  // Roscas y niples
  ...famPulg(GALV, "280", "Rosca con tuerca", "Roscas y niples", FULL),
  // Tapas, tapones y bridas
  ...famPulg(GALV, "290", "Tapón M", "Tapas, tapones y bridas", FULL.slice(0, 11)),
  ...famPulg(GALV, "300", "Tapa H", "Tapas, tapones y bridas", FULL),
  ...famPulg(GALV, "321", "Brida mediana", "Tapas, tapones y bridas", FULL.slice(2)),
]

/* ================================================================== */
/* LÍNEA EPOXI (03-) — conducción de gas (desde 1/2")                 */
/* ================================================================== */

const A = FULL.slice(2) //  1/2" … 6"   (10)
const B = FULL.slice(2, 11) // 1/2" … 4" (9)
const C = FULL.slice(2, 10) // 1/2" … 3" (8)
const D = FULL.slice(3, 11) // 3/4" … 4" (8)

const epoxi: Producto[] = [
  ...famPulg(EPOXI, "001", "Curva M-H 90°", "Curvas y codos", A),
  ...famPulg(EPOXI, "002", "Curva H-H 90°", "Curvas y codos", A),
  ...famPulg(EPOXI, "040", "Curva M-H 45°", "Curvas y codos", B),
  ...famPulg(EPOXI, "041", "Curva H-H 45°", "Curvas y codos", B),
  ...famPulg(EPOXI, "090", "Codo H-H 90°", "Curvas y codos", A),
  ...famPulg(EPOXI, "092", "Codo M-H 90°", "Curvas y codos", A),
  ...redPulg(EPOXI, "091", "Codo de reducción", "Reducciones", RED_CODO),
  ...famPulg(EPOXI, "130", "Te", "Tes, cruces y derivaciones", A),
  ...famPulg(EPOXI, "165", "Te a 45°", "Tes, cruces y derivaciones", C),
  ...famPulg(EPOXI, "180", "Cruz", "Tes, cruces y derivaciones", B),
  ...redPulg(EPOXI, "131", "Te de reducción", "Tes, cruces y derivaciones", soloGas(RED_TE)),
  ...[
    mk("03-120015015", "Te caballito", "Tes, cruces y derivaciones", EPOXI, '3/4" x 1/2" x 1/2"'),
    mk("03-120020015", "Te caballito", "Tes, cruces y derivaciones", EPOXI, '3/4" x 3/4" x 1/2"'),
  ],
  ...redPulg(EPOXI, "240", "Cupla de reducción", "Reducciones", soloGas(RED_CUPLA)),
  ...redPulg(EPOXI, "241", "Buje de reducción", "Reducciones", soloGas(RED_BUJE)),
  ...famPulg(EPOXI, "270", "Cupla con borde", "Uniones y tuercas", A),
  ...famPulg(EPOXI, "310", "Tuerca", "Uniones y tuercas", A),
  ...famPulg(EPOXI, "340", "Unión doble cónica H-H", "Uniones y tuercas", B),
  ...famPulg(EPOXI, "341", "Unión doble cónica M-H", "Uniones y tuercas", D),
  ...famPulg(EPOXI, "280", "Rosca con tuerca", "Roscas y niples", A),
  ...famPulg(EPOXI, "290", "Tapón M", "Tapas, tapones y bridas", C),
  ...famPulg(EPOXI, "300", "Tapa H", "Tapas, tapones y bridas", A),
  ...famPulg(EPOXI, "321", "Brida mediana", "Tapas, tapones y bridas", A),
]

/* ================================================================== */
/* SISTEMA SIGAS THERMOFUSIÓN (60-) — conducción de gas               */
/* ================================================================== */

const MM6 = [20, 25, 32, 40, 50, 63] //  familias hasta 63mm

const sigas: Producto[] = [
  // Tubos y vainas
  ...famMm("100", "Tubo acero-polietileno (4 m)", "Tubos y vainas", MM),
  ...famMm("109", "Vaina de protección (4 m)", "Tubos y vainas", MM6),
  ...famMm("085", "Curva de sobrepasaje", "Tubos y vainas", [20, 25, 32]),
  // Curvas y codos
  ...codoMm("090045", "Codo a 45°", MM),
  ...codoMm("090090", "Codo a 90°", MM),
  ...codoMm("092045", "Codo M-H a 45°", [20, 25, 32, 40]),
  ...codoMm("092090", "Codo M-H a 90°", [20, 25, 32, 40]),
  ...[
    mk("60-096020015", "Codo 90° c/base hembra larga", "Curvas y codos", SIGAS, '20mm x 1/2" ST'),
    mk("60-096025015", "Codo 90° c/base hembra larga", "Curvas y codos", SIGAS, '25mm x 1/2" ST'),
    mk("60-097020015", "Codo 90° c/base hembra extra larga", "Curvas y codos", SIGAS, '20mm x 1/2" ST'),
    mk("60-097025015", "Codo 90° c/base hembra extra larga", "Curvas y codos", SIGAS, '25mm x 1/2" ST'),
  ],
  // Codo 90° c/RH (mm x rosca)
  ...(
    [
      [20, '1/2"', "015"], [25, '1/2"', "015"], [25, '3/4"', "020"], [32, '3/4"', "020"],
      [32, '1"', "025"], [40, '1"', "025"], [40, '1 1/4"', "032"], [50, '1 1/4"', "032"],
      [50, '1 1/2"', "040"], [63, '1 1/2"', "040"], [63, '2"', "050"], [75, '2 1/2"', "063"],
      [90, '3"', "080"], [110, '4"', "100"],
    ] as [number, string, string][]
  ).map(([mm, rosca, rc]) =>
    mk(`60-091${mmc(mm)}${rc}`, "Codo a 90° c/RH", "Curvas y codos", SIGAS, `${mm}mm x ${rosca}`)
  ),
  // Tes, cruces y derivaciones
  ...famMm("130", "Te normal", "Tes, cruces y derivaciones", MM),
  ...redMm("133", "Te de reducción central", "Tes, cruces y derivaciones", [
    [25, 20], [32, 20], [32, 25], [40, 25], [40, 32], [50, 32], [50, 40],
    [63, 40], [63, 50], [75, 50], [75, 63], [90, 63], [90, 75], [110, 75], [110, 90],
  ]),
  ...redMm("134", "Te de reducción extrema", "Tes, cruces y derivaciones", [
    [20, 25], [20, 32], [25, 20], [25, 32], [32, 20], [32, 25],
  ]),
  ...[
    mk("60-135032020", "Te de reducción extrema y central", "Tes, cruces y derivaciones", SIGAS, "32-25-20mm"),
    mk("60-135032225", "Te de reducción extrema y central", "Tes, cruces y derivaciones", SIGAS, "32-20-25mm"),
  ],
  ...redMm("360", "Montura de derivación", "Tes, cruces y derivaciones", [
    [63, 25], [75, 25], [75, 32], [90, 25], [90, 32], [110, 25], [110, 32],
  ]),
  // Reducciones
  ...famMm("340", "Unión normal", "Uniones y tuercas", MM),
  ...redMm("240", "Cupla de reducción H-H", "Reducciones", [
    [25, 20], [32, 20], [32, 25], [40, 25], [40, 32], [50, 32], [50, 40],
    [63, 40], [63, 50], [75, 50], [75, 63], [90, 63], [90, 75], [110, 75], [110, 90],
  ]),
  ...redMm("241", "Buje de reducción M-H", "Reducciones", [
    [25, 20], [32, 20], [32, 25], [40, 25], [40, 32], [50, 32], [50, 40],
    [63, 40], [63, 50], [75, 50], [75, 63], [90, 63], [90, 75], [110, 75], [110, 90],
  ]),
  ...redMm("243", "Reductor anular", "Reducciones", [
    [32, 20], [40, 20], [40, 25], [50, 25], [50, 32], [63, 32], [63, 40],
    [75, 32], [75, 40], [75, 50], [90, 63], [90, 75], [110, 75], [110, 90],
  ]),
  // Transiciones a rosca (mm x rosca)
  ...(
    [
      [20, '1/2"', "015"], [25, '1/2"', "015"], [25, '3/4"', "020"], [32, '1"', "025"],
      [40, '1 1/4"', "032"], [50, '1 1/2"', "040"], [63, '2"', "050"], [75, '2 1/2"', "063"],
      [90, '3"', "080"], [110, '4"', "100"],
    ] as [number, string, string][]
  ).flatMap(([mm, rosca, rc]) => [
    mk(`60-271${mmc(mm)}${rc}`, "Transición hembra", "Reducciones", SIGAS, `${mm}mm x ${rosca}`),
    mk(`60-272${mmc(mm)}${rc}`, "Transición macho", "Reducciones", SIGAS, `${mm}mm x ${rosca}`),
  ]),
  // Uniones y tuercas
  ...famMm("270", "Cupla eléctrica", "Uniones y tuercas", MM),
  ...[mk("60-382032000", "Conexión p/medidor (pilar)", "Uniones y tuercas", SIGAS, '32mm x 1 1/4"')],
  // Roscas y niples
  ...famMm("280", "Niple corto con tope", "Roscas y niples", MM),
  ...famMm("361", "Montura de reparación", "Roscas y niples", MM),
  // Tapas
  ...famMm("300", "Tapa", "Tapas, tapones y bridas", MM),
  // Válvulas esféricas
  ...[
    mk("60-161020000", "Válvula esférica", "Válvulas", SIGAS, "20mm"),
    mk("60-161025000", "Válvula esférica", "Válvulas", SIGAS, "25mm"),
    mk("60-161032000", "Válvula esférica", "Válvulas", SIGAS, "32mm"),
    mk("60-161040000", "Válvula esférica", "Válvulas", SIGAS, "40mm"),
    mk("60-161050040", "Válvula esférica", "Válvulas", SIGAS, "50mm"),
    mk("60-161063050", "Válvula esférica", "Válvulas", SIGAS, "63mm"),
  ],
]

/* ================================================================== */
/* HERRAMIENTAS Y ACCESORIOS                                          */
/* ================================================================== */

const herramientas: Producto[] = (
  [
    ["60-900020032", "Corta tubo radial", "20 a 40mm"],
    ["60-900020063", "Corta tubo radial", "20 a 63mm"],
    ["60-900050110", "Corta tubo radial", "50 a 110mm"],
    ["60-903020032", "Cuchilla corta tubo radial", "20 a 32mm"],
    ["60-903020063", "Cuchilla corta tubo radial", "20 a 63mm"],
    ["60-903050110", "Cuchilla corta tubo radial", "50 a 110mm"],
    ["60-900201000", "Máquina dual electrofusión EF-2000", "20/125"],
    ["60-912038020", "Cinta protección UV", "38mm x 20m"],
    ["60-911048040", "Cinta aluminizada", "40m"],
    ["08-900111008", "Thermofusor AST 800w", "20/63"],
    ["08-900111012", "Thermofusor AST 1200w", "20/110"],
    ["08-900111018", "Thermofusor AST 1800w", "20/160"],
    ["08-900205000", "Thermofusor de banco c/boquillas", "50/125"],
    ["08-900400000", "Boquilla p/termofusión", "20mm"],
    ["08-900402000", "Boquilla p/termofusión", "32mm"],
    ["08-900404000", "Boquilla p/termofusión", "50mm"],
    ["08-900405000", "Boquilla p/termofusión", "63mm"],
    ["08-900407000", "Boquilla p/termofusión", "90mm"],
    ["08-900408000", "Boquilla p/termofusión", "110mm"],
  ] as [string, string, string][]
).map(([codigo, familia, medida]) =>
  mk(codigo, familia, "Herramientas y accesorios", SIGAS, medida)
)

/* ================================================================== */
/* EXPORTS                                                            */
/* ================================================================== */

export const productos: Producto[] = [
  ...galvanizado,
  ...epoxi,
  ...sigas,
  ...herramientas,
]

export const sistemas: Sistema[] = [
  "Galvanizado (agua)",
  "Epoxi (gas)",
  "SIGAS Thermofusión",
]

export const categorias: Categoria[] = [
  "Curvas y codos",
  "Tes, cruces y derivaciones",
  "Reducciones",
  "Uniones y tuercas",
  "Tapas, tapones y bridas",
  "Roscas y niples",
  "Tubos y vainas",
  "Válvulas",
  "Herramientas y accesorios",
]

export const proveedores: string[] = [...PROVEEDORES]

/** Índice por código para acceso O(1). */
export const productoPorCodigo: Record<string, Producto> = Object.fromEntries(
  productos.map((p) => [p.codigo, p])
)

/** Productos por debajo del stock mínimo (para dashboards de reposición). */
export const productosBajoStock: Producto[] = productos.filter(
  (p) => p.stock <= p.stockMinimo
)

/** Resumen del catálogo (mock, para KPIs). */
export const resumenCatalogo = {
  totalSkus: productos.length,
  valorStock: productos.reduce((acc, p) => acc + p.precioLista * p.stock, 0),
  skusBajoStock: productosBajoStock.length,
  porSistema: sistemas.map((s) => ({
    sistema: s,
    skus: productos.filter((p) => p.sistema === s).length,
  })),
}
