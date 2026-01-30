/**
 * Molt.bot Connector
 *
 * Connects to Molt.bot (formerly ClawdBot) - a Mac Mini AI assistant
 * that serves as the master brain orchestrating agents for all users.
 *
 * Molt.bot capabilities:
 * - Process complex multi-step tasks
 * - Create and configure AI agents
 * - Manage long-running operations
 * - Handle tasks that require persistent context
 */

/**
 * @typedef {Object} MoltBotConfig
 * @property {string} endpoint - The Molt.bot API endpoint
 * @property {string} apiKey - API key for authentication
 * @property {string[]} capabilities - List of available capabilities
 * @property {'connected' | 'disconnected' | 'busy'} status - Connection status
 */

/**
 * @typedef {Object} MoltBotTask
 * @property {string} id - Unique task ID
 * @property {'pending' | 'running' | 'completed' | 'failed'} status - Task status
 * @property {string} type - Type of task
 * @property {Object} input - Task input data
 * @property {Object} [output] - Task output (when completed)
 * @property {string} [error] - Error message (when failed)
 * @property {string} createdAt - Task creation timestamp
 * @property {string} [completedAt] - Task completion timestamp
 */

const MOLTBOT_ENDPOINT = process.env.MOLTBOT_ENDPOINT || 'http://localhost:5000';
const MOLTBOT_API_KEY = process.env.MOLTBOT_API_KEY;

/**
 * Available Molt.bot task types
 */
export const MOLTBOT_TASK_TYPES = {
    CREATE_AGENT: 'create_agent',
    BUILD_KNOWLEDGE: 'build_knowledge',
    GENERATE_CONTENT: 'generate_content',
    DEPLOY_SYSTEM: 'deploy_system',
    ANALYZE_BUSINESS: 'analyze_business',
    RESEARCH_TOPIC: 'research_topic',
    PROCESS_DOCUMENTS: 'process_documents',
    CUSTOM_WORKFLOW: 'custom_workflow'
};

/**
 * Molt.bot Connector Class
 */
export class MoltBotConnector {
    constructor() {
        this.endpoint = MOLTBOT_ENDPOINT;
        this.apiKey = MOLTBOT_API_KEY || null;
        this.status = 'disconnected';
        this.capabilities = [];
    }

    /**
     * Check if Molt.bot is configured
     * @returns {boolean}
     */
    isConfigured() {
        return !!(this.endpoint && this.apiKey);
    }

