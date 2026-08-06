const safeParseJSON = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved) as T;
  } catch (e) {
    console.warn(`Failed to parse ${key} from localStorage:`, e);
    localStorage.removeItem(key);
    return fallback;
  }
};