import React, { useState, useEffect, useRef } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Connect from './components/Connect';
import { exchangeCodeForToken } from './services/ghlAuth';
import { saveToken, hasValidToken } from './services/vaultService';

const checkSetupStatus = (locationId: string | null) => {
  if (!locationId) return false;
  const status = localStorage.getItem(`liv8_setup_${locationId}`);
  return status === 'completed';
};

type ViewState = 'loading' | 'connecting' | 'processing_callback' | 'onboarding' | 'dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('loading');
  const [locationId, setLocationId] = useState<string | null>(null);
  
  // Ref to prevent double-execution of auth logic in React Strict Mode
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const init = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const locId = searchParams.get('locationId') || 'demo_location';
      
      setLocationId(locId);
      console.log(`[App] Initializing for location: ${locId}`);

      // 1. Handle OAuth Callback
      if (code) {
        console.log("[App] Auth code detected, exchanging...");
        setView('processing_callback');
        try {
          const token = await exchangeCodeForToken(code);
          saveToken(locId, token);
          console.log("[App] Token saved successfully");
          
          // Clean URL immediately
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('code');
          window.history.replaceState({}, '', newUrl.toString());

          // Check next step
          const isSetup = checkSetupStatus(locId);
          console.log(`[App] Setup status: ${isSetup}`);
          setView(isSetup ? 'dashboard' : 'onboarding');
        } catch (error) {
          console.error("[App] Auth failed", error);
          alert("Authentication failed. Please try again.");
          setView('connecting'); 
        }
        return;
      }

      // 2. Check for existing token
      try {
        const isValid = await hasValidToken(locId);
        console.log(`[App] Existing token valid? ${isValid}`);
        
        if (!isValid) {
          setView('connecting');
          return;
        }

        // 3. Authenticated -> Check Setup Status
        const isSetup = checkSetupStatus(locId);
        setView(isSetup ? 'dashboard' : 'onboarding');
      } catch (e) {
        console.error("[App] Token check failed", e);
        setView('connecting');
      }
    };

    init();
  }, []);

  const handleOnboardingComplete = () => {
    if (locationId) {
      localStorage.setItem(`liv8_setup_${locationId}`, 'completed');
    }
    setView('dashboard');
  };

  // Views
  if (view === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-900 rounded-xl mb-4 shadow-xl"></div>
          <div className="text-slate-400 font-medium">Loading Command Center...</div>
        </div>
      </div>
    );
  }

  if (view === 'processing_callback') {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <div className="text-slate-900 font-medium text-lg">Securing Access Token...</div>
          <div className="text-slate-500 text-sm">Storing credentials in Vault</div>
        </div>
      </div>
    );
  }

  if (view === 'connecting') {
    return <Connect locationId={locationId} />;
  }

  return (
    <>
      {view === 'onboarding' && <Onboarding onComplete={handleOnboardingComplete} />}
      {view === 'dashboard' && <Dashboard />}
    </>
  );
};

export default App;
