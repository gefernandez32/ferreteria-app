import { NextResponse } from "next/server"

import { resumenCatalogo } from "@/lib/db/queries/productos"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json(await resumenCatalogo())
}
