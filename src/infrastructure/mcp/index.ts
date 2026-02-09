import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Container } from "../di/container";
import { z } from "zod";

/**
 * Register all MCP tools with the server.
 */
export function registerTools(server: McpServer, container: Container): void {
    // =========================================
    // list_products - Product Search Tool
    // =========================================
    server.tool(
        "list_products",
        {
            query: z.string().optional().describe(
                "Palabras clave para buscar productos. " +
                "IMPORTANTE: Incluir variantes y sinónimos separados por espacio. " +
                "Ejemplo: Si buscan 'camiseta', enviar 'camiseta remera polera'. " +
                "Si buscan 'pantalón', enviar 'pantalon jean jogging'."
            ),
            categoria: z.enum(["Deportivo", "Casual"]).optional().describe(
                "Filtrar por categoría de producto."
            ),
            talla: z.enum(["XS", "S", "M", "L", "XL", "XXL"]).optional().describe(
                "Filtrar por talla específica."
            ),
            color: z.string().optional().describe(
                "Filtrar por color. Ejemplo: 'Rojo', 'Negro', 'Blanco'."
            ),
            precio_max: z.number().optional().describe(
                "Precio máximo por unidad (para pedidos de 50 unidades)."
            ),
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

    // =========================================
    // get_product - Product Details Tool
    // =========================================
    server.tool(
        "get_product",
        {
            product_id: z.string().describe(
                "ID único del producto a consultar."
            ),
        },
        async ({ product_id }) => {
            const product = await container.getProductDetails.execute(product_id);

            if (!product) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            error: "Producto no encontrado.",
                        }),
                    }],
                };
            }

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        product: {
                            id: product.id,
                            tipo_prenda: product.tipo_prenda,
                            talla: product.talla,
                            color: product.color,
                            categoria: product.categoria,
                            descripcion: product.descripcion,
                            stock: product.cantidad_disponible,
                            disponible: product.disponible,
                            precios: {
                                "50_unidades": product.precio_50_u,
                                "100_unidades": product.precio_100_u,
                                "200_unidades": product.precio_200_u,
                            },
                        },
                    }),
                }],
            };
        }
    );

    // =========================================
    // create_cart - Create Shopping Cart Tool
    // =========================================
    server.tool(
        "create_cart",
        {
            conversation_id: z.string().describe(
                "ID de la conversación de Chatwoot para vincular el carrito."
            ),
        },
        async ({ conversation_id }) => {
            const cart = await container.createCart.execute(conversation_id);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: "Carrito creado exitosamente.",
                        cart: {
                            id: cart.id,
                            conversation_id: cart.conversation_id,
                            created_at: cart.created_at,
                        },
                    }),
                }],
            };
        }
    );

    // =========================================
    // update_cart - Add/Update Cart Items Tool
    // =========================================
    server.tool(
        "update_cart",
        {
            cart_id: z.string().describe(
                "ID del carrito a modificar."
            ),
            product_id: z.string().describe(
                "ID del producto a agregar o actualizar."
            ),
            qty: z.number().int().min(0).describe(
                "Cantidad a establecer. Usar 0 para eliminar el producto del carrito."
            ),
        },
        async ({ cart_id, product_id, qty }) => {
            const cart = await container.addToCart.execute(cart_id, product_id, qty);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: qty > 0
                            ? "Producto agregado/actualizado en el carrito."
                            : "Producto eliminado del carrito.",
                        cart: {
                            id: cart.id,
                            items: cart.items,
                            updated_at: cart.updated_at,
                        },
                    }),
                }],
            };
        }
    );

    // =========================================
    // view_cart - View Cart Contents Tool
    // =========================================
    server.tool(
        "view_cart",
        {
            cart_id: z.string().describe(
                "ID del carrito a consultar."
            ),
        },
        async ({ cart_id }) => {
            const cart = await container.viewCart.execute(cart_id);

            if (!cart) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            error: "Carrito no encontrado.",
                        }),
                    }],
                };
            }

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        cart: {
                            id: cart.id,
                            items: cart.items,
                            created_at: cart.created_at,
                            updated_at: cart.updated_at,
                        },
                    }),
                }],
            };
        }
    );
}
