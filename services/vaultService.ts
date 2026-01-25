import { VaultToken } from "../types";
import { refreshAuthToken } from "./ghlAuth";

const VAULT_KEY_PREFIX = "liv8_vault_v1_";
// In a real application, utilize a robust encryption library or Web Crypto API.
// Ideally, keys are managed via a backend or secure enclave.
// For this client-side demo, we use a simple obfuscation layer (XOR) to prevent plain-text exposure.
const CLIENT_SECRET_MOCK = "liv8_internal_secret_key_change_in_prod";

const encrypt = (text: string): string => {
  try {
    const xor = text.split('').map((c, i) => 
      String.fromCharCode(c.charCodeAt(0) ^ CLIENT_SECRET_MOCK.charCodeAt(i % CLIENT_SECRET_MOCK.length))
    ).join('');
    return btoa(xor);
  } catch (e) {
    console.error("[Vault] Encryption error", e);
    throw new Error("Failed to secure token");
  }
};

const decrypt = (cipher: string): string => {
  try {
    const xor = atob(cipher);
    return xor.split('').map((c, i) => 
      String.fromCharCode(c.charCodeAt(0) ^ CLIENT_SECRET_MOCK.charCodeAt(i % CLIENT_SECRET_MOCK.length))
    ).join('');
  } catch (e) {
    console.error("[Vault] Decryption error", e);
    throw new Error("Failed to decrypt token");
  }
};

export const saveToken = (locationId: string, token: VaultToken): void => {
  if (!locationId || !token) {
    console.error("[Vault] Missing locationId or token for save");
    return;
  }
  
  try {
    const payload = JSON.stringify(token);
    const encrypted = encrypt(payload);
    localStorage.setItem(`${VAULT_KEY_PREFIX}${locationId}`, encrypted);
    // console.debug(`[Vault] Credentials secured for ${locationId}`);
  } catch (e) {
    console.error("[Vault] Save failed", e);
  }
};

export const getToken = async (locationId: string): Promise<VaultToken | null> => {
  if (!locationId) return null;

  try {
    const encrypted = localStorage.getItem(`${VAULT_KEY_PREFIX}${locationId}`);
    if (!encrypted) return null;
    
    let token: VaultToken;
    try {
      const decrypted = decrypt(encrypted);
      token = JSON.parse(decrypted) as VaultToken;
    } catch (e) {
      // If decryption/parse fails, the data is corrupt or from an old version.
      console.warn("[Vault] Invalid token format, clearing storage.");
      clearToken(locationId);
      return null;
    }
    
    // Expiration Check
    // We add a safety buffer (e.g. 5 minutes) to ensure we don't return a token that expires mid-request.
    const SAFETY_BUFFER_MS = 5 * 60 * 1000;
    
    if (Date.now() > (token.expiresAt - SAFETY_BUFFER_MS)) {
      console.warn("[Vault] Token expired or nearing expiration. Attempting refresh...");
      
      try {
        const newToken = await refreshAuthToken(token.refreshToken);
        saveToken(locationId, newToken);
        console.log("[Vault] Token refreshed successfully.");
        return newToken;
      } catch (refreshError) {
        console.error("[Vault] Token refresh failed:", refreshError);
        // Refresh failed (revoked, network, etc.) -> Force re-login
        clearToken(locationId); 
        return null;
      }
    }
    
    return token;
  } catch (e) {
    console.error("[Vault] Unexpected error during retrieval", e);
    return null;
  }
};

export const hasValidToken = async (locationId: string): Promise<boolean> => {
  const token = await getToken(locationId);
  return !!token;
};

export const clearToken = (locationId: string): void => {
  localStorage.removeItem(`${VAULT_KEY_PREFIX}${locationId}`);
  console.log(`[Vault] Cleared credentials for ${locationId}`);
};
