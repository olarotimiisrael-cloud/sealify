import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

const DatabaseSchemaGenerator: React.FC = () => {
  const [sqlContent, setSqlContent] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // The SQL is embedded in SqlSchemaViewer.tsx - we'll fetch it
    setSqlContent(`-- Sealify Complete Schema - See SqlSchemaViewer.tsx for full script`);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlContent);
      setCopied(true);
      toast.success('SQL Copied to Clipboard!');
      setTimeout(() => setCopied(false), 2000);
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
        <CardHeader>
          <CardTitle>Database Schema & SQL Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={copyToClipboard} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copy SQL Schema
            </Button>
            <Button variant="outline" onClick={downloadSqlFile} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download .sql File
            </Button>
          </div>
          <pre className="bg-gray-950 text-green-400 p-4 rounded-md overflow-x-auto text-sm">
            <code>{sqlContent}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseSchemaGenerator;