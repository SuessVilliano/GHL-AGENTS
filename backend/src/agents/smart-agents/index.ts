/**
 * Smart Agents Module
 *
 * The brain of LIV8 OS - fully autonomous AI agents that:
 * - Understand user intent from natural language
 * - Create AI staff configurations
 * - Generate all types of content
 * - Build knowledge bases
 * - Deploy systems to GHL via Snapshots or TaskMagic
 *
 * Architecture:
 * - Orchestrator: Routes requests to specialized agents
 * - Builders: Create things (agents, content, knowledge)
 * - Deployers: Deploy things to GHL
 */

// Types
export * from './types.js';

// Orchestrator
export {
    createOrchestrator,
    createOrchestratorGraph,
    runOrchestrator,
    OrchestratorStateAnnotation
} from './orchestrator/index.js';

// Builders
export {
    AgentBuilder,
    createAgentBuilder,
    STAFF_TEMPLATES,
    ContentCreator,
    createContentCreator,
    PLATFORM_CONSTRAINTS,
    KnowledgeBuilder,
    createKnowledgeBuilder
} from './builders/index.js';

// Deployers
export {
    SnapshotDeployer,
    createSnapshotDeployer,
    AVAILABLE_SNAPSHOTS,
    TaskMagicDeployer,
    createTaskMagicDeployer,
    TASKMAGIC_WORKFLOWS,
    DirectAPIDeployer,
    createDirectAPIDeployer
} from './deployers/index.js';

// Connectors (external systems)
export {
    MoltBotConnector,
    createMoltBotConnector,
    MCPBridge,
    createMCPBridge
} from './connectors/index.js';

import { BrandBrain } from '../../services/brand-scanner.js';
import { runOrchestrator } from './orchestrator/index.js';
import { createAgentBuilder, STAFF_TEMPLATES } from './builders/index.js';
import { createContentCreator } from './builders/index.js';
import { createKnowledgeBuilder } from './builders/index.js';
import { createSnapshotDeployer, AVAILABLE_SNAPSHOTS } from './deployers/index.js';
import { createTaskMagicDeployer } from './deployers/index.js';
import { createDirectAPIDeployer } from './deployers/index.js';
import { createMoltBotConnector } from './connectors/index.js';
import { createMCPBridge } from './connectors/index.js';
import {
    UserIntent,
    AIStaffConfig,
    ContentRequest,
    GeneratedContent,
    KnowledgeEntry,
    DeploymentConfig,
    AgentResult
} from './types.js';

/**
 * Smart Agents Controller
 *
 * Unified interface for all smart agent capabilities
 */
export class SmartAgentsController {
    private agentBuilder = createAgentBuilder();
    private contentCreator = createContentCreator();
    private knowledgeBuilder = createKnowledgeBuilder();
    private snapshotDeployer = createSnapshotDeployer();
    private taskmagicDeployer = createTaskMagicDeployer();
    private directApiDeployer = createDirectAPIDeployer();
    private moltBot = createMoltBotConnector();
    private mcpBridge = createMCPBridge();

    /**
     * Process a natural language request
     * The orchestrator will understand intent and route to appropriate agent
     */
    async processRequest(params: {
        sessionId: string;
        locationId: string;
        userId: string;
        message: string;
        brandBrainId?: string;
    }): Promise<{
        response: string;
        intent: UserIntent;
        taskResults: any[];
        awaitingApproval: boolean;
    }> {
        return runOrchestrator(params);
    }

    // ========== AGENT BUILDING ==========

    /**
     * Get available AI staff templates
     */
    getStaffTemplates(): typeof STAFF_TEMPLATES {
        return STAFF_TEMPLATES;
    }

    /**
     * Build a single AI agent
     */
    async buildAgent(params: {
        templateKey: keyof typeof STAFF_TEMPLATES;
        brandBrain: BrandBrain;
        customizations?: Partial<AIStaffConfig>;
    }): Promise<AIStaffConfig> {
        return this.agentBuilder.buildAgent(params);
    }

    /**
     * Build a team of AI agents
     */
    async buildAgentTeam(params: {
        templateKeys: (keyof typeof STAFF_TEMPLATES)[];
        brandBrain: BrandBrain;
    }): Promise<AIStaffConfig[]> {
        return this.agentBuilder.buildAgentTeam(params);
    }

    // ========== CONTENT CREATION ==========

    /**
     * Generate content (social, email, SMS, blog, etc.)
     */
    async generateContent(
        request: ContentRequest,
        brandBrain: BrandBrain
    ): Promise<GeneratedContent> {
        return this.contentCreator.generateContent(request, brandBrain);
    }

    /**
     * Generate a content calendar
     */
    async generateContentCalendar(params: {
        brandBrain: BrandBrain;
        platforms: string[];
        weeks: number;
        postsPerWeek: number;
        topics?: string[];
    }) {
        return this.contentCreator.generateContentCalendar(params);
    }

