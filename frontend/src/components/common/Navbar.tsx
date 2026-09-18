import React from 'react';
import { 
  ShieldAlert, Radio, Volume2, VolumeX, Eye, Bell, 
  Settings, Cpu, MapPin, Activity, FileText, Sparkles, UserCheck,
  Camera as CameraIcon, Globe, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { UserRole } from '../../types/index';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, role, logout } = useAuth();
  const { isSirenActive, isMuted, toggleMute, activeAlert } = useAlert();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'live', label: 'Live Monitoring', icon: Radio },
    { id: 'gallery', label: 'Gallery', icon: Globe },
    { id: 'cameras', label: 'Cameras', icon: CameraIcon },
    { id: 'incidents', label: 'Incidents', icon: Bell, badge: activeAlert ? '!' : undefined },
    { id: 'analytics', label: 'Analytics', icon: Sparkles },
    { id: 'zones', label: 'Farm Zones', icon: MapPin },
    { id: 'iot', label: 'IoT Hardware', icon: Cpu },
    { id: 'simulation', label: 'Examiner Demo', icon: ShieldAlert, highlight: true },
    { id: 'report', label: 'Academic Thesis', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & System Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <ShieldAlert className="w-6 h-6 text-slate-950 font-bold" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  WildGuard AI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                  Ethical v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Intelligent Wildlife Harm & Intrusion Detection System
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                      : item.highlight 
                        ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30' 
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.highlight ? 'text-amber-400' : ''}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Audio Siren, Role Selector, User Profile */}
          <div className="flex items-center space-x-3">
            
            {/* Siren Indicator & Mute Toggle */}
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute Emergency Siren' : 'Mute Emergency Siren'}
              className={`p-2 rounded-lg border transition-all ${
                isSirenActive
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse-fast'
                  : isMuted
                    ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                    : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/40'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Role Switcher Pill (Farmer Only Architecture) */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[11px]">
              <span className="px-3 py-1 rounded-md font-bold bg-emerald-600 text-white shadow-sm">
                Farmer Node Auth
              </span>
            </div>

            {/* Profile Button */}
            <button
              onClick={() => setCurrentTab('profile')}
              title="Profile"
              className={`p-2 rounded-lg border transition-all ${
                currentTab === 'profile'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-emerald-400'
              }`}
            >
              <UserCheck className="w-4 h-4" />
            </button>

            {/* About Us Button */}
            <button
              onClick={() => setCurrentTab('about')}
              title="About Us"
              className={`p-2 rounded-lg border transition-all ${
                currentTab === 'about'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-emerald-400'
              }`}
            >
              <Globe className="w-4 h-4" />
            </button>

            <button
              onClick={() => logout()}
              title="Logout"
              className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
      
      {/* Mobile navigation row */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 space-x-1 border-t border-slate-800/80 bg-slate-950">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`whitespace-nowrap px-2.5 py-1 rounded text-xs ${
              currentTab === item.id ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
