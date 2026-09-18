import React from 'react';
import { ShieldAlert, Volume2, CheckCircle, Eye, AlertOctagon, X, Clock, MapPin, Gauge } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';
import { Incident } from '../../types/index';

interface CriticalAlertModalProps {
  onViewCamera?: (cameraId: string) => void;
  onViewIncident?: (incidentId: string) => void;
}

export const CriticalAlertModal: React.FC<CriticalAlertModalProps> = ({
  onViewCamera,
  onViewIncident
}) => {
  const { activeAlert, acknowledgeIncident, isSirenActive, toggleMute, isMuted } = useAlert();

  if (!activeAlert || activeAlert.status === 'RESOLVED') {
    return null;
  }

  const isCritical = activeAlert.threatLevel === 'CRITICAL';
  const isHigh = activeAlert.threatLevel === 'HIGH';

  // Only auto-pop for CRITICAL or active unacknowledged HIGH alerts
  if (!isCritical && activeAlert.status !== 'ACTIVE') {
    return null;
  }

  const formattedTime = new Date(activeAlert.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const animalName = activeAlert.species
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-rose-500 rounded-2xl shadow-2xl shadow-rose-950/80 overflow-hidden">
        
        {/* Top Emergency Header Bar */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 px-6 py-4 flex items-center justify-between text-white animate-pulse-fast">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-8 h-8 text-white drop-shadow-md animate-bounce" />
            <div>
              <h2 className="text-xl font-black tracking-wider uppercase drop-shadow">
                CRITICAL WILDLIFE ALERT
              </h2>
              <p className="text-xs text-rose-100 font-medium">
                Ethical Perimeter Intrusion Detection &bull; Immediate Human Action Required
              </p>
            </div>
          </div>
          <button
            onClick={toggleMute}
            className="px-2.5 py-1 rounded bg-black/30 hover:bg-black/50 text-xs font-semibold flex items-center space-x-1"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isMuted ? 'UNMUTE' : 'MUTE'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Main Key-Value Evidence Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                <span>Animal</span>
              </span>
              <p className="text-2xl font-black text-rose-400 tracking-tight">
                {animalName}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span>Confidence</span>
              </span>
              <p className="text-2xl font-black text-emerald-400 tracking-tight">
                {Math.round(activeAlert.confidence * 100)}%
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Zone</span>
              </span>
              <p className="text-sm font-bold text-slate-200 truncate">
                {activeAlert.zoneName}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{activeAlert.cameraName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Detected</span>
              </span>
              <p className="text-sm font-bold text-slate-200">
                {formattedTime}
              </p>
              <p className="text-[11px] text-slate-400">Duration: {activeAlert.durationSeconds} seconds</p>
            </div>

          </div>

          {/* Alarm Status Strip */}
          <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeAlert.alarmStatus === 'TRIGGERED' ? 'bg-rose-400' : 'bg-slate-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${activeAlert.alarmStatus === 'TRIGGERED' ? 'bg-rose-500' : 'bg-slate-500'}`}></span>
              </span>
              <span className="text-xs font-bold text-slate-300">Alarm Status:</span>
              <span className={`text-xs font-extrabold uppercase tracking-wider ${activeAlert.alarmStatus === 'TRIGGERED' ? 'text-rose-400' : 'text-slate-400'}`}>
                {activeAlert.alarmStatus} {activeAlert.alarmStatus === 'TRIGGERED' && '(ESP32 Acoustic Siren Active)'}
              </span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono font-bold">
              ID: {activeAlert.id}
            </span>
          </div>

          {/* Reason Narrative */}
          <div className="p-3 bg-slate-800/60 rounded-lg text-xs text-slate-300 leading-relaxed border border-slate-700/60">
            <strong className="text-slate-200 block mb-1">Threat Assessment Engine Diagnosis:</strong>
            {activeAlert.threatReason}
          </div>

          {/* Ethical Safety Notice */}
          <p className="text-[11px] text-slate-400 text-center italic">
            🛡️ Safe Response Protocol: Autonomous acoustic deterrence engaged. Do not approach or attempt to harm the animal.
          </p>

          {/* User Required Action Buttons: [ACKNOWLEDGE ALERT], [VIEW CAMERA], [VIEW INCIDENT] */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            
            <button
              onClick={() => acknowledgeIncident(activeAlert.id)}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 transition-all transform active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              <span>ACKNOWLEDGE ALERT</span>
            </button>

            <button
              onClick={() => onViewCamera && onViewCamera(activeAlert.cameraId)}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>VIEW CAMERA</span>
            </button>

            <button
              onClick={() => onViewIncident && onViewIncident(activeAlert.id)}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>VIEW INCIDENT</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
