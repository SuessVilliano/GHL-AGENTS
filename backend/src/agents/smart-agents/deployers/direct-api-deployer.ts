/**
 * Direct API Deployer Agent
 *
 * Makes direct GHL API calls for operations that don't require browser automation:
 * - Creating/updating contacts
 * - Managing tags
 * - Sending messages
 * - Creating opportunities
 * - Managing calendars
 * - Webhook setup
 */

import { DeploymentConfig, AgentResult } from '../types.js';
import { BrandBrain } from '../../../services/brand-scanner.js';

const GHL_API_BASE = 'https://services.leadconnectorhq.com';

/**
 * API Action definitions
 */
interface APIAction {
    name: string;
    description: string;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    requiredParams: string[];
    optionalParams: string[];
}

const API_ACTIONS: Record<string, APIAction> = {
    create_contact: {
        name: 'Create Contact',
        description: 'Create a new contact in GHL',
        endpoint: '/contacts/',
        method: 'POST',
        requiredParams: ['locationId'],
        optionalParams: ['firstName', 'lastName', 'email', 'phone', 'tags', 'customFields']
    },
    update_contact: {
        name: 'Update Contact',
        description: 'Update an existing contact',
        endpoint: '/contacts/{contactId}',
        method: 'PUT',
        requiredParams: ['contactId'],
        optionalParams: ['firstName', 'lastName', 'email', 'phone', 'tags']
    },
    add_tag: {
        name: 'Add Tag',
        description: 'Add a tag to a contact',
        endpoint: '/contacts/{contactId}/tags',
        method: 'POST',
        requiredParams: ['contactId', 'tags'],
        optionalParams: []
    },
    send_sms: {
        name: 'Send SMS',
        description: 'Send an SMS message to a contact',
        endpoint: '/conversations/messages',
        method: 'POST',
        requiredParams: ['locationId', 'contactId', 'message'],
        optionalParams: []
    },
    send_email: {
        name: 'Send Email',
        description: 'Send an email to a contact',
        endpoint: '/conversations/messages',
        method: 'POST',
        requiredParams: ['locationId', 'contactId', 'subject', 'body'],
        optionalParams: ['from', 'replyTo']
    },
    create_opportunity: {
        name: 'Create Opportunity',
        description: 'Create an opportunity in a pipeline',
        endpoint: '/opportunities/',
        method: 'POST',
        requiredParams: ['locationId', 'pipelineId', 'stageId', 'contactId', 'name'],
        optionalParams: ['monetaryValue', 'source']
    },
    move_opportunity: {
        name: 'Move Opportunity',
        description: 'Move opportunity to a different stage',
        endpoint: '/opportunities/{opportunityId}/status',
        method: 'PUT',
        requiredParams: ['opportunityId', 'stageId'],
        optionalParams: []
    },
    get_pipelines: {
        name: 'Get Pipelines',
        description: 'Get all pipelines for a location',
        endpoint: '/opportunities/pipelines',
        method: 'GET',
        requiredParams: ['locationId'],
        optionalParams: []
    },
    get_calendars: {
        name: 'Get Calendars',
        description: 'Get all calendars for a location',
        endpoint: '/calendars/',
        method: 'GET',
        requiredParams: ['locationId'],
        optionalParams: []
    },
    create_appointment: {
        name: 'Create Appointment',
        description: 'Book an appointment on a calendar',
        endpoint: '/calendars/events/appointments',
        method: 'POST',
        requiredParams: ['calendarId', 'locationId', 'contactId', 'startTime', 'endTime'],
        optionalParams: ['title', 'notes']
    },
    get_location_tags: {
        name: 'Get Location Tags',
        description: 'Get all tags for a location',
        endpoint: '/locations/{locationId}/tags',
        method: 'GET',
        requiredParams: ['locationId'],
        optionalParams: []
    },
    create_tag: {
        name: 'Create Tag',
        description: 'Create a new tag in the location',
        endpoint: '/locations/{locationId}/tags',
        method: 'POST',
        requiredParams: ['locationId', 'name'],
        optionalParams: []
    }
};

