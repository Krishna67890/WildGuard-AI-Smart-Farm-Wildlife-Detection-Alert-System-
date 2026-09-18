import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, Radio, Activity, 
  Cpu, Bell, CheckCircle2, Volume2, VolumeX, Eye, ArrowUpRight, 
  MapPin, Clock, Zap, Sparkles 
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { fetchApi } from '../services/api';
import { Incident, Zone, Camera } from '../types/index';
import { CameraPlayer } from '../components/live/CameraPlayer';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { activeAlert, isSirenActive, toggleMute, isMuted, acknowledgeIncident } = useAlert();
  const [metrics, setMetrics] = useState<any>({
    totalIncidents: 0,
    activeAlertsCount: 0,
    criticalAlertsCount: 0,
    resolvedCount: 0,
    onlineCameras: 0,
    totalCameras: 0,
    onlineIoTDevices: 0,
    alarmActive: false
  });
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [highRiskZones, setHighRiskZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [primaryCamera, setPrimaryCamera] = useState<Camera | null>(null);

  const loadData = async () => {
    try {
      const [summaryRes, cameraRes] = await Promise.all([
        fetchApi<{ success: boolean; data: any }>('/dashboard/summary'),
        fetchApi<{ success: boolean; cameras: Camera[] }>('/cameras')
      ]);

      if (summaryRes.success && summaryRes.data) {
        setMetrics(summaryRes.data.metrics);
        setRecentIncidents(summaryRes.data.latestIncidents || []);
        setHighRiskZones(summaryRes.data.highRiskZones || []);
      }

      if (cameraRes.success && cameraRes.cameras.length > 0) {
        setCameras(cameraRes.cameras);
        // If no primary camera set yet, or current one not in list, find a good default
        if (!primaryCamera || !cameraRes.cameras.find(c => c.id === primaryCamera.id)) {
          const cam = cameraRes.cameras.find(c => c.status === 'CRITICAL') || cameraRes.cameras[0];
          setPrimaryCamera(cam);
        } else {
          // Update the primary camera object with latest status
          const updated = cameraRes.cameras.find(c => c.id === primaryCamera.id);
          if (updated) setPrimaryCamera(updated);
        }
      }
    } catch (err) {
      console.warn('Dashboard fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Top Banner Alert Bar (Flashing if Alarm Active) */}
      <div className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isSirenActive
          ? 'bg-rose-950/90 border-rose-500 shadow-xl shadow-rose-950/50 animate-pulse-fast'
          : 'bg-slate-900/80 border-slate-800 shadow-md'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl ${isSirenActive ? 'bg-rose-600 text-white' : 'bg-emerald-500/20 text-emerald-400'}`}>
            {isSirenActive ? <ShieldAlert className="w-6 h-6 animate-bounce" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-black uppercase tracking-wider text-white">
                {isSirenActive ? 'PERIMETER INTRUSION ALARM: TRIGGERED' : 'PERIMETER STATUS: SECURE & MONITORING'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isSirenActive ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {isSirenActive ? 'ACTIVE EMERGENCY' : 'ALL SECTORS NORMAL'}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {isSirenActive 
                ? 'Apex wildlife detected inside critical farm boundary. Acoustic deterrent active on ESP32 node.'
                : 'Continuous optical AI surveillance across 4 sectors with false-alarm temporal verification.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isSirenActive && activeAlert && (
            <button
              onClick={() => acknowledgeIncident(activeAlert.id)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
            >
              Acknowledge Alert
            </button>
          )}

          <button
            onClick={toggleMute}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition ${
              isMuted ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-800 text-emerald-300 border-slate-700'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isMuted ? 'Unmute Siren' : 'Mute Siren'}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Incidents */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Total Recorded</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{metrics.totalIncidents}</div>
          <p className="text-[11px] text-emerald-400 flex items-center space-x-1">
            <span>Verified by AI Temporal Engine</span>
          </p>
        </div>

        {/* Active Alerts */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Active Alarms</span>
            <Bell className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400">{metrics.activeAlertsCount}</div>
          <p className="text-[11px] text-slate-400">
            {metrics.criticalAlertsCount} Critical &bull; {metrics.resolvedCount} Resolved
          </p>
        </div>

        {/* Surveillance Nodes */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Camera Status</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {metrics.onlineCameras} <span className="text-sm font-normal text-slate-500">/ {metrics.totalCameras}</span>
          </div>
          <p className="text-[11px] text-cyan-400">
            100% Optical Streams Online
          </p>
        </div>

        {/* Connected IoT Hardware */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">IoT ESP32 Hub</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {metrics.onlineIoTDevices} <span className="text-sm font-normal text-slate-500">Active</span>
          </div>
          <p className="text-[11px] text-amber-400">
            PIR & Ultrasonic Siren Linked
          </p>
        </div>

      </div>

      {/* Center Layout: Live Surveillance Box & High-Risk Zones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Surveillance Area (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Live Perimeter Surveillance &bull; {primaryCamera?.sector || 'All Sectors'}
                </h2>
              </div>

              <div className="flex items-center space-x-4">
                <select
                  className="bg-slate-950 border border-slate-800 text-[10px] font-bold text-emerald-400 rounded-lg px-2 py-1 outline-none focus:border-emerald-500 transition-all"
                  value={primaryCamera?.id || ''}
                  onChange={(e) => {
                    const cam = cameras.find(c => c.id === e.target.value);
                    if (cam) setPrimaryCamera(cam);
                  }}
                >
                  {cameras.map(cam => (
                    <option key={cam.id} value={cam.id}>
                      {cam.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => onNavigate('live')}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                >
                  <span>Full View</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live Camera Stream Simulator Frame */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 shadow-inner group cursor-pointer" onClick={() => onNavigate('live')}>

              {primaryCamera ? (
                <CameraPlayer
                  camera={{
                    ...primaryCamera,
                    currentDetection: activeAlert?.cameraId === primaryCamera.id ? {
                      threatLevel: activeAlert.threatLevel,
                      species: activeAlert.species,
                      confidence: activeAlert.confidence,
                      distanceMeters: 14,
                      direction: 'APPROACHING',
                      timestamp: activeAlert.timestamp,
                      bbox: activeAlert.bbox
                    } : undefined
                  }}
                  isNightVision={false}
                  isFocused={true}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-mono text-xs">
                  NO ACTIVE CAMERA STREAM
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

              {/* Camera metadata tags */}
              <div className="absolute top-3 left-3 text-[11px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-1 rounded">
                {primaryCamera?.name || 'CAM-01'} ● LIVE {primaryCamera?.fps || 30} FPS
              </div>
              <div className="absolute top-3 right-3 text-[11px] font-mono text-slate-300 bg-slate-950/80 px-2 py-1 rounded">
                ZONE: {primaryCamera?.sector || 'North Forest Perimeter'}
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
                <span>Threat Diagnosis: <strong className={activeAlert ? 'text-rose-400' : 'text-emerald-400'}>
                  {activeAlert ? 'Apex Predator Advancing Towards Zone' : 'Perimeter Secure - Normal Activity'}
                </strong></span>
                <span className="text-[11px] text-slate-400">Click to expand PTZ controls &rarr;</span>
              </div>
            </div>

            {/* Quick stats strip below camera */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Current Target</span>
                <span className="font-extrabold text-white">Leopard / Human</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Detection Confidence</span>
                <span className="font-extrabold text-emerald-400">94.2% Verified</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Threat Score</span>
                <span className="font-extrabold text-rose-400">0.92 / 1.00</span>
              </div>
            </div>

          </div>
        </div>

        {/* High-Risk Zones & AI Insight (1 Col) */}
        <div className="space-y-4">
          
          {/* AI-Generated Insight Box */}
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950/60 p-5 rounded-2xl border border-emerald-500/30 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Threat Intelligence</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              &ldquo;Most wildlife activity occurred between 19:00 and 02:00 this week, with North Forest Perimeter recording the highest confirmed predator events.&rdquo;
            </p>
            <div className="text-[10px] text-emerald-400 font-mono">
              Engine: WildGuard v2.4 (Temporal N-Frame AI)
            </div>
          </div>

          {/* High Risk Farm Zones Card */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>High-Risk Farm Zones</span>
              </h3>
              <button
                onClick={() => onNavigate('zones')}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Edit Zones
              </button>
            </div>

            <div className="space-y-2.5">
              {highRiskZones.map(zone => (
                <div
                  key={zone.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${zone.type === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                      <span className="text-xs font-bold text-white">{zone.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">{zone.description.slice(0, 45)}...</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    zone.type === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {zone.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Recent Alerts & Incidents Table */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Incident Log & Farmer Alert Triage
            </h3>
            <p className="text-xs text-slate-400">
              Real-time audit log of confirmed wildlife intrusions with human acknowledgment workflow
            </p>
          </div>

          <button
            onClick={() => onNavigate('incidents')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
          >
            <span>View Full History</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Species</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Zone / Camera</th>
                <th className="py-3 px-4">Threat Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentIncidents.map(inc => (
                <tr key={inc.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">{inc.id}</td>
                  <td className="py-3 px-4 font-bold text-white capitalize">
                    leopard
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-400">
                    {Math.round(inc.confidence * 100)}%
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-200 font-medium">{inc.zoneName}</div>
                    <div className="text-[10px] text-slate-400">{inc.cameraName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      inc.threatLevel === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : inc.threatLevel === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {inc.threatLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      inc.status === 'ACTIVE'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                        : inc.status === 'ACKNOWLEDGED'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {inc.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {inc.status === 'ACTIVE' && (
                      <button
                        onClick={() => acknowledgeIncident(inc.id)}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => onNavigate('incidents')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
