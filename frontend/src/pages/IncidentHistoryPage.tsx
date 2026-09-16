import React, { useState, useEffect } from 'react';
import { 
  Bell, Filter, Download, CheckCircle2, ShieldCheck, 
  Search, Calendar, AlertTriangle, Eye, ShieldAlert, X 
} from 'lucide-react';
import { fetchApi } from '../services/api';
import { useAlert } from '../context/AlertContext';
import { Incident, WildlifeSpecies, ThreatLevel, IncidentStatus } from '../types/index';

interface IncidentHistoryPageProps {
  initialSelectedId?: string | null;
  onClearSelection?: () => void;
}

export const IncidentHistoryPage: React.FC<IncidentHistoryPageProps> = ({
  initialSelectedId,
  onClearSelection
}) => {
  const { acknowledgeIncident, resolveIncident } = useAlert();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterSpecies, setFilterSpecies] = useState<string>('ALL');
  const [filterThreat, setFilterThreat] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [resolveNotes, setResolveNotes] = useState<string>('');

  const fetchIncidents = async () => {
    try {
      let query = `/incidents?species=${filterSpecies}&threatLevel=${filterThreat}&status=${filterStatus}`;
      const res = await fetchApi<{ success: boolean; incidents: Incident[] }>(query);
      if (res.success && res.incidents) {
        setIncidents(res.incidents);

        // Handle deep-linking from CriticalAlertModal
        if (initialSelectedId) {
          const found = res.incidents.find(i => i.id === initialSelectedId);
          if (found) {
            setSelectedIncident(found);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [filterSpecies, filterThreat, filterStatus, initialSelectedId]);

  const closeInspector = () => {
    setSelectedIncident(null);
    if (onClearSelection) onClearSelection();
  };

  const handleExportCSV = () => {
    if (incidents.length === 0) return;
    const headers = ['IncidentID', 'Species', 'Confidence', 'ThreatLevel', 'ThreatScore', 'Camera', 'Zone', 'Timestamp', 'DurationSeconds', 'AlarmStatus', 'NotificationStatus', 'Status'];
    const rows = incidents.map(i => [
      i.id,
      i.species,
      i.confidence,
      i.threatLevel,
      i.threatScore,
      `"${i.cameraName}"`,
      `"${i.zoneName}"`,
      i.timestamp,
      i.durationSeconds,
      i.alarmStatus,
      i.notificationStatus,
      i.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wildguard_incidents_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <span>Wildlife Intrusion Incident Database & Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-400">
            Immutable log of confirmed animal detections, threat assessments, and resolution timelines
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center space-x-2"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Incidents (CSV)</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs">
        
        {/* Filter by Species */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase">Filter Species</label>
          <select
            value={filterSpecies}
            onChange={(e) => setFilterSpecies(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Wildlife Species</option>
            <option value="leopard">Leopard</option>
            <option value="tiger">Tiger</option>
            <option value="elephant">Elephant</option>
            <option value="wild_boar">Wild Boar</option>
            <option value="deer">Deer</option>
            <option value="monkey">Monkey</option>
          </select>
        </div>

        {/* Filter by Threat Level */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase">Threat Level</label>
          <select
            value={filterThreat}
            onChange={(e) => setFilterThreat(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Threat Levels</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        {/* Filter by Status */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase">Triage Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE (Needs Attention)</option>
            <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>

      </div>

      {/* Incidents Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-950 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Incident ID</th>
                <th className="py-3.5 px-4">Animal</th>
                <th className="py-3.5 px-4">Confidence</th>
                <th className="py-3.5 px-4">Threat Diagnosis</th>
                <th className="py-3.5 px-4">Sector / Zone</th>
                <th className="py-3.5 px-4">Timestamp & Dwell</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    No incidents match your filter criteria.
                  </td>
                </tr>
              ) : (
                incidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {inc.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white capitalize">{inc.species.replace('_', ' ')}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Score: {inc.threatScore}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-emerald-400 font-bold">
                        {Math.round(inc.confidence * 100)}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <div className="flex items-center space-x-1.5 mb-0.5">
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                          inc.threatLevel === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : inc.threatLevel === 'HIGH'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {inc.threatLevel}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 truncate block">{inc.threatReason}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">{inc.zoneName}</div>
                      <div className="text-[10px] text-slate-400">{inc.cameraName}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-mono text-[11px]">
                        {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {inc.durationSeconds}s duration
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        inc.status === 'ACTIVE'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                          : inc.status === 'ACKNOWLEDGED'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {inc.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedIncident(inc)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Inspection & Resolution Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden space-y-4">
            
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-emerald-400 font-bold text-sm">{selectedIncident.id}</span>
                <span className="text-slate-400 text-xs">&bull;</span>
                <span className="font-bold text-white text-sm capitalize">{selectedIncident.species.replace('_', ' ')} Incident Record</span>
              </div>
              <button onClick={closeInspector} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              
              {/* Evidence Snapshot Frame Placeholder */}
              <div className="relative aspect-video rounded-xl bg-black border border-slate-800 overflow-hidden flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Eye className="w-8 h-8 text-emerald-500/60 mx-auto" />
                  <p className="text-xs text-slate-400 font-mono">
                    Snapshot Capture &bull; {selectedIncident.species.toUpperCase()} [{Math.round(selectedIncident.confidence * 100)}%]
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Recorded by {selectedIncident.cameraName} at {new Date(selectedIncident.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Diagnosis Details */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-slate-300 block">Threat Intelligence Diagnosis:</span>
                <p className="text-slate-400 leading-relaxed">{selectedIncident.threatReason}</p>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div>Alarm: <strong className="text-rose-400">{selectedIncident.alarmStatus}</strong></div>
                  <div>Notifications: <strong className="text-emerald-400">{selectedIncident.notificationStatus}</strong></div>
                  <div>Status: <strong className="text-amber-400">{selectedIncident.status}</strong></div>
                </div>
              </div>

              {/* Action State Transitions */}
              <div className="space-y-3 pt-2">
                {selectedIncident.status === 'ACTIVE' && (
                  <button
                    onClick={async () => {
                      await acknowledgeIncident(selectedIncident.id);
                      setSelectedIncident({ ...selectedIncident, status: 'ACKNOWLEDGED' });
                      fetchIncidents();
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
                  >
                    Acknowledge Incident (Silence Siren)
                  </button>
                )}

                {selectedIncident.status !== 'RESOLVED' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Add resolution notes (e.g. Wildlife returned safely to sanctuary corridor)..."
                      value={resolveNotes}
                      onChange={(e) => setResolveNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={async () => {
                        await resolveIncident(selectedIncident.id, resolveNotes);
                        setSelectedIncident({ ...selectedIncident, status: 'RESOLVED' });
                        fetchIncidents();
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold transition"
                    >
                      Resolve Incident & Close Ticket
                    </button>
                  </div>
                )}

                {selectedIncident.status === 'RESOLVED' && (
                  <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/60 text-emerald-300 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Incident successfully resolved and archived.</span>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
