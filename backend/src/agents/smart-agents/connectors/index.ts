/**
 * External Connectors
 *
 * Connections to external AI systems and services:
 * - Molt.bot: Mac Mini AI master brain
 * - MCP Servers: Model Context Protocol bridges
 */

export { MoltBotConnector, createMoltBotConnector } from './moltbot.js';
export { MCPBridge, createMCPBridge } from './mcp-bridge.js';