/**
 * Direct API Deployer Class
 */
export class DirectAPIDeployer {
    /**
     * List available API actions
     */
    listActions(): APIAction[] {
        return Object.values(API_ACTIONS);
    }

    /**
     * Get action details
     */
    getAction(actionName: string): APIAction | null {
        return API_ACTIONS[actionName] || null;
    }

    /**
     * Execute a single API action
     */
    async executeAction(params: {
        action: string;
        params: Record<string, any>;
        token: string;
        locationId: string;
    }): Promise<AgentResult> {
        const actionDef = this.getAction(params.action);
        if (!actionDef) {
            return {
                success: false,
                agentType: 'snapshot_deployer', // Using a valid type from the union
                output: null,
                message: `Unknown action: ${params.action}`
            };
        }

        // Validate required params
        const missing = actionDef.requiredParams.filter(p => !params.params[p]);
        if (missing.length > 0) {
            return {
                success: false,
                agentType: 'snapshot_deployer',
                output: null,
                message: `Missing required parameters: ${missing.join(', ')}`
            };
        }

        try {
            const result = await this.makeAPICall({
                endpoint: this.buildEndpoint(actionDef.endpoint, params.params),
                method: actionDef.method,
                body: actionDef.method !== 'GET' ? params.params : undefined,
                token: params.token,
                locationId: params.locationId
            });

            return {
                success: true,
                agentType: 'snapshot_deployer',
                output: result,
                message: `Successfully executed ${actionDef.name}`
            };
        } catch (error: any) {
            return {
                success: false,
                agentType: 'snapshot_deployer',
                output: { error: error.message },
                message: `Failed to execute ${actionDef.name}: ${error.message}`
            };
        }
    }

    /**
     * Execute multiple API actions in sequence
     */
    async executeActionSequence(params: {
        actions: { action: string; params: Record<string, any> }[];
        token: string;
        locationId: string;
        stopOnError?: boolean;
    }): Promise<{
        success: boolean;
        results: AgentResult[];
        completedCount: number;
    }> {
        const results: AgentResult[] = [];
        let completedCount = 0;

        for (const actionItem of params.actions) {
            const result = await this.executeAction({
                action: actionItem.action,
                params: { ...actionItem.params, locationId: params.locationId },
                token: params.token,
                locationId: params.locationId
            });

            results.push(result);

            if (result.success) {
                completedCount++;
            } else if (params.stopOnError) {
                break;
            }
        }

        return {
            success: completedCount === params.actions.length,
            results,
            completedCount
        };
    }

    /**
     * Deploy via direct API
     */
    async deploy(config: DeploymentConfig, token: string): Promise<AgentResult> {
        if (!config.apiActions || config.apiActions.length === 0) {
            return {
                success: false,
                agentType: 'snapshot_deployer',
                output: null,
                message: 'No API actions specified in deployment config'
            };
        }

        const result = await this.executeActionSequence({
            actions: config.apiActions.map(a => ({
                action: a.tool,
                params: a.params
            })),
            token,
            locationId: config.locationId,
            stopOnError: true
        });

        return {
            success: result.success,
            agentType: 'snapshot_deployer',
            output: result,
            message: result.success
                ? `Successfully executed ${result.completedCount} API actions`
                : `Completed ${result.completedCount}/${config.apiActions.length} actions`
        };
    }

