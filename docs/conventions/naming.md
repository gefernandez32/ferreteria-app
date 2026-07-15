# Convención: Naming y estructura de archivos

## Nombres de archivo

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componente React | `PascalCase.tsx` | `ProductoCard.tsx` |
| Hook de dominio | `useXxx.ts` | `useProductos.ts` |
| Store Zustand | `useXxxStore.ts` | `useCartStore.ts` |
| Cliente API | `kebab-case.ts` | `productos.ts`, `auth.ts` |
| Utilidad / helper | `kebab-case.ts` | `format-currency.ts` |
| Test unitario | `__tests__/Xxx.test.ts(x)` | `__tests__/ProductoCard.test.tsx` |
| Test E2E | `e2e/xxx.spec.ts` | `e2e/pos-venta.spec.ts` |
| Tipo/interface | `kebab-case.ts` | `producto.types.ts` |

## Dónde agregar código nuevo

| Qué crear | Dónde |
|-----------|-------|
| Nueva página admin | `src/app/(app)/admin/mi-modulo/page.tsx` |
| Skeleton de esa página | Inline en `page.tsx` o `loading` colocado — **nunca** `loading.tsx` genérico |
| Componentes de esa página | `src/app/(app)/admin/mi-modulo/components/` o `src/components/admin/` si es reutilizable |
| Cliente API del dominio | `src/lib/api/mi-modulo.ts` |
| Hooks TanStack Query | `src/lib/hooks/useMiModulo.ts` |
| Store global | `src/store/useMiModuloStore.ts` |
| Tipo/DTO | `src/types/mi-modulo.ts` |
| Test del hook/componente | Co-localizado en `__tests__/` adyacente al archivo |

## Estructura de `src/`

```
src/
├── app/
│   ├── (app)/          # Rutas autenticadas — Admin + POS
│   │   ├── admin/      # Backoffice — una carpeta por módulo
│   │   └── pos/        # Terminal POS
│   ├── (auth)/         # Login, reset-password (sin layout autenticado)
│   └── api/            # Route handlers (proxy, auth, version)
├── components/
│   ├── admin/          # Componentes reutilizables del backoffice
│   ├── pos/            # Componentes reutilizables del POS
│   ├── shared/         # Compartidos entre admin y POS
│   └── ui/             # Design system (Button, Input, Modal, etc.)
├── lib/
│   ├── api/            # Clientes HTTP por dominio
│   ├── hooks/          # Hooks TanStack Query por dominio
│   ├── utils/          # Formatters, validators, helpers
│   └── mocks/          # MSW handlers para tests
├── store/              # Zustand stores (solo estado global)
├── hooks/              # Hooks no-domain (useMediaQuery, useDebounce)
├── config/             # Constantes y configuración del app
└── types/              # Tipos globales y DTOs
```

## Reglas

- **Estado global**: solo en Zustand (`src/store/`). No usar Context para estado mutable compartido.
- **Lógica de negocio**: en hooks (`src/lib/hooks/`), no en componentes.
- **Tests co-localizados**: junto al archivo, en carpeta `__tests__/`. No en carpeta global `tests/`.
- **Componentes ≤300 líneas**: si crece más, extraer sub-componentes o hooks.
- Un componente por archivo. No definir componentes dentro de otros componentes.
