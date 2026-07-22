import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface PriceHistoryProps {
  currentPrice: number;
}

export const PriceHistoryChart: React.FC<PriceHistoryProps> = ({ currentPrice }) => {
  // Simulate price history data
  const data = [
    { name: '3m ago', price: currentPrice * 1.15 },
    { name: '2m ago', price: currentPrice * 1.08 },
    { name: '1m ago', price: currentPrice * 1.05 },
    { name: '2w ago', price: currentPrice * 1.02 },
    { name: 'Now', price: currentPrice },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">Market Price Insights</h3>
          <p className="text-[10px] text-slate-400">Price trend for similar items in Ogbomosoland</p>
        </div>
        <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          -15% TREND
        </div>
      </div>

      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="name" 
              hide={false} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 9, fontWeight: 'bold' }}
            />
            <Tooltip 
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
              itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
              formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Price']}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#10b981" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorPrice)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceHistoryChart;