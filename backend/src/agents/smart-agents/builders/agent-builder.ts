/**
 * Agent Builder
 *
 * Creates fully configured AI staff members including:
 * - Personality and voice settings
 * - Knowledge base integration
 * - Trigger configurations
 * - Response templates
 * - Operating schedules
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIStaffConfig } from '../types.js';
import { BrandBrain } from '../../../services/brand-scanner.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * AI Staff Templates
 */
export const STAFF_TEMPLATES: Record<string, Partial<AIStaffConfig>> = {
    receptionist: {
        name: 'AI Receptionist',
        role: 'receptionist',
        description: 'Handles inbound calls and messages, qualifies leads, books appointments',
        personality: {
            tone: 'friendly',
            style: 'helpful and professional',
            traits: ['patient', 'knowledgeable', 'efficient']
        },
        capabilities: {
            canSendSMS: true,
            canSendEmail: true,
            canBookAppointments: true,
            canTransferToHuman: true,
            canAccessCRM: true,
            canProcessPayments: false
        },
        triggers: [
            { type: 'inbound_call' },
            { type: 'inbound_sms' },
            { type: 'new_lead' }
        ]
    },
    missed_call_recovery: {
        name: 'Missed Call Recovery',
        role: 'recovery',
        description: 'Follows up on missed calls within 5 minutes to capture leads',
        personality: {
            tone: 'friendly',
            style: 'apologetic and helpful',
            traits: ['responsive', 'understanding', 'solution-oriented']
        },
        capabilities: {
            canSendSMS: true,
            canSendEmail: true,
            canBookAppointments: true,
            canTransferToHuman: true,
            canAccessCRM: true,
            canProcessPayments: false
        },
        triggers: [
            { type: 'missed_call' }
        ]
    },
    lead_qualifier: {
        name: 'Lead Qualifier',
        role: 'qualifier',
        description: 'Qualifies new leads based on criteria and routes to appropriate team',
        personality: {
            tone: 'professional',
            style: 'inquisitive but not pushy',
            traits: ['analytical', 'thorough', 'efficient']
        },
        capabilities: {
            canSendSMS: true,
            canSendEmail: true,
            canBookAppointments: false,
            canTransferToHuman: true,
            canAccessCRM: true,
            canProcessPayments: false
        },
        triggers: [
            { type: 'new_lead' },
            { type: 'tag_added', conditions: { tag: 'needs_qualification' } }
        ]
    },
    booking_assistant: {
        name: 'Booking Assistant',
        role: 'setter',
        description: 'Handles all appointment booking, rescheduling, and reminders',
        personality: {
            tone: 'professional',
            style: 'organized and accommodating',
            traits: ['punctual', 'detail-oriented', 'flexible']
        },
        capabilities: {
            canSendSMS: true,
            canSendEmail: true,
            canBookAppointments: true,
            canTransferToHuman: true,
            canAccessCRM: true,
            canProcessPayments: false
        },
        triggers: [
            { type: 'tag_added', conditions: { tag: 'wants_appointment' } },
            { type: 'scheduled', conditions: { event: 'appointment_reminder' } }
        ]
    },
    review_collector: {
        name: 'Review Collector',
        role: 'review',
        description: 'Requests and collects reviews from satisfied customers',
        personality: {
            tone: 'friendly',
            style: 'grateful and encouraging',
            traits: ['appreciative', 'persuasive', 'supportive']
        },
        capabilities: {
            canSendSMS: true,
            canSendEmail: true,
            canBookAppointments: false,
            canTransferToHuman: false,
            canAccessCRM: true,
            canProcessPayments: false
        },
        triggers: [
            { type: 'tag_added', conditions: { tag: 'completed_service' } },
            { type: 'scheduled', conditions: { event: 'review_request' } }
        ]
    },
    reengagement: {
        name: 'Re-engagement Agent',
        role: 'reengagement',
        description: 'Reaches out to dormant leads and past customers to reactivate',
        personality: {
            tone: 'friendly',
            style: 'warm and value-focused',
            traits: ['persistent', 'creative', 'empathetic']
        },
        capabilities: {
            canSendSMS: true,
            canSendEmail: true,
            canBookAppointments: true,
            canTransferToHuman: true,
            canAccessCRM: true,
            canProcessPayments: false
        },
        triggers: [
            { type: 'scheduled', conditions: { event: 'reengagement_campaign' } },
            { type: 'tag_added', conditions: { tag: 'dormant_lead' } }
        ]
    }
};

/**
 * Agent Builder Class
 */
export class AgentBuilder {
    private genAI: GoogleGenerativeAI | null = null;

    constructor() {
        if (GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        }
    }

