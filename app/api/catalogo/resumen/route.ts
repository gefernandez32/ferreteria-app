import { NextResponse } from "next/server"

import { resumenCatalogo } from "@/lib/db/queries/productos"

export const runtime = "nodejs"

export function GET() {
  return NextResponse.json(resumenCatalogo())
}