    /**
     * Connect to Molt.bot and fetch capabilities
     * @returns {Promise<{connected: boolean, capabilities: string[], error?: string}>}
     */
    async connect() {
        if (!this.isConfigured()) {
            return {
                connected: false,
                capabilities: [],
                error: 'Molt.bot not configured. Set MOLTBOT_ENDPOINT and MOLTBOT_API_KEY.'
            };
        }

        try {
            const response = await fetch(`${this.endpoint}/api/status`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            this.status = 'connected';
            this.capabilities = data.capabilities || Object.values(MOLTBOT_TASK_TYPES);

            console.log('[MoltBot] Connected successfully. Capabilities:', this.capabilities);

            return {
                connected: true,
                capabilities: this.capabilities
            };
        } catch (error) {
            console.error('[MoltBot] Connection failed:', error.message);
            this.status = 'disconnected';

            return {
                connected: false,
                capabilities: [],
                error: `Connection failed: ${error.message}`
            };
        }
    }

    /**
     * Submit a task to Molt.bot
     * @param {Object} params - Task parameters
     * @param {string} params.type - Task type from MOLTBOT_TASK_TYPES
     * @param {Object} params.input - Task input data
     * @param {string} params.locationId - GHL location ID
     * @param {string} params.userId - User ID
     * @param {boolean} [params.async=true] - Whether to run asynchronously
     * @returns {Promise<{taskId: string, status: string} | {error: string}>}
     */
    async submitTask(params) {
        if (!this.isConfigured()) {
            // Run locally if Molt.bot not configured
            console.log('[MoltBot] Not configured, running task locally');
            return this.runTaskLocally(params);
        }

        try {
            const response = await fetch(`${this.endpoint}/api/tasks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: params.type,
                    input: params.input,
                    context: {
                        locationId: params.locationId,
                        userId: params.userId
                    },
                    async: params.async ?? true
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            console.log('[MoltBot] Task submitted:', result.taskId);

            return {
                taskId: result.taskId,
                status: result.status || 'pending'
            };
        } catch (error) {
            console.error('[MoltBot] Task submission failed:', error.message);

            // Fallback to local execution
            return this.runTaskLocally(params);
        }
    }

    /**
     * Get task status and results
     * @param {string} taskId - Task ID to check
     * @returns {Promise<MoltBotTask | {error: string}>}
     */
    async getTaskStatus(taskId) {
        if (!this.isConfigured()) {
            return { error: 'Molt.bot not configured' };
        }

        try {
            const response = await fetch(`${this.endpoint}/api/tasks/${taskId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[MoltBot] Get task status failed:', error.message);
            return { error: error.message };
        }
    }

    /**
     * Wait for task completion with polling
     * @param {string} taskId - Task ID to wait for
     * @param {number} [timeout=300000] - Timeout in milliseconds (default 5 minutes)
     * @param {number} [pollInterval=2000] - Poll interval in milliseconds
     * @returns {Promise<MoltBotTask | {error: string}>}
     */
    async waitForTask(taskId, timeout = 300000, pollInterval = 2000) {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            const status = await this.getTaskStatus(taskId);

            if (status.error) {
                return status;
            }

            if (status.status === 'completed') {
                return status;
            }

            if (status.status === 'failed') {
                return status;
            }

            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

        return { error: 'Task timed out' };
    }

    /**
     * Send a message to Molt.bot for conversational interaction
     * @param {Object} params - Message parameters
     * @param {string} params.message - User message
     * @param {string} params.sessionId - Session ID for context
     * @param {string} params.locationId - GHL location ID
     * @returns {Promise<{response: string, actions?: Object[]} | {error: string}>}
     */
    async chat(params) {
        if (!this.isConfigured()) {
            return {
                response: "I'm currently running in local mode. For full capabilities, please configure Molt.bot connection.",
                actions: []
            };
        }

        try {
            const response = await fetch(`${this.endpoint}/api/chat`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: params.message,
                    sessionId: params.sessionId,
                    context: {
                        locationId: params.locationId
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[MoltBot] Chat failed:', error.message);
            return { error: error.message };
        }
    }

    /**
     * Run task locally when Molt.bot is not available
     * @param {Object} params - Task parameters
     * @returns {Promise<{taskId: string, status: string, output?: Object}>}
     */
    async runTaskLocally(params) {
        const taskId = `local_${Date.now()}`;
        console.log('[MoltBot] Running task locally:', taskId, params.type);

        // Import and use local smart agents for fallback
        try {
            const { createSmartAgentsController } = await import('../index.js');
            const controller = createSmartAgentsController();

            let output;

            switch (params.type) {
                case MOLTBOT_TASK_TYPES.CREATE_AGENT:
                    output = await controller.buildAgent(params.input);
                    break;

                case MOLTBOT_TASK_TYPES.BUILD_KNOWLEDGE:
                    output = await controller.buildKnowledgeFromWebsite(params.input.websiteUrl);
                    break;

                case MOLTBOT_TASK_TYPES.GENERATE_CONTENT:
                    // Need brand brain for content generation
                    output = { message: 'Content generation requires brandBrain context' };
                    break;

                case MOLTBOT_TASK_TYPES.ANALYZE_BUSINESS:
                    output = await controller.buildKnowledgeFromWebsite(params.input.websiteUrl);
                    break;

                default:
                    output = { message: `Task type ${params.type} handled locally with limited capabilities` };
            }

            return {
                taskId,
                status: 'completed',
                output
            };
        } catch (error) {
            console.error('[MoltBot] Local task execution failed:', error);
            return {
                taskId,
                status: 'failed',
                error: error.message
            };
        }
    }

    /**
     * Get connection status
     * @returns {{status: string, endpoint: string, configured: boolean}}
     */
    getStatus() {
        return {
            status: this.status,
            endpoint: this.endpoint,
            configured: this.isConfigured(),
            capabilities: this.capabilities
        };
    }
}

/**
 * Create MoltBotConnector instance
 * @returns {MoltBotConnector}
 */
export function createMoltBotConnector() {
    return new MoltBotConnector();
}

export default MoltBotConnector;
