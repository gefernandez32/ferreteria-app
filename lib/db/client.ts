import { existsSync, mkdirSync } from "node:fs"
import path from "node:path"

import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"

import * as schema from "./schema"

/**
 * Cliente SQLite único (singleton). Se guarda en `globalThis` para que el HMR
 * de Next en dev no abra una conexión nueva en cada recarga de módulo.
 *
 * Solo se importa desde código server-side (Route Handlers con runtime nodejs,
 * scripts de seed/migración). Nunca desde componentes client.
 */

export const DB_PATH = path.join(process.cwd(), "data", "ferreteria.db")

function crearConexion() {
  const dir = path.dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  const sqlite = new Database(DB_PATH)
  sqlite.pragma("journal_mode = WAL")
  sqlite.pragma("foreign_keys = ON")
  return drizzle(sqlite, { schema })
}

type DbClient = ReturnType<typeof crearConexion>

const globalForDb = globalThis as unknown as { __ferreteriaDb?: DbClient }

export const db: DbClient = globalForDb.__ferreteriaDb ?? crearConexion()

if (process.env.NODE_ENV !== "production") {
  globalForDb.__ferreteriaDb = db
}

export { schema }
