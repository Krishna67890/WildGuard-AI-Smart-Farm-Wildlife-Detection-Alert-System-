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
  Mail
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, switchRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    farmName: user?.farmName || '',
    location: user?.location || '',
    address: user?.address || '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSuccess(false);

    try {
      const updatedUser = {
        ...user,
        ...formData
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <UserIcon className="w-8 h-8 text-emerald-500" />
            Guardian Profile
          </h1>
          <p className="text-slate-400 mt-1">Manage your farm details and system identity</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{user.role}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-full mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-4">
              <span className="text-4xl font-bold text-white uppercase">{user.name.charAt(0)}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-sm text-slate-400">{user.email}</p>

            <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">System ID</span>
                <span className="text-slate-300 font-mono">{user.id.slice(0, 8)}...</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Member Since</span>
                <span className="text-slate-300">Jan 2025</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-emerald-400 mb-2 uppercase tracking-wider">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => switchRole('VIEWER')}
                className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-emerald-500/10 text-slate-300 transition-colors"
              >
                Switch to Viewer Mode
              </button>
              <button className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-emerald-500/10 text-slate-300 transition-colors">
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-800/30">
              <h3 className="font-bold text-white">Profile Information</h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-emerald-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      disabled
                      value={formData.email}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Farm / Estate Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={formData.farmName}
                      onChange={e => setFormData({...formData, farmName: e.target.value})}
                      placeholder="e.g. Green Valley Estates"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-emerald-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-emerald-500 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">GPS Location / Coordinates</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    placeholder="12.9716° N, 77.5946° E"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-emerald-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Physical Address</label>
                <div className="relative">
                  <Home className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <textarea
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    rows={3}
                    placeholder="Full postal address of the farm..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-emerald-500 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-800/30 border-t border-slate-800 flex justify-end items-center gap-4">
              {success && (
                <span className="text-emerald-400 text-sm font-medium animate-in fade-in duration-300">
                  Profile updated successfully!
                </span>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Guardian Details
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
