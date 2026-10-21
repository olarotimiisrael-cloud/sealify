/**
 * Lightweight, dependency-free User-Agent parser used by the admin login
 * audit log. It intentionally avoids external packages (ua-parser-js, etc.)
 * so the Workers edge runtime stays small. It is best-effort: real-world
 * UA strings are noisy, so we extract the high-signal fields the audit
 * table needs (browser name/version, OS, device type/brand/model) and fall
 * back to sensible defaults when a field cannot be identified.
 */

export interface ParsedUserAgent {
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
}

const UNKNOWN = 'Unknown';

// Order matters: more specific patterns first.
const BROWSER_PATTERNS: Array<{ name: string; regex: RegExp }> = [
  { name: 'Edge', regex: /Edg\/([0-9.]+)/ },
  { name: 'Chrome', regex: /(?:Chrome|CriOS)\/([0-9.]+)/ },
  { name: 'Firefox', regex: /(?:Firefox|FxiOS)\/([0-9.]+)/ },
  { name: 'Safari', regex: /Version\/([0-9.]+).*Safari/ },
  { name: 'Opera', regex: /(?:OPR|Opera)\/([0-9.]+)/ },
  { name: 'Samsung Internet', regex: /SamsungBrowser\/([0-9.]+)/ },
  { name: 'UC Browser', regex: /UCBrowser\/([0-9.]+)/ },
];

const OS_PATTERNS: Array<{ name: string; regex: RegExp }> = [
  { name: 'Windows', regex: /Windows NT ([0-9.]+)/ },
  { name: 'macOS', regex: /Mac OS X ([0-9_]+)/ },
  { name: 'iOS', regex: /OS ([0-9_]+) like Mac OS X/ },
  { name: 'Android', regex: /Android ([0-9.]+)/ },
  { name: 'Linux', regex: /Linux/ },
];

const DEVICE_PATTERNS: Array<{ type: string; regex: RegExp; brand?: string; model?: string }> = [
  { type: 'Mobile', regex: /Mobi(?:le)?\// },
  { type: 'Tablet', regex: /iPad/ },
  { type: 'Tablet', regex: /Android(?![\s\w]*Mobi)/ },
  { type: 'Desktop', regex: /Windows|Mac OS X|Linux/ },
];

const BRAND_PATTERNS: Array<{ brand: string; regex: RegExp }> = [
  { brand: 'Apple', regex: /iPhone/ },
  { brand: 'Apple', regex: /iPad/ },
  { brand: 'Apple', regex: /Mac/ },
  { brand: 'Samsung', regex: /Samsung/ },
  { brand: 'Google', regex: /Pixel/ },
  { brand: 'OnePlus', regex: /OnePlus/ },
  { brand: 'Xiaomi', regex: /Xiaomi|Redmi|Mi\// },
  { brand: 'Huawei', regex: /Huawei/ },
  { brand: 'Oppo', regex: /OPPO/ },
  { brand: 'Vivo', regex: /Vivo/ },
];

function matchPattern<T extends { regex: RegExp }>(patterns: T[], ua: string): T | null {
  for (const pattern of patterns) {
    if (pattern.regex.test(ua)) return pattern;
  }
  return null;
}

function extractVersion(regex: RegExp, ua: string): string {
  const match = ua.match(regex);
  return match && match[1] ? match[1].replace(/_/g, '.') : '';
}

/**
 * Parse a raw User-Agent string into the structured fields the audit log
 * stores. Never throws; on any unexpected input it returns safe defaults.
 */
export function parseUserAgent(ua: string | null | undefined): ParsedUserAgent {
  const safe = (ua || '').trim() || UNKNOWN;

  const browserMatch = matchPattern(BROWSER_PATTERNS, safe);
  const browserName = browserMatch ? browserMatch.name : UNKNOWN;
  const browserVersion = browserMatch ? extractVersion(browserMatch.regex, safe) : '';

  const osMatch = matchPattern(OS_PATTERNS, safe);
  const osName = osMatch ? osMatch.name : UNKNOWN;
  const osVersion = osMatch ? extractVersion(osMatch.regex, safe) : '';

  let deviceType = 'Desktop';
  let deviceBrand = UNKNOWN;
  let deviceModel = UNKNOWN;

  if (/Mobi(?:le)?\//.test(safe)) {
    deviceType = 'Mobile';
  } else if (/iPad/.test(safe)) {
    deviceType = 'Tablet';
  } else if (/Android(?![\s\w]*Mobi)/.test(safe)) {
    deviceType = 'Tablet';
  } else if (/Windows|Mac OS X|Linux/.test(safe)) {
    deviceType = 'Desktop';
  }

  const brandMatch = matchPattern(BRAND_PATTERNS, safe);
  if (brandMatch) {
    deviceBrand = brandMatch.brand;
  }

  // Best-effort model extraction for a few well-known families.
  if (deviceBrand === 'Apple') {
    if (/iPhone/.test(safe)) deviceModel = 'iPhone';
    else if (/iPad/.test(safe)) deviceModel = 'iPad';
    else if (/Mac/.test(safe)) deviceModel = 'Mac';
  } else if (deviceBrand === 'Samsung') {
    const m = safe.match(/SM-[A-Z0-9]+/);
    deviceModel = m ? m[0] : 'Samsung Galaxy';
  } else if (deviceBrand === 'Google') {
    const m = safe.match(/Pixel\s+\d+/);
    deviceModel = m ? m[0] : 'Pixel';
  } else if (deviceBrand === 'OnePlus') {
    deviceModel = 'OnePlus';
  }

  return {
    browserName,
    browserVersion,
    osName,
    osVersion,
    deviceType,
    deviceBrand,
    deviceModel,
  };
}