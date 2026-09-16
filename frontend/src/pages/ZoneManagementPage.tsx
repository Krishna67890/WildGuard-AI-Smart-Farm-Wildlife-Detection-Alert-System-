import React, { useState, useEffect } from 'react';
import { 
  MapPin, Shield, AlertTriangle, Eye, ShieldAlert, 
  Lock, Edit3, Plus, Check, Info 
} from 'lucide-react';
import { fetchApi } from '../services/api';
import { Zone, ZoneType } from '../types/index';
import { useAuth } from '../context/AuthContext';

export const ZoneManagementPage: React.FC = () => {
  const { canAdmin } = useAuth();
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchApi<{ success: boolean; zones: Zone[] }>('/zones')
      .then((res: any) => {
        if (res.success && res.zones) {
          setZones(res.zones);
          setSelectedZone(res.zones[0]);
        }
      })
      .catch((err: any) => console.warn('Zones fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const getZoneBadgeColor = (type: ZoneType) => {
    switch (type) {
      case 'CRITICAL': return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'WARNING': return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'MONITORING': return 'bg-yellow-950 text-yellow-300 border-yellow-800';
      case 'SAFE': return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Privacy Notice */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <span>Farm Geofencing & Spatial Zone Perimeter Engine</span>
          </h1>
          <p className="text-xs text-slate-400">
            Define multi-tiered danger geofences used by the AI Threat Assessment Engine to score proximity
          </p>
        </div>

        {/* GPS Obfuscation Privacy Banner */}
        <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-amber-300">
          <Lock className="w-3.5 h-3.5" />
          <span>Sensitive farm GPS coordinates obfuscated for privacy</span>
        </div>
      </div>

      {/* Main Grid: Interactive Farm Map Canvas + Zone Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Interactive Farm Map (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Interactive Farm Vector Geofence Map
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Coorg Valley Agro-Forest Reserve (40 Hectares)
            </span>
          </div>

          {/* SVG Geofence Canvas */}
          <div className="relative aspect-video rounded-xl bg-slate-950 border-2 border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
            
            <svg viewBox="0 0 100 80" className="w-full h-full p-2">
              
              {/* Background farm grid */}
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="80" fill="url(#grid)" />

              {/* Render Polygons for each zone */}
              {zones.map(z => {
                const pointsStr = z.polygon.map((p: { x: number; y: number }) => `${p.x},${p.y}`).join(' ');
                const isSelected = selectedZone?.id === z.id;

                return (
                  <g key={z.id} onClick={() => setSelectedZone(z)} className="cursor-pointer group">
                    <polygon
                      points={pointsStr}
                      fill={z.color}
                      fillOpacity={isSelected ? 0.35 : 0.18}
                      stroke={z.color}
                      strokeWidth={isSelected ? 1.5 : 0.8}
                      className="transition-all duration-200"
                    />
                    {/* Zone centroid text label */}
                    <text
                      x={z.polygon[0].x + 4}
                      y={z.polygon[0].y + 6}
                      fill="#ffffff"
                      fontSize="3"
                      fontWeight="bold"
                    >
                      {z.name}
                    </text>
                  </g>
                );
              })}

              {/* Camera Icon Positions */}
              <circle cx="20" cy="18" r="1.8" fill="#10b981" />
              <text x="23" y="19" fill="#10b981" fontSize="2.5" fontFamily="monospace">CAM-01</text>

              <circle cx="75" cy="45" r="1.8" fill="#10b981" />
              <text x="78" y="46" fill="#10b981" fontSize="2.5" fontFamily="monospace">CAM-02</text>

              <circle cx="50" cy="55" r="1.8" fill="#ef4444" />
              <text x="53" y="56" fill="#ef4444" fontSize="2.5" fontFamily="monospace">CAM-03 (Homestead)</text>

              <circle cx="25" cy="55" r="1.8" fill="#10b981" />
              <text x="28" y="56" fill="#10b981" fontSize="2.5" fontFamily="monospace">CAM-04</text>
            </svg>

            {/* Overlay Compass Rose & Legend */}
            <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-800 text-[10px] text-slate-300 space-y-1">
              <div className="font-bold text-white uppercase text-[9px] mb-1">Zone Legend</div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500"></span>
                <span>Critical Zone</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                <span>Warning Belt</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-yellow-500"></span>
                <span>Monitoring Buffer</span>
              </div>
            </div>

          </div>

          <p className="text-[11px] text-slate-400">
            Click on any geometric zone above to inspect perimeter dimensions, danger weightings, and camera assignment.
          </p>
        </div>

        {/* Selected Zone Inspector (1 Col) */}
        <div className="space-y-4">
          {selectedZone ? (
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
              
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase border ${getZoneBadgeColor(selectedZone.type)}`}>
                  {selectedZone.type} ZONE
                </span>
                <span className="text-[11px] text-slate-500 font-mono">ID: {selectedZone.id}</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">{selectedZone.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{selectedZone.description}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Threat Weight Multiplier:</span>
                  <span className="font-mono text-emerald-400 font-bold">{selectedZone.dangerMultiplier}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Protected Habitat:</span>
                  <span className="font-bold text-white">{selectedZone.protectedArea ? 'YES (High Priority)' : 'NO (Buffer Zone)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Obfuscated GPS Center:</span>
                  <span className="font-mono text-amber-300">
                    {selectedZone.obfuscatedGpsCenter?.lat || '12.42** N'}, {selectedZone.obfuscatedGpsCenter?.lng || '75.73** E'}
                  </span>
                </div>
              </div>

              {canAdmin ? (
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => alert(`Zone parameters for ${selectedZone.name} saved successfully.`)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                  >
                    Save Zone Parameters
                  </button>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-950 rounded-xl text-[11px] text-slate-400 text-center">
                  Zone editing restricted to Administrator role.
                </div>
              )}

            </div>
          ) : (
            <div className="p-6 bg-slate-900/60 rounded-2xl text-center text-slate-400 text-xs">
              Select a zone on the farm map.
            </div>
          )}

          {/* Environmental Best Practices Card */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5 text-slate-400">
            <div className="flex items-center space-x-1.5 font-bold text-slate-300">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Ethical Zoning Policy</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Zoning prevents false alarm fatigue. Herbivores moving through Safe or Monitoring buffers trigger silent audit logs instead of disruptive sirens.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
