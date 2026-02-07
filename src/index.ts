import { LaburenMCP, Env } from "./presentation/server";

export { LaburenMCP };

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        // Route to the Durable Object
        const id = env.MCP_SERVER.idFromName("default");
        const stub = env.MCP_SERVER.get(id);

        return stub.fetch(request);
    },
};
