// Backend API Configuration
export const getBackendUrl = () => {
    // Use environment variable if available, otherwise default to local
    if (typeof process !== 'undefined' && process.env && process.env.BACKEND_URL) {
        return process.env.BACKEND_URL;
    }

    // In production, use Vercel/Custom deployment
    // In development, use localhost
    return import.meta.env.VITE_BACKEND_URL || 'https://os.liv8ai.com';
};

export const BACKEND_URL = getBackendUrl();

/**
 * Get session token from storage
 */
export const getSessionToken = async (): Promise<string | null> => {
    const result = await chrome.storage.local.get(['sessionToken']);
    return result.sessionToken || null;
};

/**
 * Save session token to storage
 */
export const saveSessionToken = async (token: string): Promise<void> => {
    await chrome.storage.local.set({ sessionToken: token });
};

/**
 * Remove session token (logout)
 */
export const clearSessionToken = async (): Promise<void> => {
    await chrome.storage.local.remove(['sessionToken', 'user']);
};

/**
 * Get current user from storage
 */
export const getCurrentUser = async (): Promise<any> => {
    const result = await chrome.storage.local.get(['user']);
    return result.user || null;
};

/**
 * Save user to storage
 */
export const saveUser = async (user: any): Promise<void> => {
    await chrome.storage.local.set({ user });
};

