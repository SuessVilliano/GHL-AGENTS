import { TASKMAGIC_WEBHOOK_URL } from '../constants';

export interface OnboardingPayload {
    locationId: string;
    agencyName: string;
    clientEmail: string;
    domain: string;
    selectedRoles: string[];
    timestamp: number;
}

export const automationService = {
    /**
     * Trigger the TaskMagic deep onboarding workflow
     */
    async triggerDeepSync(payload: OnboardingPayload): Promise<any> {
        console.log("[Neuro-Automation] Initiating TaskMagic Deep Sync:", payload);

        try {
            const response = await fetch(TASKMAGIC_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...payload,
                    event_type: 'liv8_deep_onboarding',
                    source: 'chrome_extension'
                })
            });

            if (!response.ok) {
                throw new Error(`Automation Sync Failed: ${response.statusText}`);
            }

            const result = await response.json();
            console.log("[Neuro-Automation] Deep Sync Success:", result);
            return result;
        } catch (err: any) {
            console.error("[Neuro-Automation] Critical fault in external sync:", err);
            // We don't block the user but we log it
            throw err;
        }
    }
};
