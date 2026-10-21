import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { 
  Wrench, 
  Smartphone, 
  Home, 
  Shirt, 
  Armchair, 
  Scissors, 
  Zap, 
  Building, 
  GraduationCap,
  Camera,
  Music,
  Truck
} from 'lucide-react';

const SERVICES = [
  {
    id: 'repairs',
    name: 'Repairs & Maintenance',
    icon: Wrench,
    color: 'bg-blue-100 text-blue-600',
    description: 'Electronics, appliances, vehicle repairs and more',
    count: 0,
  },
  {
    id: 'electronics-repair',
    name: 'Phone & Laptop Repair',
    icon: Smartphone,
    color: 'bg-purple-100 text-purple-600',
    description: 'Screen replacement, battery, software fixes',
    count: 0,
  },
  {
    id: 'home-services',
    name: 'Home Services',
    icon: Home,
    color: 'bg-emerald-100 text-emerald-600',
    description: 'Cleaning, plumbing, electrical work',
    count: 0,
  },
  {
    id: 'fashion-tailoring',
    name: 'Fashion & Tailoring',
    icon: Shirt,
    color: 'bg-pink-100 text-pink-600',
    description: 'Custom clothing, alterations, repairs',
    count: 0,
  },
  {
    id: 'furniture-assembly',
    name: 'Furniture Assembly',
    icon: Armchair,
    color: 'bg-orange-100 text-orange-600',
    description: 'Assembly, repair, refurbishing',
    count: 0,
  },
  {
    id: 'barber-salon',
    name: 'Barber & Salon',
    icon: Scissors,
    color: 'bg-rose-100 text-rose-600',
    description: 'Haircuts, styling, beauty services',
    count: 0,
  },
  {
    id: 'electrical',
    name: 'Electrical Services',
    icon: Zap,
    color: 'bg-amber-100 text-amber-600',
    description: 'Installation, repairs, wiring',
    count: 0,
  },
  {
    id: 'cleaning',
    name: 'Cleaning Services',
    icon: Building,
    color: 'bg-teal-100 text-teal-600',
    description: 'Home, office, post-construction cleaning',
    count: 0,
  },
  {
    id: 'tutoring',
    name: 'Tutoring & Training',
    icon: GraduationCap,
    color: 'bg-indigo-100 text-indigo-600',
    description: 'Academic, music, language lessons',
    count: 0,
  },
  {
    id: 'photography',
    name: 'Photography & Video',
    icon: Camera,
    color: 'bg-violet-100 text-violet-600',
    description: 'Events, portraits, content creation',
    count: 0,
  },
  {
    id: 'music',
    name: 'Music & DJ Services',
    icon: Music,
    color: 'bg-fuchsia-100 text-fuchsia-600',
    description: 'Live music, DJ, sound equipment',
    count: 0,
  },
  {
    id: 'logistics',
    name: 'Logistics & Delivery',
    icon: Truck,
    color: 'bg-lime-100 text-lime-600',
    description: 'Same-day delivery, moving services',
    count: 0,
  },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Services — Sealify Nigeria" />
      <Navbar />
      
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full inline-block mb-4">
            <Wrench className="w-3 h-3" />
            <span>Local Services</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-4">
            Find Trusted Local Services
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Discover verified service providers in Ogbomosoland — from repairs and cleaning to tutoring and photography.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {SERVICES.map((service) => (
            <Link
              key={service.id}
              to="/listings"
              className="group relative block"
            >
              <div className={`bg-white border border-slate-200 rounded-[2.5rem] p-5 sm:p-6 transition-all hover:shadow-xl hover:border-emerald-400/50 h-full flex flex-col`}>
                <div className={`w-12 h-12 rounded-2xl ${service.color} flex items-center justify-center mb-4 shadow-sm shadow-${service.color.split(' ')[0].replace('bg-', '')}-100/50 group-hover:shadow-${service.color.split(' ')[0].replace('bg-', '')}-200/50 transition-shadow`}>
                  <service.icon className="w-6 h-6" />
                </div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base mb-1 group-hover:text-emerald-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium mb-3">
                  {service.description}
                </p>
                <div className="mt-auto pt-3">
                  <span className="text-[9px] bg-emerald-50 text-emerald-600 font-black px-2 py-0.5 rounded border border-emerald-100 inline-flex items-center gap-1">
                    <Link className="text-emerald-600 hover:underline">Browse {service.name.toLowerCase()}</Link>
                    <span className="w-3 h-3 text-emerald-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-2 h-2"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-12 bg-emerald-50 border border-emerald-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Need a specific service?</h2>
              <p className="text-xs text-slate-600">Post a service request and let local providers find you.</p>
            </div>
            <Link to="/post-ad" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-sm shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-95">
              <span>Post Service Request</span>
              <svg className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}

