import { VaultToken } from "../types";

// Configuration
const CLIENT_ID = process.env.NEXT_PUBLIC_GHL_CLIENT_ID || 'mock_client_id';
const SCOPES = [
  'businesses.readonly',
  'businesses.write',
  'conversations.readonly',
  'conversations.write',
  'contacts.readonly',
  'contacts.write'
].join(' ');

export const initiateAuth = (locationId?: string) => {
  // Simulating the redirect to GHL OAuth page.
  console.log("[OAuth] Initiating flow...");
  
  // For this demo, we reload the page with a mock code parameter to simulate the callback.
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('code', `mock_auth_code_${Date.now()}`);
  
  // Preserve locationId if present
  if (locationId) {
    currentUrl.searchParams.set('locationId', locationId);
  }
  
  // Simulate network delay then redirect
  setTimeout(() => {
    // Using assign to ensure browser treats it as navigation
    window.location.assign(currentUrl.toString());
  }, 1000);
};

export const exchangeCodeForToken = async (code: string): Promise<VaultToken> => {
  console.log(`[OAuth] Exchanging code: ${code}`);
  
  // Simulate API call to backend /oauth/callback
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Mock successful response
      if (code) {
        resolve({
          accessToken: `ghl_access_${Math.random().toString(36).substring(2)}`,
          refreshToken: `ghl_refresh_${Math.random().toString(36).substring(2)}`,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
          scope: SCOPES
        });
      } else {
        reject(new Error("Invalid authorization code"));
      }
    }, 1500);
  });
};

export const refreshAuthToken = async (refreshToken: string): Promise<VaultToken> => {
  console.log(`[OAuth] Refreshing token with refresh_token: ${refreshToken.substring(0, 10)}...`);
  
  // Simulate API call to backend /oauth/token with grant_type=refresh_token
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Basic validation for mock purposes
      if (refreshToken && refreshToken.startsWith('ghl_refresh_')) {
        resolve({
          accessToken: `ghl_access_${Math.random().toString(36).substring(2)}`,
          refreshToken: `ghl_refresh_${Math.random().toString(36).substring(2)}`,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
          scope: SCOPES
        });
      } else {
        reject(new Error("Invalid or expired refresh token"));
      }
    }, 1000);
  });
};
