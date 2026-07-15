import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El driver nativo de SQLite no debe bundlearse: se resuelve en runtime (Node).
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
