import { migrate } from "drizzle-orm/better-sqlite3/migrator"

import { db, DB_PATH } from "./client"

/**
 * Aplica las migraciones SQL generadas por drizzle-kit (lib/db/migrations).
 * Uso: `pnpm db:migrate`.
 */
migrate(db, { migrationsFolder: "./lib/db/migrations" })
console.log(`Migraciones aplicadas sobre ${DB_PATH}`)
