import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Download, Database, GitBranch, Terminal, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import DatabaseDiagramViewer from '@/components/DatabaseDiagramViewer';

const AdminDatabaseDiagramViewer: React.FC = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-emerald-400" />
            Database Schema & ERD Generator
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowMermaid(!showMermaid)} variant="outline" className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copy Mermaid ERD
            </Button>
            <Button onClick={copyToClipboard} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copy Full SQL
            </Button>
            <Button variant="outline" onClick={downloadSqlFile} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download .sql
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <p className="text-sm font-medium text-white">Generated Schema ({schema.length} characters)</p>
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
                    const match = schema.match(/```mermaid\n([\s\S]*?)\n```/);
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
                {schema}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDatabaseDiagramViewer;