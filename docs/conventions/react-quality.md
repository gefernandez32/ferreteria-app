# Convenciones de calidad React

Este proyecto usa [react-doctor](https://github.com/millionco/react-doctor) para verificar calidad.

## Regla de oro

Cada feature o fix **no debe bajar el score** establecido por el proyecto. Antes de commitear, correr:

```bash
npx -y react-doctor@latest . --verbose --diff
```

## Prevención automática

| Capa | Herramienta | Cuándo actúa |
|------|-------------|--------------|
| Editor | `eslint-plugin-react-doctor` | Mientras escribís código |
| Pre-commit | `react-doctor --staged --fail-on warning` (vía lint-staged) | Al hacer `git commit` |
| CLAUDE.md | Reglas inline por categoría | Antes de que el agente genere código |

## Reglas a cumplir en código nuevo

### Arquitectura de componentes

| Regla | Hacer | No hacer |
|-------|-------|----------|
| `no-giant-component` | Componentes ≤300 líneas, extraer subcomponentes | Componentes monolíticos de 500+ líneas |
| `prefer-useReducer` | `useReducer` para ≥5 estados relacionados | 15 `useState` sueltos |
| `no-nested-component-definition` | Definir componentes en su propio scope/archivo | `const Inner = () => ...` dentro de otro componente |
| `no-default-props` | Default params en destructuring `({ size = 'md' })` | `Component.defaultProps = {}` |
| `no-many-boolean-props` | Prop `variant="primary"` o objeto config | `<Btn primary outlined rounded disabled />` |
| `no-generic-handler-names` | `handleSubmitOrder`, `handleDeleteItem` | `handleClick`, `handleChange` genéricos |

### State y Effects

| Regla | Hacer | No hacer |
|-------|-------|----------|
| `rerender-functional-setstate` | `setState(prev => prev + 1)` | `setState(count + 1)` leyendo estado |
| `rerender-lazy-state-init` | `useState(() => expensiveCalc())` | `useState(expensiveCalc())` |
| `no-derived-state-effect` | Derivar en render: `const full = first + last` | `useEffect(() => setFull(first+last), [first,last])` |
| `no-effect-event-handler` | Lógica en onClick/onChange/onSubmit directamente | `useEffect` que simula un event handler |
| `no-effect-chain` | Un solo effect o derivación | Effects encadenados que se triggereean entre sí |
| `no-cascading-set-state` | Agrupar state updates en un handler | Múltiples `setState` en cascada dentro de effects |
| `effect-needs-cleanup` | Retornar cleanup en subscribe/timer/listener | `useEffect` sin cleanup en suscripciones |
| `no-prop-callback-in-effect` | Mover el effect al componente que posee el estado, o extraer un hook | Callback prop (ej. `onChange`, `setValue`) como dep de useEffect |
| `no-usememo-simple-expression` | Computar inline si es barato | `useMemo(() => a + b, [a, b])` |
| `no-fetch-in-effect` | TanStack Query `useQuery`/`useMutation` | `useEffect(() => fetch(...))` |
| `no-direct-state-mutation` | `setState({...obj, key: val})` | `state.key = val` mutación directa |

### Sincronizar estado derivado entre componentes

> **⚠ Nunca usar `useEffect` + callback prop para sincronizar estado hacia el padre.**
> react-doctor marca `no-prop-callback-in-effect` cuando un hijo llama `onXChange(valor)` dentro de un `useEffect`.
>
> **Patrón correcto:** mover el cálculo y el `useEffect` al componente que posee el estado (el que tiene el `useState`/`useForm`), o extraer la lógica a un **hook reutilizable** que el padre llama directamente.
>
> ```tsx
> // ❌ MAL — hijo llama callback del padre en un effect
> function Child({ items, onTotalChange }) {
>   const total = useMemo(() => items.reduce(...), [items]);
>   useEffect(() => { onTotalChange(total); }, [total, onTotalChange]);
> }
>
> // ✅ BIEN — el padre calcula y setea su propio estado
> function Parent() {
>   const total = useMemo(() => items.reduce(...), [items]);
>   useEffect(() => { setValue('cost', total); }, [total, setValue]);
>   return <Child items={items} />;
> }
>
> // ✅ MEJOR — extraer a un hook, el padre lo consume
> function useTotal(items) {
>   return useMemo(() => items.reduce(...), [items]);
> }
> function Parent() {
>   const total = useTotal(items);
>   useEffect(() => { setValue('cost', total); }, [total, setValue]);
> }
> ```
>
> Si el hijo necesita datos para renderizar, pasarlos como **prop de datos**, no como callback.

### TanStack Query

| Regla | Hacer | No hacer |
|-------|-------|----------|
| `query-mutation-missing-invalidation` | `onSuccess: () => queryClient.invalidateQueries(...)` | Mutación sin invalidar queries afectadas |
| `query-no-usequery-for-mutation` | `useMutation` para writes | `useQuery` con side effects |
| `query-no-query-in-effect` | `useQuery` directo con `enabled` | `useEffect(() => refetch())` |
| `query-no-rest-destructuring` | `const { data, isLoading } = useQuery(...)` | `const { data, ...rest } = useQuery(...)` |
| `query-stable-query-client` | `queryClient` fuera de render o en ref | `new QueryClient()` dentro de componente |

### Rendering y performance

| Regla | Hacer | No hacer |
|-------|-------|----------|
| `async-parallel` | `Promise.all(items.map(...))` | `for await` secuencial |
| `js-tosorted-immutable` | `array.toSorted(fn)` | `[...array].sort(fn)` |
| `js-combine-iterations` | `.reduce()` o `.flatMap()` en un pase | `.filter().map()` (dos iteraciones) |
| `js-set-map-lookups` | `Set`/`Map` para lookups frecuentes | `.find()` / `.includes()` en arrays grandes |
| `js-hoist-regexp` | `const RE = /pattern/` fuera de render | `new RegExp()` dentro de render/loop |
| `js-hoist-intl` | `const fmt = new Intl.NumberFormat()` fuera | `new Intl.*()` dentro de render |
| `no-transition-all` | `transition-colors`, `transition-opacity` | `transition-all` |
| `rendering-hoist-jsx` | JSX estático fuera del componente o memoizado | JSX estático recreado en cada render |
| `rerender-memo-with-default-value` | Constante module-level: `const EMPTY: X[] = []` | Default `= {}` / `= []` en destructuring de props (nueva ref cada render) |
| `rerender-memo-before-early-return` | `useMemo`/`useCallback` antes de returns | Memo hooks después de early return (se pierden) |

### Next.js específico

> **⚠ NUNCA destructurar `useSearchParams()`** — `URLSearchParams.get()` es un método nativo que pierde su `this` al destructurar. Causa `TypeError: Illegal invocation` en runtime (no lo detecta TypeScript).
>
> ```tsx
> // ✅ Correcto
> const searchParams = useSearchParams();
> const id = searchParams.get('id');
>
> // ❌ CRASH en runtime
> const { get } = useSearchParams();
> const id = get('id'); // Illegal invocation
> ```

| Regla | Hacer | No hacer |
|-------|-------|----------|
| `nextjs-no-img-element` | `<Image>` de `next/image` | `<img>` nativo |
| `nextjs-no-a-element` | `<Link>` de `next/link` | `<a href>` nativo |
| `nextjs-no-use-search-params-without-suspense` | `<Suspense>` wrapping `useSearchParams()` | `useSearchParams()` sin boundary |
| `nextjs-async-client-component` | Client components síncronos | `async function ClientComp()` con `"use client"` |
| `nextjs-image-missing-sizes` | `sizes` prop en `<Image>` responsive | `<Image>` sin `sizes` cuando no es fill |
| `rendering-hydration-mismatch-time` | `suppressHydrationWarning` en fechas | `new Date()` directo en JSX server/client |

### Tailwind / CSS / diseño

| Regla | Hacer | No hacer |
|-------|-------|----------|
| `design-no-redundant-size-axes` | `size-8` | `w-8 h-8` |
| `design-no-redundant-padding-axes` | `p-4` | `px-4 py-4` (cuando iguales) |
| `design-no-space-on-flex-children` | `gap-4` en parent | `space-x-4` en hijos |
| `design-no-default-tailwind-palette` | Tokens semánticos (`bg-surface`) | Palette cruda (`bg-slate-200`) |
| `design-no-bold-heading` | `font-semibold` en headings | `font-bold` / `font-black` en headings |
| `design-no-three-period-ellipsis` | `…` (U+2026) | `...` (tres puntos) |
| `design-no-em-dash-in-jsx-text` | `,` `:` `()` | `—` (em dash) en JSX |
| `no-long-transition-duration` | Transiciones ≤300ms | Transiciones >500ms |
| `no-inline-bounce-easing` | `cubic-bezier(0.16, 1, 0.3, 1)` | `bounce` / `elastic` easings |
| `no-outline-none` | `outline-none` + ring/focus-visible | `outline-none` sin alternativa |
| `no-z-index-9999` | Escala controlada de z-index | `z-[9999]` |
| `no-layout-property-animation` | Animar `transform`/`opacity` | Animar `width`/`height`/`top`/`left` |
| `no-scale-from-zero` | `scale-95` como mínimo | `scale-0` como punto de partida |
| `no-tiny-text` | `text-tiny`/`text-label`/`text-xs` mínimo | Texto <12px sin tokens |

### Accesibilidad

| Regla | Hacer | No hacer |
|-------|-------|----------|
| `<button>` nativo | `<button type="button">` con onClick | `<div onClick>` sin semántica |
| keyboard support | `role="button" tabIndex={0} onKeyDown` | Clickeable sin keyboard access |
| labels | `<label htmlFor="id">` + `<input id="id">` | `<label>` sin control asociado |
| `design-no-vague-button-label` | `"Cancelar"`, `"Guardar cambios"` | `"OK"`, `"No"`, `"Submit"` |
| `no-disabled-zoom` | Permitir zoom del usuario | `maximum-scale=1` / `user-scalable=no` |
| focus | `useRef` + focus programático | `autoFocus` prop |

### Seguridad

| Regla | Hacer | No hacer |
|-------|-------|----------|
| `no-secrets-in-client-code` | Env vars server-side | API keys en código client |
| `no-eval` | Lógica explícita | `eval()` / `new Function()` |
| `client-localstorage-no-version` | `localStorage.getItem('cart_v2')` | Keys sin versión → data stale |

### Cleanup de effects

Todo `useEffect` que subscribe, setea timer, o registra listener **debe retornar cleanup**:

```tsx
useEffect(() => {
  const id = setTimeout(() => fn(), 50);
  return () => clearTimeout(id);
}, [dep]);

useEffect(() => {
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

## Cómo correr

```bash
# Score rápido
npx -y react-doctor@latest . --score

# Verbose con todas las ubicaciones
npx -y react-doctor@latest . --verbose

# Solo archivos cambiados (recomendado antes de commit)
npx -y react-doctor@latest . --verbose --diff

# JSON para análisis programático
npx -y react-doctor@latest . --json
```

> **Windows**: el CLI `react-doctor` puede fallar con error de binding nativo (`oxc-parser`).
> En ese caso, usar la integración ESLint en su lugar — `eslint-plugin-react-doctor` está configurado
> en `eslint.config.mjs` y funciona en todos los sistemas vía `pnpm lint`.
