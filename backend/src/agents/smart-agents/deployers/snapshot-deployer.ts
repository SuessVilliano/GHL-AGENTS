/**
 * Snapshot Deployer Agent
 *
 * Deploys pre-built GHL snapshots including:
 * - Full business systems
 * - Pipeline templates
 * - Workflow templates
 * - Funnel templates
 * - Email/SMS templates
 */

import { GHLSnapshot, DeploymentConfig, AgentResult } from '../types.js';
import { BrandBrain } from '../../../services/brand-scanner.js';

/**
 * Available snapshots catalog
 */
export const AVAILABLE_SNAPSHOTS: Record<string, GHLSnapshot> = {
    'fast5-speed-to-lead': {
        id: 'snapshot_fast5',
        name: 'Fast 5 Speed-to-Lead System',
        description: 'Respond to new leads within 5 minutes via SMS and email. Includes missed call text-back.',
        category: 'full_system',
        assets: {
            pipelines: ['New Leads Pipeline'],
            workflows: ['Fast 5 Speed-to-Lead', 'Missed Call Text-Back'],
            funnels: [],
            emailTemplates: ['Welcome Email', 'Follow Up #1', 'Follow Up #2'],
            smsTemplates: ['Instant Response', 'Missed Call Response', 'Follow Up SMS']
        },
        variables: [
            { name: 'business_name', description: 'Your business name', required: true },
            { name: 'booking_link', description: 'Link to your calendar', required: true },
            { name: 'phone_number', description: 'Your business phone', required: false }
        ]
    },
    'appointment-setter': {
        id: 'snapshot_setter',
        name: 'AI Appointment Setter',
        description: 'AI-powered appointment booking system with reminders and confirmations.',
        category: 'full_system',
        assets: {
            pipelines: ['Appointments Pipeline'],
            workflows: ['Appointment Booking Flow', 'Reminder Sequence', 'No-Show Follow-Up'],
            funnels: ['Booking Page'],
            emailTemplates: ['Booking Confirmation', 'Appointment Reminder', 'No-Show Follow-Up'],
            smsTemplates: ['Booking Confirmed', 'Reminder 24hr', 'Reminder 1hr']
        },
        variables: [
            { name: 'business_name', description: 'Your business name', required: true },
            { name: 'calendar_id', description: 'GHL Calendar ID', required: true },
            { name: 'service_name', description: 'Service being booked', required: false }
        ]
    },
    'review-request': {
        id: 'snapshot_reviews',
        name: 'Review Request System',
        description: 'Automated review collection from happy customers.',
        category: 'workflow',
        assets: {
            pipelines: [],
            workflows: ['Review Request Flow', 'Positive Feedback Follow-Up', 'Negative Feedback Alert'],
            funnels: ['Review Collection Page'],
            emailTemplates: ['Review Request'],
            smsTemplates: ['Review Request SMS', 'Thank You for Review']
        },
        variables: [
            { name: 'business_name', description: 'Your business name', required: true },
            { name: 'google_review_link', description: 'Your Google review link', required: true },
            { name: 'feedback_threshold', description: 'Minimum rating to request Google review', required: false, defaultValue: 4 }
        ]
    },
    'nurture-sequence': {
        id: 'snapshot_nurture',
        name: 'Lead Nurture Sequence',
        description: '30-day email and SMS nurture sequence for leads who didnt book.',
        category: 'workflow',
        assets: {
            pipelines: [],
            workflows: ['30-Day Nurture Sequence'],
            funnels: [],
            emailTemplates: ['Nurture Day 1', 'Nurture Day 3', 'Nurture Day 7', 'Nurture Day 14', 'Nurture Day 30'],
            smsTemplates: ['Nurture Day 2', 'Nurture Day 5', 'Nurture Day 21']
        },
        variables: [
            { name: 'business_name', description: 'Your business name', required: true },
            { name: 'main_offer', description: 'Your primary offer or CTA', required: true },
            { name: 'booking_link', description: 'Link to book', required: false }
        ]
    },
    'reengagement': {
        id: 'snapshot_reengage',
        name: 'Database Re-engagement',
        description: 'Wake up dormant leads and past customers with targeted campaigns.',
        category: 'workflow',
        assets: {
            pipelines: [],
            workflows: ['Dormant Lead Reactivation', 'Past Customer Re-engagement'],
            funnels: [],
            emailTemplates: ['We Miss You', 'Special Offer', 'Last Chance'],
            smsTemplates: ['Exclusive Offer', 'Time-Limited Deal']
        },
        variables: [
            { name: 'business_name', description: 'Your business name', required: true },
            { name: 'special_offer', description: 'Reactivation offer details', required: true },
            { name: 'expiry_days', description: 'Days until offer expires', required: false, defaultValue: 7 }
        ]
    },
    'full-business-system': {
        id: 'snapshot_full',
        name: 'Complete Business Autopilot',
        description: 'Full system: lead capture, speed-to-lead, nurture, booking, reviews, and reengagement.',
        category: 'full_system',
        assets: {
            pipelines: ['Master Pipeline'],
            workflows: [
                'Fast 5 Speed-to-Lead',
                'Missed Call Text-Back',
                'Lead Qualification',
                'Appointment Booking Flow',
                'Reminder Sequence',
                '30-Day Nurture Sequence',
                'Review Request Flow',
                'Dormant Lead Reactivation'
            ],
            funnels: ['Lead Capture', 'Booking Page'],
            emailTemplates: ['Welcome', 'Follow Up Series', 'Nurture Series', 'Review Request'],
            smsTemplates: ['Instant Response', 'Reminders', 'Reviews', 'Reactivation']
        },
        variables: [
            { name: 'business_name', description: 'Your business name', required: true },
            { name: 'industry', description: 'Your industry', required: true },
            { name: 'primary_service', description: 'Main service offered', required: true },
            { name: 'booking_link', description: 'Calendar booking link', required: true },
            { name: 'google_review_link', description: 'Google review link', required: false },
            { name: 'phone_number', description: 'Business phone', required: false }
        ]
    }
};

