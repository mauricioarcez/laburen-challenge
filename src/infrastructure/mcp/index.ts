import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Container } from "../di/container";
import { registerListProductsTool } from "./tools/list-products";
import { registerCreateCartTool } from "./tools/create-cart";
import { registerUpdateCartTool } from "./tools/update-cart";
import { registerViewCartTool } from "./tools/view-cart";

/**
 * Register all MCP tools with the server by importing them from the tools directory.
 */
export function registerTools(server: McpServer, container: Container): void {
    registerListProductsTool(server, container);
    registerCreateCartTool(server, container);
    registerUpdateCartTool(server, container);
    registerViewCartTool(server, container);
}
