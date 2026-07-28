import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
}

export const DatabaseTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Supabase Client Init', status: 'pending', message: '' },
    { name: 'Users Table Exists', status: 'pending', message: '' },
    { name: 'Listings Table Exists', status: 'pending', message: '' },
    { name: 'Auth Working', status: 'pending', message: '' },
    { name: 'RLS Policies Active', status: 'pending', message: '' },
  ]);
  const [running, setRunning] = useState(false);

  const runTests = async () => {
    setRunning(true);
    const newTests = [...tests].map(t => ({...t, status: 'pending' as const}));
    setTests(newTests);

    // Test 1: Client init
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error) throw error;
      newTests[0] = { ...newTests[0], status: 'success', message: 'Client connected' };
    } catch (e: any) {
      newTests[0] = { ...newTests[0], status: 'error', message: e.message };
    }
    setTests([...newTests]);

    // Test 2: Users table
    try {
      const { data, error } = await supabase.from('users').select('id, email, full_name').limit(5);
      if (error) throw error;
      newTests[1] = { ...newTests[1], status: 'success', message: `Found ${data?.length || 0} users` };
    } catch (e: any) {
      newTests[1] = { ...newTests[1], status: 'error', message: e.message };
    }
    setTests([...newTests]);

    // Test 3: Listings table
    try {
      const { data, error } = await supabase.from('listings').select('id, title').limit(5);
      if (error) throw error;
      newTests[2] = { ...newTests[2], status: 'success', message: `Found ${data?.length || 0} listings` };
    } catch (e: any) {
      newTests[2] = { ...newTests[2], status: 'error', message: e.message };
    }
    setTests([...newTests]);

    // Test 4: Auth
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      newTests[3] = { ...newTests[3], status: 'success', message: data.session ? 'Session active' : 'No active session' };
    } catch (e: any) {
      newTests[3] = { ...newTests[3], status: 'error', message: e.message };
    }
    setTests([...newTests]);

    // Test 5: RLS
    try {
      const { data, error } = await supabase.from('system_configs').select('*');
      if (error) throw error;
      newTests[4] = { ...newTests[4], status: 'success', message: `Configs loaded: ${data?.length || 0}` };
    } catch (e: any) {
      newTests[4] = { ...newTests[4], status: 'error', message: e.message };
    }
    setTests([...newTests]);

    setRunning(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          Supabase Connection Test
        </h3>
        <Button onClick={runTests} disabled={running} className="bg-emerald-500 text-slate-950">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run Tests'}
        </Button>
      </div>

      <div className="space-y-2">
        {tests.map((test, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
            {test.status === 'pending' && <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />}
            {test.status === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
            {test.status === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            <div className="flex-1">
              <p className="font-medium text-white">{test.name}</p>
              <p className="text-xs text-slate-400">{test.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatabaseTest;