const TOKEN_KEY = 'talos_auth_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);

export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

export const isLoggedIn = (): boolean => !!getToken();

/** Returns Authorization header object to spread into any fetch call */
export const getAuthHeaders = (): Record<string, string> => {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/** Decodes the JWT payload without verifying the signature (UI-only use) */
const getTokenPayload = (): Record<string, unknown> | null => {
    const token = getToken();
    if (!token) return null;
    try {
        const payloadB64 = token.split('.')[1];
        return JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
        return null;
    }
};

/** Returns true only if the stored token carries role === 'admin' */
export const isAdmin = (): boolean => getTokenPayload()?.role === 'admin';
