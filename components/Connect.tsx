import React, { useState } from 'react';
import { Button } from './ui/Button';
import { initiateAuth } from '../services/ghlAuth';
import { clearToken } from '../services/vaultService';

interface ConnectProps {
  locationId: string | null;
}

const Connect: React.FC<ConnectProps> = ({ locationId }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    initiateAuth(locationId || undefined);
  };

  const handleReset = () => {
    if (confirm("This will clear any stored local credentials. Continue?")) {
      if (locationId) clearToken(locationId);
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-slate-200">
          <span className="text-white font-bold text-xl">LIV8</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Connect GoHighLevel</h1>
          <p className="text-slate-500">
            Link your account to enable AI Staff, automated workflows, and AEO deployment.
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 text-left space-y-3 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="text-sm text-slate-700 font-medium">Read & Write Contacts</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="text-sm text-slate-700 font-medium">Manage Automations</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="text-sm text-slate-700 font-medium">Deploy AI Agents</span>
          </div>
        </div>

        <Button 
          onClick={handleConnect} 
          disabled={isConnecting} 
          fullWidth 
          className="h-12 text-base shadow-lg shadow-blue-500/10"
        >
          {isConnecting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Redirecting...
            </span>
          ) : (
            "Authorize Access"
          )}
        </Button>
        
        <div className="pt-2">
          <button 
            onClick={handleReset}
            className="text-xs text-slate-300 hover:text-slate-500 underline transition-colors"
          >
            Trouble connecting? Reset cache
          </button>
        </div>
      </div>
    </div>
  );
};

export default Connect;