    /**
     * Quick setup actions for new locations
     */
    async quickSetup(params: {
        brandBrain: BrandBrain;
        token: string;
        locationId: string;
    }): Promise<AgentResult> {
        console.log('[DirectAPIDeployer] Running quick setup for:', params.brandBrain.brand_name);

        const actions: { action: string; params: Record<string, any> }[] = [];

        // Create standard tags
        const standardTags = [
            'New Lead',
            'Hot Lead',
            'Qualified',
            'Booked',
            'No Show',
            'Customer',
            'VIP',
            'Do Not Contact'
        ];

        for (const tagName of standardTags) {
            actions.push({
                action: 'create_tag',
                params: { name: tagName }
            });
        }

        // Execute all actions
        const result = await this.executeActionSequence({
            actions,
            token: params.token,
            locationId: params.locationId,
            stopOnError: false // Continue even if some tags already exist
        });

        return {
            success: true, // Tags may already exist, so partial success is OK
            agentType: 'snapshot_deployer',
            output: {
                tagsCreated: result.completedCount,
                totalAttempted: standardTags.length
            },
            message: `Quick setup complete: ${result.completedCount} tags created`,
            nextSteps: [
                'Set up pipelines (requires TaskMagic or manual setup)',
                'Configure workflows',
                'Add team members'
            ]
        };
    }

    /**
     * Verify GHL connection and capabilities
     */
    async verifyConnection(params: {
        token: string;
        locationId: string;
    }): Promise<{
        connected: boolean;
        capabilities: string[];
        errors: string[];
    }> {
        const capabilities: string[] = [];
        const errors: string[] = [];

        // Test read access
        try {
            await this.makeAPICall({
                endpoint: `/contacts/?locationId=${params.locationId}&limit=1`,
                method: 'GET',
                token: params.token,
                locationId: params.locationId
            });
            capabilities.push('read_contacts');
        } catch (error: any) {
            errors.push(`Cannot read contacts: ${error.message}`);
        }

        // Test pipeline access
        try {
            await this.makeAPICall({
                endpoint: `/opportunities/pipelines?locationId=${params.locationId}`,
                method: 'GET',
                token: params.token,
                locationId: params.locationId
            });
            capabilities.push('read_pipelines');
        } catch (error: any) {
            errors.push(`Cannot read pipelines: ${error.message}`);
        }

        // Test calendar access
        try {
            await this.makeAPICall({
                endpoint: `/calendars/?locationId=${params.locationId}`,
                method: 'GET',
                token: params.token,
                locationId: params.locationId
            });
            capabilities.push('read_calendars');
        } catch (error: any) {
            errors.push(`Cannot read calendars: ${error.message}`);
        }

        return {
            connected: capabilities.length > 0,
            capabilities,
            errors
        };
    }

    /**
     * Build endpoint URL with parameter substitution
     */
    private buildEndpoint(template: string, params: Record<string, any>): string {
        let endpoint = template;

        // Replace path parameters
        const pathParams = template.match(/\{([^}]+)\}/g) || [];
        for (const param of pathParams) {
            const paramName = param.slice(1, -1);
            if (params[paramName]) {
                endpoint = endpoint.replace(param, params[paramName]);
            }
        }

        // Add query parameters for GET requests if locationId is present
        if (params.locationId && !endpoint.includes('locationId')) {
            endpoint += endpoint.includes('?') ? '&' : '?';
            endpoint += `locationId=${params.locationId}`;
        }

        return endpoint;
    }

    /**
     * Make API call to GHL
     */
    private async makeAPICall(params: {
        endpoint: string;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        body?: Record<string, any>;
        token: string;
        locationId: string;
    }): Promise<any> {
        const url = `${GHL_API_BASE}${params.endpoint}`;

        const response = await fetch(url, {
            method: params.method,
            headers: {
                'Authorization': `Bearer ${params.token}`,
                'Version': '2021-07-28',
                'Content-Type': 'application/json'
            },
            body: params.body ? JSON.stringify(params.body) : undefined
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GHL API ${response.status}: ${errorText}`);
        }

        return response.json();
    }
}

/**
 * Create DirectAPIDeployer instance
 */
export function createDirectAPIDeployer(): DirectAPIDeployer {
    return new DirectAPIDeployer();
}

export default DirectAPIDeployer;
