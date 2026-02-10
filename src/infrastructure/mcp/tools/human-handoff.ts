import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Container } from "../../di/container";

export function registerHumanHandoffTool(server: McpServer, container: Container) {
    server.registerTool(
        "request_human_handoff",
        {
            description: "Solicita la intervención de un agente humano. Usar cuando el usuario pida hablar con algun superior, o este enojado. Es la ultima opcion a utilizar, no utilizarla por no haber encontrado algun producto",
            inputSchema: {
                conversation_id: z.string().describe("ID de la conversación en Chatwoot (se debe obtener del contexto o pedir si no se tiene)."),
                reason: z.string().describe("Motivo breve de la derivación (ej: 'cliente enojado', 'consulta compleja', 'solicitud explícita')."),
                summary: z.string().describe("Resumen de lo que el cliente necesita para que el humano tenga contexto.")
            },
        },
        async ({ conversation_id, reason, summary }) => {
            console.log("--- MCP TOOL: request_human_handoff ---");
            console.log("Arguments:", { conversation_id, reason, summary });

            const { apiUrl, apiToken } = container.chatwootConfig;

            if (!apiUrl || !apiToken) {
                console.warn("Chatwoot credentials not configured.");
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            message: "Error de configuración: No se pueden realizar derivaciones (Faltan credenciales). Por favor contactar a soporte."
                        })
                    }]
                };
            }

            try {
                // 1. Agregar Etiqueta de Derivación
                const labelResponse = await fetch(`${apiUrl}/api/v1/accounts/1/conversations/${conversation_id}/labels`, {
                    method: "POST",
                    headers: {
                        "api_access_token": apiToken,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        labels: ["bot-derivacion", `motivo:${reason.replace(/\s+/g, '-')}`]
                    })
                });

                if (!labelResponse.ok) {
                    console.error("Failed to add labels:", await labelResponse.text());
                }

                // 2. Agregar Nota Privada con Resumen (Opcional pero útil)
                await fetch(`${apiUrl}/api/v1/accounts/1/conversations/${conversation_id}/notes`, {
                    method: "POST",
                    headers: {
                        "api_access_token": apiToken,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        content: `🤖 **Derivación Automática**\n\n**Motivo:** ${reason}\n**Resumen:** ${summary}`
                    })
                });

                // 3. Cambiar status a Open (si estaba en pending/snoozed) y asignar (si tuviéramos lógica de asignación)
                // Por defecto, cambiar a 'open' suele disparar notificaciones en Chatwoot
                const statusResponse = await fetch(`${apiUrl}/api/v1/accounts/1/conversations/${conversation_id}/toggle_status`, {
                    method: "POST",
                    headers: {
                        "api_access_token": apiToken,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ status: "open" })
                });

                if (!statusResponse.ok) {
                    console.error("Failed to toggle status:", await statusResponse.text());
                    // Continuamos igual para devolver éxito al usuario
                }

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            message: "Derivación solicitada correctamente. Un agente humano revisará la conversación."
                        })
                    }]
                };

            } catch (error: any) {
                console.error("Error in human handoff:", error);
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            message: `Error al procesar la derivación: ${error.message}`
                        })
                    }]
                };
            }
        }
    );
}
