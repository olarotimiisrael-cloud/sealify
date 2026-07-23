import React, { useState } from 'react';
import { X, Truck, MapPin, Clock, ShieldCheck, Send } from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle?: string;
  itemLocation?: string;
  onSendEstimateToChat?: (estimateMsg: string) => void;
}

const DESTINATIONS = [
  { area: 'Under G / LAUTECH Area', zone: 'local', fee: 800, time: '20-40 mins' },
  { area: 'Takie Square / Center', zone: 'local', fee: 1000, time: '30-45 mins' },
  { area: 'Sabo Market / Aroje', zone: 'local', fee: 1200, time: '30-50 mins' },
  { area: 'General / Akala Way', zone: 'local', fee: 1000, time: '30-45 mins' },
  { area: 'Ibadan, Oyo State', zone: 'interstate', fee: 3500, time: '1 Day (Express)' },
  { area: 'Ilorin, Kwara State', zone: 'interstate', fee: 3000, time: '1 Day (Express)' },
  { area: 'Lagos State', zone: 'interstate', fee: 4500, time: '1-2 Days Courier' },
];

export const DeliveryEstimatorModal: React.FC<DeliveryEstimatorModalProps> = ({
  isOpen,
  onClose,
  itemTitle = 'Item',
  itemLocation = 'Ogbomoso',
  onSendEstimateToChat,
}) => {
  const [selectedDest, setSelectedDest] = useState(DESTINATIONS[0]);
  const [deliveryType, setDeliveryType] = useState<'bike' | 'doorstep'>('bike');

  if (!isOpen) return null;

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculatedFee = deliveryType === 'doorstep' && selectedDest.zone === 'local' 
    ? selectedDest.fee + 500 
    : selectedDest.fee;

  const handleShareToChat = () => {
    const msg = `🚚 ESTIMATED DELIVERY DISPATCH:\nItem: ${itemTitle}\nDestination: ${selectedDest.area}\nEst. Fee: ${formatNGN(calculatedFee)}\nEst. Time: ${selectedDest.time}\nProvider: Verified Sealify Dispatch Node`;
    if (onSendEstimateToChat) {
      onSendEstimateToChat(msg);
    }
    toast.success('Delivery estimate proposal sent to seller chat!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
            <Truck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Local Dispatch Estimator</h2>
          <p className="text-xs text-slate-400">
            Calculate rider and courier rates for <strong className="text-emerald-400">"{itemTitle}"</strong>
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Delivery Destination</label>
            <select
              value={selectedDest.area}
              onChange={(e) => {
                const found = DESTINATIONS.find((d) => d.area === e.target.value);
                if (found) setSelectedDest(found);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <optgroup label="Ogbomoso Hub Areas">
                {DESTINATIONS.filter(d => d.zone === 'local').map((d) => (
                  <option key={d.area} value={d.area}>{d.area}</option>
                ))}
              </optgroup>
              <optgroup label="Inter-State Regions">
                {DESTINATIONS.filter(d => d.zone === 'interstate').map((d) => (
                  <option key={d.area} value={d.area}>{d.area}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDeliveryType('bike')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                deliveryType === 'bike'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                  : 'border-slate-800 bg-slate-950 text-slate-400'
              }`}
            >
              <p className="text-xs text-white">Station Pickup</p>
              <p className="text-[10px] text-slate-400">Standard Express</p>
            </button>

            <button
              type="button"
              onClick={() => setDeliveryType('doorstep')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                deliveryType === 'doorstep'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                  : 'border-slate-800 bg-slate-950 text-slate-400'
              }`}
            >
              <p className="text-xs text-white">Doorstep Service</p>
              <p className="text-[10px] text-slate-400">+₦500 Handle</p>
            </button>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Estimated Fee</span>
              <span className="text-2xl font-black text-emerald-400">{formatNGN(calculatedFee)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Est. Time</p>
                  <p className="font-bold text-white text-xs">{selectedDest.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Reliability</p>
                  <p className="font-bold text-white text-xs">Verified Rider</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleShareToChat}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>Propose Delivery Option in Chat</span>
        </button>
      </div>
    </div>
  );
};

export default DeliveryEstimatorModal;