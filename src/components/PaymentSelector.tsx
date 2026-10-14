// src/components/PaymentSelector.tsx
import React, { useState } from 'react';
import { useLanguage, useSealify } from '@/context/LanguageContext';
import { paymentGatewayRegistry } from '@/lib/payments';
import { getLocalizedCurrencyName, formatCurrencyLocalized } from '@/lib/currency';

interface PaymentSelectorProps {
  amount: number;
  currency?: string;
  onPaymentSelected: (gatewayId: string, fee: number, total: number) => void;
  userHasKYC?: boolean;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  amount,
  currency = 'NGN',
  onPaymentSelected,
  userHasKYC = false,
}) => {
  const { language } = useLanguage();
  const { user } = useSealify();
  
  // Determine user tier (simplified)
  const userTier = user?.verificationType ? 3 : 1;
  
  const [selectedGatewayId, setSelectedGatewayId] = useState<string | null>(null);
  
  // Get accessible gateways for user
  const accessibleGateways = paymentGatewayRegistry.getUserAccessibleGateways(
    userTier,
    currency as any,
    user?.countryCode
  );
  
  // Get recommended gateway
  const recommendedGateway = paymentGatewayRegistry.getRecommendedGateway(
    amount,
    currency as any,
    userHasKYC
  );
  
  // Initialize with recommended gateway if none selected
  React.useEffect(() => {
    if (!selectedGatewayId && recommendedGateway) {
      setSelectedGatewayId(recommendedGateway.id);
      const feeData = paymentGatewayRegistry.calculateTotalFee(
        recommendedGateway.id,
        amount,
        currency as any
      );
      onPaymentSelected(recommendedGateway.id, feeData.fee, feeData.total);
    }
  }, [recommendedGateway, selectedGatewayId, amount, currency, onPaymentSelected]);
  
  // Handle gateway selection change
  const handleGatewaySelect = (gatewayId: string) => {
    setSelectedGatewayId(gatewayId);
    const feeData = paymentGatewayRegistry.calculateTotalFee(
      gatewayId,
      amount,
      currency as any
    );
    onPaymentSelected(gatewayId, feeData.fee, feeData.total);
  };
  
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
      <h3 className="font-bold text-white flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-emerald-400" />
        {t('payment')}: {t('select_payment_method')}
      </h3>
      
      <div className="space-y-3">
        {accessibleGateways.map(gateway => (
          <div
            key={gateway.id}
            className={`flex items-start gap-3 p-4 border border-slate-800 rounded-xl ${
              selectedGatewayId === gateway.id 
                ? 'bg-emerald-500/10 border-emerald-500' 
                : 'bg-slate-950 hover:bg-slate-800/50'
            }`}
            onClick={() => handleGatewaySelect(gateway.id)}
            role="button"
            tabIndex={0}
          >
            <div className="flex-shrink-0 w-8 h-8">
              {/* Gateway icon placeholder */}
              <div className="flex items-center justify-center w-full h-full bg-slate-800 rounded-lg">
                {gateway.type === 'card' && <CreditCard className="w-4 h-4 text-emerald-400" />}
                {gateway.type === 'mobile' && <Smartphone className="w-4 h-4 text-emerald-400" />}
                {gateway.type === 'bank' && <Banknote className="w-4 h-4 text-emerald-400" />}
                {gateway.type === 'crypto' && <DollarSign className="w-4 h-4 text-emerald-400" />}
                {!['card', 'mobile', 'bank', 'crypto'].includes(gateway.type) && (
                  <Circle className="w-4 h-4 text-emerald-400" />
                )}
              </div>
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-white">{paymentGatewayRegistry.getGatewayDisplayName(gateway.id, language)}</h4>
                {selectedGatewayId === gateway.id && (
                  <Check className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              
              <p className="text-slate-300 text-sm">
                {paymentGatewayRegistry.getGatewayDescription(gateway.id, language)}
              </p>
              
              <div className="flex items-center gap-2 text-xs">
                <BadgeIcon className="w-3 h-3 text-amber-400" />
                <span className="font-medium">
                  {paymentGatewayRegistry.getLocalizedGatewayType(gateway.type, language)}
                </span>
              </div>
              
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{t('amount')}:</span>
                  <span className="font-mono text-white">
                    {formatCurrencyLocalized(amount, currency as any, language)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{t('fee')}:</span>
                  <span className="font-mono text-emerald-300">
                    {paymentGatewayRegistry.getGatewayFeesDisplay(gateway.id, language)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-300">{t('total')}:</span>
                  <span className="text-white">
                    {() => {
                      const feeData = paymentGatewayRegistry.calculateTotalFee(
                        gateway.id,
                        amount,
                        currency as any
                      );
                      return formatCurrencyLocalized(
                        feeData.total,
                        currency as any,
                        language
                      );
                    }}()
                  </span>
                </div>
                
                {paymentGatewayRegistry.requiresKYC(gateway.id, userTier) && !userHasKYC && (
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span className="text-amber-300">{t('kyc_required')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Import icons (need to be added)
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  DollarSign, 
  Circle,
  Check,
  AlertTriangle,
  BadgeIcon
} from 'lucide-react';