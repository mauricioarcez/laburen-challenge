# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [0.3.0] - 2026-02-10

### Añadido
- Herramienta `add_products_to_cart` — dedicada a agregar/actualizar productos (qty ≥ 1).
- Herramienta `delete_product_from_cart` — dedicada a eliminar productos del carrito.
- Use case `RemoveFromCart` y método `removeFromCart` en el repositorio.
- Diagrama de secuencia para eliminación de productos en `agent_design.md`.
- Workflow local completo en `workflow/local/README.md` (setup desde fork).

### Cambiado
- Mejorada descripción de `list_products`: concisa, auto-suficiente, FTS5 en singular documentado.
- Actualizado `README.md` con guía paso a paso para setup local.
- Actualizado `system-prompt.md` con tipos en singular y reglas de eliminación.
- Actualizado `agent_design.md` con tools actuales y diagramas.

### Eliminado
- Herramienta `update_cart` reemplazada por `add_products_to_cart` + `delete_product_from_cart`.

---

## [0.2.0] - 2026-02-09

### Cambiado
- Migración de `server.tool()` (deprecado) a `server.registerTool()` en todas las herramientas MCP.
- Simplificada descripción del parámetro `query` en `list_products` (el System Prompt ya contiene instrucciones detalladas).

### Eliminado
- Herramienta `get_product_details` removida (no utilizada, la info viene en `list_products`).

---

## [0.1.0] - 2026-02-07

### Añadido
- Estructura inicial del proyecto para Cloudflare Workers.
- Configuración de **Bun** como gestor de paquetes y runtime local.
- Implementación de **Clean Architecture**:
    - Capas separadas: `domain`, `application`, `infrastructure`, `presentation`.
    - Definición de Entidades (`Product`, `Cart`) y Casos de Uso.
    - Implementación de Repositorios para Cloudflare D1.
    - Contenedor de Inyección de Dependencias (DI) simple.
- Integración con **Model Context Protocol (MCP)** SDK.
- Herramientas MCP implementadas:
    - `list_products`
    - `get_product_details`
    - `create_cart`
    - `add_to_cart`
    - `view_cart`
- Configuración de base de datos D1 (`schema.sql`).
- Scripts de despliegue y desarrollo en `package.json`.

### Cambiado
- Actualizada dependencia `wrangler` a v4 para compatibilidad y eliminación de advertencias.
- Habilitada flag `nodejs_compat` en `wrangler.toml` para soportar polyfills de Node.js requeridos por el SDK de MCP.

