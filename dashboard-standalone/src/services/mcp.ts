
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
    console.log(`[MCP] Created Pipeline: ${name} (${id}) in ${locationId}. Stages: ${stages.length}`);
    return { success: true, resourceId: id, message: `Pipeline '${name}' created` };
  },

  async createWorkflow(locationId: string, name: string, trigger: string): Promise<MCPResponse> {
    await delay(1200);
    const id = generateId('wf');
    console.log(`[MCP] Created Workflow: ${name} (${id}) in ${locationId}. Trigger: ${trigger}`);
    return { success: true, resourceId: id, message: `Workflow '${name}' active` };
  },

  async sendCommunication(contactId: string, type: 'sms' | 'email', content: string): Promise<MCPResponse> {
    await delay(600);
    console.log(`[MCP] Sent ${type} to ${contactId}:`, content);
    return { success: true, message: `${type.toUpperCase()} sent` };
  },

  async triggerAutomation(locationId: string, triggerKey: string): Promise<MCPResponse> {
    await delay(500);
    console.log(`[MCP] Automation Triggered: ${triggerKey} @ ${locationId}`);
    return { success: true, message: `Automation ${triggerKey} fired` };
  },

  async configureNumber(locationId: string, type: 'voice' | 'sms'): Promise<MCPResponse> {
    await delay(1000);
    console.log(`[MCP] Configured ${type} number for ${locationId}`);
    return { success: true, message: `${type.toUpperCase()} channel ready` };
  },

  async deployAgent(locationId: string, role: RoleKey, config: any): Promise<MCPResponse> {
    await delay(1500);
    const id = generateId('bot');
    console.log(`[MCP] Deployed Agent: ${role} (${id}) in ${locationId}. Config keys: ${config ? Object.keys(config).length : 0}`);
    return { success: true, resourceId: id, message: `AI Agent '${role}' online` };
  },

  async uploadKnowledgeBase(locationId: string, brandDomain: string, faqs: any[]): Promise<MCPResponse> {
    await delay(2000);
    console.log(`[MCP] Uploaded Knowledge Base for ${brandDomain} @ ${locationId}. Items: ${faqs.length}`);
    return { success: true, message: `Knowledge Base synced (${faqs.length} items)` };
  },

  async createSubAccount(metadata: any): Promise<MCPResponse> {
    await delay(2500);
    const id = generateId('loc');
    console.log(`[MCP] Provisioning Sub-Account: ${metadata.businessName} (${id})`);
    return { success: true, resourceId: id, message: "Sub-account provisioned in SaaS Mode" };
  }
};
