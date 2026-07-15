import type { OrdenCampo } from "@/lib/api/types"

import type { EstadoFiltro, Orden } from "./types"

/** Estado de filtros + orden + paginación de la vista de catálogo. */
export type FiltrosState = {
  query: string
  sistema: string
  categoria: string
  estado: EstadoFiltro
  orden: Orden
  page: number
}

export const filtrosIniciales: FiltrosState = {
  query: "",
  sistema: "todos",
  categoria: "todas",
  estado: "todos",
  orden: { campo: "codigoInterno", dir: "asc" },
  page: 1,
}

export type FiltrosAction =
  | { type: "query"; value: string }
  | { type: "sistema"; value: string }
  | { type: "categoria"; value: string }
  | { type: "estado"; value: EstadoFiltro }
  | { type: "sort"; campo: OrdenCampo }
  | { type: "page"; value: number }

export function filtrosReducer(
  state: FiltrosState,
  action: FiltrosAction
): FiltrosState {
  switch (action.type) {
    case "query":
      return { ...state, query: action.value, page: 1 }
    case "sistema":
      return { ...state, sistema: action.value, page: 1 }
    case "categoria":
      return { ...state, categoria: action.value, page: 1 }
    case "estado":
      return { ...state, estado: action.value, page: 1 }
    case "sort": {
      const dir =
        state.orden.campo === action.campo && state.orden.dir === "asc" ? "desc" : "asc"
      return { ...state, orden: { campo: action.campo, dir }, page: 1 }
    }
    case "page":
      return { ...state, page: action.value }
    default:
      return state
  }
}
