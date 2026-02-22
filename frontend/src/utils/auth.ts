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
