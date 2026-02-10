import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Container } from "../../di/container";

export function registerListProductsTool(server: McpServer, container: Container) {
    server.registerTool(
        "list_products",
        {
            description: "Busca productos del catálogo mayorista. Soporta búsqueda FTS5 y filtros por categoría, talla, color y precio.",
            inputSchema: {
                query: z.string().optional().describe(
                    "Búsqueda FTS5 sobre tipo_prenda, color y descripcion. Tipos de prenda siempre en SINGULAR (camisa, camiseta, pantalón, falda, sudadera, chaqueta). Usar OR para variantes: '(camisa OR camiseta)'. No incluir tallas aquí."
                ),
                categoria: z.enum(["Deportivo", "Casual", "Formal"]).optional().describe(
                    "Filtrar por categoría exacta."
                ),
                talla: z.enum(["S", "M", "L", "XL", "XXL"]).optional().describe(
                    "Filtrar por talla. Solo si el usuario lo pide explícitamente."
                ),
                color: z.enum([
                    "Verde", "Blanco", "Negro", "Azul", "Rojo", "Amarillo", "Gris"
                ]).optional().describe(
                    "Color exacto. Si es ambiguo (ej: 'verdoso'), no usar este filtro, incluirlo en query."
                ),
                precio_max: z.number().optional().describe(
                    "Precio máximo por unidad (precio_50_u)."
                ),
            },
        },
        async ({ query, categoria, talla, color, precio_max }) => {
            const products = await container.listProducts.execute({
                query,
                categoria,
                talla,
                color,
                precio_max,
            });

            if (products.length === 0) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            message: "No se encontraron productos con esos criterios.",
                            products: [],
                        }),
                    }],
                };
            }

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        count: products.length,
                        products: products.map(p => ({
                            id: p.id,
                            tipo_prenda: p.tipo_prenda,
                            talla: p.talla,
                            color: p.color,
                            categoria: p.categoria,
                            descripcion: p.descripcion,
                            stock: p.cantidad_disponible,
                            precios: {
                                "50_unidades": p.precio_50_u,
                                "100_unidades": p.precio_100_u,
                                "200_unidades": p.precio_200_u,
                            },
                        })),
                    }),
                }],
            };
        }
    );
}
