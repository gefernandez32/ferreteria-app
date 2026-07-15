# Flujo de releases

Cómo promover cambios entre los tres ambientes y cómo se generan tags y releases.

## Branches y ambientes

| Branch | Ambiente | Tag generado | Notifica |
|--------|----------|--------------|----------|
| `dev` | dev | `vX.Y.Z-dev.N` | no |
| `staging` | staging | `vX.Y.Z-rc.N` | sí |
| `main` | production | `vX.Y.Z` | sí |

Cada push a uno de estos branches dispara el job `version` del workflow CI, que:
1. Lee los commits desde el último tag.
2. Genera el siguiente tag según [Conventional Commits](./commits.md).
3. Crea un GitHub Release.
4. Si el proyecto usa un archivo de versión (ej. `version.json`), lo commitea al branch con `[skip ci]`.
5. Publica artefacto/imagen.

## Promoción dev → staging

### Paso 1 — Asegurarse de que `dev` está listo
- Todos los PRs de features ya están mergeados.
- El CI del último push está verde.
- Probaste lo que querés promover en el ambiente dev real.

### Paso 2 — Abrir el PR

```bash
gh pr create --base staging --head dev --title "Promover dev a staging"
```

### Paso 3 — Resolver el conflicto en el archivo de versión

Si el proyecto mantiene un `version.json` (o similar) commiteado por branch, **esperá conflicto siempre**: `dev` y `staging` mantienen series distintas (`-dev.N` vs `-rc.N`) del mismo archivo. Git no puede mergearlas solo.

**Regla**: resolver tomando el lado del **branch destino** (en este caso, `staging`).

**Resolución vía GitHub UI:**
1. En el PR, botón "Resolve conflicts".
2. Editar el archivo dejando el contenido del lado **staging** (descartar el de dev).
3. "Mark as resolved" → "Commit merge".

**Resolución vía CLI (más rápida):**
```bash
git checkout staging
git pull origin staging --ff-only
git merge origin/dev --no-ff
# git marca conflict en el archivo de versión
git checkout --ours version.json
git add version.json
git commit --no-edit
git push origin staging
```

El push cierra el PR automáticamente y dispara el CI que regenera el archivo con el nuevo tag rc.

### Paso 4 — Mergear y verificar
- Botón **"Create a merge commit"** (NO squash — preservar history de Conventional Commits).
- El CI corre y notifica.
- Deploy automático al ambiente correspondiente.

## Promoción staging → main (production)

Mismo flujo que dev → staging. El conflicto en el archivo de versión se da igual: resolver tomando el lado **main**. El CI genera `vX.Y.Z` (sin sufijo), notifica, deploy a producción.

## Sync inverso staging → dev (post-hotfix)

Si alguien metió un hotfix directo en `staging`, `dev` queda atrás. Traerlo:

```bash
git checkout dev
git pull origin dev --ff-only
git merge origin/staging --no-ff
git checkout --ours version.json
git add version.json
git commit --no-ff
git push origin dev
```

Acá `--ours` mantiene la versión de `dev` (estamos parados en dev). El CI regenera el archivo con el siguiente `-dev.N`.

## Por qué el archivo de versión siempre conflictúa

El workflow commitea la versión a cada branch para que un endpoint tipo `/api/version` sirva la versión real desplegada. Cada serie (dev/rc/prod) tiene su propio histórico y `git merge` no tiene manera de combinarlos.

**Alternativa para eliminar el conflicto de raíz:** generar el archivo de versión en build time (CI/CD/Docker) leyendo el tag git, sin commitearlo. Requiere refactor de los workflows; no es prioritario mientras la resolución manual sea ocasional.
