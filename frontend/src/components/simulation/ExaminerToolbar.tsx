import React, { useState } from 'react';
import { 
  ShieldAlert, AlertTriangle, UserCheck, Bell, Volume2, 
  Sparkles, CheckCircle2, Play, Info, Flame, Trees 
} from 'lucide-react';
import { useAlert } from '../../context/AlertContext';
import { fetchApi } from '../../services/api';

export const ExaminerToolbar: React.FC = () => {
  const { triggerSimulation, isSirenActive, toggleMute, isMuted } = useAlert();
  const [lastScenario, setLastScenario] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const scenarios = [
    {
      id: 'leopard',
      label: 'Simulate Leopard',
      subtitle: 'Panthera pardus near perimeter',
      threat: 'CRITICAL',
      color: 'from-red-600 to-rose-700',
      description: 'Triggers 95% confident Leopard detection in Zone 1. Activates siren and critical emergency modal.'
    },
    {
      id: 'leopard_group',
      label: 'Simulate Leopard Group',
      subtitle: 'Social group / mating pair',
      threat: 'HIGH',
      color: 'from-amber-600 to-orange-700',
      description: 'Triggers multiple leopard detection approaching East cultivation belt. Elevates high threat advisory.'
    },
    {
      id: 'leopard_stationary',
      label: 'Simulate Lying Leopard',
      subtitle: 'Static leopard at boundary',
      threat: 'CRITICAL',
      color: 'from-purple-600 to-indigo-700',
      description: 'Triggers leopard presence with high dwell time score. Alerts forest range personnel.'
    },
    {
      id: 'human_risk',
      label: 'Simulate Human + Leopard',
      subtitle: 'Co-occurrence danger scenario',
      threat: 'CRITICAL',
      color: 'from-rose-700 to-red-900',
      description: 'Simulates Leopard & Human simultaneously detected within 8 meters. Immediately trips failsafe emergency.'
    },
    {
      id: 'leopard_cub',
      label: 'Simulate Leopard Cub',
      subtitle: 'Cub foraging outside danger zone',
      threat: 'LOW',
      color: 'from-emerald-600 to-teal-700',
      description: 'Demonstrates threat scoring: single cub at safe distance does not trigger immediate acoustic alarms.'
    },
    {
      id: 'critical_threat',
      label: 'Simulate Critical Breach',
      subtitle: 'Full threat engine escalation',
      threat: 'CRITICAL',
      color: 'from-red-700 to-rose-800',
      description: 'Forces critical threshold breach ($T \\ge 0.85$) across species, zone, dwell time, and direction.'
    }
  ];

  const handleTrigger = async (scenarioId: string) => {
    setLoading(true);
    setLastScenario(scenarioId);
    await triggerSimulation(scenarioId);
    setLoading(false);
  };

  const handleTestAlarm = async () => {
    await fetchApi('/iot/trigger-alarm', { method: 'POST', body: JSON.stringify({ deviceId: 'iot-esp32-1' }) });
  };

  const handleTestNotification = async () => {
    await fetchApi('/simulation/trigger', { method: 'POST', body: JSON.stringify({ scenario: 'leopard' }) });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider">
                Examiner Viva Suite
              </span>
              <span className="text-slate-400 text-xs font-mono">IEEE Final-Year Project Evaluation</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Wildlife Intrusion Simulation & Verification Console
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Use these certified test harness buttons during academic project defense to prove the end-to-end operational pipeline: AI detection, threat scoring, false-alarm rejection, IoT siren relay, and farmer notification.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-bold uppercase">Siren Status</div>
              <div className={`text-xs font-black ${isSirenActive ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                {isSirenActive ? 'SIREN ACTIVE' : 'STANDBY'}
              </div>
            </div>
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center space-x-1"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isMuted ? 'Muted' : 'Unmuted'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Simulation Action Buttons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Preset Examiner Evaluation Scenarios</span>
          </h2>
          {lastScenario && (
            <span className="text-[11px] text-emerald-400 font-mono">
              Last Executed: <strong className="text-white uppercase">{lastScenario}</strong>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map(sc => (
            <div
              key={sc.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                    sc.threat === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : sc.threat === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {sc.threat} THREAT
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">T-SCORE: {sc.threat === 'CRITICAL' ? '>0.85' : sc.threat === 'HIGH' ? '0.74' : '0.28'}</span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">{sc.label}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{sc.description}</p>
              </div>

              <button
                disabled={loading}
                onClick={() => handleTrigger(sc.id)}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white shadow-md bg-gradient-to-r ${sc.color} hover:opacity-95 transition-all flex items-center justify-center space-x-2 active:scale-95`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute [{sc.label}]</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Hardware & Communication Verification Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Test Alarm Button */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Hardware Siren Test</h3>
            </div>
            <p className="text-xs text-slate-400">
              Dispatches non-harmful acoustic pulse command to all active ESP32 edge nodes.
            </p>
          </div>
          <button
            onClick={handleTestAlarm}
            className="py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-950"
          >
            [Test Alarm]
          </button>
        </div>

        {/* Test Notification Button */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Farmer Notification Test</h3>
            </div>
            <p className="text-xs text-slate-400">
              Simulates SMS, WhatsApp dispatch and logs evidence payload in database.
            </p>
          </div>
          <button
            onClick={handleTestNotification}
            className="py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-lg shadow-amber-950"
          >
            [Test Notification]
          </button>
        </div>

      </div>

      {/* Examiner Rubric & Architecture Demonstration Checklist */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Examiner Viva Verification Checklist
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 space-y-1.5">
            <div className="font-bold text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>1. Computer Vision</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Bounding box regression, Panthera pardus subspecies classification, and confidence scoring.
            </p>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 space-y-1.5">
            <div className="font-bold text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>2. Threat Engine</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Formula: $T = w_s S + w_z Z + w_c C + w_d D + w_m M + w_h H + w_n N$. Dwell time & temporal filter.
            </p>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 space-y-1.5">
            <div className="font-bold text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>3. IoT Integration</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              ESP32 node heartbeat telemetry, PIR sensor motion input, buzzer/strobe relay control.
            </p>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 space-y-1.5">
            <div className="font-bold text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>4. Emergency UX</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              State machine: Active $\rightarrow$ Acknowledged $\rightarrow$ Resolved with audio siren and audit trails.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
