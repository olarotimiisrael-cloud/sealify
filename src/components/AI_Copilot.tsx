import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import { useEffect } from 'react';

const AI_Copilot: React.FC = () => {
  const { user, listings, allUsers, safeSpots, systemConfig } = useSealify();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    // This is where we'll implement NLP and data lookup
    const handleQuery = async () => {
      // Example: Search for listings matching the query
      const results = listings.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

      setResponse(results.length > 0 ? `Found ${results.length} matching items:` + results.map(i => `
- ${i.title} (₦${i.price})`) : 'No matching items found. Try rephrasing your question.');
    };

    if (query) {
      handleQuery();
    }
  }, [query, listings]);

  return (
    <div className="ai-copilot bg-slate-950 p-6 rounded-2xl shadow-2xl">
      <h3 className="text-xl font-bold text-white">Sealify AI Copilot</h3>
      <p className="text-sm text-slate-400">Ask me anything about Sealify - how to use features, find items, or get help with your account.</p>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Ask about Sealify..."
        className="w-full px-4 py-2 bg-slate-900 text-white border border-slate-800 rounded-xl focus:outline-none"
      />
      <div className="mt-3 text-sm text-slate-400">
        {response}
      </div>
    </div>
  );
};

export default AI_Copilot;