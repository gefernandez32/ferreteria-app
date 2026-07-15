import type { Categoria, Sistema } from "@/lib/data"

/** Valor del filtro de sistema: un sistema concreto o "todos". */
export type SistemaFiltro = Sistema | "todos"

/** Valor del filtro de categoría: una categoría concreta o "todas". */
export type CategoriaFiltro = Categoria | "todas"
