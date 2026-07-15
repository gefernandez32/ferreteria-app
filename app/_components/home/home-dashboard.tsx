"use client"

import { CatalogHealthPanel } from "./catalog-health"
import { HomeHeader } from "./home-header"
import { KpiStrip } from "./kpi-strip"
import { QuickActions } from "./quick-actions"
import { ReorderSuggestions } from "./reorder-suggestions"
import { ValidationQueue } from "./validation-queue"

export function HomeDashboard() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <HomeHeader />

      <main className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="flex flex-col gap-1">
          <h1 className="font-heading text-4xl font-normal text-foreground">
            Panel general
          </h1>
          <p className="text-sm text-muted-foreground">
            Resumen del stock, ingresos y pedidos sugeridos.
          </p>
        </section>

        <KpiStrip />
        <QuickActions />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <ValidationQueue />
            <ReorderSuggestions />
          </div>
          <div className="lg:col-span-1">
            <CatalogHealthPanel />
          </div>
        </div>
      </main>
    </div>
  )
}
