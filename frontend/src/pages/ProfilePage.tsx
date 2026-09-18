import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
  User as UserIcon,
  MapPin,
  Phone,
  Home,
  Shield,
  Save,
  Loader2,
  Building2,
  Mail,
  Fingerprint,
  Cpu,
  Navigation
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    farmName: user?.farmName || '',
    farmId: user?.farmId || '',
    systemId: user?.systemId || '',
    address: user?.address || '',
    farmDescription: user?.farmDescription || '',
    lat: user?.gpsCoordinates?.lat || 0,
    lng: user?.gpsCoordinates?.lng || 0
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSuccess(false);

    try {
      const updatedUser = {
        ...user,
        ...formData,
        gpsCoordinates: {
          lat: Number(formData.lat),
          lng: Number(formData.lng)
        }
      };

      await setDoc(doc(db, 'users', user.id), updatedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please check Firestore permissions.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-500" />
            Farmer Node & Farm Profile
          </h1>
          <p className="text-slate-400 mt-1 uppercase text-[10px] tracking-[0.2em] font-bold">
            WildGuard AI Secure Identity System
          </p>
        </div>
        <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <Fingerprint className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">ADVANCED FARMER ROLE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Identity & Metadata */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             </div>
            <div className="w-28 h-28 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/10 mb-6 rotate-3">
              <span className="text-5xl font-black text-white uppercase">{user.name.charAt(0)}</span>
            </div>
            <h2 className="text-2xl font-black text-white">{user.name}</h2>
            <p className="text-sm text-emerald-500 font-mono font-bold tracking-tight mb-6">{user.email}</p>

            <div className="space-y-3 pt-6 border-t border-slate-800">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left">
                <span className="text-[9px] text-slate-500 font-black uppercase block mb-1">Farm Unique Identifier</span>
                <span className="text-xs text-white font-mono break-all">{user.farmId}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left">
                <span className="text-[9px] text-slate-500 font-black uppercase block mb-1">System Node ID</span>
                <span className="text-xs text-white font-mono break-all">{user.systemId}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em] flex items-center">
                <Cpu className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                Hardware Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Active CCTV Nodes</span>
                <span className="text-white font-bold">4</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">IoT Perimeter Sensors</span>
                <span className="text-white font-bold">12</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Detection Accuracy</span>
                <span className="text-emerald-400 font-bold">98.4%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Farm Metadata Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 bg-slate-800/20 flex items-center justify-between">
              <h3 className="font-black text-white uppercase text-sm tracking-widest">Farm Management Profile</h3>
              <InfoIcon className="w-4 h-4 text-slate-600" />
            </div>

            <div className="p-6 space-y-8">
              {/* Section 1: Basic Bio */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-3">Personal & Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Guardian Name</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                            <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Registered Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                            <input
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
              </div>

              {/* Section 2: Farm Specifics */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-3">Farm Infrastructure</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Farm / Estate Name</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                            <input
                            type="text"
                            value={formData.farmName}
                            onChange={e => setFormData({...formData, farmName: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Unique Farm ID</label>
                        <div className="relative">
                            <Fingerprint className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                            <input
                            type="text"
                            value={formData.farmId}
                            onChange={e => setFormData({...formData, farmId: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Farm Description & Landscape</label>
                    <textarea
                        value={formData.farmDescription}
                        onChange={e => setFormData({...formData, farmDescription: e.target.value})}
                        rows={3}
                        placeholder="Describe terrain, livestock types, and known leopard corridors..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                    />
                </div>
              </div>

              {/* Section 3: Geolocation */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-3">Geographic Isolation</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Latitude</label>
                        <div className="relative">
                            <Navigation className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                            <input
                            type="number"
                            step="any"
                            value={formData.lat}
                            onChange={e => setFormData({...formData, lat: parseFloat(e.target.value)})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Longitude</label>
                        <div className="relative">
                            <Navigation className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                            <input
                            type="number"
                            step="any"
                            value={formData.lng}
                            onChange={e => setFormData({...formData, lng: parseFloat(e.target.value)})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Physical Secure Address</label>
                    <div className="relative">
                        <Home className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <textarea
                            value={formData.address}
                            onChange={e => setFormData({...formData, address: e.target.value})}
                            rows={2}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-800/30 border-t border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                {success && (
                    <div className="flex items-center text-emerald-400 text-xs font-black animate-in fade-in zoom-in duration-300">
                        <Shield className="w-3.5 h-3.5 mr-2" />
                        SECURE NODE SYNC COMPLETE
                    </div>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-3 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-950/40 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Commit Farm Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const InfoIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
    </svg>
)
