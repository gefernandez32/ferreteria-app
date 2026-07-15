# Convención: Testing

## Stack

| Capa | Herramienta |
|------|-------------|
| Unit / Hooks | Jest 30 + React Testing Library 16 |
| Network mocking | MSW 2 (Mock Service Worker) |
| E2E | Playwright 1.59 |

## Regla de oro: no mockear TanStack Query

**Nunca** usar `jest.mock('@tanstack/react-query')`.
La network se mockea con **MSW** — los hooks y el QueryClient funcionan real.
Esto garantiza que si el contrato del backend cambia, los tests fallan.

```ts
// ✅ Correcto: MSW intercepta la red, TanStack Query funciona real
server.use(
  http.get('/api/proxy/productos', () =>
    HttpResponse.json([{ id: '1', nombre: 'Producto A' }])
  )
);
const { result } = renderHook(() => useProductos(), { wrapper: QueryClientWrapper });
await waitFor(() => expect(result.current.data).toHaveLength(1));

// ❌ Incorrecto: mockear el hook directamente
jest.mock('@/lib/hooks/useProductos', () => ({ useProductos: () => ({ data: [...] }) }));
```

## Organización de tests

```
src/
├── lib/
│   ├── api/
│   │   └── __tests__/         # Tests de clientes API (fetch mock)
│   └── hooks/
│       └── __tests__/         # Tests de hooks TanStack Query (MSW)
├── components/
│   └── admin/
│       └── __tests__/         # Tests de componentes (RTL)
e2e/
└── flujo-venta.spec.ts        # Tests Playwright (flujos críticos)
```

Tests **co-localizados** en `__tests__/` adyacente al archivo que prueban.

## Naming de tests

Patrón: `{función}_{escenario}_{resultado}` en español.

```ts
it('listar_conProductosActivos_devuelveListaOrdenada', async () => { ... });
it('crearProducto_nombreVacio_lanzaErrorValidacion', async () => { ... });
it('useProductos_errorServidor_exponePropiedadError', async () => { ... });
```

## Mocking de módulos

```ts
// Mockear módulo completo
jest.mock('@/config/tenant', () => ({ getTenant: () => ({ slug: 'test-tenant' }) }));

// Mockear función individual con tipado
const mockFn = jest.fn() as jest.MockedFunction<typeof crearProducto>;
jest.mock('@/lib/api/productos', () => ({ crearProducto: mockFn }));
```

## E2E — autenticación

Playwright usa `storageState` para no re-loguearse en cada test:

```ts
// playwright.config.ts
use: {
  storageState: '.auth/admin.json',  // generado por globalSetup
}
```

El `globalSetup` hace login una vez y guarda las cookies/tokens. Los specs arrancan ya autenticados.

## Qué testear

| Prioridad | Qué | Dónde |
|-----------|-----|-------|
| Alta | Hooks de dominio con lógica (mutations, queries con filtros) | `__tests__/` |
| Alta | Flujos críticos completos (login, venta, cierre caja) | `e2e/` |
| Media | Componentes con lógica propia (formularios, validaciones) | `__tests__/` |
| Baja | Componentes puramente presentacionales | No obligatorio |

## Qué no testear

- Componentes que solo renderizan props sin lógica — verificar visualmente
- Librerías de terceros (React Query, Zustand) — ya tienen sus propios tests
- Styling / CSS — react-doctor y visual review

## Coverage

No hay threshold hard configurado. La gate de calidad automática es **react-doctor ≥98**.
La cobertura es un indicador de salud, no un objetivo en sí mismo.
