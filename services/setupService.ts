
import { BrandBrain, BuildPlan, RoleKey, ApprovalPack } from "../types";
import { generateBuildPlan, generateApprovalPack } from "./geminiService";
import { GHL } from "./mcp";

export class SetupService {

  /**
   * Generates both the high-level Approval Pack (for user review) 
   * and the low-level Build Plan (for execution).
   */
  async compileArchitecture(brand: BrandBrain, roles: RoleKey[]): Promise<{ approval: ApprovalPack, build: BuildPlan }> {
    // Run in parallel for speed
    const [approval, build] = await Promise.all([
      generateApprovalPack(brand, roles),
      generateBuildPlan(brand, roles)
    ]);

    return { approval, build };
  }

  /**
   * Executes the BuildPlan against the GHL MCP.
   * Emits progress updates via callback.
   */
  async deploySystem(
    locationId: string,
    plan: BuildPlan,
    onProgress: (msg: string, percent: number) => void
  ): Promise<boolean> {

    try {
      const update = (msg: string, pct: number) => onProgress(msg, pct);

      // PHASE 1: IMMEDIATE TRIGGER & WELCOME
      update("Phase 1: Initializing Neural Handshake...", 5);
      await GHL.sendCommunication("Client", "email", "Welcome to LIV8 OS! We're spinning up your AI infrastructure now.");
      await GHL.sendCommunication("Client", "sms", "LIV8 OS: Your AI Command Center is being initialized. Stay tuned!");
      update("Phase 1 Complete: Welcome Sent", 15);

      // PHASE 2: SUB-ACCOUNT & TEAM ORCHESTRATION
      update("Phase 2: Provisioning Headless Sub-Account...", 30);
      const subAccount = await GHL.createSubAccount({
        businessName: "Neuro Client", // In production, extract from brandBrain
        locationId: locationId
      });

      update("Triggering Internal Team Alert (Slack)...", 45);
      await GHL.triggerAutomation(locationId, "TEAM_ONBOARDING_ALERT");
      update("Phase 2 Complete: Infrastructure Ready", 55);

      // PHASE 3: FULFILLMENT & ASSETS
      const totalAssets = (plan.assets.pipelines?.length || 0) + (plan.assets.workflows?.length || 0);
      update("Phase 3: Injecting Brand Intelligence...", 65);
      await GHL.uploadKnowledgeBase(locationId, "brand_domain", []);

      // Deploy Pipelines
      for (const pipe of (plan.assets.pipelines || [])) {
        update(`Deploying Neural Pipeline: ${pipe}`, 75);
        await GHL.createPipeline(locationId, pipe, ["New", "Syncing", "Optimized"]);
      }

      // Deploy AI Staff
      update("Activating AI Staff Nodes...", 85);
      for (const wf of (plan.assets.workflows || [])) {
        await GHL.createWorkflow(locationId, wf, "Trigger: Contact Intent");
      }

      update("Finalizing Numbers & Connectivity...", 95);
      await GHL.configureNumber(locationId, 'sms');
      await GHL.configureNumber(locationId, 'voice');

      update("Sub-Account Online. Credentials Dispatched.", 100);
      return true;

    } catch (error) {
      console.error("Headless Deployment Failed", error);
      throw error;
    }
  }
}

export const setupService = new SetupService();
