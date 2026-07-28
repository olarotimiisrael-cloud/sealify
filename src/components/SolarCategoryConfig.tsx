import React from 'react';
import { useSealify } from '../context/SealifyContext';
import { Category } from '../types/sealify';
import { 
  Sun, 
  Battery, 
  Zap, 
  Settings, 
  Wrench, 
  Home, 
  Building2, 
  Factory, 
  Leaf, 
  Bolt, 
  Gauge, 
  ShieldCheck 
} from 'lucide-react';

export const SOLAR_CATEGORY_CONFIG = {
  name: 'Solar & Clean Energy',
  iconName: 'Sun',
  color: 'bg-yellow-500',
  subcategories: [
    {
      id: 'solar_products',
      name: 'Solar Accessories & Products',
      icon: Battery,
      description: 'Inverters, Solar Panels, Batteries, Charge Controllers, Wiring, Mounting Systems',
      listingType: 'product',
      specFields: [
        { key: 'productType', label: 'Product Type', type: 'select', options: ['Solar Panel', 'Inverter', 'Battery', 'Charge Controller', 'Mounting System', 'Wiring & Connectors', 'Monitoring System', 'Other Accessory'] },
        { key: 'capacity', label: 'Capacity / Power Rating', type: 'text', placeholder: 'e.g. 5kW, 200Ah, 450W' },
        { key: 'voltage', label: 'Voltage', type: 'select', options: ['12V', '24V', '48V', '120V', '240V', '380V', 'Other'] },
        { key: 'brand', label: 'Brand / Manufacturer', type: 'text', placeholder: 'e.g. Victron, Growatt, Felicity, Bluegate' },
        { key: 'warranty', label: 'Warranty Period', type: 'select', options: ['1 Year', '2 Years', '3 Years', '5 Years', '10 Years', 'Lifetime', 'No Warranty'] },
        { key: 'certification', label: 'Certifications', type: 'text', placeholder: 'e.g. IEC, CE, UL, TUV' },
      ]
    },
    {
      id: 'solar_installation',
      name: 'Solar Installation & Maintenance Services',
      icon: Wrench,
      description: 'System Sizing, Installation Services, Repair & Maintenance, Energy Audits, Consultation',
      listingType: 'service',
      specFields: [
        { key: 'serviceType', label: 'Service Type', type: 'select', options: ['System Design & Sizing', 'Full Installation', 'Panel Installation Only', 'Inverter/Battery Installation', 'System Repair', 'Preventive Maintenance', 'Energy Audit', 'Performance Optimization', 'System Upgrade'] },
        { key: 'systemSize', label: 'Typical System Size Handled', type: 'select', options: ['Small (1-3kW)', 'Medium (3-10kW)', 'Large (10-50kW)', 'Commercial (50kW+)', 'Industrial (100kW+)'] },
        { key: 'serviceArea', label: 'Service Coverage Area', type: 'text', placeholder: 'e.g. Ogbomoso, Ibadan, Oyo State' },
        { key: 'certifications', label: 'Technician Certifications', type: 'text', placeholder: 'e.g. NABCEP, COREN, Manufacturer Certified' },
        { key: 'warrantyOffered', label: 'Workmanship Warranty', type: 'select', options: ['3 Months', '6 Months', '1 Year', '2 Years', '5 Years', 'No Warranty'] },
        { key: 'responseTime', label: 'Emergency Response Time', type: 'select', options: ['24 Hours', '48 Hours', '3-5 Days', '1 Week', 'Scheduled Only'] },
      ]
    }
  ]
};

export const SolarCategoryConfig: React.FC = () => {
  const { categories, addCategory, updateCategory } = useSealify();

  const solarExists = categories.some(c => c.name === 'Solar & Clean Energy');

  return (
    <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/30">
          <Sun className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-white">Solar & Clean Energy Category</h3>
          <p className="text-xs text-slate-400">Configure subcategories and specification fields</p>
        </div>
      </div>

      {SOLAR_CATEGORY_CONFIG.subcategories.map((sub) => (
        <div key={sub.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg">
              <sub.icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white">{sub.name}</h4>
              <p className="text-xs text-slate-400">{sub.description}</p>
            </div>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${sub.listingType === 'product' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
              {sub.listingType === 'product' ? 'PRODUCT' : 'SERVICE'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            {sub.specFields.map((field) => (
              <div key={field.key} className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{field.label}</span>
                <span className="text-white font-medium capitalize">{field.type}</span>
                {field.options && (
                  <span className="text-[9px] text-slate-400 block mt-1">{field.options.length} options</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-4 border-t border-slate-800 flex gap-2">
        <button
          onClick={() => {
            if (!solarExists) {
              addCategory({
                id: 'solar_clean_energy',
                name: 'Solar & Clean Energy',
                iconName: 'Sun',
                count: 0,
                color: 'bg-yellow-500'
              });
            }
          }}
          disabled={solarExists}
          className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{solarExists ? 'Category Active' : 'Add Solar Category to Marketplace'}</span>
        </button>
      </div>
    </div>
  );
};

export default SolarCategoryConfig;