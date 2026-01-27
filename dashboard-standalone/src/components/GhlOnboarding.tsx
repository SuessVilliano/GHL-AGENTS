
import React, { useState, useEffect } from 'react';
import {
    Zap,
    Globe,
    Sparkles,
    ArrowLeft,
    ChevronRight,
    CheckCircle2,
    Brain,
    FileText,
    Layout,
    Rocket
} from 'lucide-react';

interface GhlOnboardingProps {
    onComplete: (data: any) => void;
}

type Step = 'brand' | 'roles' | 'deploy';

const GhlOnboarding: React.FC<GhlOnboardingProps> = ({ onComplete }) => {
    const [step, setStep] = useState<Step>('brand');

    // Brand States
    const [domain, setDomain] = useState('');
    const [description, setDescription] = useState('');

    // Role States
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const handleNext = () => {
        if (step === 'brand') setStep('roles');
        else if (step === 'roles') setStep('deploy');
    };

    const toggleRole = (id: string) => {
        setSelectedRoles(prev =>
            prev.includes(id)
                ? prev.filter(r => r !== id)
                : [...prev, id]
        );
    };

    const handleFinalize = () => {
        onComplete({ domain, description });
    };

    return (
        <div className="h-full bg-[var(--os-bg)] flex flex-col font-sans text-[var(--os-text)] relative overflow-x-hidden custom-scrollbar overflow-y-auto transition-colors duration-500">
            <div className="p-10 max-w-5xl mx-auto w-full space-y-12 relative z-10">
                <header className="flex items-center justify-between border-b border-[var(--os-border)] pb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-neuro rounded-2xl flex items-center justify-center shadow-lg shadow-neuro/20">
                            <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase italic tracking-tight">OS Onboarding</h2>
                            <p className="text-[10px] font-bold text-[var(--os-text-muted)] uppercase tracking-widest mt-1">Intelligence Configuration</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {['brand', 'roles', 'deploy'].map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${step === s ? 'bg-neuro text-white' : 'bg-[var(--os-surface)] border border-[var(--os-border)] text-[var(--os-text-muted)]'
                                    }`}>
                                    {i + 1}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${step === s ? 'text-neuro' : 'text-[var(--os-text-muted)]'}`}>
                                    {s}
                                </span>
                            </div>
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-10">
                    {step === 'brand' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black uppercase italic leading-none">Business <span className="text-neuro">Recon</span></h3>
                                <p className="text-sm text-[var(--os-text-muted)] font-bold">LIV8 AI will crawl your website to extract DNA and voice protocols.</p>
                            </div>

                            <div className="os-card p-10 space-y-8 shadow-xl shadow-blue-900/5 backdrop-blur-xl">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-[var(--os-text-muted)] tracking-widest ml-1">Company Website</label>
                                        <div className="relative group">
                                            <Globe className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--os-text-muted)]" />
                                            <input
                                                type="text"
                                                value={domain}
                                                onChange={(e) => setDomain(e.target.value)}
                                                className="w-full bg-[var(--os-surface)] border border-[var(--os-border)] rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:border-neuro outline-none transition-all"
                                                placeholder="e.g. solarpro.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-[var(--os-text-muted)] tracking-widest ml-1">Brand Voice Blueprint</label>
                                        <div className="relative group">
                                            <FileText className="absolute left-5 top-6 h-5 w-5 text-[var(--os-text-muted)]" />
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                rows={4}
                                                className="w-full bg-[var(--os-surface)] border border-[var(--os-border)] rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:border-neuro outline-none transition-all resize-none"
                                                placeholder="Describe your brand voice and mission..."
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleNext}
                                    className="w-full h-14 bg-neuro hover:bg-neuro-dark text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-neuro/20 flex items-center justify-center gap-2 group"
                                >
                                    Initiate Recon <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'roles' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black uppercase italic leading-none">Neural <span className="text-neuro">Staffing</span></h3>
                                <p className="text-sm text-[var(--os-text-muted)] font-bold">Select the AI archetypes to deploy into your GHL workflows.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { id: 'rec', title: 'AI Receptionist', desc: 'Handles missed calls and bookings in real-time.', icon: Zap },
                                    { id: 'setter', title: 'Appointment Setter', desc: 'Converts leads into confirmed calendar bookings.', icon: Sparkles },
                                    { id: 'recov', title: 'Recovery Agent', desc: 'Resurrects dead leads via multi-channel reactivation.', icon: Rocket },
                                    { id: 'seo', title: 'SEO Auditor', desc: 'Monitors AEO and Vital Signs for Google dominance.', icon: Globe },
                                    { id: 'content', title: 'Content Strategist', desc: 'Automates blogs, social posts, and brand voice.', icon: FileText }
                                ].map((role) => {
                                    const isSelected = selectedRoles.includes(role.id);
                                    return (
                                        <div
                                            key={role.id}
                                            onClick={() => toggleRole(role.id)}
                                            className={`os-card p-6 flex items-start gap-4 cursor-pointer group transition-all border-2 ${isSelected
                                                ? 'border-neuro bg-neuro/5 ring-4 ring-neuro/10'
                                                : 'border-transparent hover:border-neuro/30 hover:bg-neuro/5'
                                                }`}
                                        >
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-neuro text-white shadow-lg shadow-neuro/20' : 'bg-neuro/10 text-neuro group-hover:bg-neuro group-hover:text-white'
                                                }`}>
                                                <role.icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-black uppercase italic leading-tight ${isSelected ? 'text-neuro' : ''}`}>{role.title}</h4>
                                                <p className="text-[10px] text-[var(--os-text-muted)] font-medium mt-1">{role.desc}</p>
                                            </div>
                                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-neuro border-neuro text-white shadow-md' : 'border-[var(--os-border)] text-white bg-[var(--os-surface)] text-transparent'
                                                }`}>
                                                <CheckCircle2 className="h-2.5 w-2.5" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex items-center gap-4">
                                <button onClick={() => setStep('brand')} className="px-8 h-14 bg-[var(--os-surface)] border border-[var(--os-border)] text-[var(--os-text-muted)] rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                    <ArrowLeft className="h-3 w-3" /> Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="flex-1 h-14 bg-neuro text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-neuro/20"
                                >
                                    Review Build <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'deploy' && (
                        <ConstructionProgress onDone={handleFinalize} />
                    )}
                </div>
            </div>
        </div>
    );
};

const ConstructionProgress = ({ onDone }: { onDone: () => void }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const builderSteps = [
        { label: 'Deploying GHL Snapshots', detail: 'Inbound SMS & Missed Call Recovery frameworks.', icon: Layout },
        { label: 'Provisioning Funnels', detail: 'Mapping Brand DNA to high-conversion lead magnets.', icon: Globe },
        { label: 'Architecting Workflows', detail: 'Linking AI staff to neural trigger nodes.', icon: Zap },
        { label: 'Extracting Knowledge', detail: 'Scraping business assets into the Neural Core.', icon: Brain }
    ];

    useEffect(() => {
        let currentStep = 0;
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    if (currentStep < builderSteps.length - 1) {
                        currentStep++;
                        setStepIndex(currentStep);
                        return 0;
                    } else {
                        clearInterval(interval);
                        return 100;
                    }
                }
                return prev + 2;
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-10 space-y-12 animate-in fade-in zoom-in-95 duration-1000">
            <div className="relative">
                <div className="h-40 w-40 bg-neuro rounded-[3rem] flex items-center justify-center shadow-2xl shadow-neuro/40 animate-neuro-float relative z-10">
                    <Sparkles className="h-16 w-16 text-white" />
                </div>
                <div className="absolute inset-0 h-40 w-40 bg-neuro rounded-[3rem] animate-ping opacity-10"></div>
            </div>

            <div className="text-center space-y-3 max-w-sm">
                <h3 className="text-3xl font-black uppercase italic leading-none">{builderSteps[stepIndex].label}</h3>
                <p className="text-[10px] font-black text-neuro uppercase tracking-[0.3em]">{builderSteps[stepIndex].detail}</p>
            </div>

            <div className="w-full max-w-md space-y-4">
                <div className="h-3 w-full bg-[var(--os-surface)] border border-[var(--os-border)] rounded-full overflow-hidden shadow-inner p-0.5">
                    <div className="h-full bg-neuro rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest italic">Node {stepIndex + 1}/{builderSteps.length} Verified</span>
                    <span className="text-[9px] font-black text-neuro uppercase tracking-widest">{progress}% Complete</span>
                </div>
            </div>

            {progress === 100 && stepIndex === builderSteps.length - 1 && (
                <button
                    onClick={onDone}
                    className="h-16 px-12 bg-white border-2 border-neuro text-neuro hover:bg-neuro hover:text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-blue-500/5 animate-in slide-in-from-bottom-4"
                >
                    Finalize OS Setup
                </button>
            )}
        </div>
    );
};

export default GhlOnboarding;
