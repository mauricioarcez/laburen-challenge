# Laburen Asistente de Ventas — MCP Server

Servidor MCP (Model Context Protocol) para el asistente de ventas mayorista de Laburen. Implementado en TypeScript con **Clean Architecture**, desplegado en Cloudflare Workers.

## 📂 Estructura del Proyecto

```
src/
├── domain/              # Reglas de negocio y modelos puros
│   ├── entities/        # Tipos centrales (Product, Cart)
│   └── repositories/    # Interfaces (contratos) para acceso a datos
├── application/         # Casos de uso
│   └── usecases/        # ListProducts, AddToCart, RemoveFromCart, etc.
├── infrastructure/      # Implementaciones concretas
│   ├── database/        # Configuración de base de datos (D1)
│   ├── repositories/    # Repositorios D1
│   ├── mcp/tools/       # Herramientas MCP
│   └── di/              # Inyección de dependencias
├── presentation/        # Capa de entrada
│   └── server.ts        # Configuración del servidor MCP
├── db/
│   └── schema.sql       # Esquema de base de datos D1
└── index.ts             # Punto de entrada del Worker

data/
├── products.xlsx        # Datos fuente de productos
└── seed.sql             # Seed SQL generado desde el Excel

scripts/
└── generate-seed.ts     # Script para regenerar seed.sql desde products.xlsx

prompts/
└── system-prompt.md     # System prompt del agente

docs/
└── agent_design.md      # Diseño del agente, diagramas y flujos
```

## 🛠️ Herramientas MCP

| Tool | Descripción | Parámetros clave |
|:-----|:------------|:-----------------|
| `list_products` | Busca productos (FTS5 + filtros) | `query?`, `categoria?`, `talla?`, `color?`, `precio_max?` |
| `create_cart` | Crea un carrito vinculado a una conversación | `conversation_id` |
| `add_products_to_cart` | Agrega/actualiza un producto en el carrito | `cart_id`, `product_id`, `qty` (min: 1) |
| `delete_product_from_cart` | Elimina un producto del carrito | `cart_id`, `product_id` |
| `view_cart` | Consulta el carrito sin modificar | `cart_id` |

## 🏗️ Arquitectura

| Componente | Tecnología |
|:-----------|:-----------|
| Runtime | Cloudflare Workers (serverless edge) |
| Base de Datos | Cloudflare D1 (SQLite + FTS5) |
| Protocolo | Model Context Protocol (MCP) |
| Arquitectura | Clean Architecture (domain → application → infrastructure) |
| Lenguaje | TypeScript |
| Runtime local | Bun |

## 🚀 Workflows

| Workflow | Descripción | Guía |
|:---------|:------------|:-----|
| **Desarrollo local** | Levantar el MCP Server desde cero | [`workflow/local/README.md`](workflow/local/README.md) |
| **Deploy Cloudflare** | Desplegar el Worker en producción | [`workflow/production/README.md`](workflow/production/README.md) |

## 📄 Documentación

- **[Diseño del Agente](docs/agent_design.md)** — Diagramas de arquitectura, secuencia, modelo de datos y estrategia FTS5.
- **[System Prompt](prompts/system-prompt.md)** — Prompt del agente con reglas de búsqueda y comportamiento.
