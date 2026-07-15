# CLAUDE.md — NeuronicSkillsCore Frontend

## Build & Run

```bash
pnpm install
pnpm dev       # Turbopack dev server → http://localhost:3000
pnpm build
pnpm lint
pnpm typecheck # tsc --noEmit — correr antes de commitear
pnpm test      # Jest (unit + hooks)
pnpm e2e       # Playwright (flujos críticos)
```

## Constraint de calidad

`react-doctor ≥98` es un requisito del proyecto, no opcional.
Correr antes de cada commit:
```bash
npx -y react-doctor@latest . --verbose --diff
```
Un score por debajo del establecido bloquea el PR.

## Variables de entorno

Copiar `.env.example` (si existe) a `.env.local`. Variables mínimas:

```env
NEXT_PUBLIC_TENANT=mi-tenant          # build-time, inlinea en el bundle
BACKEND_URL=http://localhost:5006     # server-only, nunca en el browser
```

`NEXT_PUBLIC_*` se incrustan en el bundle — nunca poner secrets ahí.
`BACKEND_URL` y cualquier otro sin prefijo `NEXT_PUBLIC_` son server-only.

## HTTP y estado del servidor

**Siempre usar TanStack Query** para llamadas HTTP: `useQuery` para lecturas, `useMutation` para writes. Nunca `useEffect(() => fetch(...))`. Las funciones de fetch viven en `src/lib/api/`, los hooks en `src/lib/hooks/`. Ver convención completa en `docs/conventions/api-proxy.md`.

---

## Componentes UI — shadcn primero

**Antes de construir cualquier componente de interfaz, verificar si shadcn/ui ya lo tiene.**  
shadcn es la primera opción. Para agregar uno: `pnpm dlx shadcn@latest add <componente>`.  
Los componentes instalados viven en `src/components/ui/`. Ver [docs/conventions/ui-components.md](docs/conventions/ui-components.md).

## Convenciones del proyecto

Antes de crear o modificar código, leer las convenciones relevantes en [docs/conventions/](docs/conventions/):

- **[UI — Componentes (shadcn)](docs/conventions/ui-components.md)** — **shadcn es siempre la primera opción** para cualquier elemento de UI. Solo construir custom si shadcn no lo cubre.
- **[UI — Colores y temas](docs/conventions/ui-colors.md)** — usar tokens semánticos. **Nunca** `slate-*`, `gray-*`, `green-*`, etc.
  Mapeo rápido: fondo página `bg-brand-secondary`, card/input `bg-surface`, texto principal `text-foreground`, secundario `text-foreground-muted`, borde `border-surface-border`, botón `bg-brand-primary`.
- **[UI — Skeletons](docs/conventions/skeletons.md)** — cada skeleton replica fielmente la UI final (inline, mismos wrappers/grid). No usar genéricos ni `loading.tsx`.
- **[Commits](docs/conventions/commits.md)** — Conventional Commits (`feat:`, `fix:`, `refactor:`). El CI genera tags semver automáticamente.
- **[React Quality](docs/conventions/react-quality.md)** — usar `react-doctor` para verificar score; **nunca bajar** el score establecido. Antes de crear o editar cualquier `.tsx`, **leer `docs/conventions/react-quality.md`** y cumplir todas las reglas.
- **[Backend API](docs/conventions/backend-api.md)** — ante dudas sobre endpoints, params o tipos, consultar la fuente de verdad del backend (OpenAPI/Swagger, contrato, repo). No adivinar.
- **[API Proxy y cliente HTTP](docs/conventions/api-proxy.md)** — el browser nunca llama al backend directo. Patrón proxy, estructura de `lib/api/`, hooks de TanStack Query, query keys, `createCrudHooks`.
- **[Naming y estructura](docs/conventions/naming.md)** — convenciones de nombres de archivo, dónde agregar código nuevo, estructura de `src/`.
- **[Testing](docs/conventions/testing.md)** — MSW para mocking de red (no mockear TanStack Query), naming de tests, co-location, E2E auth.
- **[Estructura docs](docs/conventions/docs-structure.md)** — todo `.md` generado (planes, specs, auditorías) va dentro de `docs/` en su subcarpeta. Nunca dejar suelto en raíz.
- **[Flujo de releases](docs/conventions/release-flow.md)** — promoción dev → staging → main, tags automáticos por branch, y cómo resolver el conflicto recurrente en el archivo de versión.