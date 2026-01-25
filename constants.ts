import { RoleDefinition, RoleKey } from './types';

export const ROLE_OPTIONS: RoleDefinition[] = [
  { 
    key: RoleKey.AI_RECEPTIONIST, 
    label: "AI Receptionist", 
    description: "Answers inbound calls 24/7, handles FAQs, and filters spam.",
    recommended: true
  },
  { 
    key: RoleKey.MISSED_CALL_RECOVERY, 
    label: "Missed Call Recovery", 
    description: "Instantly texts back missed calls to save the lead.",
    recommended: true
  },
  { 
    key: RoleKey.LEAD_QUALIFIER, 
    label: "Lead Qualifier", 
    description: "Asks qualification questions via SMS/IG before booking.",
    recommended: false
  },
  { 
    key: RoleKey.BOOKING_ASSISTANT, 
    label: "Booking Assistant", 
    description: "Negotiates times and books directly to your calendar.",
    recommended: false
  },
  { 
    key: RoleKey.REVIEW_COLLECTOR, 
    label: "Review Collector", 
    description: "Automatically requests reviews after successful service.",
    recommended: true
  },
  { 
    key: RoleKey.REENGAGEMENT_AGENT, 
    label: "Re-engagement Agent", 
    description: "Wakes up cold leads from 90+ days ago.",
    recommended: false
  }
];

// Fallback if API key is missing
export const MOCK_APPROVAL_PACK = {
  summary: "LIV8AI will configure your location for maximum Answer Engine Optimization (AEO) and deploy 3 active AI agents.",
  brand_confirmed: {
    name: "Detected Brand",
    domain: "example.com"
  },
  ai_staff_actions: [
    { role: "AI Receptionist", action: "Configured to answer with 'Professional' tone." },
    { role: "Missed Call Recovery", action: "Will trigger SMS 1 minute after missed call." }
  ],
  deploy_steps: [
    "Inject Brand Brain into Knowledge Base",
    "Configure GHL Workflows for Speed-to-Lead",
    "Activate Voice Agent on Main Line"
  ],
  aeo_score_impact: "High (+45 points)"
};
