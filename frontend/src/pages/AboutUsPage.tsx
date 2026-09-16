import React from 'react';
import {
  ShieldCheck,
  Heart,
  Leaf,
  Cpu,
  Eye,
  Globe,
  Users,
  Terminal,
  ChevronRight
} from 'lucide-react';

export const AboutUsPage: React.FC = () => {
  const missionPoints = [
    {
      icon: Heart,
      title: "Ethical Conservation",
      desc: "Our primary mission is to prevent human-wildlife conflict using non-lethal, high-tech deterrents. We believe every life has value."
    },
    {
      icon: Leaf,
      title: "Crop Protection",
      desc: "Empowering farmers to protect their livelihoods from animal intrusion without resorting to harmful fences or pesticides."
    },
    {
      icon: Cpu,
      title: "AI & IoT Innovation",
      desc: "Leveraging state-of-the-art Edge AI and low-power IoT sensors to provide real-time, zero-latency detection in remote areas."
    }
  ];

  const team = [
    { name: "Krishna", role: "Lead Systems Architect & AI Engineer" },
    { name: "WildGuard Dev Team", role: "Cloud & IoT Integration" }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-16 py-8 animate-in fade-in duration-700">

      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-bold tracking-widest uppercase">
          <ShieldCheck className="w-4 h-4" />
          Securing The Future of Coexistence
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
          WildGuard AI:<br/>
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Smart Wildlife Safeguarding
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          A revolutionary AIoT framework designed to detect, track, and deter wildlife intrusions
          using ethical sound frequencies and light strobes, ensuring a harmonious balance between
          human agriculture and nature.
        </p>
      </div>

      {/* Philosophy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {missionPoints.map((point, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-emerald-500/30 transition-all group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <point.icon className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{point.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{point.desc}</p>
          </div>
        ))}
      </div>

      {/* Technical Philosophy */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-12">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Globe className="w-64 h-64 text-emerald-500" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">The Sentinel Logic</h2>
            <p className="text-slate-400 leading-relaxed">
              WildGuard AI utilizes a sophisticated "Sentinel Logic" engine. It doesn't just see pixels;
              it understands movement vectors, heat signatures, and behavioral patterns.
            </p>
            <ul className="space-y-4">
              {[
                "Real-time Computer Vision on Edge Devices",
                "Mesh Networked IoT Siren Nodes",
                "Cloud-Sync Incident Logging for Academic Analysis",
                "Non-Harmful Ultrasonic Deterrents"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                  <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <ChevronRight className="w-3 h-3 text-emerald-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 font-mono text-[11px] leading-relaxed text-emerald-500/80 shadow-2xl">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
              <Terminal className="w-4 h-4" />
              <span>wildguard_core.v2.4.log</span>
            </div>
            <p className="text-emerald-400">[SYSTEM] Initializing WildGuard Neural Core...</p>
            <p>[LOAD] loading model_weights/wildlife_v8.pt</p>
            <p>[SUCCESS] Animal detection active (Confidence threshold: 82%)</p>
            <p>[MQTT] Connected to Broker: 192.168.1.104</p>
            <p>[STATUS] All siren nodes (4/4) in STANDBY mode</p>
            <p className="text-amber-400">[ALERT] Motion detected in Sector B - Critical Zone</p>
            <p className="text-rose-500">[ACTION] Activating Strobe #2 - Species: ELEPHANT</p>
            <p>[LOG] Incident saved to Firestore: UID_88cd9</p>
          </div>
        </div>
      </div>

      {/* Visionaries */}
      <div className="text-center space-y-8 pb-12">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
          <Users className="w-6 h-6 text-emerald-500" />
          The Visionaries
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {team.map((member, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 px-8 py-6 rounded-2xl">
              <div className="text-emerald-400 font-bold mb-1">{member.name}</div>
              <div className="text-slate-500 text-xs uppercase tracking-widest">{member.role}</div>
            </div>
          ))}
        </div>
        <p className="text-slate-500 text-xs italic">
          "Technology is most beautiful when it serves to protect life."
        </p>
      </div>

    </div>
  );
};
