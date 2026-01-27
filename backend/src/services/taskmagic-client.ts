import axios from 'axios';

const TASKMAGIC_WEBHOOK_URL = process.env.TASKMAGIC_WEBHOOK_URL || '';
const TASKMAGIC_MCP_TOKEN = process.env.TASKMAGIC_MCP_TOKEN || '';

export interface TaskMagicPayload {
    event_type: string;
    source: string;
    locationId?: string;
    agencyName?: string;
    clientEmail?: string;
    domain?: string;
    selectedRoles?: string[];
    timestamp?: number;
    data?: Record<string, any>;
}

export interface TaskMagicResponse {
    success: boolean;
    message: string;
    data?: any;
}

/**
 * TaskMagic MCP Client
 * Communicates with TaskMagic's webhook API for automation workflows
 */
export class TaskMagicClient {
    private webhookUrl: string;
    private token: string;

    constructor() {
        this.webhookUrl = TASKMAGIC_WEBHOOK_URL;
        this.token = TASKMAGIC_MCP_TOKEN;
    }

    /**
     * Check if TaskMagic is configured
     */
    isConfigured(): boolean {
        return !!(this.webhookUrl && this.token);
    }

    /**
     * Send a webhook event to TaskMagic
     */
    async triggerWebhook(payload: TaskMagicPayload): Promise<TaskMagicResponse> {
        if (!this.isConfigured()) {
            console.warn('[TaskMagic] Not configured. Set TASKMAGIC_WEBHOOK_URL and TASKMAGIC_MCP_TOKEN.');
            return {
                success: false,
                message: 'TaskMagic not configured'
            };
        }

        try {
            const response = await axios.post(
                this.webhookUrl,
                {
                    ...payload,
                    timestamp: payload.timestamp || Date.now(),
                    _auth: this.token
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    }
                }
            );

            console.log(`[TaskMagic] Webhook triggered: ${payload.event_type}`);
            return {
                success: true,
                message: 'Webhook triggered successfully',
                data: response.data
            };
        } catch (error: any) {
            console.error('[TaskMagic] Webhook failed:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Trigger deep onboarding workflow
     */
    async triggerDeepOnboarding(
        locationId: string,
        agencyName: string,
        clientEmail: string,
        domain: string,
        selectedRoles: string[]
    ): Promise<TaskMagicResponse> {
        return this.triggerWebhook({
            event_type: 'liv8_deep_onboarding',
            source: 'liv8_backend',
            locationId,
            agencyName,
            clientEmail,
            domain,
            selectedRoles,
            timestamp: Date.now()
        });
    }

    /**
     * Trigger brand sync workflow
     */
    async triggerBrandSync(locationId: string, brandData: Record<string, any>): Promise<TaskMagicResponse> {
        return this.triggerWebhook({
            event_type: 'liv8_brand_sync',
            source: 'liv8_backend',
            locationId,
            data: brandData,
            timestamp: Date.now()
        });
    }

    /**
     * Trigger deployment complete notification
     */
    async notifyDeploymentComplete(
        locationId: string,
        deploymentSummary: Record<string, any>
    ): Promise<TaskMagicResponse> {
        return this.triggerWebhook({
            event_type: 'liv8_deployment_complete',
            source: 'liv8_backend',
            locationId,
            data: deploymentSummary,
            timestamp: Date.now()
        });
    }

    /**
     * Trigger custom automation
     */
    async triggerCustomAutomation(
        eventType: string,
        locationId: string,
        data: Record<string, any>
    ): Promise<TaskMagicResponse> {
        return this.triggerWebhook({
            event_type: eventType,
            source: 'liv8_backend',
            locationId,
            data,
            timestamp: Date.now()
        });
    }
}

export const taskMagicClient = new TaskMagicClient();
