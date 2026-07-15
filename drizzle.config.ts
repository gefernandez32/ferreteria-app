import { defineConfig } from "drizzle-kit"

/**
 * Config de drizzle-kit para generar migraciones SQL a partir del schema.
 * La base vive en data/ferreteria.db (git-ignored, se regenera con el seed).
 */
export default defineConfig({
  dialect: "sqlite",
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dbCredentials: {
    url: "./data/ferreteria.db",
  },
})
