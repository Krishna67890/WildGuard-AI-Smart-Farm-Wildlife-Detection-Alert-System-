import React, { useState, useEffect } from 'react';
import { 
  Settings, Sliders, Shield, Bell, Users, CheckCircle2, 
  Save, RefreshCw, AlertTriangle, Key, Layers 
} from 'lucide-react';
import { fetchApi } from '../services/api';
import { ThreatEngineConfig } from '../types/index';
import { useAuth } from '../context/AuthContext';

export const AdminPanelPage: React.FC = () => {
  const { canAdmin } = useAuth();
  const [config, setConfig] = useState<ThreatEngineConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchApi<{ success: boolean; config: ThreatEngineConfig }>('/config')
      .then((res: any) => {
        if (res.success && res.config) {
          setConfig(res.config);
        }
      })
      .catch((err: any) => console.warn('Config fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    try {
      await fetchApi('/config', {
        method: 'PUT',
        body: JSON.stringify(config)
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      alert('Failed to save settings: ' + err);
    }
  };

  if (!config) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading threat configuration...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <span>Threat Intelligence Configuration & Admin Panel</span>
          </h1>
          <p className="text-xs text-slate-400">
            Fine-tune mathematical threat formula weights, temporal false-alarm filters, and notification channels
          </p>
        </div>

        {canAdmin ? (
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Threat Thresholds</span>
          </button>
        ) : (
          <span className="text-xs text-amber-400 bg-amber-950/80 px-3 py-1.5 rounded-lg border border-amber-800 font-medium">
            Read-only mode (Switch to Admin in top bar to edit)
          </span>
        )}
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Threat Engine Parameters successfully synchronized with live detection server!</span>
        </div>
      )}

      {/* Grid: 3 Major Config Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. False-Alarm Prevention & Temporal Confirmation */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-white">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider">False-Alarm Mitigation</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Temporal window verification parameters. Single-frame foliage motion or camera noise will not trip alerts.
          </p>

          <div className="space-y-4 text-xs pt-2">
            
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium text-slate-300">
                <span>Minimum Confidence Cutoff:</span>
                <span className="font-mono text-emerald-400 font-bold">{Math.round(config.minConfidenceThreshold * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.40"
                max="0.90"
                step="0.05"
                disabled={!canAdmin}
                value={config.minConfidenceThreshold}
                onChange={(e) => setConfig({ ...config, minConfidenceThreshold: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium text-slate-300">
                <span>Consecutive Frames Required ($k$):</span>
                <span className="font-mono text-emerald-400 font-bold">{config.consecutiveFramesRequired} frames</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                disabled={!canAdmin}
                value={config.consecutiveFramesRequired}
                onChange={(e) => setConfig({ ...config, consecutiveFramesRequired: parseInt(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium text-slate-300">
                <span>Minimum Dwell Duration (t_min):</span>
                <span className="font-mono text-emerald-400 font-bold">{config.minDetectionDurationSec} seconds</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                disabled={!canAdmin}
                value={config.minDetectionDurationSec}
                onChange={(e) => setConfig({ ...config, minDetectionDurationSec: parseInt(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

          </div>
        </div>

        {/* 2. Threat Formula Weights */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-white">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Formula Weights ($\sum w_i = 1.0$)</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Coefficients determining the sensitivity of individual risk vectors in the threat calculation.
          </p>

          <div className="space-y-3 text-xs pt-1">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Species Danger ($w_s$):</span>
              <span className="font-mono text-amber-400 font-bold">{config.weights.speciesDanger}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Zone Proximity ($w_z$):</span>
              <span className="font-mono text-amber-400 font-bold">{config.weights.zoneProximity}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Confidence ($w_c$):</span>
              <span className="font-mono text-amber-400 font-bold">{config.weights.confidence}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Human Proximity ($w_h$):</span>
              <span className="font-mono text-rose-400 font-bold">{config.weights.humanCoexistence}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Dwell Duration ($w_d$):</span>
              <span className="font-mono text-amber-400 font-bold">{config.weights.duration}</span>
            </div>
          </div>
        </div>

        {/* 3. Notification Dispatch Routing */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-white">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Emergency Dispatch Routing</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Multi-channel notification routing for critical and high risk intrusion events.
          </p>

          <div className="space-y-3 pt-2 text-xs">
            
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="font-bold text-white block">SMS Cellular Dispatch</span>
                <span className="text-[11px] text-slate-400">Target: Lead Farmer (+91 98220 11223)</span>
              </div>
              <input
                type="checkbox"
                disabled={!canAdmin}
                checked={config.smsAlertsEnabled}
                onChange={(e) => setConfig({ ...config, smsAlertsEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="font-bold text-white block">WhatsApp Emergency Group</span>
                <span className="text-[11px] text-slate-400">Instant rich media card with snapshot link</span>
              </div>
              <input
                type="checkbox"
                disabled={!canAdmin}
                checked={config.whatsappAlertsEnabled}
                onChange={(e) => setConfig({ ...config, whatsappAlertsEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="font-bold text-white block">Forest Range Email Advisory</span>
                <span className="text-[11px] text-slate-400">Target: forest-range@karnataka.gov.in</span>
              </div>
              <input
                type="checkbox"
                disabled={!canAdmin}
                checked={config.emailAlertsEnabled}
                onChange={(e) => setConfig({ ...config, emailAlertsEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="font-bold text-rose-400 block">Autonomous IoT Siren Relay</span>
                <span className="text-[11px] text-slate-400">Auto-trip ESP32 ultrasonic buzzer on Critical</span>
              </div>
              <input
                type="checkbox"
                disabled={!canAdmin}
                checked={config.autoAlarmOnCritical}
                onChange={(e) => setConfig({ ...config, autoAlarmOnCritical: e.target.checked })}
                className="w-4 h-4 accent-rose-500"
              />
            </label>

          </div>
        </div>

      </div>

    </div>
  );
};
