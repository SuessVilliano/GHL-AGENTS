import { GoogleGenAI, Type } from "@google/genai";
import { BrandBrain, ApprovalPack, RoleKey } from "../types";
import { MOCK_APPROVAL_PACK } from "../constants";

// Initialize Gemini
// Note: In a production GHL app, this is often proxied through a backend to protect the key,
// or the user inputs their own key in a settings panel.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

const LIV8_SYSTEM_PROMPT = `
You are LIV8AI, an elite AI Business Operations Architect. 
Your goal is to analyze business inputs and generate deployment plans for GoHighLevel (GHL) automation.
Prioritize "Answer Engine Optimization" (AEO) and "Speed to Lead".
`;

export const scanBrandIdentity = async (domain: string, description: string): Promise<BrandBrain> => {
  if (!apiKey) {
    // Mock return if no key
    return {
      brand_name: "Acme Services",
      domain: domain,
      socials: ["instagram.com/acme", "facebook.com/acme"],
      tone_profile: { professional: 0.8, friendly: 0.2, direct: 0.5 },
      key_services: ["Service A", "Service B"],
      do_say: ["We appreciate your business", "How can we help?"],
      dont_say: ["I don't know", "Maybe"],
      faqs: [{ q: "What are your hours?", a: "9am-5pm Mon-Fri" }]
    };
  }

  try {
    const prompt = `
      Analyze the following business based on their domain "${domain}" and description: "${description}".
      Infer their brand voice, likely services, and standard FAQs.
      Return JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: LIV8_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brand_name: { type: Type.STRING },
            domain: { type: Type.STRING },
            socials: { type: Type.ARRAY, items: { type: Type.STRING } },
            tone_profile: {
              type: Type.OBJECT,
              properties: {
                professional: { type: Type.NUMBER },
                friendly: { type: Type.NUMBER },
                direct: { type: Type.NUMBER }
              }
            },
            key_services: { type: Type.ARRAY, items: { type: Type.STRING } },
            do_say: { type: Type.ARRAY, items: { type: Type.STRING } },
            dont_say: { type: Type.ARRAY, items: { type: Type.STRING } },
            faqs: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { q: { type: Type.STRING }, a: { type: Type.STRING } } 
              } 
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as BrandBrain;
    }
    throw new Error("No text returned");
  } catch (error) {
    console.error("Scan failed", error);
    // Fallback
    return {
      brand_name: "Detected Business",
      domain,
      socials: [],
      tone_profile: { professional: 0.5, friendly: 0.5, direct: 0.5 },
      key_services: [],
      do_say: [],
      dont_say: [],
      faqs: []
    };
  }
};

export const generateApprovalPack = async (brand: BrandBrain, roles: RoleKey[]): Promise<ApprovalPack> => {
  if (!apiKey) return MOCK_APPROVAL_PACK as unknown as ApprovalPack;

  try {
    const prompt = `
      Generate a "LIV8AI Approval Pack" for deployment.
      Business: ${brand.brand_name} (${brand.domain})
      Services: ${brand.key_services.join(', ')}
      Selected Roles: ${roles.join(', ')}

      The summary should be professional and highlight the "Growth Loop" (AEO -> AI Staff -> CRM).
      Explain what specific actions the AI agents will take.
      Estimate the AEO score impact.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: LIV8_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            brand_confirmed: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                domain: { type: Type.STRING }
              }
            },
            ai_staff_actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  action: { type: Type.STRING }
                }
              }
            },
            deploy_steps: { type: Type.ARRAY, items: { type: Type.STRING } },
            aeo_score_impact: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ApprovalPack;
    }
    throw new Error("No plan generated");
  } catch (e) {
    console.error(e);
    return MOCK_APPROVAL_PACK as unknown as ApprovalPack;
  }
};
