import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "./schema"

/**
 * Cliente Postgres único (singleton). Se guarda en `globalThis` para que el HMR
 * de Next en dev no abra una conexión nueva en cada recarga de módulo y para no
 * agotar el pool en entornos serverless (Vercel) que reusan el proceso.
 *
 * Solo se importa desde código server-side (Route Handlers con runtime nodejs,
 * scripts de seed/migración). Nunca desde componentes client.
 */

function urlBase(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      "DATABASE_URL no está definida. Copiá la connection string pública de " +
        "Railway a .env.local (local) y a las env vars del proyecto en Vercel."
    )
  }
  return url
}

function crearConexion() {
  // Pool chico: en serverless conviene 1 conexión por instancia para no
  // saturar el límite de Railway con muchas lambdas concurrentes.
  const client = postgres(urlBase(), { max: 1 })
  return drizzle(client, { schema })
}

type DbClient = ReturnType<typeof crearConexion>

const globalForDb = globalThis as unknown as { __ferreteriaDb?: DbClient }

export const db: DbClient = globalForDb.__ferreteriaDb ?? crearConexion()

if (process.env.NODE_ENV !== "production") {
  globalForDb.__ferreteriaDb = db
}

export { schema }
