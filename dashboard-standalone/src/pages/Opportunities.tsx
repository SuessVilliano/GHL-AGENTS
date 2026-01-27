import { useState } from 'react';
import { Target, Search, MessageCircle, MoreVertical, Sparkles } from 'lucide-react';

const Opportunities = () => {
    const [filter, setFilter] = useState('All');

    const allOpportunities = [
        { id: '1', name: 'James Wilson', value: '$2,400', sentiment: 'Highly Interested', status: 'Hot', lastAction: 'AI Receptionist Handled Call', color: 'emerald-500' },
        { id: '2', name: 'Sarah Chen', value: '$4,800', sentiment: 'Questioning Pricing', status: 'Warm', lastAction: 'Recovery Agent Sent SMS', color: 'amber-500' },
        { id: '3', name: 'Mike Ross', value: '$1,200', sentiment: 'Ready to Book', status: 'Hot', lastAction: 'Appointment Setter Mapping Calendar', color: 'emerald-500' },
        { id: '4', name: 'Elena Rodriguez', value: '$3,500', sentiment: 'Busy / Follow-up', status: 'Cold', lastAction: 'System Monitoring Active', color: 'blue-500' },
    ];

    const opportunities = filter === 'All'
        ? allOpportunities
        : allOpportunities.filter(o => o.status === filter);

    return (
        <div className="h-full bg-[var(--os-bg)] flex flex-col font-sans text-[var(--os-text)] relative overflow-x-hidden custom-scrollbar overflow-y-auto transition-colors duration-500">
            <div className="p-10 space-y-12 relative z-10">
                <header className="flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-black text-neuro uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                            <Target className="h-3 w-3" /> Revenue Orchestration
                        </p>
                        <h1 className="text-5xl font-black text-[var(--os-text)] tracking-tighter leading-none uppercase italic">
                            Opportunities <span className="text-neuro">By AI</span>
                        </h1>
                        <p className="text-[var(--os-text-muted)] text-xs font-bold mt-4">Leads categorized and nurtured via real-time neural sentiment detection.</p>
                    </div>
                </header>

                <div className="flex items-center justify-between gap-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--os-text-muted)]" />
                        <input
                            type="text"
                            className="w-full bg-[var(--os-surface)] border border-[var(--os-border)] rounded-[2rem] pl-14 pr-6 py-4 text-sm font-bold focus:border-neuro outline-none transition-all"
                            placeholder="Search lead intelligence..."
                        />
                    </div>
                    <div className="flex bg-[var(--os-surface)] p-1.5 rounded-2xl border border-[var(--os-border)]">
                        {['All', 'Hot', 'Warm', 'Cold'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === cat ? 'bg-neuro text-white shadow-lg' : 'text-[var(--os-text-muted)] hover:text-neuro'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {opportunities.map((opp) => (
                        <div key={opp.id} className="os-card p-8 flex items-center justify-between hover:border-neuro/30 group transition-all relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-32 h-full bg-${opp.color}/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity`}></div>

                            <div className="flex items-center gap-8 relative z-10">
                                <div className="h-16 w-16 rounded-[1.5rem] bg-[var(--os-surface)] border border-[var(--os-border)] flex items-center justify-center text-neuro group-hover:scale-110 transition-transform">
                                    <MessageCircle className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase italic leading-none">{opp.name}</h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest">{opp.value} Value</span>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest text-${opp.color}`}>{opp.sentiment}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-12 relative z-10">
                                <div className="text-right">
                                    <div className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-1">Last AI Protocol</div>
                                    <div className="text-xs font-bold flex items-center gap-2 justify-end">
                                        <Sparkles className="h-3 w-3 text-neuro" /> {opp.lastAction}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`h-12 px-6 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest ${opp.status === 'Hot' ? 'bg-emerald-500 text-white animate-pulse' : 'bg-[var(--os-surface)] border border-[var(--os-border)] text-[var(--os-text-muted)]'
                                        }`}>
                                        {opp.status}
                                    </div>
                                    <button className="p-4 bg-[var(--os-bg)] border border-[var(--os-border)] rounded-2xl text-[var(--os-text-muted)] hover:text-neuro transition-all">
                                        <MoreVertical className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Opportunities;
