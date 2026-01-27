import express, { Request, Response } from 'express';
import { authService } from '../services/auth.js';
import analyticsService from '../services/analytics.js';
import ghlTools from '../services/ghl-tools.js';
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
 * GET /api/analytics/health-score
 * Get business health score
 */
router.get('/health-score', authenticate, async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { locationId } = req.query;

    if (!locationId) {
        return res.status(400).json({ error: 'locationId required' });
    }

    try {
        const ghlToken = await db.getLocationToken(locationId as string);
        if (!ghlToken) {
            return res.status(404).json({ error: 'Location not connected' });
        }

        const healthScore = await analyticsService.calculateHealthScore(ghlToken, locationId as string);
        res.json(healthScore);

    } catch (error: any) {
        console.error('[Analytics API] Health score error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/analytics/revenue-forecast
 * Get AI-powered revenue forecast
 */
router.get('/revenue-forecast', authenticate, async (req: Request, res: Response) => {
    const { locationId } = req.query;

    if (!locationId) {
        return res.status(400).json({ error: 'locationId required' });
    }

    try {
        const ghlToken = await db.getLocationToken(locationId as string);
        if (!ghlToken) {
            return res.status(404).json({ error: 'Location not connected' });
        }

        const forecast = await analyticsService.forecastRevenue(ghlToken, locationId as string);
        res.json(forecast);

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/analytics/opportunities
 * Detect opportunities for improvement
 */
router.get('/opportunities', authenticate, async (req: Request, res: Response) => {
    const { locationId } = req.query;

    if (!locationId) {
        return res.status(400).json({ error: 'locationId required' });
    }

    try {
        const ghlToken = await db.getLocationToken(locationId as string);
        if (!ghlToken) {
            return res.status(404).json({ error: 'Location not connected' });
        }

        const opportunities = await analyticsService.detectOpportunities(ghlToken, locationId as string);
        res.json({ opportunities });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/analytics/pipeline
 * Get pipeline analysis
 */
router.get('/pipeline', authenticate, async (req: Request, res: Response) => {
    const { locationId } = req.query;

    if (!locationId) {
        return res.status(400).json({ error: 'locationId required' });
    }

    try {
        const ghlToken = await db.getLocationToken(locationId as string);
        if (!ghlToken) {
            return res.status(404).json({ error: 'Location not connected' });
        }

        const pipelineData = await analyticsService.analyzePipeline(ghlToken, locationId as string);
        res.json(pipelineData);

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/analytics/lead-sources
 * Get lead source performance
 */
router.get('/lead-sources', authenticate, async (req: Request, res: Response) => {
    const { locationId } = req.query;

    if (!locationId) {
        return res.status(400).json({ error: 'locationId required' });
    }

    try {
        const ghlToken = await db.getLocationToken(locationId as string);
        if (!ghlToken) {
            return res.status(404).json({ error: 'Location not connected' });
        }

        const sources = await analyticsService.analyzeLeadSources(ghlToken, locationId as string);
        res.json({ sources });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/analytics/dashboard
 * Get complete dashboard data
 */
router.get('/dashboard', authenticate, async (req: Request, res: Response) => {
    const { locationId } = req.query;

    if (!locationId) {
        return res.status(400).json({ error: 'locationId required' });
    }

    try {
        const ghlToken = await db.getLocationToken(locationId as string);
        if (!ghlToken) {
            return res.status(404).json({ error: 'Location not connected' });
        }

        // Fetch all dashboard metrics concurrently
        const [healthScore, forecast, opportunities, pipeline, leadSources] = await Promise.all([
            analyticsService.calculateHealthScore(ghlToken, locationId as string),
            analyticsService.forecastRevenue(ghlToken, locationId as string),
            analyticsService.detectOpportunities(ghlToken, locationId as string),
            analyticsService.analyzePipeline(ghlToken, locationId as string),
            analyticsService.analyzeLeadSources(ghlToken, locationId as string)
        ]);

        res.json({
            healthScore,
            forecast,
            opportunities,
            pipeline,
            leadSources
        });

    } catch (error: any) {
        console.error('[Analytics API] Dashboard error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
