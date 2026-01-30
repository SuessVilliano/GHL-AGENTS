/**
 * MCP Bridge Connector
 *
 * Connects to MCP (Model Context Protocol) servers for tool access.
 * Enables the Smart Agents system to use tools from any MCP-compatible server.
 *
 * MCP allows AI systems to access external tools in a standardized way.
 */

/**
 * @typedef {Object} MCPServerConfig
 * @property {string} id - Server ID
 * @property {string} name - Server display name
 * @property {string} endpoint - Server endpoint URL
 * @property {'http' | 'websocket' | 'stdio'} protocol - Connection protocol
 * @property {string[]} tools - List of available tools
 * @property {'connected' | 'disconnected' | 'error'} status - Connection status
 */

/**
 * @typedef {Object} MCPTool
 * @property {string} name - Tool name
 * @property {string} description - Tool description
 * @property {Object} inputSchema - JSON Schema for tool inputs
 * @property {string} serverId - ID of server providing this tool
 */

/**
 * MCP Bridge Class
 *
 * Manages connections to multiple MCP servers and routes tool calls.
 */
export class MCPBridge {
    constructor() {
        /** @type {Map<string, MCPServerConfig>} */
        this.servers = new Map();
        /** @type {Map<string, MCPTool>} */
        this.tools = new Map();
    }

    /**
     * Register an MCP server
     * @param {MCPServerConfig} config - Server configuration
     * @returns {Promise<{success: boolean, tools?: string[], error?: string}>}
     */
    async registerServer(config) {
        console.log('[MCPBridge] Registering server:', config.name);

        try {
            // Fetch server capabilities
            const capabilities = await this.fetchServerCapabilities(config);

            // Store server config
            this.servers.set(config.id, {
                ...config,
                tools: capabilities.tools.map(t => t.name),
                status: 'connected'
            });

            // Register tools
            for (const tool of capabilities.tools) {
                this.tools.set(tool.name, {
                    ...tool,
                    serverId: config.id
                });
            }

            console.log('[MCPBridge] Server registered with', capabilities.tools.length, 'tools');

            return {
                success: true,
                tools: capabilities.tools.map(t => t.name)
            };
        } catch (error) {
            console.error('[MCPBridge] Failed to register server:', error.message);

            // Store as disconnected
            this.servers.set(config.id, {
                ...config,
                tools: [],
                status: 'error'
            });

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Fetch server capabilities via MCP protocol
     * @param {MCPServerConfig} config - Server config
     * @returns {Promise<{tools: MCPTool[]}>}
     */
    async fetchServerCapabilities(config) {
        if (config.protocol === 'http') {
            const response = await fetch(`${config.endpoint}/tools/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            return { tools: result.result?.tools || [] };
        }

        // For websocket/stdio, return empty for now
        // Full implementation would use proper MCP client
        return { tools: [] };
    }

    /**
     * Call a tool via MCP
     * @param {string} toolName - Name of the tool to call
     * @param {Object} args - Tool arguments
     * @returns {Promise<{result?: any, error?: string}>}
     */
    async callTool(toolName, args) {
        const tool = this.tools.get(toolName);

        if (!tool) {
            return { error: `Tool not found: ${toolName}` };
        }

        const server = this.servers.get(tool.serverId);

        if (!server || server.status !== 'connected') {
            return { error: `Server not connected: ${tool.serverId}` };
        }

        console.log('[MCPBridge] Calling tool:', toolName, 'on server:', server.name);

        try {
            if (server.protocol === 'http') {
                const response = await fetch(`${server.endpoint}/tools/call`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: Date.now(),
                        method: 'tools/call',
                        params: {
                            name: toolName,
                            arguments: args
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const result = await response.json();

                if (result.error) {
                    return { error: result.error.message || 'Tool call failed' };
                }

                return { result: result.result };
            }

            return { error: `Protocol ${server.protocol} not fully implemented` };
        } catch (error) {
            console.error('[MCPBridge] Tool call failed:', error.message);
            return { error: error.message };
        }
    }

    /**
     * List all available tools across all servers
     * @returns {MCPTool[]}
     */
    listTools() {
        return Array.from(this.tools.values());
    }

    /**
     * List all registered servers
     * @returns {MCPServerConfig[]}
     */
    listServers() {
        return Array.from(this.servers.values());
    }

    /**
     * Get a specific tool's definition
     * @param {string} toolName - Tool name
     * @returns {MCPTool | undefined}
     */
    getTool(toolName) {
        return this.tools.get(toolName);
    }

    /**
     * Remove a server and its tools
     * @param {string} serverId - Server ID to remove
     */
    removeServer(serverId) {
        const server = this.servers.get(serverId);
        if (!server) return;

        // Remove tools from this server
        for (const [toolName, tool] of this.tools.entries()) {
            if (tool.serverId === serverId) {
                this.tools.delete(toolName);
            }
        }

        this.servers.delete(serverId);
        console.log('[MCPBridge] Removed server:', serverId);
    }

    /**
     * Register default GHL MCP server (from Chrome extension)
     * @param {string} extensionEndpoint - Chrome extension MCP endpoint
     * @returns {Promise<{success: boolean, tools?: string[], error?: string}>}
     */
    async registerGHLServer(extensionEndpoint) {
        return this.registerServer({
            id: 'ghl-extension',
            name: 'GHL Chrome Extension MCP',
            endpoint: extensionEndpoint,
            protocol: 'http',
            tools: [],
            status: 'disconnected'
        });
    }

    /**
     * Get bridge status
     * @returns {{servers: number, tools: number, connectedServers: number}}
     */
    getStatus() {
        const connectedServers = Array.from(this.servers.values())
            .filter(s => s.status === 'connected').length;

        return {
            servers: this.servers.size,
            tools: this.tools.size,
            connectedServers
        };
    }
}

/**
 * Create MCPBridge instance
 * @returns {MCPBridge}
 */
export function createMCPBridge() {
    return new MCPBridge();
}

export default MCPBridge;
