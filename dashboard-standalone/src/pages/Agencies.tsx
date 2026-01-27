import { useState } from 'react';
import { Users, Search, Plus, MoreVertical, Globe } from 'lucide-react';

const Agencies = () => {
    const [statusFilter, setStatusFilter] = useState('All');

    const allAgencies = [
        { name: 'Solar Pro Systems', locations: 8, status: 'Active', health: 98, region: 'Global' },
        { name: 'LIV8 Real Estate', locations: 14, status: 'Active', health: 92, region: 'North America' },
        { name: 'Dental Growth Lab', locations: 5, status: 'Provisioning', health: 0, region: 'Europe' },
        { name: 'Elite HVAC Ops', locations: 12, status: 'Active', health: 95, region: 'Global' },
    ];

    const agencies = statusFilter === 'All'
        ? allAgencies
        : allAgencies.filter(a => a.status === statusFilter);

    return (
        <div className="h-full bg-[var(--os-bg)] flex flex-col font-sans text-[var(--os-text)] relative overflow-x-hidden custom-scrollbar overflow-y-auto transition-colors duration-500">
            <div className="p-10 space-y-12 relative z-10">
                <header className="flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-black text-neuro uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                            <Users className="h-3 w-3" /> Network Orchestration
                        </p>
                        <h1 className="text-5xl font-black text-[var(--os-text)] tracking-tighter leading-none uppercase italic">
                            Agency <span className="text-neuro">Fidelity</span>
                        </h1>
                        <p className="text-[var(--os-text-muted)] text-xs font-bold mt-4">Manage multi-location sub-accounts and AI staff allocation.</p>
                    </div>
                    <button className="h-14 px-8 bg-neuro text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-neuro/20 flex items-center gap-3 hover:scale-105 transition-transform">
                        <Plus className="h-4 w-4" /> Onboard Agency
                    </button>
                </header>

                <div className="flex items-center justify-between gap-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--os-text-muted)]" />
                        <input
                            type="text"
                            className="w-full bg-[var(--os-surface)] border border-[var(--os-border)] rounded-[2rem] pl-14 pr-6 py-4 text-sm font-bold focus:border-neuro outline-none transition-all"
                            placeholder="Search network nodes..."
                        />
                    </div>
                    <div className="flex bg-[var(--os-surface)] p-1.5 rounded-2xl border border-[var(--os-border)]">
                        {['All', 'Active', 'Provisioning'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setStatusFilter(cat)}
                                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === cat ? 'bg-neuro text-white shadow-lg' : 'text-[var(--os-text-muted)] hover:text-neuro'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {agencies.map((agency) => (
                        <div key={agency.name} className="os-card p-6 flex items-center justify-between hover:border-neuro/30 group transition-all">
                            <div className="flex items-center gap-6">
                                <div className="h-14 w-14 rounded-2xl bg-neuro/10 flex items-center justify-center text-neuro group-hover:bg-neuro group-hover:text-white transition-all">
                                    <Globe className="h-7 w-7" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase italic">{agency.name}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-[var(--os-text-muted)] uppercase tracking-widest">
                                        <span>{agency.locations} Locations Linked</span>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <span>{agency.region}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-10">
                                <div className="text-right">
                                    <div className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-1">Health</div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-1.5 bg-[var(--os-bg)] rounded-full border border-[var(--os-border)] overflow-hidden">
                                            <div className="bg-emerald-500 h-full" style={{ width: `${agency.health}%` }}></div>
                                        </div>
                                        <span className="text-xs font-black text-emerald-500">{agency.health}%</span>
                                    </div>
                                </div>
                                <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${agency.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                    }`}>
                                    {agency.status}
                                </div>
                                <button className="p-3 bg-[var(--os-bg)] border border-[var(--os-border)] rounded-xl text-[var(--os-text-muted)] hover:text-neuro">
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Agencies;