    // ========== KNOWLEDGE BUILDING ==========

    /**
     * Build knowledge base from website
     */
    async buildKnowledgeFromWebsite(websiteUrl: string): Promise<{
        brandBrain: BrandBrain;
        entries: KnowledgeEntry[];
        summary: string;
    }> {
        return this.knowledgeBuilder.buildFromWebsite(websiteUrl);
    }

    /**
     * Build knowledge from text/documents
     */
    async buildKnowledgeFromText(params: {
        content: string;
        source: string;
        businessName?: string;
    }): Promise<KnowledgeEntry[]> {
        return this.knowledgeBuilder.buildFromText(params);
    }

    /**
     * Build objection handling scripts
     */
    async buildObjectionHandlers(params: {
        brandBrain: BrandBrain;
        commonObjections?: string[];
    }): Promise<KnowledgeEntry[]> {
        return this.knowledgeBuilder.buildObjectionHandlers(params);
    }

    /**
     * Search knowledge base
     */
    searchKnowledge(entries: KnowledgeEntry[], query: string): KnowledgeEntry[] {
        return this.knowledgeBuilder.searchKnowledge(entries, query);
    }

    // ========== DEPLOYMENT ==========

    /**
     * Get available snapshots
     */
    getAvailableSnapshots() {
        return this.snapshotDeployer.listSnapshots();
    }

    /**
     * Recommend snapshot based on goals
     */
    recommendSnapshot(params: {
        goals: string[];
        industry: string;
    }) {
        return this.snapshotDeployer.recommendSnapshot(params);
    }

    /**
     * Deploy a snapshot
     */
    async deploySnapshot(config: DeploymentConfig): Promise<AgentResult> {
        return this.snapshotDeployer.deploySnapshot(config);
    }

    /**
     * Check if TaskMagic is configured
     */
    isTaskMagicConfigured(): boolean {
        return this.taskmagicDeployer.isConfigured();
    }

    /**
     * Trigger TaskMagic workflow
     */
    async triggerTaskMagicWorkflow(params: {
        workflowId: string;
        variables: Record<string, any>;
        locationId: string;
    }): Promise<AgentResult> {
        return this.taskmagicDeployer.triggerWorkflow(params);
    }

    /**
     * Create custom TaskMagic deployment plan
     */
    createTaskMagicPlan(params: {
        brandBrain: BrandBrain;
        requirements: string[];
    }) {
        return this.taskmagicDeployer.createDeploymentPlan(params);
    }

    /**
     * Execute direct API actions
     */
    async executeAPIActions(params: {
        actions: { action: string; params: Record<string, any> }[];
        token: string;
        locationId: string;
    }) {
        return this.directApiDeployer.executeActionSequence({
            actions: params.actions,
            token: params.token,
            locationId: params.locationId
        });
    }

    /**
     * Verify GHL connection
     */
    async verifyGHLConnection(params: {
        token: string;
        locationId: string;
    }) {
        return this.directApiDeployer.verifyConnection(params);
    }

    /**
     * Run quick setup for new location
     */
    async quickSetup(params: {
        brandBrain: BrandBrain;
        token: string;
        locationId: string;
    }): Promise<AgentResult> {
        return this.directApiDeployer.quickSetup(params);
    }

    // ========== FULL AUTOMATION ==========

