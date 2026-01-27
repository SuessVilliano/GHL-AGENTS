import { TASKMAGIC_WEBHOOK_URL, TASKMAGIC_MCP_TOKEN } from '../constants';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.liv8ai.com';

export interface OnboardingPayload {
    locationId: string;
    agencyName: string;
    clientEmail: string;
    domain: string;
    selectedRoles: string[];
    timestamp: number;
}

/**
 * Automation Service
 * Routes through backend when possible, falls back to direct webhook
 */
export const automationService = {
    /**
     * Trigger the TaskMagic deep onboarding workflow via backend
     */
    async triggerDeepSync(payload: OnboardingPayload): Promise<any> {
        console.log("[Neuro-Automation] Initiating TaskMagic Deep Sync:", payload);

        const token = localStorage.getItem('liv8_jwt');

        // Prefer backend API for security and audit logging
        if (token) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/taskmagic/onboarding`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log("[Neuro-Automation] Deep Sync Success (via backend):", result);
                    return result;
                }
            } catch (err) {
                console.warn("[Neuro-Automation] Backend unavailable, falling back to direct webhook");
            }
        }

        // Fallback to direct webhook if backend unavailable or not authenticated
        if (!TASKMAGIC_WEBHOOK_URL) {
            console.warn("[Neuro-Automation] TaskMagic not configured");
            return { success: false, message: 'TaskMagic webhook not configured' };
        }

        try {
            const response = await fetch(TASKMAGIC_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(TASKMAGIC_MCP_TOKEN && { 'Authorization': `Bearer ${TASKMAGIC_MCP_TOKEN}` })
                },
                body: JSON.stringify({
                    ...payload,
                    event_type: 'liv8_deep_onboarding',
                    source: 'dashboard_standalone'
                })
            });

            if (!response.ok) {
                throw new Error(`Automation Sync Failed: ${response.statusText}`);
            }

            const result = await response.json();
            console.log("[Neuro-Automation] Deep Sync Success (direct):", result);
            return result;
        } catch (err: any) {
            console.error("[Neuro-Automation] Critical fault in external sync:", err);
            throw err;
        }
    },

    /**
     * Trigger a custom TaskMagic automation
     */
    async triggerCustomAutomation(eventType: string, locationId: string, data: Record<string, any>): Promise<any> {
        const token = localStorage.getItem('liv8_jwt');

        if (token) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/taskmagic/trigger`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ eventType, locationId, data })
                });

                if (response.ok) {
                    return await response.json();
                }
            } catch (err) {
                console.warn("[Neuro-Automation] Backend unavailable for custom automation");
            }
        }

        return { success: false, message: 'Not authenticated or backend unavailable' };
    }
};
