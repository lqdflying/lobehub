export type AuthType = 'basic' | 'bearer' | 'none';

/**
 * Validates that a URL starts with http:// or https://
 */
export const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Builds the Authorization header value based on auth type.
 * Returns undefined if auth type is 'none' or required fields are empty.
 */
export const buildAuthHeader = (
  type: AuthType,
  token: string,
  username: string,
  password: string,
): string | undefined => {
  if (type === 'bearer') {
    return token.trim() ? `Bearer ${token.trim()}` : undefined;
  }
  if (type === 'basic') {
    if (!username && !password) return undefined;
    return `Basic ${btoa(`${username}:${password}`)}`;
  }
  return undefined;
};

/**
 * Pretty-prints JSON string with 2-space indentation.
 * Throws SyntaxError if input is not valid JSON.
 */
export const formatJson = (text: string): string => {
  return JSON.stringify(JSON.parse(text), null, 2);
};
