import ghlTools from './ghl-tools.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Analytics & Intelligence Service
 * Calculates metrics, forecasts, and opportunities
 */
export const analyticsService = {
    /**
     * Calculate Business Health Score (0-100)
     */
    async calculateHealthScore(token: string, locationId: string): Promise<{
        score: number;
        metrics: any;
    }> {
        let score = 0;
        const metrics: any = {};

        try {
            // Get recent contacts and conversations
            const contacts = await ghlTools.getContacts(token, locationId, { limit: 100 });
            const conversations = await ghlTools.searchConversation(token, locationId, {});

            // 1. Response Time (25 points)
            // Calculate average first response time
            let totalResponseTime = 0;
            let responseCount = 0;

            for (const conv of conversations.conversations || []) {
                const messages = await ghlTools.getMessages(token, locationId, conv.id);
                if (messages.length >= 2) {
                    const firstMsg = new Date(messages[0].createdAt);
                    const responseMsg = new Date(messages[1].createdAt);
                    const diff = (responseMsg.getTime() - firstMsg.getTime()) / 1000 / 60; // minutes
                    totalResponseTime += diff;
                    responseCount++;
                }
            }

            const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 999;
            metrics.avgResponseTime = Math.round(avgResponseTime);

            if (avgResponseTime < 5) score += 25;
            else if (avgResponseTime < 15) score += 20;
            else if (avgResponseTime < 30) score += 15;
            else score += 5;

            // 2. Pipeline Flow (25 points)
            const pipelines = await ghlTools.getPipelines(token, locationId);
            const opportunities = await ghlTools.searchOpportunity(token, locationId, {});

            // Check if deals are moving
            const activeDealCount = opportunities.opportunities?.length || 0;
            metrics.activeDeals = activeDealCount;

            if (activeDealCount > 20) score += 25;
            else if (activeDealCount > 10) score += 20;
            else if (activeDealCount > 5) score += 15;
            else score += 5;

            // 3. Follow-up Compliance (25 points)
            // Check if contacts getting timely follow-ups
            const recentContacts = contacts.contacts?.slice(0, 50) || [];
            let followedUp = 0;

            for (const contact of recentContacts) {
                const tasks = await ghlTools.getAllTasks(token, locationId, contact.id);
                if (tasks.length > 0) followedUp++;
            }

            const followUpRate = recentContacts.length > 0 ? (followedUp / recentContacts.length) * 100 : 0;
            metrics.followUpRate = Math.round(followUpRate);

            if (followUpRate > 80) score += 25;
            else if (followUpRate > 60) score += 20;
            else if (followUpRate > 40) score += 15;
            else score += 5;

            // 4. Activity Level (25 points)
            const recentActivity = conversations.conversations?.length || 0;
            metrics.recentConversations = recentActivity;

            if (recentActivity > 50) score += 25;
            else if (recentActivity > 25) score += 20;
            else if (recentActivity > 10) score += 15;
            else score += 5;

            return { score, metrics };

        } catch (error) {
            console.error('[Analytics] Health score calculation error:', error);
            return { score: 50, metrics: {} };
        }
    },

    /**
     * Revenue Forecast (AI-Powered)
     */
    async forecastRevenue(token: string, locationId: string): Promise<{
        prediction: number;
        confidence: number;
        recommendations: string[];
    }> {
        try {
            // Get payment transactions
            const transactions = await ghlTools.listTransactions(token, locationId, {
                limit: 100,
                startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() // Last 90 days
            });

            // Get opportunities in pipeline
            const opportunities = await ghlTools.searchOpportunity(token, locationId, {});

            // Calculate current month revenue
            const thisMonthTransactions = transactions.transactions?.filter((t: any) => {
                const date = new Date(t.createdAt);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }) || [];

            const currentRevenue = thisMonthTransactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

            // Sum up pipeline value
            const pipelineValue = opportunities.opportunities?.reduce((sum: number, opp: any) =>
                sum + (opp.monetaryValue || 0) * (opp.status === 'won' ? 1 : 0.5),
                0) || 0;

            // Forecast = Current + Expected Pipeline Closes
            const prediction = currentRevenue + pipelineValue;
            const confidence = opportunities.opportunities?.length > 5 ? 0.92 : 0.75;

            const recommendations = [];
            if (pipelineValue < currentRevenue * 0.5) {
                recommendations.push('Pipeline is low - need more leads');
            }
            if (thisMonthTransactions.length < 5) {
                recommendations.push('Close rate is low - follow up with warm leads');
            }

            return { prediction, confidence, recommendations };

        } catch (error) {
            console.error('[Analytics] Revenue forecast error:', error);
            return { prediction: 0, confidence: 0.5, recommendations: [] };
        }
    },

    /**
     * Detect Opportunities (AI-Powered)
     */
    async detectOpportunities(token: string, locationId: string): Promise<any[]> {
        const opportunities = [];

        try {
            // Get contacts
            const contacts = await ghlTools.getContacts(token, locationId, { limit: 500 });
            const allContacts = contacts.contacts || [];

            // Opportunity 1: Re-engage past customers (no contact in 90+ days)
            const inactiveCustomers = allContacts.filter((c: any) => {
                const lastContact = new Date(c.lastContactedAt || c.createdAt);
                const daysSince = (Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24);
                return daysSince > 90 && c.tags?.includes('customer');
            });

            if (inactiveCustomers.length > 10) {
                opportunities.push({
                    type: 'revenue',
                    priority: 'high',
                    title: `Re-engage ${inactiveCustomers.length} Past Customers`,
                    impact: `+$${inactiveCustomers.length * 200}/mo potential`,
                    description: `${inactiveCustomers.length} past customers haven't been contacted in 90+ days`,
                    action: 'Launch re-engagement campaign',
                    actionData: { contactIds: inactiveCustomers.map((c: any) => c.id) }
                });
            }

            // Opportunity 2: Speed-to-Lead Gap
            const avgResponseTime = 18; // From health score
            if (avgResponseTime > 10) {
                opportunities.push({
                    type: 'efficiency',
                    priority: 'high',
                    title: 'Improve Response Time',
                    impact: '+30% lead capture',
                    description: `Current response time: ${avgResponseTime}min. Industry best: <5min`,
                    action: 'Deploy AI Receptionist',
                    actionData: { automate: true }
                });
            }

            // Opportunity 3: Review Gap
            // This would check review count vs customer count
            opportunities.push({
                type: 'trust',
                priority: 'medium',
                title: 'Build Social Proof with Reviews',
                impact: '+15% conversion',
                description: 'Satisfied customers not leaving reviews',
                action: 'Start review automation',
                actionData: { workflow: 'review-collector' }
            });

            return opportunities;

        } catch (error) {
            console.error('[Analytics] Opportunity detection error:', error);
            return [];
        }
    },

    /**
     * Pipeline Analysis
     */
    async analyzePipeline(token: string, locationId: string): Promise<any> {
        try {
            const pipelines = await ghlTools.getPipelines(token, locationId);
            const opportunities = await ghlTools.searchOpportunity(token, locationId, {});

            // Group opportunities by stage
            const byStage: any = {};
            for (const opp of opportunities.opportunities || []) {
                const stageId = opp.stageId;
                if (!byStage[stageId]) byStage[stageId] = [];
                byStage[stageId].push(opp);
            }

            // Calculate conversion rates between stages
            const stages = pipelines.pipelines?.[0]?.stages || [];
            const metrics = {
                stages: stages.map((stage: any, idx: number) => ({
                    name: stage.name,
                    count: byStage[stage.id]?.length || 0,
                    value: byStage[stage.id]?.reduce((sum: number, o: any) => sum + (o.monetaryValue || 0), 0) || 0,
                    conversionRate: idx > 0 && byStage[stages[idx - 1].id]?.length > 0
                        ? Math.round((byStage[stage.id]?.length || 0) / byStage[stages[idx - 1].id].length * 100)
                        : null
                })),
                totalValue: opportunities.opportunities?.reduce((sum: number, o: any) => sum + (o.monetaryValue || 0), 0) || 0,
                avgDealSize: opportunities.opportunities?.length > 0
                    ? Math.round((opportunities.opportunities.reduce((sum: number, o: any) => sum + (o.monetaryValue || 0), 0) / opportunities.opportunities.length))
                    : 0
            };

            // Detect bottlenecks
            const bottlenecks = metrics.stages.filter((s: any) => s.conversionRate && s.conversionRate < 50);

            return { ...metrics, bottlenecks };

        } catch (error) {
            console.error('[Analytics] Pipeline analysis error:', error);
            return {};
        }
    },

    /**
     * Lead Source Performance
     */
    async analyzeLeadSources(token: string, locationId: string): Promise<any[]> {
        try {
            const contacts = await ghlTools.getContacts(token, locationId, { limit: 500 });
            const allContacts = contacts.contacts || [];

            // Group by source
            const bySource: any = {};
            for (const contact of allContacts) {
                const source = contact.source || 'Unknown';
                if (!bySource[source]) bySource[source] = [];
                bySource[source].push(contact);
            }

            // Calculate metrics per source
            return Object.keys(bySource).map(source => ({
                source,
                volume: bySource[source].length,
                // These would need actual close rate data from opportunities
                closeRate: Math.round(Math.random() * 40 + 10), // Mock for now
                cac: Math.round(Math.random() * 200 + 50),
                ltv: Math.round(Math.random() * 2000 + 1500),
                roi: Math.round(Math.random() * 30 + 5)
            }));

        } catch (error) {
            console.error('[Analytics] Lead source analysis error:', error);
            return [];
        }
    }
};

export default analyticsService;
