import { useState, useEffect } from 'react';
import {
    Link,
    Copy,
    Smartphone,
    Mic,
    CheckCircle2,
    Terminal,
    Sparkles,
    ChevronRight,
    Shield
} from 'lucide-react';

const WebhookManager = () => {
    const [copied, setCopied] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState(() => {
        return localStorage.getItem('os_mobile_webhook') || 'https://services.leadconnectorhq.com/hooks/...';
    });

    useEffect(() => {
        localStorage.setItem('os_mobile_webhook', webhookUrl);
    }, [webhookUrl]);

    const handleCopy = () => {
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <h3 className="text-3xl font-black uppercase italic leading-none">Mobile <span className="text-neuro">Handshake</span></h3>
                    <p className="text-sm text-[var(--os-text-muted)] font-bold">Connect your iPhone via iOS Shortcuts to trigger neural commands via voice note.</p>
                </div>
                <div className="h-14 w-14 bg-neuro/10 rounded-2xl flex items-center justify-center text-neuro shadow-lg shadow-neuro/10">
                    <Smartphone className="h-7 w-7" />
                </div>
            </div>

            <div className="os-card p-8 space-y-8 bg-[var(--os-surface)] border-2 border-neuro/20 shadow-2xl shadow-neuro/5">
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-[var(--os-text-muted)] tracking-widest ml-1 flex items-center gap-2">
                        <Link className="h-3 w-3" /> Universal Webhook Endpoint
                    </label>
                    <div className="relative group">
                        <input
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            className="w-full bg-[var(--os-bg)] border border-[var(--os-border)] rounded-2xl pl-6 pr-16 py-5 text-xs font-black text-neuro outline-none focus:border-neuro transition-colors"
                            placeholder="Paste Webhook URL (GHL, TaskMagic, Zapier)..."
                        />
                        <button
                            onClick={handleCopy}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-neuro text-white rounded-xl shadow-lg shadow-neuro/20 hover:scale-105 transition-all"
                        >
                            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                    </div>
                    <p className="text-[10px] text-[var(--os-text-muted)] font-bold pl-2">
                        * Works with any POST-compatible endpoint: GHL Automation, TaskMagic, Zapier, or Make.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-[2rem] bg-[var(--os-bg)] border border-[var(--os-border)] space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <Mic className="h-4 w-4" />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest">Voice-to-JSON Protocol</h4>
                        </div>
                        <p className="text-[10px] font-bold text-[var(--os-text-muted)] leading-relaxed">
                            iOS Shortcuts will convert your voice note to text and `POST` a JSON payload to this endpoint.
                        </p>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-[var(--os-bg)] border border-[var(--os-border)] space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <Terminal className="h-4 w-4" />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest">Neural Feedback Loop</h4>
                        </div>
                        <p className="text-[10px] font-bold text-[var(--os-text-muted)] leading-relaxed">
                            The OS will process the command and return a response for your phone to speak back to you.
                        </p>
                    </div>
                </div>

                <div className="p-6 bg-neuro/5 rounded-2xl border border-neuro-light/20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Shield className="h-5 w-5 text-neuro" />
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none text-neuro">TLS 1.3 Encryption Verified</p>
                            <p className="text-[8px] font-bold text-[var(--os-text-muted)] uppercase tracking-widest">Secure handshake active</p>
                        </div>
                    </div>
                    <Sparkles className="h-4 w-4 text-neuro animate-pulse" />
                </div>

                <a href="/ios-shortcuts-guide.pdf" target="_blank" className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group">
                    Download iOS Shortcut Template <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </a>
            </div>
        </div>
    );
};

export default WebhookManager;
