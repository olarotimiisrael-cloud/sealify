import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Download, Database, GitBranch, Terminal, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DatabaseDiagramViewer: React.FC = () => {
  const [sqlContent, setSqlContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMermaid, setShowMermaid] = useState(false);

  useEffect(() => {
    generateSchema();
  }, []);

  const generateSchema = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/admin/db-schema');
      if (response.ok) {
        const data = await response.text();
        setSqlContent(data);
      } else {
        setSqlContent('-- Error loading schema');
      }
    } catch (err) {
      console.error('Failed to load SQL schema:', err);
      setSqlContent('-- Error loading schema');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlContent);
      toast.success('SQL Copied to Clipboard!');
    } catch (err) {
      toast.error('Failed to copy SQL to clipboard');
    }
  };

  const downloadSqlFile = () => {
    const blob = new Blob([sqlContent], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sealify-schema-${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('SQL file downloaded!');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-emerald-400" />
            Database Schema & ERD Generator
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={copyToClipboard} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copy SQL Schema
            </Button>
            <Button variant="outline" onClick={downloadSqlFile} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download .sql File
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <p className="text-sm font-medium text-white">Generated Schema ({sqlContent.length} characters)</p>
              <p className="text-xs text-slate-400">
                Complete PostgreSQL schema for Sealify Nigeria marketplace with 31 tables, indexes, RLS policies, and triggers.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setShowMermaid(!showMermaid)} variant="outline" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                {showMermaid ? 'Hide' : 'Show'} Mermaid ERD
              </Button>
              <Button onClick={generateSchema} disabled={isGenerating} className="flex items-center gap-2">
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                Regenerate Schema
              </Button>
            </div>

            {showMermaid && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-96 overflow-auto">
                <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap">
                  {(() => {
                    const match = sqlContent.match(/```mermaid\n([\s\S]*?)\n```/);
                    return match ? match[1] : 'No Mermaid diagram found';
                  })()}
                </pre>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Copy the above and paste into <a href="https://mermaid.live" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">mermaid.live</a> to visualize the ERD
                </p>
              </div>
            )}

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-96 overflow-auto">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                {sqlContent}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseDiagramViewer;