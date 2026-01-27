
import { RoleKey } from "../types";

// Simulated delay to mimic API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface MCPResponse {
  success: boolean;
  resourceId?: string;
  message: string;
}

const generateId = (prefix: string) => `${prefix}_${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;

export const GHL = {
  async createPipeline(locationId: string, name: string, stages: string[]): Promise<MCPResponse> {
    await delay(800);
    const id = generateId('pipe');
    console.log(`[MCP] Created Pipeline: ${name} (${id}) in ${locationId}`);
    return { success: true, resourceId: id, message: `Pipeline '${name}' created` };
  },

  async createWorkflow(locationId: string, name: string, trigger: string): Promise<MCPResponse> {
    await delay(1200);
    const id = generateId('wf');
    console.log(`[MCP] Created Workflow: ${name} (${id})`);
    return { success: true, resourceId: id, message: `Workflow '${name}' active` };
  },

  async configureNumber(locationId: string, type: 'sms' | 'voice'): Promise<MCPResponse> {
    await delay(600);
    console.log(`[MCP] Configured ${type} capability for ${locationId}`);
    return { success: true, message: `${type.toUpperCase()} channel ready` };
  },

  async deployAgent(locationId: string, role: RoleKey, config: any): Promise<MCPResponse> {
    await delay(1500);
    const id = generateId('bot');
    console.log(`[MCP] Deployed Agent: ${role} (${id})`, config);
    return { success: true, resourceId: id, message: `AI Agent '${role}' online` };
  },

  async uploadKnowledgeBase(locationId: string, brandDomain: string, faqs: any[]): Promise<MCPResponse> {
    await delay(2000);
    console.log(`[MCP] Uploaded Knowledge Base for ${brandDomain}`);
    return { success: true, message: `Knowledge Base synced (${faqs.length} items)` };
  },

  async createSubAccount(metadata: any): Promise<MCPResponse> {
    await delay(2500);
    const id = generateId('loc');
    console.log(`[MCP] Provisioning Sub-Account: ${metadata.businessName} (${id})`);
    return { success: true, resourceId: id, message: "Sub-account provisioned in SaaS Mode" };
  },

  async sendCommunication(to: string, channel: 'sms' | 'email', body: string): Promise<MCPResponse> {
    await delay(1000);
    console.log(`[MCP] Dispatching ${channel.toUpperCase()} to ${to}: ${body.substring(0, 30)}...`);
    return { success: true, message: `${channel.toUpperCase()} Sent` };
  },

  async triggerAutomation(locationId: string, event: string): Promise<MCPResponse> {
    await delay(1200);
    console.log(`[MCP] Triggering GHL Automation: ${event} for ${locationId}`);
    return { success: true, message: `Workflow trigger '${event}' fired` };
  }
};
