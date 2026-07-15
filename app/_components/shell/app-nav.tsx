"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ClipboardCheck,
  LayoutDashboard,
  PackageSearch,
  Store,
  Truck,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type NavItem = { href: string; label: string; icon: LucideIcon }

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Panel", icon: LayoutDashboard },
  { href: "/catalogo", label: "Catálogo", icon: PackageSearch },
  { href: "/ingresos", label: "Ingresos", icon: ClipboardCheck },
  { href: "/pedidos", label: "Pedidos", icon: Truck },
]

function esActivo(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppNav() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Navegación principal"
      className="flex shrink-0 gap-1 border-b border-border bg-card/40 px-2 py-2 md:h-dvh md:w-56 md:flex-col md:gap-0.5 md:border-r md:border-b-0 md:px-3 md:py-4"
    >
      <div className="mb-1 hidden items-center gap-2 px-2 py-2 md:flex">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Store className="size-4" aria-hidden="true" />
        </div>
        <span className="font-heading text-base text-foreground">
          <span className="italic">Ferretería</span>
        </span>
      </div>
      {NAV_ITEMS.map((item) => {
        const activo = esActivo(pathname, item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={activo ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activo
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
