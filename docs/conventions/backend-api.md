# Convención: Backend API

La fuente de verdad del backend (OpenAPI/Swagger, contrato compartido, o repo del backend) es lo que define los endpoints, params y tipos. **No adivinar.**

## Regla

Antes de asumir el formato de un request/response, los parámetros de un endpoint, o el comportamiento de paginación/filtros, **consultá la spec del backend** (idealmente un `openapi.json` / `swagger.json` versionado en el repo o un contrato compartido). No inventes nombres de campos, tipos ni valores default.

## Cuándo consultar

- Al crear o modificar funciones en `src/lib/api/`
- Al agregar campos a interfaces (`*Dto`, `*Request`, `*Filters`)
- Al conectar un formulario o listado con un endpoint
- Cuando haya dudas sobre: tipos de datos, valores default, parámetros opcionales/obligatorios, formato de respuesta

## Si no hay spec disponible

Pedirla antes de codear. En último caso, leer directamente el código del backend — pero nunca inferir tipos a partir de un ejemplo de respuesta puntual.
