# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

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
