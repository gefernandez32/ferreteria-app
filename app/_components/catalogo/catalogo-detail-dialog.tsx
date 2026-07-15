"use client"

import { Dialog } from "@base-ui/react/dialog"
import { MapPin, X } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Producto } from "@/lib/data"

import { formatArs } from "./format"
import { StockBadge } from "./stock-badge"

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-sm text-foreground">{children}</span>
    </div>
  )
}

function DetailContent({ producto }: { producto: Producto }) {
  return (
    <>
      <Dialog.Title className="pr-8 font-heading text-lg font-medium text-foreground">
        {producto.familia} {producto.medida}
      </Dialog.Title>
      <Dialog.Description className="text-xs tracking-wider text-muted-foreground">
        {producto.codigo}
      </Dialog.Description>

      <div className="mt-4 flex flex-col">
        <DetailRow label="Sistema">{producto.sistema}</DetailRow>
        <DetailRow label="Categoría">{producto.categoria}</DetailRow>
        <DetailRow label="Material">{producto.material}</DetailRow>
        <DetailRow label="Marca">{producto.marca}</DetailRow>
        <DetailRow label="Proveedor">{producto.proveedor}</DetailRow>
        <DetailRow label="Precio de lista">
          <span className="font-medium tabular-nums">
            {formatArs(producto.precioLista)}
          </span>
        </DetailRow>
        <DetailRow label="Stock">
          <StockBadge stock={producto.stock} stockMinimo={producto.stockMinimo} />
        </DetailRow>
        <DetailRow label="Stock mínimo">
          <span className="tabular-nums">{producto.stockMinimo}</span>
        </DetailRow>
        <DetailRow label="Ubicación">
          <span className="inline-flex items-center gap-1 text-xs tracking-wider">
            <MapPin className="size-3.5 text-muted-foreground" aria-hidden="true" />
            {producto.ubicacion}
          </span>
        </DetailRow>
      </div>
    </>
  )
}

const BACKDROP =
  "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"

const POPUP =
  "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-6 text-card-foreground shadow-lg ring-1 ring-foreground/10 transition-[opacity,transform] duration-200 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0"

export function CatalogoDetailDialog({
  producto,
  onClose,
}: {
  producto: Producto | null
  onClose: () => void
}) {
  return (
    <Dialog.Root
      open={producto !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className={BACKDROP} />
        <Dialog.Popup className={POPUP}>
          {producto ? <DetailContent producto={producto} /> : null}
          <Dialog.Close
            aria-label="Cerrar detalle"
            className={cn(
              "absolute right-4 top-4 inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            )}
          >
            <X className="size-4" aria-hidden="true" />
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
