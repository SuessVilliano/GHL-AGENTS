import { BarChart3, TrendingUp, Activity, Target } from 'lucide-react';

const Analytics = () => {
    return (
        <div className="h-full bg-[var(--os-bg)] flex flex-col font-sans text-[var(--os-text)] relative overflow-x-hidden custom-scrollbar overflow-y-auto transition-colors duration-500">
            <div className="p-10 space-y-12 relative z-10">
                <header>
                    <p className="text-[10px] font-black text-neuro uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                        <BarChart3 className="h-3 w-3" /> Neural Telemetry
                    </p>
                    <h1 className="text-5xl font-black text-[var(--os-text)] tracking-tighter leading-none uppercase italic">
                        Platform <span className="text-neuro">Vitals</span>
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Performance Overview */}
                    <div className="lg:col-span-2 os-card p-10 shadow-xl shadow-blue-900/5 backdrop-blur-xl space-y-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black uppercase italic">Efficiency Curve</h3>
                            <div className="flex items-center gap-2 px-3 py-1 bg-neuro/10 rounded-lg text-neuro text-[10px] font-black">
                                <TrendingUp className="h-3 w-3" /> +18.4% Monthly
                            </div>
                        </div>
                        <div className="h-64 w-full bg-neuro/5 rounded-[2rem] border border-neuro-light/20 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-t from-neuro/10 to-transparent"></div>
                            <Activity className="h-24 w-24 text-neuro/20 group-hover:scale-125 transition-transform duration-1000" />
                            <p className="absolute bottom-6 text-[10px] font-black text-neuro/40 uppercase tracking-[0.4em]">Streaming Real-time Telemetry...</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Sentiment Module */}
                        <div className="os-card p-10 shadow-xl shadow-blue-900/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px]"></div>
                            <h4 className="text-lg font-black uppercase italic mb-6">Sentiment Pulse</h4>
                            <div className="text-5xl font-black text-emerald-500 italic uppercase">Positive</div>
                            <p className="text-[10px] font-bold text-[var(--os-text-muted)] mt-2 uppercase tracking-widest">Based on latest 482 conversations</p>
                        </div>

                        {/* Conversion Alpha */}
                        <div className="os-card p-10 bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-neuro/20 blur-[60px]"></div>
                            <Target className="h-8 w-8 text-neuro mb-6 group-hover:scale-110 transition-transform" />
                            <h4 className="text-lg font-black uppercase italic leading-none">Conversion Alpha</h4>
                            <div className="text-4xl font-black mt-3 italic">32.4%</div>
                            <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Neural appointment booking rate</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Token Utilization', value: '42%', color: 'neuro' },
                        { label: 'Avg Handshake', value: '1.2s', color: 'neuro' },
                        { label: 'Neural Accuracy', value: '99.4%', color: 'emerald-500' },
                        { label: 'GHL Uptime', value: '100%', color: 'emerald-500' }
                    ].map(stat => (
                        <div key={stat.label} className="os-card p-8 group hover:bg-neuro/5 transition-all">
                            <div className="text-[9px] font-black text-[var(--os-text-muted)] uppercase tracking-widest mb-1">{stat.label}</div>
                            <div className={`text-3xl font-black group-hover:translate-x-1 transition-transform italic uppercase ${stat.color === 'neuro' ? 'text-neuro' : 'text-emerald-500'}`}>
                                {stat.value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
