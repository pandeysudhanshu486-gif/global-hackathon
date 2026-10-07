import crypto from 'crypto';

export const computeSha256 = (data: unknown): string => {
  const serialized = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(serialized).digest('hex');
};
