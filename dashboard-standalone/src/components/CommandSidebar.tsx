import React, { useState, useRef, useEffect } from 'react';
import {
    X,
    Send,
    Sparkles,
    User,
    Cpu,
    MessageSquare,
    Terminal,
    Zap,
    Mic,
    Loader2
} from 'lucide-react';
import { generateActionPlan } from '../services/geminiService';

interface Message {
    id: string;
    role: 'user' | 'agent';
    text: string;
    agentName?: string;
    timestamp: number;
}

interface CommandSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const CommandSidebar: React.FC<CommandSidebarProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'agent', text: 'Handshake complete. LIV8 OS Command Hub initialized. How can I assist with your agency orchestration?', agentName: 'Core OS', timestamp: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isProcessing]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isProcessing) return;

        const originalInput = input;
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: originalInput, timestamp: Date.now() };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsProcessing(true);

        try {
            // Execute Neural Action
            const actionPlan = await generateActionPlan(originalInput, { source: 'side_panel' });

            const agentMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                text: actionPlan.summary || "Command processed. Executing neural workflow...",
                agentName: 'Orchestrator',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, agentMsg]);
        } catch (error) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                text: "Neural Link Disrupted. Please check your connectivity or API configuration.",
                agentName: 'System Alert',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity duration-500 md:block hidden" onClick={onClose} />}

            {/* Sidebar */}
            <aside className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-[var(--os-bg)] border-l border-[var(--os-border)] shadow-2xl z-[110] transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full relative">

                    {/* Header */}
                    <div className="p-8 border-b border-[var(--os-border)] flex items-center justify-between bg-[var(--os-surface)]/50 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-neuro rounded-xl flex items-center justify-center shadow-lg shadow-neuro/20">
                                <Terminal className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black uppercase italic leading-none">Neural <span className="text-neuro">Command</span></h2>
                                <p className="text-[9px] font-bold text-[var(--os-text-muted)] uppercase tracking-widest mt-1">Universal OS Sidepanel</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-[var(--os-text-muted)] hover:text-neuro transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[var(--os-bg)]">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {msg.role === 'agent' && <div className="h-5 w-5 rounded-md bg-neuro/10 flex items-center justify-center text-neuro"><Cpu className="h-3 w-3" /></div>}
                                    <span className="text-[10px] font-black uppercase text-[var(--os-text-muted)] tracking-widest">
                                        {msg.role === 'agent' && msg.agentName ? msg.agentName : msg.role === 'agent' ? 'Admin' : 'You'}
                                    </span>
                                    {msg.role === 'user' && <div className="h-5 w-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-400"><User className="h-3 w-3" /></div>}
                                </div>
                                <div className={`
                                    max-w-[85%] p-5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm
                                    ${msg.role === 'user'
                                        ? 'bg-neuro text-white rounded-tr-none'
                                        : 'bg-[var(--os-surface)] text-[var(--os-text)] border border-[var(--os-border)] rounded-tl-none'}
                                `}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {isProcessing && (
                            <div className="flex flex-col items-start animate-pulse">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-5 w-5 rounded-md bg-neuro/10 flex items-center justify-center text-neuro"><Cpu className="h-3 w-3" /></div>
                                    <span className="text-[10px] font-black uppercase text-[var(--os-text-muted)] tracking-widest">Processing</span>
                                </div>
                                <div className="bg-[var(--os-surface)] border border-[var(--os-border)] text-[var(--os-text)] rounded-2xl rounded-tl-none p-5 flex items-center gap-3">
                                    <Loader2 className="h-4 w-4 animate-spin text-neuro" />
                                    <span className="text-xs font-bold text-[var(--os-text-muted)]">Analyzing signal...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Tools */}
                    <div className="px-8 py-3 flex items-center gap-3 bg-[var(--os-surface)]/30 border-t border-[var(--os-border)] overflow-x-auto no-scrollbar">
                        {[
                            { label: 'SEO Audit', icon: Zap },
                            { label: 'Draft Post', icon: MessageSquare },
                            { label: 'Check Vitals', icon: Sparkles }
                        ].map(tool => (
                            <button
                                key={tool.label}
                                onClick={() => setInput(tool.label)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--os-bg)] border border-[var(--os-border)] text-[9px] font-black uppercase tracking-widest text-[var(--os-text-muted)] hover:text-neuro hover:border-neuro transition-all whitespace-nowrap"
                            >
                                <tool.icon className="h-3 w-3" /> {tool.label}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-8 bg-[var(--os-surface)]/50 backdrop-blur-md">
                        <form onSubmit={handleSendMessage} className="relative group">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a command or assign a task..."
                                className="w-full bg-[var(--os-bg)] border border-[var(--os-border)] rounded-2xl pl-6 pr-24 py-5 text-sm font-bold text-[var(--os-text)] focus:border-neuro outline-none transition-all shadow-inner placeholder:text-[var(--os-text-muted)]"
                                disabled={isProcessing}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <button type="button" className="p-2 text-[var(--os-text-muted)] hover:text-neuro transition-colors"><Mic className="h-4 w-4" /></button>
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isProcessing}
                                    className={`h-10 w-10 bg-neuro text-white rounded-xl flex items-center justify-center shadow-lg shadow-neuro/20 transition-all ${(!input.trim() || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default CommandSidebar;