    /**
     * Build a complete AI staff configuration
     */
    async buildAgent(params: {
        templateKey: keyof typeof STAFF_TEMPLATES;
        brandBrain: BrandBrain;
        customizations?: Partial<AIStaffConfig>;
    }): Promise<AIStaffConfig> {
        const template = STAFF_TEMPLATES[params.templateKey];
        if (!template) {
            throw new Error(`Unknown template: ${params.templateKey}`);
        }

        // Generate customized responses using AI
        const responses = await this.generateResponses(
            params.templateKey,
            params.brandBrain,
            template
        );

        // Build the complete configuration
        const config: AIStaffConfig = {
            id: `staff_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name: params.customizations?.name || template.name || 'AI Agent',
            role: template.role || 'assistant',
            description: template.description || '',

            personality: {
                ...template.personality,
                ...params.customizations?.personality
            } as AIStaffConfig['personality'],

            knowledge: {
                brandBrainId: params.brandBrain.domain,
                customInstructions: this.generateInstructions(params.brandBrain, template),
                faqs: params.brandBrain.faqs || [],
                doSay: params.brandBrain.do_say || [],
                dontSay: params.brandBrain.dont_say || []
            },

            capabilities: {
                ...template.capabilities,
                ...params.customizations?.capabilities
            } as AIStaffConfig['capabilities'],

            triggers: template.triggers || [],

            templates: {
                greeting: responses.greeting,
                fallback: responses.fallback,
                transferMessage: responses.transfer,
                afterHoursMessage: responses.afterHours
            },

            schedule: params.customizations?.schedule || {
                timezone: 'America/New_York',
                hours: {
                    monday: { start: '09:00', end: '17:00' },
                    tuesday: { start: '09:00', end: '17:00' },
                    wednesday: { start: '09:00', end: '17:00' },
                    thursday: { start: '09:00', end: '17:00' },
                    friday: { start: '09:00', end: '17:00' },
                    saturday: null,
                    sunday: null
                }
            }
        };

        return config;
    }

    /**
     * Generate brand-appropriate responses
     */
    private async generateResponses(
        role: string,
        brandBrain: BrandBrain,
        template: Partial<AIStaffConfig>
    ): Promise<{
        greeting: string;
        fallback: string;
        transfer: string;
        afterHours: string;
    }> {
        if (!this.genAI) {
            // Return default responses if no AI available
            return this.getDefaultResponses(brandBrain.brand_name, role);
        }

        try {
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: { responseMimeType: 'application/json' }
            });

            const prompt = `Generate response templates for an AI ${role} for "${brandBrain.brand_name}".

Brand Info:
- Industry: ${brandBrain.industry_niche}
- Services: ${brandBrain.key_services.join(', ')}
- Tone: ${JSON.stringify(brandBrain.tone_profile)}
- Do Say: ${brandBrain.do_say.join(', ')}
- Don't Say: ${brandBrain.dont_say.join(', ')}

Generate these templates:
1. greeting: First message when a lead reaches out
2. fallback: Response when AI doesn't understand
3. transfer: Message when transferring to human
4. afterHours: Message when contacted outside business hours

Make them sound natural, brand-appropriate, and helpful.

Return JSON:
{
  "greeting": "...",
  "fallback": "...",
  "transfer": "...",
  "afterHours": "..."
}`;

            const result = await model.generateContent(prompt);
            return JSON.parse(result.response.text());
        } catch (error) {
            console.error('[AgentBuilder] AI generation failed, using defaults');
            return this.getDefaultResponses(brandBrain.brand_name, role);
        }
    }

    /**
     * Get default responses
     */
    private getDefaultResponses(brandName: string, role: string): {
        greeting: string;
        fallback: string;
        transfer: string;
        afterHours: string;
    } {
        return {
            greeting: `Hi! Thanks for reaching out to ${brandName}. I'm your AI assistant and I'm here to help. How can I assist you today?`,
            fallback: `I want to make sure I understand correctly. Could you rephrase that or provide a bit more detail?`,
            transfer: `I'll connect you with a team member who can better assist with this. Please hold for just a moment.`,
            afterHours: `Thanks for contacting ${brandName}! We're currently outside business hours, but I've noted your message and someone will get back to you first thing tomorrow.`
        };
    }

    /**
     * Generate custom instructions for the agent
     */
    private generateInstructions(brandBrain: BrandBrain, template: Partial<AIStaffConfig>): string[] {
        const instructions: string[] = [
            `You represent ${brandBrain.brand_name}, a ${brandBrain.industry_niche} business.`,
            `Our main services include: ${brandBrain.key_services.join(', ')}.`,
            `We're located in ${brandBrain.geographic_location}.`,
            `Always maintain a ${template.personality?.tone || 'professional'} tone.`,
        ];

        if (template.role === 'receptionist') {
            instructions.push(
                'Your primary goal is to qualify leads and book appointments.',
                'Ask for contact information early in the conversation.',
                'If someone asks about pricing, provide ranges if available or offer to connect them with sales.'
            );
        }

        if (template.role === 'recovery') {
            instructions.push(
                'Apologize for missing their call and express eagerness to help.',
                'Respond within 5 minutes of a missed call.',
                'Offer to call them back or continue via text.'
            );
        }

        return instructions;
    }

    /**
     * Build multiple agents at once
     */
    async buildAgentTeam(params: {
        templateKeys: (keyof typeof STAFF_TEMPLATES)[];
        brandBrain: BrandBrain;
    }): Promise<AIStaffConfig[]> {
        const agents: AIStaffConfig[] = [];

        for (const key of params.templateKeys) {
            const agent = await this.buildAgent({
                templateKey: key,
                brandBrain: params.brandBrain
            });
            agents.push(agent);
        }

        return agents;
    }
}

/**
 * Create AgentBuilder instance
 */
export function createAgentBuilder(): AgentBuilder {
    return new AgentBuilder();
}

export default AgentBuilder;
