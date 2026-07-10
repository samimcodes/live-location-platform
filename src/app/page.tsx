import Image from "next/image";
import SocialLogin from "../components/SocialLogin";
import { Footer } from "../components/Footer";
import { Navber } from "../components/Navber";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-sans overflow-hidden">
      {/* Background decoration for glassy effect */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-100/40 via-white to-purple-50/40"></div>
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <Navber />

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 py-32 w-full max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Welcome to Our Platform
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto font-medium">
            Experience the future of seamless integration with our premium tools and services.
          </p>
        </div>

        <div className="w-full max-w-md">
          <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none"></div>
            
            <div className="relative z-10 text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Get Started</h2>
              <p className="text-sm text-slate-500 mt-2">Sign in to your account</p>
            </div>
            
            <div className="relative z-10 flex justify-center w-full">
              <SocialLogin />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
