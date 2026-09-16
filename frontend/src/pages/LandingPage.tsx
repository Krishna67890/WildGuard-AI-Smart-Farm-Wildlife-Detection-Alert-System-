import React from 'react';
import { 
  ShieldAlert, ShieldCheck, Cpu, Radio, Activity, 
  ArrowRight, AlertTriangle, Eye, CheckCircle2, Award, 
  FileText, Play, Layers, BellRing, Sparkles 
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: (tab?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      
      {/* Top Header */}
      <nav className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldAlert className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                WildGuard AI
              </span>
              <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Final-Year Engineering Project
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onEnterApp('simulation')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition flex items-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Examiner Demo Mode</span>
            </button>

            <button
              onClick={() => onEnterApp('dashboard')}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition shadow-lg shadow-emerald-950/50"
            >
              Enter Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Glow backdrop circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center space-y-6 max-w-3xl mx-auto relative z-10">
          
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strictly Non-Harm &bull; Ethical Human-Wildlife Coexistence Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Intelligent Wildlife Harm &{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              Intrusion Detection System
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            An advanced AI-powered perimeter defense platform engineered to protect agricultural farmlands and human lives through real-time species classification, multi-factor threat intelligence, false-alarm mitigation, and IoT acoustic deterrence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onEnterApp('dashboard')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/60 transition flex items-center justify-center space-x-2"
            >
              <span>Launch Farmer Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onEnterApp('simulation')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-sm border border-amber-500/40 shadow-xl transition flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Examiner Demo Console</span>
            </button>

            <button
              onClick={() => onEnterApp('report')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-bold text-sm border border-slate-700 transition flex items-center justify-center space-x-2"
            >
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Academic Thesis (IEEE)</span>
            </button>
          </div>

        </div>

        {/* 8-Step Core Workflow Cards */}
        <div className="mt-20 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">End-to-End System Pipeline</h2>
            <p className="text-xl font-extrabold text-white">Closed-Loop Intrusion Mitigation Architecture</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 pt-4">
            {[
              { step: '01', name: 'Camera Stream', desc: 'RTSP/WebRTC optical input' },
              { step: '02', name: 'AI Detection', desc: 'Species classifier (YOLO/CV)' },
              { step: '03', name: 'Temporal Filter', desc: 'N-frame false alarm suppression' },
              { step: '04', name: 'Zone Geometry', desc: 'Perimeter geofence proximity' },
              { step: '05', name: 'Threat Engine', desc: 'Multi-factor hazard scoring' },
              { step: '06', name: 'IoT Siren', desc: 'ESP32 safe acoustic pulse' },
              { step: '07', name: 'Farmer Alert', desc: 'SMS, WhatsApp, Email, HUD' },
              { step: '08', name: 'Resolution', desc: 'Human-in-the-loop triage' }
            ].map(item => (
              <div key={item.step} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400 block">{item.step}</span>
                <p className="text-xs font-bold text-white leading-tight">{item.name}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Pillars of the Engineering Project */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">AI Computer Vision</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects Leopard, Tiger, Elephant, Wild Boar, Deer, Monkey, and Humans with real-time bounding boxes and confidence analysis.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Threat Assessment Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-factor scoring algorithm weighing species danger, zone geometry, movement vector, dwell time, and human presence.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">ESP32 IoT Prototype</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full hardware integration for ESP32 nodes, PIR motion triggers, ultrasonic safe buzzers, and real-time telemetry heartbeats.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <BellRing className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Emergency UX & Triage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-visibility critical alert HUD with synthesized Web Audio sirens, evidence snapshots, and active-to-resolved state tracking.
            </p>
          </div>

        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-400">
          WildGuard AI &bull; Final-Year Engineering Capstone Project &bull; 2026
        </p>
        <p className="text-[11px] mt-1 text-slate-600">
          Strictly Non-Harm Architecture: Designed solely for early detection, risk assessment, human notification, and safe response.
        </p>
      </footer>

    </div>
  );
};
