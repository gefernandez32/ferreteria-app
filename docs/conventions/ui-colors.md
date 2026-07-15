# Convenciones de colores y temas UI

Este proyecto usa un sistema de tokens semánticos. **Nunca hardcodear colores Tailwind** (`green-500`, `emerald-300`, `slate-700`, etc.) en componentes nuevos. Usar siempre las variables del sistema.

## Variables disponibles (clases Tailwind)

### Fondos

| Clase | Uso |
|-------|-----|
| `bg-brand-secondary` | Canvas de página (el fondo "exterior") |
| `bg-surface` | Cards, paneles, modales, inputs — elementos elevados sobre el canvas |
| `bg-surface/50` | Variante semitransparente de surface (filas de tabla, secciones internas) |
| `bg-brand-primary` | Botón primario, badge activo |
| `bg-brand-primary-dark` | Hover de botón primario, barras/áreas siempre oscuras |
| `bg-brand-danger` | Acciones destructivas (eliminar, error) |

### Texto

| Clase | Uso |
|-------|-----|
| `text-foreground` | Texto principal (títulos h1-h4, labels, valores importantes) — negro en light, blanco en dark |
| `text-foreground-muted` | Texto secundario (subtítulos, descripciones, placeholders, captions) |
| `text-brand-primary` | Texto de acento de marca (logo, montos en positivo, links activos) |
| `text-brand-danger` | Texto de error / destructivo |
| `text-white` | Texto sobre fondos oscuros (`bg-brand-primary`, `bg-brand-primary-dark`) |

> **Regla clave:** `text-brand-primary-dark` **no usar** como color de texto general — es invisible en temas oscuros. Usar `text-foreground` en su lugar.

### Bordes

| Clase | Uso |
|-------|-----|
| `border-surface-border` | Bordes de cards, divisores, inputs |
| `border-brand-primary/25` | Bordes con acento de marca |
| `border-brand-danger` | Bordes de error |

### Colores semánticos de estado (estos sí usan Tailwind fijo)

| Color | Uso permitido |
|-------|--------------|
| `bg-amber-*` / `text-amber-*` | Advertencias |
| `bg-brand-danger` / `text-brand-danger` | Error, acciones destructivas |
| `text-brand-primary` | Valores positivos |
| `text-brand-danger` | Valores negativos |

## Jerarquía de fondos (dos niveles)

```
bg-brand-secondary   ← página / canvas exterior
  └─ bg-surface      ← card / panel / modal / input
       └─ bg-surface/50  ← fila de tabla / sección interna
```

El contraste entre nivel 1 y nivel 2 es lo que hace visibles los elementos. Si un input o card tiene el mismo fondo que la página, no se distingue.

## Ejemplo de componente nuevo correcto

```tsx
// ✅ Correcto
<div className="bg-surface border border-surface-border rounded-2xl p-6">
  <h2 className="text-foreground font-black text-xl">Título</h2>
  <p className="text-foreground-muted text-sm">Descripción del módulo</p>

  <input className="bg-brand-secondary border border-surface-border rounded-xl px-4 py-2 text-foreground" />

  <button className="bg-brand-primary hover:bg-brand-primary-dark text-white font-bold">
    Confirmar
  </button>
  <button className="bg-brand-danger hover:opacity-90 text-white font-bold">
    Eliminar
  </button>
</div>

// ❌ Incorrecto — hardcodea colores que rompen en dark themes
<div className="bg-white border border-gray-200 rounded-2xl p-6">
  <h2 className="text-slate-900 font-black text-xl">Título</h2>
  <p className="text-slate-500 text-sm">Descripción</p>
  <input className="bg-gray-50 border border-gray-300 rounded-xl" />
  <button className="bg-green-600 text-white">Confirmar</button>
</div>
```

## Configuración de tokens

Los tokens se definen en `src/app/globals.css` usando `@theme` de Tailwind v4. Ejemplo mínimo:

```css
@import "tailwindcss";

@theme {
  --color-brand-primary: #2563eb;
  --color-brand-primary-dark: #1d4ed8;
  --color-brand-secondary: #f4f6f8;
  --color-brand-danger: #c62828;

  --color-surface: #ffffff;
  --color-surface-border: #e2e8f0;
  --color-foreground: #1e293b;
  --color-foreground-muted: #64748b;
}
```

Personalizar la paleta por proyecto cambiando solo estos valores; los componentes no se tocan.
