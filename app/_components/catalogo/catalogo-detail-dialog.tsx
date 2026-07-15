"use client"

import { Dialog } from "@base-ui/react/dialog"
import { BadgeCheck, Check, MapPin, Tag, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useActualizarProducto, useProducto } from "@/lib/hooks/use-productos"
import type { EstadoProducto } from "@/lib/db/schema"
import type { Oferta, ProductoDetalle } from "@/lib/api/types"

import { formatArs } from "./format"
import { StockBadge } from "./stock-badge"
import { estadoMeta } from "./types"

const ESTADOS: EstadoProducto[] = ["activo", "limbo", "no_comercializa"]

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-sm text-foreground">{children}</span>
    </div>
  )
}

function OfertaRow({ oferta }: { oferta: Oferta }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0">
      <div className="flex min-w-0 flex-col">
        <span className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
          {oferta.proveedor}
          {oferta.esHabitual ? (
            <BadgeCheck className="size-3.5 text-info" aria-label="Proveedor habitual" />
          ) : null}
        </span>
        <span className="text-xs tracking-wider text-muted-foreground">
          Cód. {oferta.codigoProveedor}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {oferta.esMasBarato ? (
          <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
            Más barato
          </span>
        ) : null}
        <span className="tabular-nums text-sm font-medium text-foreground">
          {formatArs(oferta.precio)}
        </span>
      </div>
    </div>
  )
}

function DetailContent({ producto }: { producto: ProductoDetalle }) {
  const actualizar = useActualizarProducto()
  const estadoActual = producto.estado

  function handleCambiarEstado(estado: EstadoProducto) {
    if (estado === estadoActual) return
    actualizar.mutate({ id: producto.id, cambios: { estado } })
  }

  function handleToggleGenerico() {
    actualizar.mutate({
      id: producto.id,
      cambios: { esGenerico: !producto.esGenerico },
    })
  }

  return (
    <>
      <Dialog.Title className="pr-8 font-heading text-lg font-medium text-foreground">
        {producto.familia} {producto.medida}
      </Dialog.Title>
      <Dialog.Description className="flex items-center gap-2 text-xs tracking-wider text-muted-foreground">
        {producto.codigoInterno}
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-medium tracking-normal",
            estadoMeta[estadoActual].toneClass
          )}
        >
          {estadoMeta[estadoActual].label}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[0.7rem] font-medium tracking-normal text-muted-foreground">
          <Tag className="size-3" aria-hidden="true" />
          {producto.esGenerico ? "Genérico" : "Por marca"}
        </span>
      </Dialog.Description>

      <div className="mt-4 flex flex-col">
        <DetailRow label="Sistema">{producto.sistema}</DetailRow>
        <DetailRow label="Categoría">{producto.categoria}</DetailRow>
        <DetailRow label="Material">{producto.material}</DetailRow>
        <DetailRow label="Marca">{producto.marca}</DetailRow>
        <DetailRow label="Stock">
          <StockBadge stock={producto.stock} stockMinimo={producto.stockMinimo} />
        </DetailRow>
        <DetailRow label="Mínimo / Máximo">
          <span className="tabular-nums">
            {producto.stockMinimo} / {producto.stockMaximo}
          </span>
        </DetailRow>
        <DetailRow label="Ubicación">
          <span className="inline-flex items-center gap-1 text-xs tracking-wider">
            <MapPin className="size-3.5 text-muted-foreground" aria-hidden="true" />
            {producto.ubicacion}
          </span>
        </DetailRow>
      </div>

      <div className="mt-5">
        <div className="mb-1 flex items-baseline justify-between">
          <h3 className="text-sm font-medium text-foreground">Ofertas de proveedores</h3>
          <span className="text-xs text-muted-foreground">
            {producto.ofertas.length} lista{producto.ofertas.length === 1 ? "" : "s"} vinculada
            {producto.ofertas.length === 1 ? "" : "s"}
          </span>
        </div>
        {producto.ofertas.length === 0 ? (
          <p className="rounded-lg bg-muted px-3 py-4 text-center text-xs text-muted-foreground">
            Sin proveedores asociados a este SKU.
          </p>
        ) : (
          <div className="flex flex-col">
            {producto.ofertas.map((o) => (
              <OfertaRow key={o.proveedorId} oferta={o} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-border pt-4">
        <span className="text-xs font-medium text-muted-foreground">Estado del catálogo</span>
        <div className="flex flex-wrap gap-1.5">
          {ESTADOS.map((estado) => {
            const activo = estado === estadoActual
            return (
              <Button
                key={estado}
                type="button"
                size="sm"
                variant={activo ? "default" : "outline"}
                aria-pressed={activo}
                disabled={actualizar.isPending}
                onClick={() => handleCambiarEstado(estado)}
              >
                {activo ? <Check className="size-3.5" aria-hidden="true" /> : null}
                {estadoMeta[estado].label}
              </Button>
            )
          })}
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="self-start"
          disabled={actualizar.isPending}
          onClick={handleToggleGenerico}
        >
          <Tag className="size-3.5" aria-hidden="true" />
          Marcar como {producto.esGenerico ? "producto por marca" : "genérico"}
        </Button>
      </div>
    </>
  )
}

const BACKDROP =
  "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"

const POPUP =
  "fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-card p-6 text-card-foreground shadow-lg ring-1 ring-foreground/10 transition-[opacity,transform] duration-200 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0"

export function CatalogoDetailDialog({
  productoId,
  onClose,
}: {
  productoId: number | null
  onClose: () => void
}) {
  const { data: producto, isLoading } = useProducto(productoId)

  return (
    <Dialog.Root
      open={productoId !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className={BACKDROP} />
        <Dialog.Popup className={POPUP}>
          {isLoading || !producto ? (
            <div className="flex flex-col gap-3">
              <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-40 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <DetailContent producto={producto} />
          )}
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
