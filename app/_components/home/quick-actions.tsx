import type { ComponentType, SVGProps } from "react"

import { Button } from "@/components/ui/button"

import { quickActions } from "./mocks"

type ActionVariant = "default" | "outline" | "ghost" | "secondary" | "destructive" | "link"

export function QuickActions() {
  return (
    <section
      aria-label="Accesos rápidos"
      className="flex flex-wrap items-center gap-2"
    >
      {quickActions.map((action) => {
        const Icon = action.icon as ComponentType<SVGProps<SVGSVGElement>>
        const variant = action.variant as ActionVariant
        return (
          <Button
            key={action.id}
            variant={variant}
            nativeButton={false}
            render={(props) => (
              <a href={action.href} {...props}>
                <Icon className="size-4" aria-hidden="true" />
                {action.label}
              </a>
            )}
          />
        )
      })}
    </section>
  )
}
