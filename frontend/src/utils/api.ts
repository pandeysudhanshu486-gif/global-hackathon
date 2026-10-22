/**
 * WorkProof AI API URL Resolver
 * Resolves API requests against VITE_API_URL if configured for cloud deployments (e.g. Vercel),
 * or falls back to relative paths for local development and proxying.
 */
export const getApiBaseUrl = (): string => {
  return (import.meta.env.VITE_API_URL || '').trim();
};

export const apiUrl = (endpoint: string): string => {
  const base = getApiBaseUrl();
  if (!base) return endpoint;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${cleanBase}${cleanPath}`;
};
