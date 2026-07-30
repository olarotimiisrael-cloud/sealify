<div className="space-y-3">
            {STORAGE_BUCKETS.map(bucket => (
              <div key={bucket.name} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                      <Database className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{bucket.name}</h4>
                      <p className="text-xs text-slate-400">{bucket.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">
                    {bucket.policies.length} RLS Policies
                  </span>
                </div>
                <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg overflow-x-auto"><code>{bucket.policies.map(p =>
`CREATE POLICY "${p.name}" ON storage.objects FOR ${p.command} ${p.using ? `USING (${p.using})` : ''} ${p.withCheck ? `WITH CHECK (${p.withCheck})` : ''};`
).join('\n\n')}</code></pre>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.FC<{ className?: string }>; label: string; value: number; color: string }> = ({
  icon: Icon,
  label,
  value,
  color,
}) => (
  <Card className="border-slate-800 bg-slate-900/50">
    <CardContent className="p-4 space-y-2">
      <div className="flex items-center justify-between">
        <Icon className={`h-5 w-5 ${color}`} />
        <span className="text-2xl font-black text-white">{value}</span>
      </div>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
    </CardContent>
  </Card>
);

const TableCard: React.FC<{
  table: TableSchema;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ table, isExpanded, onToggle }) => {
  return (
    <Card className="border-slate-800 bg-slate-900/50 overflow-hidden">
      <CardHeader className="border-slate-800 p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-emerald-400" />
            <h4 className="font-bold text-white capitalize">{table.name}</h4>
            <span className="text-xs font-bold px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full border border-slate-700">
              {table.columns.length} columns
            </span>
            {table.foreignKeys.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/30">
                {table.foreignKeys.length} FK
              </span>
            )}
            {table.indexes.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/30">
                {table.indexes.length} idx
              </span>
            )}
            {table.policies.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/30">
                {table.policies.length} RLS
              </span>
            )}
          </div>
          <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-0 pb-4">
          <div className="space-y-4 px-4">
            <div className="px-4 pt-2">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Columns className="h-4 w-4" />
                Columns ({table.columns.length})
              </h5>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Constraints</th>
                      <th className="text-left p-2">Default</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.columns.map(col => (
                      <tr key={col.name} className="border-b border-slate-800/50 hover:bg-slate-950/50">
                        <td className="p-2 font-medium text-white">{col.name}</td>
                        <td className="p-2 text-slate-300">{col.type}</td>
                        <td className="p-2 text-slate-400 flex items-center gap-1">
                          {col.primaryKey && <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] rounded border border-amber-500/30">PK</span>}
                          {col.references && <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] rounded border border-blue-500/30">FK \u2192 {col.references.table}.{col.references.column}</span>}
                          {col.unique && <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] rounded border border-emerald-500/30">UNIQUE</span>}
                          {col.nullable === false && !col.primaryKey && <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 text-[9px] rounded border border-rose-500/30">NOT NULL</span>}
                        </td>
                        <td className="p-2 text-slate-500">{col.default || '\u2014'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {table.indexes.length > 0 && (
              <div className="px-4 border-t border-slate-800">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Indexes ({table.indexes.length})
                </h5>
                <div className="space-y-1">
                  {table.indexes.map(idx => (
                    <div key={idx.name} className="p-2 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-2 text-xs">
                      <span className="font-mono text-emerald-400">{idx.name}</span>
                      <span className="text-slate-400">({idx.columns.join(', ')})</span>
                      {idx.unique && <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] rounded border border-emerald-500/30">UNIQUE</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {table.foreignKeys.length > 0 && (
              <div className="px-4 border-t border-slate-800">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Foreign Keys ({table.foreignKeys.length})
                </h5>
                <div className="space-y-1">
                  {table.foreignKeys.map((fk, i) => (
                    <div key={i} className="p-2 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-2 text-xs">
                      <span className="font-mono text-blue-400">{fk.column}</span>
                      <span className="text-slate-500">\u2192</span>
                      <span className="font-mono text-emerald-400">{fk.references.table}.{fk.references.column}</span>
                      {fk.onDelete && <span className="text-[9px] text-slate-500 px-1.5 py-0.5 bg-slate-900 rounded">ON DELETE {fk.onDelete}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {table.policies.length > 0 && (
              <div className="px-4 border-t border-slate-800 pb-4">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  RLS Policies ({table.policies.length})
                </h5>
                <div className="space-y-2">
                  {table.policies.map((policy, i) => (
                    <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-white">{policy.name}</span>
                        <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[9px] rounded border border-slate-700">{policy.command}</span>
                      </div>
                      {policy.using && (
                        <div className="text-[10px] text-slate-400 font-mono bg-slate-900 p-2 rounded">
                          USING ({policy.using})
                        </div>
                      )}
                      {policy.withCheck && (
                        <div className="text-[10px] text-slate-400 font-mono bg-slate-900 p-2 rounded">
                          WITH CHECK ({policy.withCheck})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default DatabaseDiagramViewer;