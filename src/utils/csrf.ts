// CSRF protection utilities for forms
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const setCSRFToken = (token: string): void => {
  localStorage.setItem('csrf_token', token);
  document.cookie = `csrf_token=${token}; SameSite=Strict; Secure; Path=/`;
};

export const getCSRFToken = (): string | null => {
  return localStorage.getItem('csrf_token');
};

export const validateCSRFToken = (token: string): boolean => {
  const stored = getCSRFToken();
  return stored === token && stored !== null;
};

export const clearCSRFToken = (): void => {
  localStorage.removeItem('csrf_token');
  document.cookie = 'csrf_token=; Max-Age=0; SameSite=Strict; Secure; Path=/';
};

// Initialize on app load
export const initCSRF = (): void => {
  if (!getCSRFToken()) {
    const token = generateCSRFToken();
    setCSRFToken(token);
  }
};