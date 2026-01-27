import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import axios from 'axios';

const HIGHLEVEL_MCP_URL = process.env.HIGHLEVEL_MCP_URL || 'https://services.leadconnectorhq.com/mcp/';

/**
 * HighLevel MCP Client
 * Communicates with GoHighLevel's MCP server for tool execution
 */
export class HighLevelMCPClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = HIGHLEVEL_MCP_URL;
    }

    /**
     * Call a tool on the HighLevel MCP server
     */
    async callTool(
        toolName: string,
        args: Record<string, any>,
        token: string,
        locationId: string
    ): Promise<any> {
        try {
            const response = await axios.post(
                `${this.baseUrl}tools/${toolName}`,
                args,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'locationId': locationId,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            console.error(`[MCP] Tool ${toolName} failed:`, error.response?.data || error.message);
            throw new Error(`MCP tool execution failed: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Wrapper methods for common GHL operations
     */

    async createContact(token: string, locationId: string, contactData: any) {
        return this.callTool('ghl_create_contact', contactData, token, locationId);
    }

    async updateContact(token: string, locationId: string, contactId: string, updates: any) {
        return this.callTool('ghl_update_contact', { contactId, ...updates }, token, locationId);
    }

    async searchContacts(token: string, locationId: string, query: any) {
        return this.callTool('ghl_search_contacts', query, token, locationId);
    }

    async sendSMS(token: string, locationId: string, contactId: string, message: string) {
        return this.callTool('ghl_send_sms', { contactId, message }, token, locationId);
    }

    async sendEmail(token: string, locationId: string, contactId: string, subject: string, body: string) {
        return this.callTool('ghl_send_email', { contactId, subject, body }, token, locationId);
    }

    async createTask(token: string, locationId: string, taskData: any) {
        return this.callTool('ghl_create_task', taskData, token, locationId);
    }

    async createNote(token: string, locationId: string, contactId: string, note: string) {
        return this.callTool('ghl_create_note', { contactId, body: note }, token, locationId);
    }

    async moveOpportunity(token: string, locationId: string, opportunityId: string, stage: string) {
        return this.callTool('ghl_move_opportunity', { opportunityId, pipelineStageId: stage }, token, locationId);
    }

    async createWorkflow(token: string, locationId: string, workflowConfig: any) {
        return this.callTool('ghl_create_workflow', workflowConfig, token, locationId);
    }

    async triggerWorkflow(token: string, locationId: string, workflowId: string, contactId: string) {
        return this.callTool('ghl_trigger_workflow', { workflowId, contactId }, token, locationId);
    }
}

export const mcpClient = new HighLevelMCPClient();
