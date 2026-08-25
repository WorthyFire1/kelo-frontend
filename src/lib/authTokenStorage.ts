const AUTH_TOKEN_KEY = 'kelo-access-token';

export const authTokenStorage = {
  get(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  set(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  remove(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },
};
