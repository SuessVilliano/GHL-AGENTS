import express, { Request, Response } from 'express';
import { authService } from '../services/auth.js';
import { taskMagicClient } from '../services/taskmagic-client.js';
import { db } from '../db/index.js';

const router = express.Router();

/**
 * Middleware: Verify JWT
 */
const authenticate = (req: Request, res: Response, next: any) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const payload = authService.verifyToken(token);

        (req as any).user = payload;
        next();
    } catch (error: any) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

/**
 * GET /api/taskmagic/status
 * Check if TaskMagic integration is configured
 */
router.get('/status', authenticate, (req: Request, res: Response) => {
    res.json({
        configured: taskMagicClient.isConfigured(),
        message: taskMagicClient.isConfigured()
            ? 'TaskMagic integration is active'
            : 'TaskMagic not configured. Set TASKMAGIC_WEBHOOK_URL and TASKMAGIC_MCP_TOKEN.'
    });
});

/**
 * POST /api/taskmagic/trigger
 * Trigger a TaskMagic automation
 */
router.post('/trigger', authenticate, async (req: Request, res: Response) => {
    const user = (req as any).user;

    try {
        const { eventType, locationId, data } = req.body;

        if (!eventType) {
            return res.status(400).json({ error: 'eventType is required' });
        }

        const result = await taskMagicClient.triggerCustomAutomation(
            eventType,
            locationId || user.locationId,
            data || {}
        );

        // Log the action
        await db.logAction(
            user.userId,
            user.agencyId,
            locationId || user.locationId,
            'taskmagic_trigger',
            'taskmagic.trigger',
            { eventType, data },
            result,
            result.success ? 'success' : 'failure',
            result.success ? undefined : result.message
        );

        res.json(result);
    } catch (error: any) {
        console.error('[TaskMagic API] Trigger error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/taskmagic/onboarding
 * Trigger deep onboarding workflow
 */
router.post('/onboarding', authenticate, async (req: Request, res: Response) => {
    const user = (req as any).user;

    try {
        const { locationId, agencyName, clientEmail, domain, selectedRoles } = req.body;

        if (!locationId || !agencyName || !domain) {
            return res.status(400).json({ error: 'Missing required fields: locationId, agencyName, domain' });
        }

        const result = await taskMagicClient.triggerDeepOnboarding(
            locationId,
            agencyName,
            clientEmail || user.email,
            domain,
            selectedRoles || []
        );

        // Log the action
        await db.logAction(
            user.userId,
            user.agencyId,
            locationId,
            'taskmagic_onboarding',
            'taskmagic.deepOnboarding',
            { agencyName, domain, selectedRoles },
            result,
            result.success ? 'success' : 'failure',
            result.success ? undefined : result.message
        );

        res.json(result);
    } catch (error: any) {
        console.error('[TaskMagic API] Onboarding error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/taskmagic/brand-sync
 * Trigger brand sync workflow
 */
router.post('/brand-sync', authenticate, async (req: Request, res: Response) => {
    const user = (req as any).user;

    try {
        const { locationId, brandData } = req.body;

        if (!locationId || !brandData) {
            return res.status(400).json({ error: 'Missing required fields: locationId, brandData' });
        }

        const result = await taskMagicClient.triggerBrandSync(locationId, brandData);

        // Log the action
        await db.logAction(
            user.userId,
            user.agencyId,
            locationId,
            'taskmagic_brand_sync',
            'taskmagic.brandSync',
            { brandName: brandData.brand_name },
            result,
            result.success ? 'success' : 'failure',
            result.success ? undefined : result.message
        );

        res.json(result);
    } catch (error: any) {
        console.error('[TaskMagic API] Brand sync error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
