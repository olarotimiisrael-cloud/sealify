import React, { useState } from 'react';
import { Calculator, DollarSign, Percent, Calendar, ShieldCheck } from 'lucide-react';

interface FinancingCalculatorProps {
  itemPrice: number;
  category: string;
}

export const FinancingCalculator: React.FC<FinancingCalculatorProps> = ({ itemPrice, category }) => {
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [termMonths, setTermMonths] = useState<number>(category === 'Real Estate' ? 360 : 60);

  const downPaymentAmount = Math.round((itemPrice * downPaymentPercent) / 100);
  const loanPrincipal = Math.max(0, itemPrice - downPaymentAmount);

  // Monthly interest rate calculation formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
  const monthlyRate = interestRate / 100 / 12;
  let monthlyPayment = 0;

  if (loanPrincipal > 0 && monthlyRate > 0) {
    monthlyPayment = Math.round(
      (loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
        (Math.pow(1 + monthlyRate, termMonths) - 1)
    );
  } else if (loanPrincipal > 0) {
    monthlyPayment = Math.round(loanPrincipal / termMonths);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Financing & Monthly Payment Calculator</h3>
            <p className="text-[11px] text-slate-400">Estimate installment options for ${itemPrice.toLocaleString()}</p>
          </div>
        </div>
        <span className="text-xl font-black text-emerald-400">
          ${monthlyPayment.toLocaleString()}
          <span className="text-[10px] font-normal text-slate-400 block text-right">/ month</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        {/* Down Payment Slider */}
        <div className="space-y-1.5 bg-slate-950 p-3 rounded-2xl border border-slate-800">
          <div className="flex justify-between text-slate-300 font-semibold">
            <span>Down Payment ({downPaymentPercent}%)</span>
            <span className="text-emerald-400 font-extrabold">${downPaymentAmount.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        {/* Interest Rate */}
        <div className="space-y-1.5 bg-slate-950 p-3 rounded-2xl border border-slate-800">
          <div className="flex justify-between text-slate-300 font-semibold">
            <span>Interest Rate</span>
            <span className="text-emerald-400 font-extrabold">{interestRate}% APR</span>
          </div>
          <input
            type="range"
            min={2.0}
            max={15.0}
            step={0.5}
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        {/* Loan Term */}
        <div className="space-y-1.5 bg-slate-950 p-3 rounded-2xl border border-slate-800">
          <div className="flex justify-between text-slate-300 font-semibold">
            <span>Loan Term</span>
            <span className="text-emerald-400 font-extrabold">{termMonths} Months</span>
          </div>
          <div className="flex gap-1 pt-1">
            {[12, 24, 36, 60].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setTermMonths(term)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                  termMonths === term
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {term}m
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Estimated calculation. Contact seller for direct payment terms.
        </span>
        <span>Financed Amount: ${loanPrincipal.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default FinancingCalculator;