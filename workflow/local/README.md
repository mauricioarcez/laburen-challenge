# Workflow Local — Levantar el MCP Server desde cero

Guía paso a paso para clonar el repo y tener el servidor MCP funcionando localmente.

## Prerrequisitos

- [Bun](https://bun.sh/) instalado (`curl -fsSL https://bun.sh/install | bash`)

## Pasos

### 1. Instalar dependencias

```bash
bun install
```

### 2. Crear esquema de base de datos D1 (local)

```bash
bun wrangler d1 execute laburen-db --local --file=src/db/schema.sql
```

Esto crea las tablas `products`, `products_fts`, `carts` y `cart_items` en una D1 local.

### 3. Poblar con datos de productos

```bash
bun wrangler d1 execute laburen-db --local --file=data/seed.sql
```

### 4. Verificar

```bash
bun wrangler d1 execute laburen-db --local --command "SELECT COUNT(*) FROM products"
```

Resultado esperado: `100`.

### 5. Iniciar el servidor

Para probar autenticación localmente, crear un archivo `.dev.vars`:

```text
MCP_AUTH_TOKEN=token-local-123
```

Luego iniciar:

```bash
bun run dev
```

El MCP Server se levanta en `http://localhost:8787` (o `8788`).

### 6. Probar con MCP Inspector

```bash
# Setear env var para el inspector (si soporta headers) o usar el token en la URL si el inspector lo permite.
# Nota: La tool mcp-inspector actual puede no soportar headers custom fácilmente.
# Si el token está activado, el inspector podría fallar con 401.
# Para desarrollo con Inspector, podés comentar el check de auth temporalmente o no poner .dev.vars
bunx @modelcontextprotocol/inspector@latest
```

En otra terminal:

```bash
bunx @modelcontextprotocol/inspector@latest
```

En el Inspector, conectar al endpoint SSE:

```
http://localhost:8787/sse
```

Desde ahí podés ver las 5 tools (`list_products`, `create_cart`, `add_products_to_cart`, `delete_product_from_cart`, `view_cart`) y probarlas.

---

## Regenerar seed desde Excel

Si modificás `data/products.xlsx`:

```bash
bun run scripts/generate-seed.ts
```

Luego repetir pasos 2 y 3.

---

## Queries útiles para debug

```bash
# Ver todos los productos
bun wrangler d1 execute laburen-db --local --command "SELECT * FROM products LIMIT 5"

# Buscar en FTS5
bun wrangler d1 execute laburen-db --local --command "SELECT p.* FROM products p JOIN products_fts fts ON p.rowid = fts.rowid WHERE products_fts MATCH 'camiseta'"

# Ver carritos
bun wrangler d1 execute laburen-db --local --command "SELECT * FROM carts"

# Ver items de un carrito
bun wrangler d1 execute laburen-db --local --command "SELECT ci.*, p.tipo_prenda, p.color, p.talla FROM cart_items ci JOIN products p ON ci.product_id = p.id"
```

---

## Notas

- El error `Broken pipe` en los logs de `wrangler dev` es un issue cosmético de `workerd` en WSL2. No afecta funcionalidad.
- La D1 local se guarda en `.wrangler/state/`. Si necesitás resetear, borrá esa carpeta y repetí desde el paso 2.