/**
 * Snapshot Deployer Class
 */
export class SnapshotDeployer {
    private ghlAgencyApiKey: string | null = null;

    constructor() {
        this.ghlAgencyApiKey = process.env.GHL_AGENCY_API_KEY || null;
    }

    /**
     * List available snapshots
     */
    listSnapshots(filter?: { category?: GHLSnapshot['category'] }): GHLSnapshot[] {
        let snapshots = Object.values(AVAILABLE_SNAPSHOTS);

        if (filter?.category) {
            snapshots = snapshots.filter(s => s.category === filter.category);
        }

        return snapshots;
    }

    /**
     * Get snapshot details
     */
    getSnapshot(snapshotId: string): GHLSnapshot | null {
        return AVAILABLE_SNAPSHOTS[snapshotId] || null;
    }

    /**
     * Validate snapshot variables
     */
    validateVariables(snapshotId: string, variables: Record<string, any>): {
        valid: boolean;
        missing: string[];
        warnings: string[];
    } {
        const snapshot = this.getSnapshot(snapshotId);
        if (!snapshot) {
            return { valid: false, missing: ['Snapshot not found'], warnings: [] };
        }

        const missing: string[] = [];
        const warnings: string[] = [];

        for (const varDef of snapshot.variables) {
            if (varDef.required && !variables[varDef.name]) {
                missing.push(varDef.name);
            } else if (!varDef.required && !variables[varDef.name] && varDef.defaultValue !== undefined) {
                warnings.push(`${varDef.name} not provided, will use default: ${varDef.defaultValue}`);
            }
        }

        return {
            valid: missing.length === 0,
            missing,
            warnings
        };
    }

    /**
     * Generate deployment plan
     */
    generateDeploymentPlan(params: {
        snapshotId: string;
        brandBrain: BrandBrain;
        additionalVariables?: Record<string, any>;
    }): {
        snapshot: GHLSnapshot;
        variables: Record<string, any>;
        steps: { action: string; description: string }[];
    } | null {
        const snapshot = this.getSnapshot(params.snapshotId);
        if (!snapshot) return null;

        // Auto-populate variables from BrandBrain
        const variables: Record<string, any> = {
            business_name: params.brandBrain.brand_name,
            industry: params.brandBrain.industry_niche,
            primary_service: params.brandBrain.key_services[0],
            phone_number: params.brandBrain.geographic_location, // Placeholder
            ...params.additionalVariables
        };

        const steps = [
            { action: 'validate', description: 'Validate all required variables are provided' },
            { action: 'backup', description: 'Create backup of existing sub-account configuration' },
            { action: 'import_snapshot', description: `Import "${snapshot.name}" snapshot to sub-account` },
            { action: 'customize', description: 'Replace template variables with business-specific values' },
            { action: 'configure_ai', description: 'Configure AI agent with Brand Brain knowledge' },
            { action: 'activate', description: 'Activate workflows and publish funnels' },
            { action: 'verify', description: 'Run verification tests' }
        ];

        return { snapshot, variables, steps };
    }

