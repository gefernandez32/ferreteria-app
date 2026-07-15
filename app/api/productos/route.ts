import { NextResponse } from "next/server"

import { listarProductos } from "@/lib/db/queries/productos"
import type {
  EstadoProducto,
} from "@/lib/db/schema"
import type { FiltrosProductos, OrdenCampo, OrdenDir } from "@/lib/api/types"

export const runtime = "nodejs"

const ORDEN_CAMPOS: OrdenCampo[] = ["codigoInterno", "nombre", "stock", "mejorPrecio"]
const ESTADOS = ["activo", "limbo", "no_comercializa", "todos"]

export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams
  const ordenCampo = sp.get("ordenCampo")
  const estado = sp.get("estado")

  const filtros: FiltrosProductos = {
    query: sp.get("query") ?? undefined,
    sistema: sp.get("sistema") ?? undefined,
    categoria: sp.get("categoria") ?? undefined,
    estado:
      estado && ESTADOS.includes(estado)
        ? (estado as EstadoProducto | "todos")
        : undefined,
    ordenCampo: ORDEN_CAMPOS.includes(ordenCampo as OrdenCampo)
      ? (ordenCampo as OrdenCampo)
      : undefined,
    ordenDir: (sp.get("ordenDir") as OrdenDir) ?? undefined,
    page: sp.get("page") ? Number(sp.get("page")) : undefined,
    pageSize: sp.get("pageSize") ? Number(sp.get("pageSize")) : undefined,
  }

  return NextResponse.json(await listarProductos(filtros))
}
