import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { DurableObject } from "cloudflare:workers";
import { Container } from "../infrastructure/di/container";
import { registerTools } from "../infrastructure/mcp";

export interface Env {
    DB: D1Database;
}

export class LaburenMCP extends DurableObject<Env> {
    server: McpServer;

    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
        this.server = new McpServer({
            name: "laburen-mcp",
            version: "1.0.0",
        });

        // Initialize DI Container
        const container = new Container({ d1: env.DB });

        // Register Tools
        registerTools(this.server, container);
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        if (url.pathname === "/sse") {
            const transport = new SSEServerTransport("/messages", new Response());
            return this.server.connect(transport);
        }

        if (url.pathname === "/messages") {
            // Basic handling for messages endpoint if needed by the transport or client expectation
            // For Cloudflare Workers / SSE, the connection is usually maintained via /sse
            // This response might need adjustment based on specific client SDK requirements for POST
            return new Response("Method not allowed for /messages in this DO setup directly without session handling", { status: 405 });
        }

        return new Response("MCP Server running", { status: 200 });
    }
}
