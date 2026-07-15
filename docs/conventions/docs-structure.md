# Estructura de documentación

Todo archivo `.md` generado (planes, auditorías, specs, etc.) debe vivir dentro de `docs/` en la subcarpeta correspondiente. **Nunca** dejar archivos sueltos en la raíz de `docs/` ni en la raíz del proyecto.

## Carpetas sugeridas

| Carpeta | Contenido |
|---------|-----------|
| `docs/api/` | Documentación de endpoints, flujos backend, breaking changes |
| `docs/audits/` | Auditorías técnicas, UX/UI, informes |
| `docs/ci/` | CI/CD, versionado, pipelines |
| `docs/conventions/` | Reglas y convenciones del proyecto (este archivo) |
| `docs/deploy/` | Planes y configs de deploy |
| `docs/e2e/` | Planes y cobertura de tests E2E |
| `docs/frameworks/` | Documentación de frameworks externos |
| `docs/modules/` | Planes y specs de módulos/features del producto |
| `docs/performance/` | Planes de optimización, react-doctor, refactors de calidad |
| `docs/qa/` | Tech debt, planes de testing, bugs conocidos |
| `docs/wip/` | Planes o docs en desarrollo, pendientes de ejecutar al 100% |

## Reglas

1. **Elegir la carpeta por temática**, no por fecha ni por autor.
2. **Nombres en kebab-case**: `plan-feature-x.md`, no `Plan Feature X.md`.
3. **Si no existe una carpeta adecuada**, crear una nueva con nombre descriptivo en singular o plural consistente con las existentes.
4. **No crear archivos `.md` fuera de `docs/`** (excepto `README.md` y `CLAUDE.md` en la raíz del proyecto).
