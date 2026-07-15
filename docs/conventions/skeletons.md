# Convenciones de Skeleton Screens

## Principio

Cada skeleton debe ser una **réplica fiel** de la UI final: mismas proporciones, misma estructura de layout, mismos wrappers y classNames. El usuario debe percibir que "la página ya cargó pero los datos todavía no".

## Componentes disponibles

```tsx
import { Skeleton } from '@/components/ui/Skeleton';
```

- `Skeleton` — bloque base con shimmer (`animate-pulse rounded-md bg-brand-secondary`). Acepta `className` y `style`.
- Componentes específicos de dominio (ej. `SkeletonProductCard`) se crean por proyecto cuando hay un patrón muy repetido.

## Cuándo usar componentes compartidos vs inline

- **Componentes específicos** (ej. una grilla de cards repetida en muchas pantallas): extraer.
- **Todo lo demás**: skeleton **inline** en el propio page, porque cada página tiene layout único (columnas de tabla distintas, forms distintos, dashboards distintos).

## Cómo construir un skeleton inline

### 1. Copiar el wrapper principal

Usar el mismo contenedor que la UI real. Si la página real tiene:

```tsx
<div className="flex-1 overflow-y-auto px-6 py-10 bg-surface">
```

El skeleton debe usar el mismo div.

### 2. Replicar cada sección

| Sección real | Skeleton equivalente |
|---|---|
| Título `<h1>` | `<Skeleton className="h-9 w-48" />` |
| Subtítulo `<p>` | `<Skeleton className="h-4 w-72" />` |
| Botón de acción | `<Skeleton className="h-11 w-40 rounded-xl" />` |
| Search bar | `<Skeleton className="h-10 w-full rounded-xl" />` |
| Filter pills | `{[80, 100, 72].map((w, i) => <Skeleton key={i} className="h-10 rounded-xl" style={{ width: w }} />)}` |
| Stat card | `<div className="bg-surface rounded-2xl p-6 border border-surface-border space-y-4"><Skeleton className="w-12 h-12 rounded-xl" /><Skeleton className="h-3 w-28" /><Skeleton className="h-9 w-16" /></div>` |
| Badge/pill | `<Skeleton className="h-6 w-20 rounded-full" />` |
| Thumbnail | `<Skeleton className="w-10 h-10 rounded-lg shrink-0" />` |
| Icon button | `<Skeleton className="h-8 w-8 rounded-lg" />` |

### 3. Tablas

Replicar el **mismo grid/flex** de la tabla real. Ejemplo para `grid-cols-12`:

```tsx
{/* Header */}
<div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-surface-border">
  <div className="col-span-2"><Skeleton className="h-3 w-3/4" /></div>
  <div className="col-span-3"><Skeleton className="h-3 w-3/4" /></div>
  {/* ... resto de columnas ... */}
</div>

{/* Rows */}
{Array.from({ length: 8 }).map((_, i) => (
  <div key={i} className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-surface-border items-center">
    <div className="col-span-2"><Skeleton className="h-4 w-20" /></div>
    <div className="col-span-3 flex items-center gap-4">
      <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
    {/* ... resto de columnas ... */}
  </div>
))}
```

### 4. Formularios

```tsx
<div className="space-y-5 p-6">
  {/* Cada campo: label + input */}
  <div className="space-y-1.5">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-10 w-full rounded-lg" />
  </div>
</div>
```

### 5. Dashboards (stat cards + gráfico)

```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {Array.from({ length: 4 }).map((_, i) => (
    <div key={i} className="bg-surface rounded-2xl p-6 border border-surface-border space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-24" />
    </div>
  ))}
</div>
<Skeleton className="h-64 w-full rounded-2xl mt-4" />
```

## Reglas

1. **NO usar `loading.tsx`** de Next.js. Manejar loading via `isLoading` de TanStack Query dentro de cada page.
2. **NO usar genéricos** tipo `SkeletonAdminPage`, `SkeletonTable`, `SkeletonForm` — no replican la UI real. Hacer inline.
3. Siempre envolver en `aria-busy="true"` o `aria-label="Cargando..."` el contenedor del skeleton.
4. Mantener el **mismo ancho/alto aproximado** que el contenido final para evitar layout shift.
5. Preferir anchos relativos (`w-full`, `w-3/4`, `flex-1`) sobre anchos fijos para que sea responsivo.
6. Usar `style={{ width: N }}` solo para pills/filtros donde cada elemento tiene ancho variable.