    /**
     * Full autonomous onboarding
     * Takes a website URL and sets up everything automatically
     */
    async fullAutonomousSetup(params: {
        websiteUrl: string;
        locationId: string;
        token: string;
        userId: string;
        goals?: string[];
        selectedAgents?: (keyof typeof STAFF_TEMPLATES)[];
    }): Promise<{
        brandBrain: BrandBrain;
        agents: AIStaffConfig[];
        knowledge: KnowledgeEntry[];
        content: GeneratedContent[];
        deploymentPlan: any;
        status: 'ready_for_approval' | 'deployed' | 'failed';
        message: string;
    }> {
        console.log('[SmartAgents] Starting full autonomous setup for:', params.websiteUrl);

        try {
            // 1. Scan website and build knowledge
            console.log('[SmartAgents] Step 1: Building knowledge from website...');
            const { brandBrain, entries: knowledge } = await this.buildKnowledgeFromWebsite(params.websiteUrl);

            // 2. Build objection handlers
            console.log('[SmartAgents] Step 2: Building objection handlers...');
            const objectionHandlers = await this.buildObjectionHandlers({ brandBrain });
            const fullKnowledge = [...knowledge, ...objectionHandlers];

            // 3. Build AI agents
            console.log('[SmartAgents] Step 3: Building AI agents...');
            const agentKeys = params.selectedAgents || ['receptionist', 'missed_call_recovery', 'booking_assistant'];
            const agents = await this.buildAgentTeam({
                templateKeys: agentKeys,
                brandBrain
            });

            // 4. Generate initial content
            console.log('[SmartAgents] Step 4: Generating content...');
            const socialContent = await this.generateContent({
                type: 'social_post',
                topic: 'Introduction to our services',
                brandBrainId: brandBrain.domain,
                platforms: ['facebook', 'instagram']
            }, brandBrain);

            const emailContent = await this.generateContent({
                type: 'email_sequence',
                topic: 'Welcome sequence',
                brandBrainId: brandBrain.domain,
                sequenceLength: 5,
                goal: 'nurture leads to booking'
            }, brandBrain);

            const content = [socialContent, emailContent];

            // 5. Recommend and plan deployment
            console.log('[SmartAgents] Step 5: Planning deployment...');
            const goals = params.goals || ['speed to lead', 'appointment booking', 'follow up automation'];
            const recommendations = this.recommendSnapshot({ goals, industry: brandBrain.industry_niche });

            let deploymentPlan;
            if (recommendations.length > 0) {
                // Use snapshot deployment
                deploymentPlan = this.snapshotDeployer.generateDeploymentPlan({
                    snapshotId: Object.keys(AVAILABLE_SNAPSHOTS).find(k =>
                        AVAILABLE_SNAPSHOTS[k].id === recommendations[0].snapshot.id
                    ) || 'fast5-speed-to-lead',
                    brandBrain
                });
            } else {
                // Use TaskMagic for custom
                deploymentPlan = this.createTaskMagicPlan({
                    brandBrain,
                    requirements: goals
                });
            }

            // 6. Verify GHL connection
            console.log('[SmartAgents] Step 6: Verifying GHL connection...');
            const connectionStatus = await this.verifyGHLConnection({
                token: params.token,
                locationId: params.locationId
            });

            if (!connectionStatus.connected) {
                return {
                    brandBrain,
                    agents,
                    knowledge: fullKnowledge,
                    content,
                    deploymentPlan,
                    status: 'failed',
                    message: `GHL connection failed: ${connectionStatus.errors.join(', ')}`
                };
            }

            console.log('[SmartAgents] Full autonomous setup complete - ready for approval');

            return {
                brandBrain,
                agents,
                knowledge: fullKnowledge,
                content,
                deploymentPlan,
                status: 'ready_for_approval',
                message: `Setup complete for ${brandBrain.brand_name}. Created ${agents.length} AI agents, ${fullKnowledge.length} knowledge entries, and ${content.length} content pieces. Ready to deploy.`
            };
        } catch (error: any) {
            console.error('[SmartAgents] Full setup failed:', error);
            throw error;
        }
    }

    // ========== MOLT.BOT INTEGRATION ==========

    /**
     * Connect to Molt.bot master brain
     */
    async connectMoltBot() {
        return this.moltBot.connect();
    }

    /**
     * Get Molt.bot connection status
     */
    getMoltBotStatus() {
        return this.moltBot.getStatus();
    }

    /**
     * Submit task to Molt.bot
     */
    async submitToMoltBot(params: {
        type: string;
        input: Record<string, any>;
        locationId: string;
        userId: string;
    }) {
        return this.moltBot.submitTask(params);
    }

    /**
     * Chat with Molt.bot
     */
    async chatWithMoltBot(params: {
        message: string;
        sessionId: string;
        locationId: string;
    }) {
        return this.moltBot.chat(params);
    }

    /**
     * Wait for Molt.bot task completion
     */
    async waitForMoltBotTask(taskId: string, timeout?: number) {
        return this.moltBot.waitForTask(taskId, timeout);
    }

    // ========== MCP BRIDGE ==========

    /**
     * Register an MCP server
     */
    async registerMCPServer(config: {
        id: string;
        name: string;
        endpoint: string;
        protocol: 'http' | 'websocket' | 'stdio';
    }) {
        return this.mcpBridge.registerServer({
            ...config,
            tools: [],
            status: 'disconnected'
        });
    }

    /**
     * Call an MCP tool
     */
    async callMCPTool(toolName: string, args: Record<string, any>) {
        return this.mcpBridge.callTool(toolName, args);
    }

    /**
     * List all MCP tools
     */
    listMCPTools() {
        return this.mcpBridge.listTools();
    }

    /**
     * Get MCP bridge status
     */
    getMCPBridgeStatus() {
        return this.mcpBridge.getStatus();
    }

    /**
     * Get full system status
     */
    getSystemStatus() {
        return {
            orchestrator: 'ready',
            builders: {
                agentBuilder: 'ready',
                contentCreator: 'ready',
                knowledgeBuilder: 'ready'
            },
            deployers: {
                snapshot: 'ready',
                taskmagic: this.taskmagicDeployer.isConfigured() ? 'ready' : 'not_configured',
                directApi: 'ready'
            },
            connectors: {
                moltBot: this.moltBot.getStatus(),
                mcpBridge: this.mcpBridge.getStatus()
            }
        };
    }
}

/**
 * Create SmartAgentsController instance
 */
export function createSmartAgentsController(): SmartAgentsController {
    return new SmartAgentsController();
}

// Default export
export default SmartAgentsController;
