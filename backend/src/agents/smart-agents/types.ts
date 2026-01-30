/**
 * Smart Agents Type Definitions
 */

import { BaseMessage } from '@langchain/core/messages';

/**
 * Intent types the orchestrator can classify
 */
export type UserIntent =
    | 'create_agent'        // User wants to create an AI agent
    | 'create_content'      // User wants content (social, email, SMS)
    | 'build_knowledge'     // User wants to build/update knowledge base
    | 'deploy_system'       // User wants to deploy something
    | 'run_campaign'        // User wants to run a marketing campaign
    | 'manage_contacts'     // User wants to work with contacts
    | 'analyze_data'        // User wants analytics/insights
    | 'configure_workflow'  // User wants to set up automations
    | 'general_chat'        // General conversation
    | 'unknown';

/**
 * Agent types available in the system
 */
export type AgentType =
    | 'orchestrator'
    | 'agent_builder'
    | 'content_creator'
    | 'knowledge_builder'
    | 'workflow_designer'
    | 'snapshot_deployer'
    | 'taskmagic_deployer'
    | 'receptionist'
    | 'follow_up'
    | 'review_collector'
    | 'reengagement';

/**
 * AI Staff Configuration - What gets created when building an agent
 */
export interface AIStaffConfig {
    id: string;
    name: string;
    role: string;
    description: string;

    // Personality & Voice
    personality: {
        tone: 'professional' | 'friendly' | 'casual' | 'formal';
        style: string;
        traits: string[];
    };

    // Knowledge & Context
    knowledge: {
        brandBrainId: string;
        customInstructions: string[];
        faqs: { q: string; a: string }[];
        doSay: string[];
        dontSay: string[];
    };

    // Capabilities
    capabilities: {
        canSendSMS: boolean;
        canSendEmail: boolean;
        canBookAppointments: boolean;
        canTransferToHuman: boolean;
        canAccessCRM: boolean;
        canProcessPayments: boolean;
    };

    // Triggers & Workflows
    triggers: {
        type: 'inbound_call' | 'inbound_sms' | 'inbound_email' | 'missed_call' | 'new_lead' | 'tag_added' | 'scheduled';
        conditions?: Record<string, any>;
    }[];

    // Response Templates
    templates: {
        greeting: string;
        fallback: string;
        transferMessage: string;
        afterHoursMessage: string;
    };

    // Operating Hours
    schedule: {
        timezone: string;
        hours: {
            [day: string]: { start: string; end: string } | null;
        };
    };
}

/**
 * Content Generation Request
 */
export interface ContentRequest {
    type: 'social_post' | 'email_sequence' | 'sms_sequence' | 'blog_post' | 'ad_copy' | 'landing_page';
    topic: string;
    brandBrainId: string;

    // Social specific
    platforms?: ('facebook' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok')[];

    // Sequence specific
    sequenceLength?: number;
    goal?: string;

    // Style
    tone?: string;
    includeEmojis?: boolean;
    includeHashtags?: boolean;
    includeCTA?: boolean;

    // Constraints
    maxLength?: number;
    targetAudience?: string;
}

/**
 * Generated Content Output
 */
export interface GeneratedContent {
    id: string;
    type: ContentRequest['type'];
    content: string | ContentPiece[];
    metadata: {
        generatedAt: string;
        model: string;
        brandBrainId: string;
        tokens: number;
    };
}

export interface ContentPiece {
    id: string;
    platform?: string;
    subject?: string;
    body: string;
    scheduledFor?: string;
    hashtags?: string[];
    mediaUrls?: string[];
}

/**
 * Knowledge Base Entry
 */
export interface KnowledgeEntry {
    id: string;
    category: 'faq' | 'product' | 'service' | 'policy' | 'process' | 'script';
    title: string;
    content: string;
    keywords: string[];
    source?: string;
    lastUpdated: string;
}

/**
 * Deployment Configuration
 */
export interface DeploymentConfig {
    method: 'snapshot' | 'taskmagic' | 'direct_api';

    // Snapshot deployment
    snapshotId?: string;
    snapshotOverrides?: Record<string, any>;

    // TaskMagic deployment
    taskmagicWorkflowId?: string;
    taskmagicVariables?: Record<string, any>;

    // Direct API deployment
    apiActions?: {
        tool: string;
        params: Record<string, any>;
    }[];

    // Target
    locationId: string;

    // Options
    dryRun?: boolean;
    notifyOnComplete?: boolean;
}

/**
 * Orchestrator State - Main state for routing decisions
 */
export interface OrchestratorState {
    // Session
    sessionId: string;
    locationId: string;
    userId: string;

    // Conversation
    messages: BaseMessage[];

    // Classification
    currentIntent: UserIntent;
    confidence: number;
    extractedEntities: Record<string, any>;

    // Routing
    targetAgent: AgentType | null;
    agentQueue: AgentType[];

    // Context
    brandBrainId: string | null;
    activeAgentConfigs: AIStaffConfig[];

    // Execution
    currentTask: string | null;
    taskProgress: number;
    taskResults: any[];

    // Control
    awaitingHumanApproval: boolean;
    approvalReason: string | null;
}

/**
 * Agent Execution Result
 */
export interface AgentResult {
    success: boolean;
    agentType: AgentType;
    output: any;
    message: string;
    nextSteps?: string[];
    requiresApproval?: boolean;
    approvalData?: any;
}

/**
 * TaskMagic Workflow Definition
 */
export interface TaskMagicWorkflow {
    id: string;
    name: string;
    description: string;
    trigger: 'webhook' | 'schedule' | 'manual';
    steps: TaskMagicStep[];
    variables: Record<string, any>;
}

export interface TaskMagicStep {
    id: string;
    type: 'browser_action' | 'api_call' | 'wait' | 'condition' | 'loop';
    action: string;
    params: Record<string, any>;
    onSuccess?: string;
    onFailure?: string;
}

/**
 * GHL Snapshot Definition
 */
export interface GHLSnapshot {
    id: string;
    name: string;
    description: string;
    category: 'full_system' | 'pipeline' | 'workflow' | 'funnel' | 'email_template';
    assets: {
        pipelines: string[];
        workflows: string[];
        funnels: string[];
        emailTemplates: string[];
        smsTemplates: string[];
    };
    variables: {
        name: string;
        description: string;
        required: boolean;
        defaultValue?: any;
    }[];
}

/**
 * Molt.bot Connection Config
 */
export interface MoltBotConfig {
    endpoint: string;
    apiKey: string;
    capabilities: string[];
    status: 'connected' | 'disconnected' | 'busy';
}

/**
 * MCP Server Connection
 */
export interface MCPServerConfig {
    id: string;
    name: string;
    endpoint: string;
    protocol: 'http' | 'websocket' | 'stdio';
    tools: string[];
    status: 'connected' | 'disconnected' | 'error';
}
