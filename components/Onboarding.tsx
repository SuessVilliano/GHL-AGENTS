import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ROLE_OPTIONS } from '../constants';
import { RoleKey, BrandBrain, ApprovalPack } from '../types';
import { scanBrandIdentity, generateApprovalPack } from '../services/geminiService';

interface OnboardingProps {
  onComplete: () => void;
}

type Step = 'intro' | 'brand' | 'roles' | 'plan' | 'deploying';

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>('intro');
  const [loading, setLoading] = useState(false);
  
  // State
  const [domain, setDomain] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<RoleKey[]>([RoleKey.AI_RECEPTIONIST, RoleKey.MISSED_CALL_RECOVERY]);
  const [brandBrain, setBrandBrain] = useState<BrandBrain | null>(null);
  const [approvalPack, setApprovalPack] = useState<ApprovalPack | null>(null);

  // Handlers
  const handleScanBrand = async () => {
    setLoading(true);
    try {
      const result = await scanBrandIdentity(domain, description);
      setBrandBrain(result);
      setStep('roles');
    } catch (e) {
      console.error(e);
      alert("Failed to scan brand. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!brandBrain) return;
    setLoading(true);
    try {
      const result = await generateApprovalPack(brandBrain, selectedRoles);
      setApprovalPack(result);
      setStep('plan');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    setStep('deploying');
    // Simulate deployment time
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);
    return () => clearTimeout(timer);
  };

  const toggleRole = (key: RoleKey) => {
    setSelectedRoles(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Render Steps
  const renderIntro = () => (
    <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto py-12">
      <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-slate-200">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Let's bring your business to life</h1>
      <p className="text-slate-500 text-lg">
        LIV8AI will scan your brand, recruit your AI staff, and deploy a fully automated operations center inside HighLevel.
      </p>
      <div className="pt-4 w-full">
        <Button onClick={() => setStep('brand')} fullWidth className="h-12 text-lg">
          Start Setup
        </Button>
      </div>
      <p className="text-xs text-slate-400">Takes ~2 minutes • Fully Automated</p>
    </div>
  );

  const renderBrand = () => (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Brand Recon</h2>
        <p className="text-slate-500">We'll scan your digital footprint to build your "Brand Brain".</p>
      </div>
      
      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Website URL</label>
            <input 
              type="text" 
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Brief Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you do and who do you serve?"
              rows={3}
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 border p-2"
            />
          </div>
        </div>
      </Card>

      <Button onClick={handleScanBrand} disabled={!domain || loading} fullWidth className="h-11">
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Scanning Brand Identity...
          </span>
        ) : "Create Brand Brain"}
      </Button>
    </div>
  );

  const renderRoles = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
       <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Hire your AI Staff</h2>
        <p className="text-slate-500">Select the roles you want to activate immediately.</p>
      </div>

      <div className="grid gap-4">
        {ROLE_OPTIONS.map((role) => (
          <div 
            key={role.key}
            onClick={() => toggleRole(role.key)}
            className={`
              relative flex items-start p-4 border rounded-xl cursor-pointer transition-all
              ${selectedRoles.includes(role.key) 
                ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' 
                : 'border-slate-200 hover:border-slate-300 bg-white'}
            `}
          >
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={selectedRoles.includes(role.key)}
                readOnly
                className="h-4 w-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900 pointer-events-none"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-slate-900 cursor-pointer">
                {role.label}
                {role.recommended && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Recommended</span>}
              </label>
              <p className="text-slate-500 mt-1">{role.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <Button variant="ghost" onClick={() => setStep('brand')}>Back</Button>
        <Button onClick={handleGeneratePlan} disabled={loading} className="flex-1">
           {loading ? "Generating Plan..." : "Generate Approval Pack"}
        </Button>
      </div>
    </div>
  );

  const renderPlan = () => (
    <div className="space-y-6 max-w-3xl mx-auto h-full flex flex-col">
       <div className="space-y-2 shrink-0">
        <h2 className="text-2xl font-bold text-slate-900">Approval Pack</h2>
        <p className="text-slate-500">Review the blueprint before we deploy to your GHL account.</p>
      </div>

      {approvalPack && (
        <div className="flex-1 overflow-auto space-y-4 pr-2">
          {/* Summary Card */}
          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-2">Deployment Strategy</h3>
            <p className="text-slate-300 leading-relaxed">{approvalPack.summary}</p>
            <div className="mt-4 flex items-center gap-2 text-sm bg-slate-800/50 p-2 rounded w-fit">
              <span className="text-green-400">⚡ AEO Impact:</span>
              <span>{approvalPack.aeo_score_impact}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <h3 className="font-semibold text-slate-900 mb-3 border-b pb-2">Confirmed Brand</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Name</span>
                  <span className="font-medium">{brandBrain?.brand_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Domain</span>
                  <span className="font-medium">{brandBrain?.domain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tone</span>
                  <span className="font-medium">
                    {brandBrain?.tone_profile.professional ? 'Professional' : 'Friendly'}
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-slate-900 mb-3 border-b pb-2">Included Actions</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {approvalPack.deploy_steps.map((step, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-blue-500">✓</span> {step}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card>
             <h3 className="font-semibold text-slate-900 mb-3 border-b pb-2">AI Staff Configuration</h3>
             <div className="space-y-3">
                {approvalPack.ai_staff_actions.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm bg-slate-50 p-3 rounded-lg">
                    <span className="font-medium text-slate-900">{item.role}</span>
                    <span className="text-slate-500 italic mt-1 sm:mt-0">{item.action}</span>
                  </div>
                ))}
             </div>
          </Card>
        </div>
      )}

      <div className="pt-4 shrink-0 flex gap-4 bg-gray-50 z-10">
         <Button variant="ghost" onClick={() => setStep('roles')}>Adjust Roles</Button>
         <Button onClick={handleDeploy} variant="secondary" fullWidth className="shadow-lg shadow-blue-500/20">
           Approve & Deploy System
         </Button>
      </div>
    </div>
  );

  const renderDeploying = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in duration-700">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Deploying LIV8AI System</h2>
        <p className="text-slate-500">Configuring workflows, training agents, and wiring MCP...</p>
      </div>
      <div className="w-full max-w-md bg-slate-200 rounded-full h-2.5 overflow-hidden">
         <div className="bg-slate-900 h-2.5 rounded-full animate-[width_3s_ease-out_forwards]" style={{ width: '90%' }}></div>
      </div>
    </div>
  );

  return (
    <div className="h-full px-4 py-6 md:px-8 overflow-y-auto">
      {step === 'intro' && renderIntro()}
      {step === 'brand' && renderBrand()}
      {step === 'roles' && renderRoles()}
      {step === 'plan' && renderPlan()}
      {step === 'deploying' && renderDeploying()}
    </div>
  );
};

export default Onboarding;
