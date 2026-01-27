import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowLeft,
  Layout,
  CheckCircle2,
  Clock,
  Zap,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Kanban as KanbanIcon,
  ChevronRight,
  ShieldCheck,
  Brain
} from 'lucide-react';
import { Button } from './ui/Button';

interface DashboardProps {
  locationId: string;
  onBack: () => void;
}

interface Task {
  id: string;
  title: string;
  status: 'discovered' | 'thinking' | 'syncing' | 'optimized';
  priority: 'low' | 'medium' | 'high';
  agent: string;
  updatedAt: number;
}

const Dashboard: React.FC<DashboardProps> = ({ locationId, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Simulate data fetch from os.liv8ai.com
    const timer = setTimeout(() => {
      setTasks([
        { id: '1', title: 'Extract Brand DNA from Website', status: 'optimized', priority: 'high', agent: 'OS-Scan', updatedAt: Date.now() - 500000 },
        { id: '2', title: 'Mapping GHL Custom Fields', status: 'syncing', priority: 'medium', agent: 'LIV8-Link', updatedAt: Date.now() - 100000 },
        { id: '3', title: 'Generate Automated Welcome Sequence', status: 'thinking', priority: 'high', agent: 'Voice-AI', updatedAt: Date.now() },
        { id: '4', title: 'Analyze Contact Sentiment: Lead #829', status: 'discovered', priority: 'low', agent: 'Operator', updatedAt: Date.now() },
        { id: '5', title: 'Deploy AI Reception Protocol', status: 'discovered', priority: 'high', agent: 'Receptionist', updatedAt: Date.now() }
      ]);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const columns = [
    { key: 'discovered', label: 'Discovered', color: 'bg-slate-100 text-slate-500' },
    { key: 'thinking', label: 'Neural Map', color: 'bg-neuro-light/30 text-neuro-dark' },
    { key: 'syncing', label: 'Active Sync', color: 'bg-neuro text-white' },
    { key: 'optimized', label: 'Optimized', color: 'bg-emerald-500 text-white' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-neuro rounded-2xl animate-pulse flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neuro">Syncing Ops Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#F9FBFF] flex flex-col font-sans text-slate-800">
      {/* 1. Header */}
      <header className="px-6 py-6 bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-[#1068EB] transition flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <ArrowLeft className="h-4 w-4" /> Back to Chat
          </button>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-300 hover:text-[#1068EB]"><RefreshCw className="h-4 w-4" /></button>
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-[#1068EB]" />
            </div>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase italic">LIV8 <span className="text-[#1068EB]">OS Center</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <Activity className="h-3 w-3 text-emerald-500" /> Active Location: {locationId.substring(0, 8)}...
          </p>
        </div>
      </header>

      {/* 2. Stats Bar */}
      <section className="px-6 py-4 flex gap-4 overflow-x-auto no-scrollbar">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shrink-0 w-36">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency</div>
          <div className="text-xl font-black text-neuro">+24%</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shrink-0 w-36">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tasks Syncing</div>
          <div className="text-xl font-black text-slate-900">{tasks.filter(t => t.status === 'syncing').length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shrink-0 w-36">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Core Health</div>
          <div className="text-xl font-black text-emerald-500">Optimal</div>
        </div>
      </section>

      {/* 3. Kanban Area */}
      <div className="flex-1 overflow-x-auto p-6 flex gap-6 custom-scrollbar">
        {columns.map((col) => (
          <div key={col.key} className="w-72 shrink-0 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <h3 className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${col.color}`}>
                  {col.label}
                </h3>
                <span className="text-[10px] font-bold text-slate-300">{tasks.filter(t => t.status === col.key).length}</span>
              </div>
              <button className="text-slate-300 hover:text-neuro"><Plus className="h-4 w-4" /></button>
            </div>

            <div className="flex-1 space-y-3">
              {tasks.filter(t => t.status === col.key).map((task) => (
                <div key={task.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-neuro-light hover:shadow-md transition group cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{task.agent}</span>
                    <MoreVertical className="h-3 w-3 text-slate-200 group-hover:text-slate-400" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 leading-snug group-hover:text-neuro transition">{task.title}</h4>
                  <div className="mt-4 flex items-center justify-between">
                    <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${task.priority === 'high' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'
                      }`}>
                      {task.priority}
                    </div>
                    <div className="text-[8px] font-bold text-slate-300 flex items-center gap-1">
                      <Clock className="h-2 w-2" /> {new Date(task.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status === col.key).length === 0 && (
                <div className="h-32 border-2 border-dashed border-slate-50 rounded-2xl flex items-center justify-center">
                  <p className="text-[9px] font-bold text-slate-200 uppercase">Idle Core</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
