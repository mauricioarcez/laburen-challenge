import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Container } from "../../di/container";

export function registerUpdateCartTool(server: McpServer, container: Container) {
    server.registerTool(
        "update_cart",
        {
            description: "Agrega, actualiza o elimina un producto del carrito de compras.",
            inputSchema: {
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
}