/**
 * API call helper with auth and neuro-diagnostics
 */
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getSessionToken();
    const url = `${BACKEND_URL}${endpoint}`;

    console.log(`[Neuro] Fetching: ${url}`, { method: options.method || 'GET' });

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            mode: 'cors',
            credentials: 'omit', // Avoid cookie issues in sidepanels
            referrerPolicy: 'no-referrer'
        });

        if (!response.ok) {
            let errorMsg = `API Error ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.error || errorMsg;
            } catch (e) {
                // Not JSON
            }
            console.error(`[Neuro] Request failed: ${errorMsg}`);
            throw new Error(errorMsg);
        }

        const data = await response.json();
        console.log(`[Neuro] Success: ${endpoint}`);
        return data;

    } catch (err: any) {
        console.error(`[Neuro] Connectivity breakdown:`, err);
        if (err.message === 'Failed to fetch') {
            throw new Error("Target core unreachable. Ensure the backend is active at " + BACKEND_URL);
        }
        throw err;
    }
};

/**
 * Generate a simple hash from a string (for deriving password from token)
 */
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36) + str.slice(-8);
}

/**
 * Authentication API
 */
export const auth = {
    async login(email: string, password: string) {
        const result = await apiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        await saveSessionToken(result.token);
        await saveUser(result.user);

        return result;
    },

    async register(email: string, password: string, agencyName: string) {
        const result = await apiCall('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, agencyName })
        });

        await saveSessionToken(result.token);
        await saveUser(result.user);

        return result;
    },

    async connectLocation(locationId: string, locationName: string, ghlToken: string) {
        return apiCall('/api/auth/connect-location', {
            method: 'POST',
            body: JSON.stringify({ locationId, locationName, ghlToken })
        });
    },

    /**
     * Auto-authenticate and connect location
     * Creates account if needed, logs in if exists, then connects location
     */
    async autoConnectLocation(locationId: string, ghlToken: string, locationName?: string): Promise<boolean> {
        // Generate deterministic credentials from location ID
        const email = `loc_${locationId}@liv8.auto`;
        const password = simpleHash(ghlToken);
        const agencyName = locationName || `Agency ${locationId.slice(0, 8)}`;

        try {
            // Try to login first (account might already exist)
            try {
                await this.login(email, password);
                console.log('[Auth] Logged into existing account');
            } catch (loginErr: any) {
                // If login fails, try to register
                if (loginErr.message?.includes('Invalid') || loginErr.message?.includes('not found')) {
                    await this.register(email, password, agencyName);
                    console.log('[Auth] Created new account');
                } else {
                    throw loginErr;
                }
            }

            // Now connect the location
            await this.connectLocation(locationId, locationName || 'GHL Location', ghlToken);
            console.log('[Auth] Location connected to backend');

            return true;
        } catch (error: any) {
            console.error('[Auth] Auto-connect failed:', error.message);
            return false;
        }
    },

    async getMe() {
        return apiCall('/api/auth/me');
    },

    async logout() {
        await clearSessionToken();
    }
};

/**
 * Operator API
 */
export const operator = {
    async executePlan(plan: any, context: any) {
        return apiCall('/api/operator/execute-plan', {
            method: 'POST',
            body: JSON.stringify({ plan, context })
        });
    },

    async getAuditLog(limit: number = 100) {
        return apiCall(`/api/operator/audit-log?limit=${limit}`);
    }
};

/**
 * Support & Feedback API
 */
/**
 * Support & Feedback API
 */
export const support = {
    async sendFeedback(details: {
        type: 'bug' | 'feedback' | 'escalation',
        message: string,
        context?: any
    }) {
        // Import constant dynamically to avoid circular dependencies if any
        const { FEEDBACK_WEBHOOK_URL } = await import('../constants');

        console.log(`[Neuro] Dispatching Support Feedback to Webhook...`);

        const response = await fetch(FEEDBACK_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...details,
                timestamp: new Date().toISOString(),
                source: 'LIV8-OS-EXTENSION'
            })
        });

        if (!response.ok) throw new Error("Support Dispatch Failed");
        return { success: true };
    }
};

/**
 * Direct GHL Neural Bridge
 * Fetches real data using local storage credentials if available
 */
export const ghl = {
    _getAuthHeaders: () => {
        const apiKey = localStorage.getItem('os_api_key');
        const locId = localStorage.getItem('os_loc_id');
        if (!apiKey) throw new Error("GHL Neural Link inactive. Please connect API Key.");
        return {
            'Authorization': `Bearer ${apiKey}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json'
        };
    },

    async searchContacts(query: string) {
        try {
            const headers = ghl._getAuthHeaders();
            const response = await fetch(`https://services.leadconnectorhq.com/contacts/?locationId=${localStorage.getItem('os_loc_id')}&query=${query}`, {
                headers
            });
            return await response.json();
        } catch (e) {
            console.warn("GHL Contact Sync interrupted:", e);
            throw e;
        }
    },

    async getOpportunities(status: 'open' | 'won' | 'lost' | 'all' = 'open') {
        try {
            const headers = ghl._getAuthHeaders();
            const response = await fetch(`https://services.leadconnectorhq.com/opportunities/search?location_id=${localStorage.getItem('os_loc_id')}&status=${status}`, {
                headers
            });
            return await response.json();
        } catch (e) {
            console.warn("Opportunity Sync interrupted:", e);
            throw e;
        }
    },

    async getWorkflows() {
        try {
            const headers = ghl._getAuthHeaders();
            // Using V2 workflows endpoint
            const response = await fetch(`https://services.leadconnectorhq.com/workflows/?locationId=${localStorage.getItem('os_loc_id')}`, {
                headers
            });
            return await response.json();
        } catch (e) {
            console.warn("Workflow Sync interrupted:", e);
            throw e;
        }
    },

    async triggerWorkflow(workflowId: string, contactId: string) {
        // Not natively exposed easily via public API without oauth, but we can try legacy or webhook
        console.log(`[Neuro] Triggering workflow ${workflowId} for ${contactId}... (Simulation due to API restrictions)`);
        return true;
    },

    async getConversations(limit: number = 20) {
        try {
            const headers = ghl._getAuthHeaders();
            const response = await fetch(`https://services.leadconnectorhq.com/conversations/search?locationId=${localStorage.getItem('os_loc_id')}&limit=${limit}`, {
                headers
            });
            return await response.json();
        } catch (e) {
            console.warn("Conversation Stream interrupted:", e);
            throw e;
        }
    }
};
