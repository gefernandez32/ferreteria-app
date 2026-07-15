# Convención: API Proxy y cliente HTTP

## Patrón

El frontend **nunca llama al backend directamente desde el browser**. Toda comunicación va a través de una API route de Next.js que actúa como proxy:

```
Browser → /api/proxy/[...path] (Next.js API route) → Backend (BACKEND_URL)
```

**Por qué:**
- `BACKEND_URL` es server-only y nunca se expone al browser
- El proxy inyecta el header `Authorization: Bearer <token>` automáticamente
- CORS queda resuelto en el proxy, no en el browser
- Permite lógica server-side como refresh de tokens antes de reenviar

## Estructura de `src/lib/api/`

```
src/lib/api/
├── client.ts        # Base HTTP client (fetch wrapper, error handling)
├── auth.ts          # Endpoints de /api/auth
├── [dominio].ts     # Un archivo por dominio: productos.ts, usuarios.ts, etc.
```

## `client.ts` — reglas

- Todas las funciones usan `fetch` con base path `/api/proxy`
- Inyectar el JWT desde el store de auth (si es client-side) o desde la cookie (si es server-side)
- Manejar errores: HTTP 401 → redirect a login; HTTP ≥400 → throw con mensaje del backend
- No usar `axios` — `fetch` nativo es suficiente con el wrapper

```ts
// Ejemplo de función en src/lib/api/productos.ts
export async function getProductos(): Promise<Producto[]> {
  const res = await apiClient.get('/productos');
  return res as Producto[];
}
```

## TanStack Query — patrones

Cada dominio expone hooks en `src/lib/hooks/` que envuelven las funciones de `api/`:

```ts
// src/lib/hooks/useProductos.ts
export function useProductos() {
  return useQuery({ queryKey: ['productos'], queryFn: getProductos });
}

export function useCrearProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearProducto,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productos'] }),
  });
}
```

**Reglas de query keys:**

| Patrón | Key |
|--------|-----|
| Lista de dominio | `['productos']` |
| Item individual | `['productos', id]` |
| Lista con filtros | `['productos', filters]` |
| Sub-recurso | `['productos', id, 'imagenes']` |

Invalidar siempre la key del dominio (o más específica) después de una mutación.

## Variables de entorno

| Variable | Tipo | Uso |
|----------|------|-----|
| `BACKEND_URL` | server-only | URL base del backend Python; solo accesible en API routes y Server Components |

**Nunca** leer `BACKEND_URL` en un componente con `"use client"` — no existe en el browser.

## Patrón `createCrudHooks` (opcional pero recomendado)

Para dominios con operaciones CRUD estándar, usar una factory que genere todos los hooks:

```ts
// src/lib/hooks/createCrudHooks.ts
export function createCrudHooks<T, CreateDto, UpdateDto>(
  queryKey: string,
  api: { listar: () => Promise<T[]>; crear: (d: CreateDto) => Promise<T>; /* etc */ }
) {
  return {
    useListar: () => useQuery({ queryKey: [queryKey], queryFn: api.listar }),
    useCrear: () => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: api.crear, onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }) });
    },
    // ...
  };
}

// Uso por dominio
export const useProductosHooks = createCrudHooks('productos', productosApi);
```

Esto evita repetir el mismo boilerplate de invalidación en cada dominio.

## Convención de query keys

Usar una factory por dominio para que las invalidaciones sean consistentes:

```ts
// src/lib/hooks/queryKeys.ts
export const keys = {
  productos: {
    all:    () => ['productos'] as const,
    list:   (filters?: Filters) => ['productos', 'list', filters] as const,
    detail: (id: string) => ['productos', 'detail', id] as const,
  },
  // ...
};

// En el hook
useQuery({ queryKey: keys.productos.list(filters), queryFn: () => getProductos(filters) });

// Al invalidar
queryClient.invalidateQueries({ queryKey: keys.productos.all() }); // invalida lista Y detalle
```

## Consultar la spec del backend

Antes de crear o modificar funciones en `src/lib/api/`, consultar:
1. Docs OpenAPI del backend Python: `$BACKEND_URL/docs` (Swagger UI) o `/redoc`
2. El schema crudo: `$BACKEND_URL/openapi.json`

No inventar nombres de campos ni tipos a partir de un ejemplo de respuesta. Ver también [backend-api.md](backend-api.md).
