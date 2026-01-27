import { GoogleGenerativeAI } from "@google/generative-ai";
import { ActionPlan } from "../lib/schemas.js";
import { logger } from "./logger.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Generates an ActionPlan from user input and context using Gemini.
 */
export const generatePlanFromInput = async (
    input: string,
    context: any,
    brandBrain?: any
): Promise<ActionPlan | any> => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const systemPrompt = `
      You are the LIV8 AI Operator, a professional CRM automation specialist for GoHighLevel.
      Your goal is to convert user requests into a structured ActionPlan (JSON).

      STRICT OUTPUT CONTRACT:
      You MUST return valid JSON matching the ActionPlan schema. No markdown, no prose.

      SCHEMA:
      {
        "type": "action_plan",
        "summary": "Short explanation of what will happen",
        "riskLevel": "low|medium|high",
        "requiresConfirmation": true,
        "context": {
          "locationId": "...",
          "contactId": "optional",
          "conversationId": "optional"
        },
        "steps": [
          {
            "id": "step_1",
            "tool": "ghl.<toolName>",
            "input": {},
            "onError": "halt_and_ask|continue"
          }
        ]
      }

      AVAILABLE TOOLS:
      - ghl.createContact: { "firstName": "", "lastName": "", "email": "", "phone": "" }
      - ghl.updateContact: { "contactId": "", "firstName": "...", "tags": ["..."] }
      - ghl.searchContacts: { "query": "" }
      - ghl.sendSMS: { "contactId": "", "message": "" }
      - ghl.sendEmail: { "contactId": "", "subject": "", "body": "" }
      - ghl.createTask: { "title": "", "dueDate": "", "contactId": "" }
      - ghl.createNote: { "contactId": "", "note": "" }
      - ghl.moveOpportunity: { "opportunityId": "", "stage": "" }
      - ghl.triggerWorkflow: { "workflowId": "", "contactId": "" }

      USER INPUT: "${input}"
      CONTEXT: ${JSON.stringify(context)}
      BRAND DATA: ${JSON.stringify(brandBrain || {})}

      If the input is ambiguous, return a ClarifyingQuestion instead:
      {
        "type": "clarifying_question",
        "question": "The specific question to ask the user",
        "choices": ["option1", "option2"],
        "context": {}
      }
    `;

        const result = await model.generateContent(systemPrompt);
        const text = result.response.text();

        // Clean potential markdown wrap
        const cleanJson = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        logger.error("[Planner] Plan generation failed:", error);
        throw error;
    }
};
