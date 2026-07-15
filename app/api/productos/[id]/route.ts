import { NextResponse } from "next/server"

import { actualizarProducto, obtenerProducto } from "@/lib/db/queries/productos"
import { ESTADOS_PRODUCTO } from "@/lib/db/schema"

export const runtime = "nodejs"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Ctx) {
  const { id } = await params
  const producto = await obtenerProducto(Number(id))
  if (!producto) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
  }
  return NextResponse.json(producto)
}

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params
  const body = (await request.json()) as {
    estado?: string
    esGenerico?: boolean
  }

  if (body.estado !== undefined && !ESTADOS_PRODUCTO.includes(body.estado as never)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
  }

  const actualizado = await actualizarProducto(Number(id), {
    estado: body.estado as (typeof ESTADOS_PRODUCTO)[number] | undefined,
    esGenerico: body.esGenerico,
  })
  if (!actualizado) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
  }
  return NextResponse.json(actualizado)
}
