# Laburen Asistente de Ventas - MCP Server

Este repositorio contiene el servidor MCP (Model Context Protocol) para el desafío técnico de Laburen. Implementado en TypeScript bajo una **Arquitectura Limpia (Clean Architecture)**, diseñado para ser desplegado en Cloudflare Workers usando Bun.

## 📂 Estructura del Proyecto

El proyecto sigue los principios de Clean Architecture para separar responsabilidades y facilitar el mantenimiento y las pruebas.

```
src/
├── domain/              # Reglas de negocio y modelos puros
│   ├── entities/        # Tipos centrales (Product, Cart)
│   └── repositories/    # Interfaces (contratos) para acceso a datos
├── application/         # Casos de uso de la aplicación
│   ├── usecases/        # Lógica de negocio (e.g., CreateCart, ListProducts)
├── infrastructure/      # Implementaciones concretas y herramientas
│   ├── database/        # Configuración de base de datos (D1)
│   ├── repositories/    # Implementación de repositorios con D1
│   ├── mcp-tools/       # Definición de herramientas MCP
│   └── di/              # Inyección de dependencias
├── presentation/        # Capa de presentación (Entrada)
│   └── server.ts        # Configuración del servidor MCP
├── db/
│   └── schema.sql       # Esquema de base de datos D1
└── index.ts             # Punto de entrada del Worker
```

## 🚀 Configuración y Uso

### Prerrequisitos

- **[Bun](https://bun.sh/)** instalado (runtime y gestor de paquetes).
- Cuenta de Cloudflare y `wrangler` autenticado.

### Instalación

```bash
bun install
```

### Desarrollo Local

Para iniciar el servidor en modo desarrollo (con base de datos D1 local simulada):

```bash
bun run dev
```

Si necesitas regenerar los tipos de Cloudflare:

```bash
bun run cf-typegen
```

### Despliegue

Para desplegar el worker en Cloudflare:

```bash
bun run deploy
```

## 🛠️ Herramientas MCP Disponibles

Las siguientes herramientas están expuestas para que el Agente de IA pueda interactuar con el sistema:

- **`list_products`**: Busca productos por nombre o descripción.
- **`get_product_details`**: Obtiene detalles completos de un producto por ID.
- **`create_cart`**: Inicializa un nuevo carrito de compras para la sesión.
- **`add_to_cart`**: Agrega un producto y cantidad al carrito especificado.
- **`view_cart`**: Muestra el contenido actual y el total del carrito.

## 🏗️ Arquitectura

Este proyecto utiliza:
- **Cloudflare Workers**: Para ejecución serverless en el borde.
- **Cloudflare D1**: Base de datos SQLite distribuida.
- **Model Context Protocol (MCP)**: Estándar para conectar modelos de IA con datos.
- **Clean Architecture**: Para desacoplar la lógica de negocio de la infraestructura.
