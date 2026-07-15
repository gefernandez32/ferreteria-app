import { Bell, Search, Store } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { ownerName, tenant, today } from "./mocks"

export function HomeHeader() {
  const greetingTime = "Buen día"
  return (
    <header className="flex flex-col gap-4 border-b border-border bg-card/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Store className="size-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg text-foreground">
              <span className="italic">Ferretería</span>
              <span className="text-muted-foreground"> · Panel</span>
            </span>
            <Badge variant="outline" className="hidden font-normal sm:inline-flex">
              {tenant}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">{today}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {greetingTime}, <span className="font-medium text-foreground">{ownerName}</span>
        </span>
        <Separator orientation="vertical" className="hidden h-5 sm:block" />
        <Button variant="ghost" size="icon-sm" aria-label="Buscar">
          <Search className="size-4" aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Notificaciones" className="relative">
          <Bell className="size-4" aria-hidden="true" />
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 size-1.5 rounded-full bg-destructive"
          />
        </Button>
      </div>
    </header>
  )
}
