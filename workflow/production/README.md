# Workflow Deploy — Cloudflare Workers

Guía para desplegar el MCP Server en Cloudflare Workers.

## Prerrequisitos

- [Bun](https://bun.sh/) instalado
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) autenticado (`wrangler login`)
- Una base de datos D1 creada en Cloudflare Dashboard

## Pasos

### 1. Crear la base de datos D1 en Cloudflare (solo la primera vez)

```bash
bun wrangler d1 create laburen-db
```

Copiar el `database_id` del output y pegarlo en `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "laburen-db"
database_id = "tu-database-id-aquí"
```

### 2. Aplicar el esquema en producción

```bash
bun wrangler d1 execute laburen-db --remote --file=src/db/schema.sql
```

### 3. Poblar con datos de productos

```bash
bun wrangler d1 execute laburen-db --remote --file=data/seed.sql
```

### 4. Verificar

```bash
bun wrangler d1 execute laburen-db --remote --command "SELECT COUNT(*) FROM products"
```

Resultado esperado: `100`.

### 5. Configurar Auth (Seguridad)

### 6. Configurar Secretos (Auth y Chatwoot)

Para que el servidor funcione correctamente y pueda derivar a humanos, necesitas configurar los siguientes secretos:

```bash
# 1. Token de Autenticación del MCP (para proteger tu API)
bun wrangler secret put MCP_AUTH_TOKEN
# Ingresa tu token seguro (ej: laburen-secret-123)

# 2. URL de Chatwoot (para derivación humana)
bun wrangler secret put CHATWOOT_API_URL
# Ingresa la URL base (ej: https://chatwootchallenge.laburen.com)

# 3. Token de API de Chatwoot (para derivación humana)
bun wrangler secret put CHATWOOT_API_TOKEN
# Ingresa el Token de Acceso Personal de un usuario Agente/Admin
```

> ⚠️ Si no configuras `MCP_AUTH_TOKEN`, el servidor será público. Si no configuras los de `CHATWOOT`, la tool `request_human_handoff` fallará.

### 7. Deploy del Worker

```bash
bun run deploy
```

El Worker queda disponible en la URL que devuelve Wrangler (ej: `https://laburen-asistente-ventas-mcp-server.<tu-subdomain>.workers.dev`).

---

## Conexión desde Laburen

| Config | Valor |
|:-------|:------|
| **MCP URL** | `https://tu-worker-url/sse` |
| **Auth Header** | `Bearer <tu-token>` |

---

---

## Re-deploy

Para actualizaciones posteriores, solo hace falta:

```bash
bun run deploy
```

Si se modificaron datos (seed), también ejecutar el paso 3 con `--remote`.

---

## Notas

- El `database_id` en `wrangler.toml` viene con un placeholder (`to-be-replaced-with-real-id`). Reemplazarlo con el ID real antes del primer deploy.
- Los Durable Objects (`LaburenMCP`) se crean automáticamente con el deploy.
