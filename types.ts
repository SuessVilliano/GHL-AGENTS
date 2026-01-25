export interface BrandBrain {
  brand_name: string;
  domain: string;
  socials: string[];
  tone_profile: {
    professional: number;
    friendly: number;
    direct: number;
  };
  key_services: string[];
  do_say: string[];
  dont_say: string[];
  faqs: { q: string; a: string }[];
}

export enum RoleKey {
  AI_RECEPTIONIST = 'AI_RECEPTIONIST',
  MISSED_CALL_RECOVERY = 'MISSED_CALL_RECOVERY',
  LEAD_QUALIFIER = 'LEAD_QUALIFIER',
  BOOKING_ASSISTANT = 'BOOKING_ASSISTANT',
  REVIEW_COLLECTOR = 'REVIEW_COLLECTOR',
  REENGAGEMENT_AGENT = 'REENGAGEMENT_AGENT'
}

export interface RoleDefinition {
  key: RoleKey;
  label: string;
  description: string;
  recommended: boolean;
}

export interface ApprovalPack {
  summary: string;
  brand_confirmed: {
    name: string;
    domain: string;
  };
  ai_staff_actions: {
    role: string;
    action: string;
  }[];
  deploy_steps: string[];
  aeo_score_impact: string;
}

export interface DeploymentStatus {
  id: string;
  status: 'staged' | 'deploying' | 'active' | 'failed';
  logs: string[];
  progress: number;
}

export interface VaultToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
}
