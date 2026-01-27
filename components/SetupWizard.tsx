import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

type PathType = 'new' | 'existing' | null;
type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface SetupWizardProps {
    onComplete: (result: any) => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
    const [step, setStep] = useState<WizardStep>(1);
    const [pathType, setPathType] = useState<PathType>(null);
    const [brandData, setBrandData] = useState({
        niche: '',
        offer: '',
        location: '',
        websiteUrl: '',
        socials: { instagram: '', facebook: '' },
        brandVoice: 'professional'
    });
    const [selectedStaff, setSelectedStaff] = useState<string[]>([
        'AI_RECEPTIONIST',
        'MISSED_CALL_RECOVERY',
        'REVIEW_COLLECTOR'
    ]);
    const [goals, setGoals] = useState<string[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [brandBrain, setBrandBrain] = useState<any>(null);
    const [buildPlan, setBuildPlan] = useState<any>(null);

    // Step 1: Path Selection
    if (step === 1) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to LIV8 GHL! 🚀</h1>
                    <p className="text-slate-600">Let's build your AI-powered agency</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <Card
                        className="p-6 cursor-pointer hover:border-blue-500 transition-all"
                        onClick={() => {
                            setPathType('new');
                            setStep(2);
                        }}
                    >
                        <div className="text-4xl mb-4">🆕</div>
                        <h3 className="font-bold text-lg mb-2">Starting from Scratch</h3>
                        <p className="text-sm text-slate-600">
                            We'll build your complete business system from the ground up
                        </p>
                    </Card>

                    <Card
                        className="p-6 cursor-pointer hover:border-blue-500 transition-all"
                        onClick={() => {
                            setPathType('existing');
                            setStep(2);
                        }}
                    >
                        <div className="text-4xl mb-4">⚡</div>
                        <h3 className="font-bold text-lg mb-2">Already Running</h3>
                        <p className="text-sm text-slate-600">
                            We'll enhance your existing setup with AI automation
                        </p>
                    </Card>
                </div>
            </div>
        );
    }

    // Step 2: Brand Identity Form
    if (step === 2) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Tell us about your brand</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Business Niche *
                        </label>
                        <select
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                            value={brandData.niche}
                            onChange={(e) => setBrandData({ ...brandData, niche: e.target.value })}
                        >
                            <option value="">Select your industry...</option>
                            <option value="Roofing">Roofing Contractor</option>
                            <option value="HVAC">HVAC Services</option>
                            <option value="Plumbing">Plumbing</option>
                            <option value="Real Estate">Real Estate</option>
                            <option value="Fitness">Fitness & Wellness</option>
                            <option value="DentalHealth">Dental/Health</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Primary Offer *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Emergency roof repairs, Personal training"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                            value={brandData.offer}
                            onChange={(e) => setBrandData({ ...brandData, offer: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Where do you operate? *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Miami, FL or Nationwide"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                            value={brandData.location}
                            onChange={(e) => setBrandData({ ...brandData, location: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Website URL (optional - we'll scan it!)
                        </label>
                        <input
                            type="url"
                            placeholder="https://yourwebsite.com"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                            value={brandData.websiteUrl}
                            onChange={(e) => setBrandData({ ...brandData, websiteUrl: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Brand Voice
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Professional', 'Friendly', 'Bold', 'Casual'].map(voice => (
                                <button
                                    key={voice}
                                    className={`px-4 py-2 rounded-lg border transition-all ${brandData.brandVoice === voice.toLowerCase()
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-slate-300 hover:border-slate-400'
                                        }`}
                                    onClick={() => setBrandData({ ...brandData, brandVoice: voice.toLowerCase() })}
                                >
                                    {voice}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={() => setStep(1)}>
                            Back
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={() => setStep(3)}
                            disabled={!brandData.niche || !brandData.offer || !brandData.location}
                        >
                            Continue →
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 3: AI Staff Selection
    if (step === 3) {
        const staffOptions = [
            { key: 'AI_RECEPTIONIST', label: 'AI Receptionist', description: 'Answers calls 24/7, handles FAQs', recommended: true },
            { key: 'MISSED_CALL_RECOVERY', label: 'Missed Call Recovery', description: 'Instantly texts back missed calls', recommended: true },
            { key: 'REVIEW_COLLECTOR', label: 'Review Collector', description: 'Auto-requests reviews after service', recommended: true },
            { key: 'LEAD_QUALIFIER', label: 'Lead Qualifier', description: 'Pre-qualifies leads via SMS', recommended: false },
            { key: 'BOOKING_ASSISTANT', label: 'Booking Assistant', description: 'Books appointments to calendar', recommended: false },
            { key: 'REENGAGEMENT_AGENT', label: 'Re-engagement Agent', description: 'Wakes up cold leads', recommended: false }
        ];

        return (
            <div className="max-w-2xl mx-auto p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Which AI Staff do you want?</h2>

                <div className="space-y-3">
                    {staffOptions.map(staff => (
                        <div
                            key={staff.key}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedStaff.includes(staff.key)
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-slate-300 hover:border-slate-400'
                                }`}
                            onClick={() => {
                                if (selectedStaff.includes(staff.key)) {
                                    setSelectedStaff(selectedStaff.filter(k => k !== staff.key));
                                } else {
                                    setSelectedStaff([...selectedStaff, staff.key]);
                                }
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={selectedStaff.includes(staff.key)}
                                    className="mt-1"
                                    readOnly
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold">{staff.label}</h4>
                                        {staff.recommended && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                                Recommended
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">{staff.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 pt-6">
                    <Button variant="outline" onClick={() => setStep(2)}>
                        Back
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={() => setStep(4)}
                        disabled={selectedStaff.length === 0}
                    >
                        Continue →
                    </Button>
                </div>
            </div>
        );
    }

    // Step 4: Goals Selection
    if (step === 4) {
        const goalOptions = [
            'Get more leads',
            'Book more appointments',
            'Improve response time',
            'Get more reviews',
            'Automate follow-ups',
            'Nurture cold leads',
            'Reduce no-shows'
        ];

        return (
            <div className="max-w-2xl mx-auto p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">What are your primary goals?</h2>
                <p className="text-slate-600 mb-6">Select all that apply</p>

                <div className="grid md:grid-cols-2 gap-3">
                    {goalOptions.map(goal => (
                        <div
                            key={goal}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${goals.includes(goal)
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-slate-300 hover:border-slate-400'
                                }`}
                            onClick={() => {
                                if (goals.includes(goal)) {
                                    setGoals(goals.filter(g => g !== goal));
                                } else {
                                    setGoals([...goals, goal]);
                                }
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={goals.includes(goal)}
                                    readOnly
                                />
                                <span className="font-medium">{goal}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 pt-6">
                    <Button variant="outline" onClick={() => setStep(3)}>
                        Back
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={() => {
                            // Generate build plan
                            setStep(5);
                        }}
                        disabled={goals.length === 0}
                    >
                        Generate My System →
                    </Button>
                </div>
            </div>
        );
    }

    // Step 5: Preview (Placeholder)
    if (step === 5) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Build Plan Preview</h2>

                <Card className="p-6 mb-4">
                    <h3 className="font-bold mb-2">Brand Profile</h3>
                    <p>Niche: {brandData.niche}</p>
                    <p>Location: {brandData.location}</p>
                    <p>AI Staff: {selectedStaff.length} active</p>
                </Card>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(4)}>
                        Back
                    </Button>
                    <Button className="flex-1" onClick={() => onComplete({ brandData, selectedStaff, goals })}>
                        Deploy Now →
                    </Button>
                </div>
            </div>
        );
    }

    return null;
};

export default SetupWizard;
