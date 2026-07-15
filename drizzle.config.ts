import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

// Los comandos de drizzle-kit corren fuera de Next, que no carga .env.local solo.
config({ path: ".env.local" })

/**
 * Config de drizzle-kit para generar y aplicar migraciones sobre Postgres.
 * La connection string (Railway) se toma de DATABASE_URL.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
