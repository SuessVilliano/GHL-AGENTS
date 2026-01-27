import { z } from 'zod';

/**
 * Action Plan Schema
 * Used by Operator for day-to-day operations
 */
export const ActionStepSchema = z.object({
    id: z.string(),
    tool: z.string(),
    input: z.record(z.any()),
    onError: z.enum(['halt_and_ask', 'continue', 'retry'])
});

export const ActionPlanSchema = z.object({
    type: z.literal('action_plan'),
    summary: z.string(),
    requiresConfirmation: z.boolean(),
    riskLevel: z.enum(['low', 'medium', 'high']),
    context: z.object({
        locationId: z.string().optional(),
        contactId: z.string().optional(),
        conversationId: z.string().optional(),
        opportunityId: z.string().optional(),
        sourceUrl: z.string().optional()
    }).optional(),
    steps: z.array(ActionStepSchema)
});

/**
 * Build Plan Schema
 * Used by Setup OS for onboarding/system building
 */
export const BuildPlanSchema = z.object({
    type: z.literal('build_plan'),
    summary: z.string(),
    requiresApproval: z.boolean(),
    businessProfile: z.object({
        niche: z.string(),
        offer: z.string(),
        geo: z.string(),
        brandVoice: z.string(),
        goals: z.array(z.string())
    }),
    assets: z.object({
        pipelines: z.array(z.string()),
        workflows: z.array(z.string()),
        emailSequences: z.array(z.string()),
        smsSequences: z.array(z.string()),
        pages: z.array(z.string())
    }),
    deployment: z.object({
        locationId: z.string(),
        mappingNeeded: z.array(z.string()),
        preflightChecks: z.array(z.string())
    })
});

/**
 * Clarifying Question Schema
 * Used when AI needs more information
 */
export const ClarifyingQuestionSchema = z.object({
    type: z.literal('clarifying_question'),
    question: z.string(),
    choices: z.array(z.string()).optional(),
    context: z.record(z.any()).optional()
});

/**
 * Union type for AI responses
 */
export const AIResponseSchema = z.discriminatedUnion('type', [
    ActionPlanSchema,
    BuildPlanSchema,
    ClarifyingQuestionSchema
]);

export type ActionStep = z.infer<typeof ActionStepSchema>;
export type ActionPlan = z.infer<typeof ActionPlanSchema>;
export type BuildPlan = z.infer<typeof BuildPlanSchema>;
export type ClarifyingQuestion = z.infer<typeof ClarifyingQuestionSchema>;
export type AIResponse = z.infer<typeof AIResponseSchema>;

/**
 * Page Context Schema
 * Detected from GHL pages by content script
 */
export const PageContextSchema = z.object({
    type: z.enum(['contact', 'conversation', 'opportunity', 'workflow', 'global']),
    locationId: z.string().optional(),
    contactId: z.string().optional(),
    contactName: z.string().optional(),
    conversationId: z.string().optional(),
    opportunityId: z.string().optional(),
    pipelineStage: z.string().optional(),
    url: z.string().optional()
});

export type PageContext = z.infer<typeof PageContextSchema>;
