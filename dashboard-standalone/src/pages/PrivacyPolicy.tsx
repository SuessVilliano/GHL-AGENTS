
import { ShieldCheck, ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-[var(--os-bg)] font-sans text-[var(--os-text)] p-10">
            <div className="max-w-4xl mx-auto space-y-12">
                <header>
                    <Link to="/login" className="inline-flex items-center gap-2 text-[var(--os-text-muted)] hover:text-neuro transition-colors mb-8 text-xs font-black uppercase tracking-widest">
                        <ArrowLeft className="h-4 w-4" /> Back to OS
                    </Link>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 bg-neuro/10 rounded-2xl flex items-center justify-center text-neuro">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Privacy <span className="text-neuro">Protocol</span></h1>
                    </div>
                    <p className="text-sm font-bold text-[var(--os-text-muted)]">Last Updated: January 26, 2026</p>
                </header>

                <div className="space-y-10 text-sm leading-relaxed text-[var(--os-text-muted)]">
                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-[var(--os-text)] uppercase italic">1. Introduction</h2>
                        <p>
                            LIV8 OS ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our Chrome Extension and Web Dashboard (collectively, the "Service").
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-[var(--os-text)] uppercase italic">2. Data We Collect</h2>
                        <div className="space-y-2">
                            <p><strong className="text-[var(--os-text)]">a) Account Information:</strong> We collect your email address and authentication tokens to verify your identity and manage your session.</p>
                            <p><strong className="text-[var(--os-text)]">b) CRM Data:</strong> To provide core functionality, our Service interacts with the GoHighLevel (GHL) platform. We may process contact details, workflows, and opportunity data locally in your browser to execute commands.</p>
                            <p><strong className="text-[var(--os-text)]">c) Voice Commands:</strong> If you use the voice features, audio data is processed locally or via ephemeral secure API calls to interpret your intent. We do not store raw audio recordings.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-[var(--os-text)] uppercase italic">3. How We Use Your Data</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>To authenticate your access to the LIV8 OS ecosystem.</li>
                            <li>To execute automation tasks within your GHL instance.</li>
                            <li>To provide personalized "Neural" suggestions based on your agency's activity.</li>
                            <li>To improve the performance and reliability of the Service.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-[var(--os-text)] uppercase italic">4. Data Storage & Security</h2>
                        <p>
                            We prioritize local processing. Most operational data (like GHL session tokens) is stored securely in your browser's local storage (`chrome.storage`). Any data transmitted to our backend is encrypted using industry-standard protocols (HTTPS/TLS). We do not sell your personal data to third parties.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-[var(--os-text)] uppercase italic">5. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact our support channel.
                        </p>
                        <a href="mailto:support@liv8ai.com" className="inline-flex items-center gap-2 text-neuro font-black uppercase tracking-widest hover:underline mt-2">
                            <Mail className="h-4 w-4" /> support@liv8ai.com
                        </a>
                    </section>
                </div>

                <footer className="pt-12 border-t border-[var(--os-border)] text-center">
                    <p className="text-[10px] font-black text-[var(--os-text-muted)] uppercase tracking-widest">
                        © 2026 LIV8 OS. All Neural Rights Reserved.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
