import React, { useState, useEffect } from 'react';
import { useSealify } from '../context/SealifyContext';
import { ShoppingBag, MessageSquare, Zap, MapPin } from 'lucide-react';

export const LiveActivityToast: React.FC = () => {
  const [currentActivity, setCurrentActivity] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  const activities = [
    { type: 'view', user: 'Ope_1', item: 'iPhone 13 Pro', icon: Zap, color: 'text-amber-400' },
    { type: 'message', user: 'Uche_D', item: 'Toyota Camry', icon: MessageSquare, color: 'text-teal-400' },
    { type: 'post', user: 'Blessing', item: 'Office Desk', icon: ShoppingBag, color: 'text-emerald-400' },
    { type: 'meetup', user: 'Israel', item: 'MacBook M1', icon: MapPin, color: 'text-blue-400' },
  ];

  useEffect(() => {
    const triggerActivity = () => {
      const randomAct = activities[Math.floor(Math.random() * activities.length)];
      setCurrentActivity(randomAct);
      setVisible(true);
      
      setTimeout(() => setVisible(false), 5000);
    };

    const interval = setInterval(triggerActivity, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!currentActivity) return null;

  const Icon = currentActivity.icon;

  return (
    <div 
      className={`fixed bottom-24 left-6 z-[45] max-w-[240px] transition-all duration-500 transform ${
        visible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}
    >
      <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-3 rounded-2xl shadow-2xl flex items-start gap-3">
        <div className={`p-2 rounded-xl bg-slate-950 border border-slate-800 ${currentActivity.color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-white uppercase tracking-widest">Activity Now</p>
          <p className="text-[11px] text-slate-300 mt-1 leading-snug">
            <span className="font-bold text-emerald-400">{currentActivity.user}</span> 
            {currentActivity.type === 'view' ? ' is viewing ' : 
             currentActivity.type === 'message' ? ' messaged about ' : 
             currentActivity.type === 'post' ? ' just listed ' : ' proposed meetup for '} 
            <span className="font-bold text-white italic">"{currentActivity.item}"</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveActivityToast;