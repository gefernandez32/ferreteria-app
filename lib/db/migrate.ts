import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

// tsx no carga .env.local: hacerlo antes de leer DATABASE_URL.
config({ path: ".env.local" })

/**
 * Aplica las migraciones SQL generadas por drizzle-kit (lib/db/migrations).
 * Uso: `pnpm db:migrate`.
 */
async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL no está definida (.env.local).")

  // Conexión dedicada (max: 1) que se cierra al terminar; el migrator es async.
  const client = postgres(url, { max: 1 })
  const db = drizzle(client)
  await migrate(db, { migrationsFolder: "./lib/db/migrations" })
  await client.end()
  console.log("Migraciones aplicadas.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
