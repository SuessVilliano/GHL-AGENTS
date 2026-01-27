
import { RoleKey } from "../types";

/**
 * Live GHL MCP Service
 * Connects to the backend API which communicates with GoHighLevel's MCP server
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.liv8ai.com';

export interface MCPResponse {
  success: boolean;
  resourceId?: string;
  message: string;
  data?: any;
}

interface MCPCallOptions {
  token: string;
  locationId: string;
}

/**
 * Make an authenticated request to the backend MCP API
 */
async function mcpRequest(
  endpoint: string,
  body: Record<string, any>,
  options: MCPCallOptions
): Promise<MCPResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/operator/execute-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${options.token}`,
      },
      body: JSON.stringify({
        plan: {
          type: 'action_plan',
          summary: `MCP Operation: ${endpoint}`,
          requiresConfirmation: false,
          riskLevel: 'low',
          steps: [{
            id: crypto.randomUUID(),
            tool: endpoint,
            input: body,
            onError: 'continue'
          }]
        },
        context: {
          locationId: options.locationId
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Request failed: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      success: result.status === 'success',
      resourceId: result.results?.[0]?.result?.id,
      message: result.summary || 'Operation completed',
      data: result.results?.[0]?.result
    };
  } catch (error: any) {
    console.error(`[MCP] ${endpoint} failed:`, error);
    return {
      success: false,
      message: error.message || 'MCP operation failed'
    };
  }
}

/**
 * Get stored auth credentials from localStorage or context
 */
function getCredentials(): MCPCallOptions | null {
  const token = localStorage.getItem('liv8_jwt');
  const locationId = localStorage.getItem('liv8_location_id');

  if (!token || !locationId) {
    console.warn('[MCP] Missing credentials. Please connect your GHL location first.');
    return null;
  }

  return { token, locationId };
}

export const GHL = {
  /**
   * Create a pipeline in GHL
   */
  async createPipeline(locationId: string, name: string, stages: string[]): Promise<MCPResponse> {
    const creds = getCredentials();
    if (!creds) {
      return { success: false, message: 'Not authenticated. Please connect your GHL location.' };
    }

    console.log(`[MCP] Creating Pipeline: ${name} with ${stages.length} stages`);
    return mcpRequest('ghl.createPipeline', { name, stages }, { ...creds, locationId });
  },

  /**
   * Create a workflow in GHL
   */
  async createWorkflow(locationId: string, name: string, trigger: string): Promise<MCPResponse> {
    const creds = getCredentials();
    if (!creds) {
      return { success: false, message: 'Not authenticated. Please connect your GHL location.' };
    }

    console.log(`[MCP] Creating Workflow: ${name}`);
    return mcpRequest('ghl.createWorkflow', { name, trigger }, { ...creds, locationId });
  },

  /**
   * Send SMS or email communication
   */
  async sendCommunication(contactId: string, type: 'sms' | 'email', content: string): Promise<MCPResponse> {
    const creds = getCredentials();
    if (!creds) {
      return { success: false, message: 'Not authenticated. Please connect your GHL location.' };
    }

    console.log(`[MCP] Sending ${type.toUpperCase()} to ${contactId}`);

    if (type === 'sms') {
      return mcpRequest('ghl.sendSMS', { contactId, message: content }, creds);
    } else {
      return mcpRequest('ghl.sendEmail', { contactId, subject: 'Message', body: content }, creds);
    }
  },

  /**
   * Trigger a GHL automation/workflow
   */
  async triggerAutomation(locationId: string, triggerKey: string): Promise<MCPResponse> {
    const creds = getCredentials();
    if (!creds) {
      return { success: false, message: 'Not authenticated. Please connect your GHL location.' };
    }

    console.log(`[MCP] Triggering Automation: ${triggerKey}`);
    return mcpRequest('ghl.triggerWorkflow', { workflowId: triggerKey }, { ...creds, locationId });
  },

  /**
   * Configure a phone number for SMS or voice
   */
  async configureNumber(locationId: string, type: 'voice' | 'sms'): Promise<MCPResponse> {
    const creds = getCredentials();
    if (!creds) {
      return { success: false, message: 'Not authenticated. Please connect your GHL location.' };
    }

    console.log(`[MCP] Configuring ${type} capability`);
    return mcpRequest('ghl.configureNumber', { type }, { ...creds, locationId });
  },

  /**
   * Deploy an AI agent to the location
   */
  async deployAgent(locationId: string, role: RoleKey, config: any): Promise<MCPResponse> {
    const creds = getCredentials();
    if (!creds) {
      return { success: false, message: 'Not authenticated. Please connect your GHL location.' };
    }

    console.log(`[MCP] Deploying Agent: ${role}`);
    return mcpRequest('ghl.deployAgent', { role, config }, { ...creds, locationId });
  },

  /**
   * Upload knowledge base content
   */
  async uploadKnowledgeBase(locationId: string, brandDomain: string, faqs: any[]): Promise<MCPResponse> {
    const creds = getCredentials();
    if (!creds) {
      return { success: false, message: 'Not authenticated. Please connect your GHL location.' };
    }

    console.log(`[MCP] Uploading Knowledge Base for ${brandDomain}`);
    return mcpRequest('ghl.uploadKnowledgeBase', { brandDomain, faqs }, { ...creds, locationId });
  },

  /**
   * Create a sub-account in SaaS mode
   */
  async createSubAccount(metadata: any): Promise<MCPResponse> {
    const creds = getCredentials();
    if (!creds) {
      return { success: false, message: 'Not authenticated. Please connect your GHL location.' };
    }

    console.log(`[MCP] Provisioning Sub-Account: ${metadata.businessName}`);
    return mcpRequest('ghl.createSubAccount', metadata, creds);
  }
};
