import { GoogleGenerativeAI } from '@google/generative-ai';
import { BrandBrain } from './brand-scanner.js';
import { mcpClient } from './mcp-client.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export interface BuildPlan {
    type: 'build_plan';
    summary: string;
    requiresApproval: boolean;
    aeo_score: { score: number; impact: string };
    businessProfile: {
        niche: string;
        offer: string;
        geo: string;
        brandVoice: string;
        goals: string[];
    };
    aiStaff: {
        role: string;
        configuration: string;
    }[];
    assets: {
        pipelines: { name: string; stages: string[] }[];
        workflows: { name: string; description: string; trigger: string }[];
        emailSequences: { name: string; emails: number; purpose: string }[];
        smsSequences: { name: string; messages: number; purpose: string }[];
        pages: { name: string; type: string; purpose: string }[];
    };
    deployment: {
        locationId: string;
        estimatedTime: string;
        preflightChecks: string[];
    };
}

/**
 * Snapshot Builder Service
 * Generates complete GHL business systems from brand identity
 */
export const snapshotBuilder = {
    /**
     * Generate a comprehensive Build Plan from brand brain
     */
    async generateBuildPlan(
        brandBrain: BrandBrain,
        selectedStaff: string[],
        goals: string[],
        locationId: string
    ): Promise<BuildPlan> {
        if (!GEMINI_API_KEY) {
            // Return mock build plan if no API key
            return this.getMockBuildPlan(brandBrain, selectedStaff, goals, locationId);
        }

        try {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: {
                    responseMimeType: 'application/json'
                }
            });

            const prompt = `Generate a complete GoHighLevel business system setup plan:

**Brand Identity:**
- Name: ${brandBrain.brand_name}
- Niche: ${brandBrain.industry_niche}
- Services: ${brandBrain.key_services.join(', ')}
- Location: ${brandBrain.geographic_location}
- Voice: Professional ${brandBrain.tone_profile.professional}, Friendly ${brandBrain.tone_profile.friendly}, Direct ${brandBrain.tone_profile.direct}

**Selected AI Staff:**
${selectedStaff.join(', ')}

**Business Goals:**
${goals.join(', ')}

**Create a complete business system with:**

1. **Pipelines** (4-6 stages matching the business type)
   - Name each pipeline and its stages

2. **Workflows** (one for each AI staff + essential automation)
   - Fast 5 (Speed to Lead - <5min response)
   - One workflow per AI staff role
   - Include triggers and key actions

3. **Email Sequences**
   - Welcome series
   - Nurture sequences
   - Re-engagement campaigns

4. **SMS Sequences**
   - Instant lead response
   - Appointment reminders
   - Follow-ups

5. **Landing Pages/Funnels**
   - Main service page
   - Offer-specific pages
   - Thank you pages

Optimize for Answer Engine Optimization (AEO) using the FAQs and keywords.

Return detailed JSON matching the BuildPlan schema.`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const parsed = JSON.parse(responseText) as any;

            // Construct full BuildPlan
            const buildPlan: BuildPlan = {
                type: 'build_plan',
                summary: `Complete ${brandBrain.industry_niche} system for ${brandBrain.brand_name} with ${selectedStaff.length} AI staff members`,
                requiresApproval: true,
                aeo_score: {
                    score: 85,
                    impact: 'High (+45 points with AI staff and AEO optimization)'
                },
                businessProfile: {
                    niche: brandBrain.industry_niche,
                    offer: brandBrain.primary_offer,
                    geo: brandBrain.geographic_location,
                    brandVoice: `Professional (${Math.round(brandBrain.tone_profile.professional * 100)}%)`,
                    goals
                },
                aiStaff: selectedStaff.map(role => ({
                    role,
                    configuration: `Configured with ${brandBrain.brand_name} brand voice and FAQs`
                })),
                assets: parsed.assets || this.getDefaultAssets(brandBrain, selectedStaff),
                deployment: {
                    locationId,
                    estimatedTime: '5-10 minutes',
                    preflightChecks: [
                        'Verify GHL location access',
                        'Confirm Brand Brain uploaded',
                        'Test AI staff configurations'
                    ]
                }
            };

            return buildPlan;

        } catch (error: any) {
            console.error('[Snapshot Builder] Error:', error.message);
            return this.getMockBuildPlan(brandBrain, selectedStaff, goals, locationId);
        }
    },

    /**
     * Deploy Build Plan to GHL location
     */
    async deployBuildPlan(
        buildPlan: BuildPlan,
        locationId: string,
        ghlToken: string
    ): Promise<{ success: boolean; deployed: any; errors: any[] }> {
        const deployed: any = {};
        const errors: any[] = [];

        try {
            // 1. Create Pipelines
            console.log('[Deploy] Creating pipelines...');
            deployed.pipelines = [];
            for (const pipeline of buildPlan.assets.pipelines) {
                try {
                    const result = await mcpClient.callTool(
                        'ghl_create_pipeline',
                        {
                            name: pipeline.name,
                            stages: pipeline.stages
                        },
                        ghlToken,
                        locationId
                    );
                    deployed.pipelines.push(result);
                } catch (err: any) {
                    errors.push({ step: 'create_pipeline', pipeline: pipeline.name, error: err.message });
                }
            }

            // 2. Create Workflows
            console.log('[Deploy] Creating workflows...');
            deployed.workflows = [];
            for (const workflow of buildPlan.assets.workflows) {
                try {
                    const result = await mcpClient.callTool(
                        'ghl_create_workflow',
                        {
                            name: workflow.name,
                            trigger: workflow.trigger,
                            description: workflow.description
                        },
                        ghlToken,
                        locationId
                    );
                    deployed.workflows.push(result);
                } catch (err: any) {
                    errors.push({ step: 'create_workflow', workflow: workflow.name, error: err.message });
                }
            }

            // Note: Email sequences, SMS sequences, and pages would be created similarly
            // For now, marking as planned

            console.log(`[Deploy] Completed with ${errors.length} errors`);

            return {
                success: errors.length === 0,
                deployed,
                errors
            };

        } catch (error: any) {
            console.error('[Deploy] Critical error:', error);
            return {
                success: false,
                deployed,
                errors: [{ step: 'deployment', error: error.message }]
            };
        }
    },

    /**
     * Default assets template
     */
    getDefaultAssets(brandBrain: BrandBrain, selectedStaff: string[]) {
        return {
            pipelines: [
                {
                    name: 'New Leads',
                    stages: ['New', 'Contacted', 'Qualified', 'Booked', 'Sold', 'Lost']
                }
            ],
            workflows: [
                {
                    name: 'Fast 5 - Speed to Lead',
                    description: 'Respond to new leads in under 5 minutes',
                    trigger: 'New contact created'
                },
                ...selectedStaff.map(staff => ({
                    name: `${staff} Automation`,
                    description: `Automated ${staff.toLowerCase()} workflow`,
                    trigger: 'Tag added or specific event'
                }))
            ],
            emailSequences: [
                { name: 'Welcome Series', emails: 3, purpose: 'Onboard new leads' },
                { name: 'Nurture Campaign', emails: 5, purpose: 'Build relationship over 30 days' }
            ],
            smsSequences: [
                { name: 'Instant Response', messages: 1, purpose: 'Immediate lead acknowledgment' },
                { name: 'Appointment Reminders', messages: 3, purpose: '72hr, 24hr, 2hr reminders' }
            ],
            pages: [
                { name: `${brandBrain.brand_name} - Main Landing Page`, type: 'landing', purpose: 'Primary lead capture' },
                { name: 'Free Consultation Offer', type: 'offer', purpose: 'Lead magnet' },
                { name: 'Thank You', type: 'confirmation', purpose: 'Post-booking confirmation' }
            ]
        };
    },

    /**
     * Mock build plan for fallback
     */
    getMockBuildPlan(brandBrain: BrandBrain, selectedStaff: string[], goals: string[], locationId: string): BuildPlan {
        return {
            type: 'build_plan',
            summary: `Complete ${brandBrain.industry_niche} system for ${brandBrain.brand_name}`,
            requiresApproval: true,
            aeo_score: { score: 75, impact: 'High' },
            businessProfile: {
                niche: brandBrain.industry_niche,
                offer: brandBrain.primary_offer,
                geo: brandBrain.geographic_location,
                brandVoice: 'Professional',
                goals
            },
            aiStaff: selectedStaff.map(role => ({
                role,
                configuration: 'Configured with brand voice'
            })),
            assets: this.getDefaultAssets(brandBrain, selectedStaff),
            deployment: {
                locationId,
                estimatedTime: '5-10 minutes',
                preflightChecks: ['Verify access', 'Upload Brand Brain']
            }
        };
    }
};
