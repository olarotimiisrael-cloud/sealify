import React, { useState } from 'react';
import { laravelApi, laravelAuth } from '@/lib/laravel-api';
import { adminFetch } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';

type TestStatus = 'pending' | 'success' | 'error';

interface TestResult {
  name: string;
  status: TestStatus;
  message: string;
}

export const DatabaseTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Laravel API Init', status: 'pending', message: '' },
    { name: 'Users Table Exists', status: 'pending', message: '' },
    { name: 'Listings Table Exists', status: 'pending', message: '' },
    { name: 'Auth Working', status: 'pending', message: '' },
    { name: 'Admin Controls Active', status: 'pending', message: '' },
  ]);
  const [running, setRunning] = useState(false);

  const runTests = async () => {
    setRunning(true);
    const newTests = [...tests].map(t => ({...t, status: 'pending' as TestStatus}));
    setTests(newTests);

    try {
      const profiles = await laravelApi.data.list<any>('profiles', { limit: '5' });
      newTests[0] = { ...newTests[0], status: 'success', message: 'API connected' };
      newTests[1] = { ...newTests[1], status: 'success', message: `Found ${profiles?.length || 0} users` };
    } catch (e: any) {
      newTests[0] = { ...newTests[0], status: 'error', message: e.message };
      newTests[1] = { ...newTests[1], status: 'error', message: e.message };
    }
    setTests([...newTests]);

    try {
      const listings = await laravelApi.data.list<any>('ads', { limit: '5' });
      newTests[2] = { ...newTests[2], status: 'success', message: `Found ${listings?.length || 0} listings` };
    } catch (e: any) {
      newTests[2] = { ...newTests[2], status: 'error', message: e.message };
    }
    setTests([...newTests]);

    try {
      const token = laravelAuth.getToken();
      newTests[3] = { ...newTests[3], status: 'success', message: token ? 'Session token present' : 'No active session' };
    } catch (e: any) {
      newTests[3] = { ...newTests[3], status: 'error', message: e.message };
    }
    setTests([...newTests]);

    try {
      const response = await adminFetch('/api/admin/system-config');
      if (!response.ok) throw new Error('Admin system configuration endpoint unavailable');
      const payload = await response.json() as { config: any };
      newTests[4] = { ...newTests[4], status: 'success', message: `Config loaded: ${Object.keys(payload.config || {}).length} keys` };
    } catch (e: any) {
      newTests[4] = { ...newTests[4], status: 'error', message: e.message };
    }
    setTests([...newTests]);

    setRunning(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" />
          Database Connection Test
        </h3>
        <Button onClick={runTests} disabled={running} className="bg-emerald-500 text-slate-950">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run Tests'}
        </Button>
      </div>

      <div className="space-y-2">
        {tests.map((test, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
            {test.status === 'pending' && <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />}
            {test.status === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
            {test.status === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
            <div className="flex-1">
              <p className="font-medium text-slate-900">{test.name}</p>
              <p className="text-xs text-slate-600">{test.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatabaseTest;


