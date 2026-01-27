
import React, { useState, useEffect, useRef } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Connect from './components/Connect';
import LandingPage from './components/LandingPage';
import HelpDocs from './components/HelpDocs';
import Operator from './components/Operator';
import { saveToken, hasValidToken } from './services/vaultService';
import { ErrorProvider, useError } from './contexts/ErrorContext';
import { ExtensionThemeProvider } from './contexts/ThemeContext';
import { ToastContainer } from './components/ui/Toast';
import { VaultToken } from './types';

const checkSetupStatus = async (locationId: string | null) => {
  if (!locationId) return false;
  const result = await chrome.storage.local.get([`liv8_setup_${locationId}`]);
  return result[`liv8_setup_${locationId}`] === 'completed';
};

type ViewState = 'loading' | 'landing' | 'docs' | 'connecting' | 'onboarding' | 'dashboard';

const AppContent: React.FC = () => {
  const [view, setView] = useState<ViewState>('loading');
  const [locationId, setLocationId] = useState<string | null>(null);
  const { addToast } = useError();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const init = async () => {
      let targetLocationId: string | null = null;
      try {
        const searchParams = new URLSearchParams(window.location.search);
        targetLocationId = searchParams.get('locationId');
      } catch (e) {
        console.warn("Could not parse URL params", e);
      }

      if (!targetLocationId) {
        const result = await chrome.storage.local.get(['liv8_last_location']);
        targetLocationId = result.liv8_last_location || null;
      }

      if (targetLocationId) {
        setLocationId(targetLocationId);
        const isValid = await hasValidToken(targetLocationId);
        if (isValid) {
          const isSetup = await checkSetupStatus(targetLocationId);
          setView(isSetup ? 'dashboard' : 'onboarding');
        } else {
          setView('connecting');
        }
      } else {
        setView('landing');
      }
    };
    init();
  }, []);

  const handleAuthSuccess = async (token: VaultToken, locId: string) => {
    await saveToken(locId, token);
    setLocationId(locId);
    await chrome.storage.local.set({ liv8_last_location: locId });
    addToast("Connected", "Secure connection established.", "success");
    const isSetup = await checkSetupStatus(locId);
    setView(isSetup ? 'dashboard' : 'onboarding');
  };

  const handleOnboardingComplete = async () => {
    if (locationId) {
      await chrome.storage.local.set({ [`liv8_setup_${locationId}`]: 'completed' });
    }
    addToast("Setup Complete", "LIV8 OS is now active.", "success");
    setView('dashboard');
  };

  if (view === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--os-bg)]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-neuro rounded-2xl mb-4 shadow-xl shadow-neuro/30"></div>
          <div className="text-[var(--os-text-muted)] text-[10px] font-black uppercase tracking-[0.2em] text-center">Establishing<br />OS Core...</div>
        </div>
      </div>
    );
  }

  if (view === 'landing') return <LandingPage onLaunch={() => setView('connecting')} onOpenDocs={() => setView('docs')} />;
  if (view === 'docs') return <HelpDocs onBack={() => setView('landing')} />;
  if (view === 'connecting') return <Connect locationId={locationId} onAuth={handleAuthSuccess} />;

  return (
    <>
      {view === 'onboarding' && <Onboarding onComplete={handleOnboardingComplete} />}
      {view === 'dashboard' && <Operator />}
    </>
  );
};

const App: React.FC = () => {
  return (
    <ErrorProvider>
      <ExtensionThemeProvider>
        <AppContent />
        <ToastContainer />
      </ExtensionThemeProvider>
    </ErrorProvider>
  );
};

export default App;
