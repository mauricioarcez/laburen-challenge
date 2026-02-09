import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Container } from "../../di/container";

export function registerListProductsTool(server: McpServer, container: Container) {
    server.registerTool(
        "list_products",
        {
            description: "Lista y busca productos con filtros opcionales de categoría, talla, color y precio.",
            inputSchema: {
                query: z.string().optional().describe(
                    "Búsqueda FTS5. Usa OR para sinónimos: (termino1 OR termino2). Espacio combina conceptos (AND implícito). NO incluir tallas."
                ),
                categoria: z.enum(["Deportivo", "Casual", "Formal"]).optional().describe(
                    "Filtrar por categoría exacta."
                ),
                talla: z.enum(["S", "M", "L", "XL", "XXL"]).optional().describe(
                    "Filtrar por talla. NO usar a menos que el usuario lo pida explícitamente."
                ),
                color: z.enum([
                    "Verde", "Blanco", "Negro", "Azul", "Rojo", "Amarillo", "Gris"
                ]).optional().describe(
                    "Filtrar por color EXACTO. Si el color es ambiguo (ej: 'verdoso'), usar query en su lugar."
                ),
                precio_max: z.number().optional().describe(
                    "Precio máximo por unidad."
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
