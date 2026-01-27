import React from 'react';
import {
  Info,
  Settings,
  Timer,
  Layout,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Button } from './ui/Button';

interface LandingPageProps {
  onLaunch: () => void;
  onOpenDocs: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunch, onOpenDocs }) => {

  const features = [
    {
      icon: <Info className="h-6 w-6 text-white" />,
      title: "What is LIV8 OS?",
      description: "LIV8 OS is a specialized Chrome extension that eliminates CRM manual labor. Instead of manually updating records, you simply tell the agent—like 'Just called John, he's interested'—and it logs it instantly."
    },
    {
      icon: <Settings className="h-6 w-6 text-white" />,
      title: "How does it work?",
      description: "Our agent uses LLMs to understand natural language and map it to your GHL fields automatically. It identifies contacts, logs notes, and creates follow-up tasks without you ever leaving the page."
    },
    {
      icon: <Timer className="h-6 w-6 text-white" />,
      title: "Saved Selling Time",
      description: "Sales teams using LIV8 OS save an average of 5-10 hours per week on data entry. This 20% efficiency boost lets your team focus on closing deals instead of fighting with CRM menus."
    },
    {
      icon: <Layout className="h-6 w-6 text-white" />,
      title: "GHL Optimized",
      description: "Currently built with a 'GHL-First' philosophy, integrating deeply with Sub-account APIs, Workflows, and Pipelines for a seamless, lag-free experience."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-white" />,
      title: "Secure & Encrypted",
      description: "We prioritize your data security. Credentials are encrypted at rest on our secure backend. We never store raw keys in the extension, and data stays in your CRM."
    },
    {
      icon: <CheckCircle2 className="h-6 w-6 text-white" />,
      title: "How do I start?",
      description: "Connect your GHL location in under two minutes. Once connected, start typing or speaking naturally to your Operator. No complex training required—if you can type, you can use LIV8."
    }
  ];

  return (
    <div className="h-full overflow-y-auto bg-[#F9FBFF] flex flex-col font-sans text-slate-800 selection:bg-blue-100 relative">

      {/* 1. Navbar - Neuro Blue Accent */}
      <nav className="sticky top-0 z-[100] bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-neuro rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">L8</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">LIV8 OS</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
          <button className="hover:text-neuro transition" onClick={onOpenDocs}>FAQ</button>
          <Button onClick={onLaunch} className="bg-neuro hover:bg-neuro-dark text-white px-4 py-1.5 h-auto text-[9px] rounded-md shadow-lg shadow-neuro/20 border-none uppercase tracking-widest font-black">
            Sync
          </Button>
        </div>
      </nav>

      {/* 2. Hero Section - Refined for Side Panel */}
      <section className="bg-white px-6 pt-10 pb-12 text-center border-b border-slate-50 relative overflow-hidden">
        <div className="max-w-md mx-auto space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neuro-light/50 text-neuro text-[9px] font-black uppercase tracking-wider border border-neuro-light">
            <span className="flex h-1.5 w-1.5 rounded-full bg-neuro animate-pulse"></span>
            LIV8 OS v2.5
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Neural Sync for <br />
            <span className="text-neuro">Agency Operators</span>
          </h1>

          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[280px] mx-auto">
            Eliminate CRM manual labor with the first autonomous OS for GoHighLevel.
          </p>

          <div className="flex flex-col gap-3 pt-2">
            <Button onClick={onLaunch} className="h-12 bg-neuro hover:bg-neuro-dark text-white shadow-xl shadow-neuro/20 rounded-xl border-none font-bold text-xs tracking-wide">
              Initialize OS Connectivity <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
            <button onClick={onOpenDocs} className="text-[10px] font-bold text-neuro hover:underline transition flex items-center justify-center gap-1 uppercase tracking-widest pt-1">
              View Sync Protocol <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
          <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-500 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-blue-400 rounded-full blur-[100px]"></div>
        </div>
      </section>

      {/* 3. Feature Grid - FlightSuite Cards */}
      <section className="p-6 bg-[#F9FBFF]">
        <div className="grid grid-cols-1 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:border-blue-200 transition group">
              <div className="w-12 h-12 bg-[#1068EB] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 transform -rotate-3 group-hover:rotate-0 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">{f.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed overflow-hidden">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Footer - Clean Branding */}
      <footer className="mt-auto p-12 bg-white border-t border-slate-100 flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 opacity-30 grayscale">
          <div className="w-6 h-6 bg-slate-900 rounded-md"></div>
          <span className="font-bold text-sm text-slate-900 tracking-tight">LIV8 OS</span>
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] text-center leading-loose">
          Trusted by 100+ HighLevel Agencies<br />
          © 2026 LIV8 Inc.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
