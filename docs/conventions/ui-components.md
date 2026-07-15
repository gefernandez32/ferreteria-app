# Convenciones de componentes UI — shadcn/ui

## Regla principal

**Antes de crear cualquier componente de interfaz, verificar si shadcn/ui ya lo provee.**  
shadcn es la primera opción. Solo se escribe un componente custom si shadcn no cubre el caso.

## ¿Qué es shadcn/ui?

No es una librería de npm — es un sistema de componentes que se copian al proyecto en `src/components/ui/`.  
Cada componente es código propio: se puede leer, modificar y extender libremente.

## Cómo agregar un componente

```bash
pnpm dlx shadcn@latest add <componente>
# ejemplos:
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add table
```

Los archivos se crean en `src/components/ui/`. No modificarlos salvo necesidad justificada — si shadcn actualiza el componente, los cambios manuales se pierden.

## Componentes disponibles

Ver el catálogo completo en [ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components).  
Los que ya están instalados viven en `src/components/ui/`.

## Uso correcto

```tsx
// ✅ Primero verificar si shadcn lo tiene
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// ✅ Usar las variantes de shadcn
<Button variant="default">Guardar</Button>
<Button variant="destructive">Eliminar</Button>
<Button variant="outline">Cancelar</Button>
<Button variant="ghost">Ver más</Button>

// ❌ No construir botones/cards/inputs desde cero si shadcn los tiene
<button className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
```

## Tokens y temas

shadcn usa las CSS variables de `globals.css` (`--background`, `--foreground`, `--primary`, etc.).  
Cuando se definen colores de marca del proyecto, mapearlos sobre las variables de shadcn para que los componentes respeten el tema automáticamente.

## Composición con Tailwind

Los componentes de shadcn aceptan `className` para sobreescribir estilos puntuales via `cn()`:

```tsx
import { cn } from '@/lib/utils';

<Button className={cn('w-full', isLoading && 'opacity-50 cursor-not-allowed')}>
  Guardar
</Button>
```

## Cuándo NO usar shadcn

- Componentes de dominio muy específicos (ej. un picker de productos con lógica de negocio).
- Visualizaciones de datos (charts, mapas) — usar la librería específica.
- En esos casos, construir el componente en `src/components/` usando los tokens de shadcn como base.
