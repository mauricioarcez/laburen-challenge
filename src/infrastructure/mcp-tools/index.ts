import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Container } from "../di/container";

export function registerTools(server: McpServer, container: Container) {
    server.tool(
        "list_products",
        {
            search: z.string().optional().describe("Search term for product name or description"),
        },
        async ({ search }) => {
            const results = await container.listProducts.execute(search);
            return {
                content: [{ type: "text", text: JSON.stringify(results) }],
            };
        }
    );

    server.tool(
        "get_product_details",
        {
            id: z.number().describe("Product ID"),
        },
        async ({ id }) => {
            const product = await container.getProductDetails.execute(id);

            if (!product) {
                return {
                    content: [{ type: "text", text: `Product with ID ${id} not found` }],
                    isError: true,
                };
            }

            return {
                content: [{ type: "text", text: JSON.stringify(product) }],
            };
        }
    );

    server.tool(
        "create_cart",
        {},
        async () => {
            const result = await container.createCart.execute();
            return {
                content: [{ type: "text", text: JSON.stringify(result) }],
            };
        }
    );

    server.tool(
        "add_to_cart",
        {
            cart_id: z.number().describe("ID of the cart"),
            product_id: z.number().describe("ID of the product to add"),
            qty: z.number().min(1).default(1).describe("Quantity to add"),
        },
        async ({ cart_id, product_id, qty }) => {
            const result = await container.addToCart.execute(cart_id, product_id, qty);
            return {
                content: [{ type: "text", text: JSON.stringify(result) }],
            };
        }
    );

    server.tool(
        "view_cart",
        {
            cart_id: z.number().describe("ID of the cart to view"),
        },
        async ({ cart_id }) => {
            const results = await container.viewCart.execute(cart_id);
            return {
                content: [{ type: "text", text: JSON.stringify(results) }],
            };
        }
    );
}