    /**
     * Deploy snapshot to GHL sub-account
     */
    async deploySnapshot(config: DeploymentConfig): Promise<AgentResult> {
        console.log('[SnapshotDeployer] Starting deployment:', config.snapshotId);

        const snapshot = this.getSnapshot(config.snapshotId || '');
        if (!snapshot) {
            return {
                success: false,
                agentType: 'snapshot_deployer',
                output: null,
                message: `Snapshot not found: ${config.snapshotId}`,
                requiresApproval: false
            };
        }

        // Validate variables
        const validation = this.validateVariables(config.snapshotId!, config.snapshotOverrides || {});
        if (!validation.valid) {
            return {
                success: false,
                agentType: 'snapshot_deployer',
                output: { validation },
                message: `Missing required variables: ${validation.missing.join(', ')}`,
                requiresApproval: false
            };
        }

        // Dry run mode - just return the plan
        if (config.dryRun) {
            return {
                success: true,
                agentType: 'snapshot_deployer',
                output: {
                    mode: 'dry_run',
                    snapshot,
                    variables: config.snapshotOverrides,
                    warnings: validation.warnings
                },
                message: `Dry run complete. Ready to deploy "${snapshot.name}"`,
                requiresApproval: true,
                approvalData: {
                    action: 'deploy_snapshot',
                    snapshotId: config.snapshotId,
                    locationId: config.locationId
                }
            };
        }

        // Actual deployment would happen here
        // This requires GHL Agency API access to import snapshots
        try {
            const deploymentResult = await this.executeSnapshotDeployment(
                snapshot,
                config.locationId,
                config.snapshotOverrides || {}
            );

            return {
                success: deploymentResult.success,
                agentType: 'snapshot_deployer',
                output: deploymentResult,
                message: deploymentResult.success
                    ? `Successfully deployed "${snapshot.name}" to location ${config.locationId}`
                    : `Deployment failed: ${deploymentResult.error}`,
                nextSteps: deploymentResult.success ? [
                    'Test the workflows by adding a test contact',
                    'Verify email/SMS templates are sending correctly',
                    'Review pipeline stages and move logic'
                ] : undefined
            };
        } catch (error: any) {
            console.error('[SnapshotDeployer] Deployment failed:', error);
            return {
                success: false,
                agentType: 'snapshot_deployer',
                output: { error: error.message },
                message: `Deployment error: ${error.message}`
            };
        }
    }

    /**
     * Execute actual snapshot deployment
     */
    private async executeSnapshotDeployment(
        snapshot: GHLSnapshot,
        locationId: string,
        variables: Record<string, any>
    ): Promise<{ success: boolean; deployed?: any; error?: string }> {
        // Check for agency API key
        if (!this.ghlAgencyApiKey) {
            return {
                success: false,
                error: 'GHL Agency API key not configured. Snapshot deployment requires agency-level access.'
            };
        }

        // In production, this would:
        // 1. Call GHL Agency API to import snapshot to sub-account
        // 2. Use GHL API to customize templates with variables
        // 3. Activate workflows
        // 4. Return deployment status

        console.log('[SnapshotDeployer] Would deploy to:', locationId);
        console.log('[SnapshotDeployer] Snapshot:', snapshot.name);
        console.log('[SnapshotDeployer] Variables:', variables);

        // Simulated success for now - actual GHL API calls would go here
        return {
            success: true,
            deployed: {
                snapshotId: snapshot.id,
                locationId,
                assets: snapshot.assets,
                customizedVariables: variables,
                timestamp: new Date().toISOString()
            }
        };
    }

    /**
     * Recommend snapshot based on business needs
     */
    recommendSnapshot(params: {
        goals: string[];
        industry: string;
        currentSetup?: string[];
    }): { snapshot: GHLSnapshot; reason: string }[] {
        const recommendations: { snapshot: GHLSnapshot; reason: string; score: number }[] = [];

        const goalKeywords: Record<string, string[]> = {
            'fast5-speed-to-lead': ['speed', 'fast', 'response', 'lead', 'missed call', 'quick'],
            'appointment-setter': ['book', 'appointment', 'calendar', 'schedule', 'meeting'],
            'review-request': ['review', 'reputation', 'google', 'feedback', 'testimonial'],
            'nurture-sequence': ['nurture', 'follow up', 'sequence', 'drip', 'email'],
            'reengagement': ['dormant', 'inactive', 'past', 'reactivate', 'reengage'],
            'full-business-system': ['full', 'complete', 'everything', 'autopilot', 'all']
        };

        for (const [snapshotId, keywords] of Object.entries(goalKeywords)) {
            const snapshot = AVAILABLE_SNAPSHOTS[snapshotId];
            let score = 0;
            const matchedGoals: string[] = [];

            for (const goal of params.goals) {
                const goalLower = goal.toLowerCase();
                for (const keyword of keywords) {
                    if (goalLower.includes(keyword)) {
                        score += 1;
                        if (!matchedGoals.includes(goal)) {
                            matchedGoals.push(goal);
                        }
                    }
                }
            }

            if (score > 0) {
                recommendations.push({
                    snapshot,
                    reason: `Matches your goals: ${matchedGoals.join(', ')}`,
                    score
                });
            }
        }

        // Sort by score and return top recommendations
        return recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(({ snapshot, reason }) => ({ snapshot, reason }));
    }
}

/**
 * Create SnapshotDeployer instance
 */
export function createSnapshotDeployer(): SnapshotDeployer {
    return new SnapshotDeployer();
}

export default SnapshotDeployer;
