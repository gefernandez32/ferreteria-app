# Conventional Commits

Este proyecto usa [Conventional Commits](https://www.conventionalcommits.org/) para generar tags de versión automáticamente.

## Formato

```
tipo(scope): descripción corta
```

El `scope` es opcional pero recomendado.

## Tipos

| Prefijo | Version bump | Cuándo usar |
|---------|-------------|-------------|
| `feat:` | minor (v0.1.0 → v0.**2**.0) | Funcionalidad nueva |
| `fix:` | patch (v0.1.0 → v0.1.**1**) | Corrección de bugs |
| `refactor:` | patch | Refactoreo sin cambio funcional |
| `test:` | patch | Agregar o modificar tests |
| `chore:` | patch | Mantenimiento, dependencias, CI |
| `docs:` | patch | Documentación |

Si no se usa ningún prefijo, se hace bump **patch** por defecto.

## Ejemplos

```bash
feat(auth): agregar flujo de login con OAuth
fix(admin): corregir paginación de listados
refactor(api): simplificar cliente HTTP
test(checkout): cubrir cálculo de impuestos
chore: actualizar dependencias
```

## Cómo funciona

1. Se pushea a `main`
2. El CI (`github-tag-action`) lee los commits desde el último tag
3. Elige el bump más alto (si hay 3 `fix:` y 1 `feat:`, sube **minor**)
4. Crea un tag git (`v0.1.1`, `v0.2.0`, etc.) y un GitHub Release automáticamente
