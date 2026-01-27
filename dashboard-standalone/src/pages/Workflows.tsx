
import { Workflow, Play, ExternalLink, Zap, Plus, X, Shield, Sparkles, ChevronRight, Activity } from 'lucide-react';
import { useState } from 'react';

const Workflows = () => {
    const [isArchitectOpen, setIsArchitectOpen] = useState(false);
    const [flows, setFlows] = useState([
        { name: '7-Day Reactivation', trigger: 'Customer Inactive > 30d', status: 'active', loads: '420', speed: '0.1s', type: 'Goal: Revenue' },
        { name: 'SEO Authority Builder', trigger: 'Blog Post Published', status: 'active', loads: '12', speed: '2.4s', type: 'Goal: Visibility' },
        { name: 'A2P Lead Capture', trigger: 'Inbound SMS', status: 'active', loads: '1.2k', speed: '0.4s', type: 'System' },
        { name: 'Review Solicitation', trigger: 'Opportunity Won', status: 'active', loads: '482', speed: '1.1s', type: 'System' },
        { name: 'Missed Call Recovery', trigger: 'Call Status: No Answer', status: 'paused', loads: '8.4k', speed: '0.2s', type: 'System' },
    ]);

    const handleCreateWorkflow = (newFlow: any) => {
        setFlows([newFlow, ...flows]);
        setIsArchitectOpen(false);
    };

    return (
        <div className="h-full bg-[var(--os-bg)] flex flex-col font-sans text-[var(--os-text)] relative overflow-x-hidden custom-scrollbar overflow-y-auto transition-colors duration-500">
            <div className="p-10 space-y-12 relative z-10">
                <header className="flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-black text-neuro uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                            <Workflow className="h-3 w-3" /> Logic Orchestration
                        </p>
                        <h1 className="text-5xl font-black text-[var(--os-text)] tracking-tighter leading-none uppercase italic">
                            Neural <span className="text-neuro">Flows</span>
                        </h1>
                        <p className="text-[var(--os-text-muted)] text-xs font-bold mt-4">Monitor and trigger deep GHL automations across your agency network.</p>
                    </div>
                    <button
                        onClick={() => setIsArchitectOpen(true)}
                        className="h-14 px-8 bg-neuro text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-neuro/20 flex items-center gap-3 hover:scale-105 transition-transform"
                    >
                        <Plus className="h-4 w-4" /> Workflow Architect
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {flows.map((flow) => (
                        <div key={flow.name} className="os-card p-8 hover:border-neuro/30 group transition-all relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10 ${flow.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>

                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-[var(--os-bg)] flex items-center justify-center text-[var(--os-text-muted)] group-hover:text-neuro group-hover:scale-110 transition-all">
                                        <Zap className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase italic">{flow.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] font-black text-neuro uppercase tracking-[0.2em]">{flow.type}</span>
                                            <span className="w-0.5 h-0.5 bg-slate-200 rounded-full"></span>
                                            <span className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest">Trigger: {flow.trigger}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`h-2 w-2 rounded-full ${flow.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse ring-4 ring-white`}></div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-[var(--os-bg)] p-4 rounded-2xl border border-[var(--os-border)]">
                                    <div className="text-[8px] font-black text-[var(--os-text-muted)] uppercase tracking-widest">Executions</div>
                                    <div className="text-lg font-black">{flow.loads}</div>
                                </div>
                                <div className="bg-[var(--os-bg)] p-4 rounded-2xl border border-[var(--os-border)]">
                                    <div className="text-[8px] font-black text-[var(--os-text-muted)] uppercase tracking-widest">Latency</div>
                                    <div className="text-lg font-black">{flow.speed}</div>
                                </div>
                                <div className="bg-[var(--os-bg)] p-4 rounded-2xl border border-[var(--os-border)]">
                                    <div className="text-[8px] font-black text-[var(--os-text-muted)] uppercase tracking-widest">Efficiency</div>
                                    <div className="text-lg font-black text-emerald-500">99.8%</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button className="flex-1 h-12 bg-neuro text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neuro-dark transition-all">
                                    <Play className="h-3 w-3" /> Test Handshake
                                </button>
                                <button className="px-6 h-12 bg-[var(--os-surface)] border border-[var(--os-border)] text-[var(--os-text-muted)] rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-neuro transition-all flex items-center gap-2">
                                    <ExternalLink className="h-3 w-3" /> GHL
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Workflow Architect Modal */}
            {isArchitectOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
                    <div className="w-full max-w-2xl bg-[var(--os-bg)] rounded-[3rem] border border-[var(--os-border)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-neuro/10 rounded-2xl flex items-center justify-center text-neuro">
                                        <Sparkles className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase italic italic leading-none">Workflow <span className="text-neuro">Architect</span></h2>
                                        <p className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mt-1">Neural Logic Builder</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsArchitectOpen(false)} className="p-2 text-[var(--os-text-muted)] hover:text-red-500 transition-colors">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form className="space-y-6" onSubmit={(e) => {
                                e.preventDefault();
                                handleCreateWorkflow({
                                    name: (e.target as any).flowName.value,
                                    trigger: (e.target as any).trigger.value,
                                    status: 'active',
                                    loads: '0',
                                    speed: '0.1s'
                                });
                            }}>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-black uppercase text-[var(--os-text-muted)] tracking-widest ml-1">Logic Name</label>
                                        <input
                                            name="flowName"
                                            type="text"
                                            required
                                            className="w-full bg-[var(--os-surface)] border border-[var(--os-border)] rounded-2xl px-6 py-4 text-sm font-bold focus:border-neuro outline-none transition-all"
                                            placeholder="e.g. AI Appointment Confirmation"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-[var(--os-text-muted)] tracking-widest ml-1">Event Trigger</label>
                                        <select
                                            name="trigger"
                                            className="w-full bg-[var(--os-surface)] border border-[var(--os-border)] rounded-2xl px-6 py-4 text-sm font-bold focus:border-neuro outline-none transition-all appearance-none"
                                        >
                                            <option>Contact Tag Added</option>
                                            <option>Form Submitted</option>
                                            <option>Inbound Call</option>
                                            <option>Opportunity Changed</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-[var(--os-text-muted)] tracking-widest ml-1">Assigned Agent</label>
                                        <select className="w-full bg-[var(--os-surface)] border border-[var(--os-border)] rounded-2xl px-6 py-4 text-sm font-bold focus:border-neuro outline-none transition-all appearance-none">
                                            <option>AI Receptionist</option>
                                            <option>Appointment Setter</option>
                                            <option>Recovery Agent</option>
                                            <option>OS Core Auditor</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-6 bg-neuro/5 rounded-2xl border border-neuro-light/20 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-neuro" />
                                        <div className="text-[10px] font-black uppercase tracking-widest">GHL Sync Integrity: Verified</div>
                                    </div>
                                    <Activity className="h-4 w-4 text-neuro animate-pulse" />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full h-16 bg-neuro hover:bg-neuro-dark text-white rounded-2xl border-none font-black text-xs tracking-[0.2em] shadow-xl shadow-neuro/30 uppercase transition-all flex items-center justify-center gap-2 group"
                                >
                                    Deploy to GHL Network <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Workflows;
