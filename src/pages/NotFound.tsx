import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNav from "../components/MobileNav";
import SEO from "../components/SEO";
import { AlertCircle, Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <SEO title="404 - Page Not Found" />
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-12 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white">404</h1>
            <h2 className="text-xl font-bold text-slate-200 uppercase tracking-tight">Endpoint Not Found</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              The resource you are looking for has been moved, removed, or never existed in the Sealify network.
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Marketplace</span>
          </button>
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default NotFound;