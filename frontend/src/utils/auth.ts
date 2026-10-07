/**
 * Authentication and Token Utilities for WorkProof AI
 * Centralized, canonical token lifecycle, session recovery, and API authentication.
 */

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: string;
  publicSlug?: string;
  companyName?: string;
}

export const getAuthToken = (): string => {
  return (
    localStorage.getItem('workproof_access_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('jwt') ||
    sessionStorage.getItem('workproof_access_token') ||
    sessionStorage.getItem('token') ||
    ''
  );
};

export const getRefreshToken = (): string => {
  return (
    localStorage.getItem('workproof_refresh_token') ||
    sessionStorage.getItem('workproof_refresh_token') ||
    ''
  );
};

export const getStoredUser = (): StoredUser | null => {
  try {
    const raw = localStorage.getItem('workproof_user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setAuthSession = (authData: {
  tokens?: { accessToken?: string; refreshToken?: string };
  user?: StoredUser;
}): void => {
  if (authData.tokens?.accessToken) {
    localStorage.setItem('workproof_access_token', authData.tokens.accessToken);
    // Also keep compatibility keys
    localStorage.setItem('token', authData.tokens.accessToken);
  }
  if (authData.tokens?.refreshToken) {
    localStorage.setItem('workproof_refresh_token', authData.tokens.refreshToken);
  }
  if (authData.user) {
    localStorage.setItem('workproof_user', JSON.stringify(authData.user));
  }
};

export const clearAuthSession = (): void => {
  localStorage.removeItem('workproof_user');
  localStorage.removeItem('workproof_access_token');
  localStorage.removeItem('workproof_refresh_token');
  localStorage.removeItem('token');
  localStorage.removeItem('jwt');
  sessionStorage.removeItem('workproof_access_token');
  sessionStorage.removeItem('workproof_refresh_token');
  sessionStorage.removeItem('token');
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

let activeRefreshPromise: Promise<string | null> | null = null;

/**
 * Attempts to obtain a new access token using the stored refresh token.
 */
export const refreshAuthSession = async (): Promise<string | null> => {
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  activeRefreshPromise = (async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        clearAuthSession();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('workproof:auth-expired'));
        }
        return null;
      }

      const body = await res.json();
      if (body.success && body.data?.accessToken) {
        const newAccessToken = body.data.accessToken;
        localStorage.setItem('workproof_access_token', newAccessToken);
        localStorage.setItem('token', newAccessToken);
        return newAccessToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      activeRefreshPromise = null;
    }
  })();

  return activeRefreshPromise;
};

/**
 * Canonical authenticated fetch wrapper.
 * Automatically injects Bearer token and retries once if 401 is encountered and token can be refreshed.
 */
export const authFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const token = getAuthToken();

  const prepareHeaders = (currentToken: string): Headers => {
    const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;
    const headers = new Headers(init?.headers || {});

    if (currentToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${currentToken}`);
    }
    if (!isFormData && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    return headers;
  };

  let response = await fetch(input, {
    ...init,
    headers: prepareHeaders(token),
  });

  // If 401 Unauthorized, attempt automatic token recovery once
  if (response.status === 401 && getRefreshToken()) {
    const refreshedToken = await refreshAuthSession();
    if (refreshedToken) {
      // Retry original request once with fresh access token
      response = await fetch(input, {
        ...init,
        headers: prepareHeaders(refreshedToken),
      });
    }
  }

  return response;
};
