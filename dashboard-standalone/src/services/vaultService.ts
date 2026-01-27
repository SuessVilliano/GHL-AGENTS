
import type { VaultToken } from "../types";
import { refreshAuthToken } from "./ghlAuth";
import { AuthError, AppError } from "./errors";
import { logger } from "./logger";

const VAULT_KEY_PREFIX = "liv8_vault_v1_";
const CLIENT_SECRET_MOCK = "liv8_internal_secret_key_change_in_prod";

const encrypt = (text: string): string => {
  try {
    const xor = text.split('').map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ CLIENT_SECRET_MOCK.charCodeAt(i % CLIENT_SECRET_MOCK.length))
    ).join('');
    return btoa(xor);
  } catch (e) {
    throw new AppError("Encryption failed during token storage", "AUTH", e);
  }
};

const decrypt = (cipher: string): string => {
  try {
    const xor = atob(cipher);
    return xor.split('').map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ CLIENT_SECRET_MOCK.charCodeAt(i % CLIENT_SECRET_MOCK.length))
    ).join('');
  } catch (e) {
    throw new AuthError("Failed to decrypt stored credentials.", e);
  }
};

const storage = {
  async get(keys: string[]) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return chrome.storage.local.get(keys);
    }
    const result: any = {};
    keys.forEach(k => {
      const val = localStorage.getItem(k);
      if (val) result[k] = val;
    });
    return result;
  },
  async set(items: any) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return chrome.storage.local.set(items);
    }
    Object.keys(items).forEach(k => localStorage.setItem(k, items[k]));
  },
  async remove(keys: string[]) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return chrome.storage.local.remove(keys);
    }
    keys.forEach(k => localStorage.removeItem(k));
  }
};

export const saveToken = async (locationId: string, token: VaultToken): Promise<void> => {
  if (!locationId || !token) {
    logger.error("[Vault] Missing locationId or token for save");
    return;
  }

  try {
    const payload = JSON.stringify(token);
    const encrypted = encrypt(payload);
    const key = `${VAULT_KEY_PREFIX}${locationId}`;

    await storage.set({
      [key]: encrypted,
      'sessionToken': token.accessToken,
      'currentLocationId': locationId
    });
    logger.info(`[Vault] Credentials saved for ${locationId}`);
  } catch (e) {
    logger.error("[Vault] Save failed.", e);
  }
};

export const clearToken = async (locationId: string): Promise<void> => {
  try {
    const key = `${VAULT_KEY_PREFIX}${locationId}`;
    await storage.remove([key, 'sessionToken', 'currentLocationId']);
    logger.info(`[Vault] Cleared credentials for ${locationId}`);
  } catch (e) {
    logger.warn("[Vault] Failed to clear token", e);
  }
};

export const getToken = async (locationId: string): Promise<VaultToken | null> => {
  if (!locationId) return null;

  const key = `${VAULT_KEY_PREFIX}${locationId}`;
  let encrypted: string | null = null;

  try {
    const result = await storage.get([key]);
    encrypted = result[key] || null;
  } catch (e) {
    logger.error("[Vault] Storage access denied", e);
    return null;
  }

  if (!encrypted) return null;

  let token: VaultToken;

  // 1. Decrypt
  try {
    const decrypted = decrypt(encrypted);
    token = JSON.parse(decrypted) as VaultToken;
  } catch (e) {
    logger.warn(`[Vault] Corrupt token data for ${locationId}. Clearing.`);
    await clearToken(locationId);
    return null;
  }

  // 2. Check Expiration & Refresh
  const SAFETY_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

  if (Date.now() > (token.expiresAt - SAFETY_BUFFER_MS)) {
    if (!token.refreshToken) {
      logger.warn("[Vault] Static token expired.");
      await clearToken(locationId);
      throw new AuthError("Session expired. Please reconnect.");
    }

    logger.info("[Vault] Token expired or nearing expiration. Attempting refresh...");

    try {
      const newToken = await refreshAuthToken(token.refreshToken);
      await saveToken(locationId, newToken);
      logger.info("[Vault] Token refreshed successfully.");
      return newToken;
    } catch (refreshError) {
      logger.error("[Vault] Token refresh failed", refreshError);
      await clearToken(locationId);
      throw new AuthError("Session expired. Please reconnect.", refreshError);
    }
  }

  return token;
};

export const hasValidToken = async (locationId: string): Promise<boolean> => {
  try {
    const token = await getToken(locationId);
    return !!token;
  } catch (e) {
    return false;
  }
};
