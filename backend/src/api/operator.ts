import express, { Request, Response } from 'express';
import { authService } from '../services/auth.js';
import { db } from '../db/index.js';
import { mcpClient } from '../services/mcp-client.js';
import { ActionPlanSchema, PageContextSchema, AIResponseSchema } from '../lib/schemas.js';
import { generatePlanFromInput } from '../services/planner.js';

const router = express.Router();

/**
 * Middleware: Verify JWT and extract user
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
 * POST /api/operator/plan
 * Generate an action plan from user input
 */
router.post('/plan', authenticate, async (req: Request, res: Response) => {
    try {
        const { input, context } = req.body;

        if (!input) {
            return res.status(400).json({ error: 'No input provided' });
        }

        const validatedContext = PageContextSchema.parse(context);
        const locationId = validatedContext.locationId;

        // Fetch brand brain if available for better personalization
        const brandBrain = locationId ? await db.getBrandBrain(locationId) : null;

        const plan = await generatePlanFromInput(input, validatedContext, brandBrain);

        // Validate against union schema (ActionPlan | ClarifyingQuestion)
        const validatedResponse = AIResponseSchema.parse(plan);

        res.json(validatedResponse);
    } catch (error: any) {
        console.error('[Operator] Planning error:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /api/operator/execute-plan
 * Execute an action plan from the operator
 */
router.post('/execute-plan', authenticate, async (req: Request, res: Response) => {
    const user = (req as any).user;

    try {
        const { plan, context } = req.body;

        // Validate plan schema
        const validatedPlan = ActionPlanSchema.parse(plan);
        const validatedContext = PageContextSchema.parse(context);

        const locationId = validatedContext.locationId || validatedPlan.context?.locationId;

        if (!locationId) {
            return res.status(400).json({ error: 'No locationId provided' });
        }

        // Get GHL token for this location (decrypted from DB)
        const ghlToken = await db.getLocationToken(locationId);

        if (!ghlToken) {
            return res.status(404).json({ error: 'Location not connected. Please connect GHL location first.' });
        }

        // Execute each step
        const results = [];
        const errors = [];

        for (const step of validatedPlan.steps) {
            try {
                let result;

                // Route to appropriate MCP tool
                switch (step.tool) {
                    case 'ghl.createContact':
                        result = await mcpClient.createContact(ghlToken, locationId, step.input);
                        break;
                    case 'ghl.updateContact':
                        result = await mcpClient.updateContact(ghlToken, locationId, step.input.contactId, step.input);
                        break;
                    case 'ghl.searchContacts':
                        result = await mcpClient.searchContacts(ghlToken, locationId, step.input);
                        break;
                    case 'ghl.sendSMS':
                        result = await mcpClient.sendSMS(ghlToken, locationId, step.input.contactId, step.input.message);
                        break;
                    case 'ghl.sendEmail':
                        result = await mcpClient.sendEmail(ghlToken, locationId, step.input.contactId, step.input.subject, step.input.body);
                        break;
                    case 'ghl.createTask':
                        result = await mcpClient.createTask(ghlToken, locationId, step.input);
                        break;
                    case 'ghl.createNote':
                        result = await mcpClient.createNote(ghlToken, locationId, step.input.contactId, step.input.note);
                        break;
                    case 'ghl.moveOpportunity':
                        result = await mcpClient.moveOpportunity(ghlToken, locationId, step.input.opportunityId, step.input.stage);
                        break;
                    case 'ghl.triggerWorkflow':
                        result = await mcpClient.triggerWorkflow(ghlToken, locationId, step.input.workflowId, step.input.contactId);
                        break;
                    default:
                        throw new Error(`Unknown tool: ${step.tool}`);
                }

                results.push({ stepId: step.id, success: true, result });

                // Log success to audit
                await db.logAction(
                    user.userId,
                    user.agencyId,
                    locationId,
                    step.tool.replace('ghl.', ''),
                    step.tool,
                    step.input,
                    result,
                    'success'
                );

            } catch (error: any) {
                const errorMsg = error.message || 'Unknown error';
                errors.push({ stepId: step.id, error: errorMsg });

                // Log failure to audit
                await db.logAction(
                    user.userId,
                    user.agencyId,
                    locationId,
                    step.tool.replace('ghl.', ''),
                    step.tool,
                    step.input,
                    null,
                    'failure',
                    errorMsg
                );

                // Handle error strategy
                if (step.onError === 'halt_and_ask') {
                    break; // Stop execution
                }
                // 'continue' or 'retry' - continue to next step
            }
        }

        res.json({
            status: errors.length === 0 ? 'success' : 'partial',
            results,
            errors,
            summary: `Executed ${results.length}/${validatedPlan.steps.length} steps successfully`
        });

    } catch (error: any) {
        console.error('[Operator] Execution error:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/operator/audit-log
 * Get audit log for agency
 */
router.get('/audit-log', authenticate, async (req: Request, res: Response) => {
    const user = (req as any).user;

    try {
        const limit = parseInt(req.query.limit as string) || 100;
        const logs = await db.getAuditLogs(user.agencyId, limit);

        res.json({ logs });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
