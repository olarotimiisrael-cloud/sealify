import { apiUrl, appEnv } from './env';

export function testApiUrl() {
  const testCases = [
    { base: '/api', path: '/api/auth/admin-login', expected: '/api/auth/admin-login' },
    { base: '/api', path: '/auth/admin-login', expected: '/api/auth/admin-login' },
    { base: 'https://sealify.pages.dev/api', path: '/api/auth/admin-login', expected: 'https://sealify.pages.dev/api/auth/admin-login' },
    { base: 'https://sealify.pages.dev/api', path: '/auth/admin-login', expected: 'https://sealify.pages.dev/api/auth/admin-login' },
    { base: 'https://sealify.thesealconsult.com.ng', path: '/api/auth/admin-login', expected: 'https://sealify.thesealconsult.com.ng/api/auth/admin-login' },
  ];

  const failed: string[] = [];

  for (const { base, path, expected } of testCases) {
    const originalBase = appEnv.apiBase;
    Object.defineProperty(appEnv, 'apiBase', { value: base, writable: true, configurable: true });

    const result = apiUrl(path);
    if (result !== expected) {
      failed.push(`apiUrl('${path}' with base '${base}' => '${result}' (expected '${expected}')`);
    }
  }

  if (failed.length > 0) {
    console.error('apiUrl tests failed:');
    failed.forEach(f => console.error('  ' + f));
    process.exit(1);
  }

  console.log('apiUrl: all tests passed');
  return true;
}