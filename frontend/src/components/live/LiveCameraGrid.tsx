import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Camera as CameraIcon, Play, Pause, Maximize2, Shield, AlertTriangle,
  ZoomIn, ZoomOut, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Eye, RefreshCw, Video, Sparkles, Radio, Grid, Layout,
  Settings, CameraOff, Power, Activity, Bell, Map as MapIcon,
  ChevronLeft, ChevronRight, Plus, Monitor, Terminal, Clock,
  X, CheckCircle2, Info, Network, Lock, Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { fetchApi, wsClient } from '../../services/api';
import { WildlifeSpecies, ThreatLevel, Camera, Zone, Incident, CameraSourceType, CameraProtocol, CameraPriority, BoundingBox, CameraFeed } from '../../types/index';
import { wildlifeData } from '../../data/wildlifeInfo';
import { CameraPlayer } from './CameraPlayer';

type ViewMode = 'FOCUS' | 'GRID' | 'SECTOR';
export const LiveCameraGrid: React.FC = () => {
  const { activeAlert, setActiveAlert, setIsSirenActive, addToast } = useAlert();
  const [cameras, setCameras] = useState<CameraFeed[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('FOCUS');
  const [isNightVision, setIsNightVision] = useState<boolean>(false);
  const [autoFocusCritical, setAutoFocusCritical] = useState<boolean>(false);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  // Synchronize Local Critical State with Global Alarm
  useEffect(() => {
    const criticalCam = cameras.find(c =>
      (c.status === 'CRITICAL' || c.currentDetection?.threatLevel === 'CRITICAL') &&
      c.currentDetection?.species.toLowerCase() === 'leopard'
    );

    if (criticalCam && !activeAlert) {
      setIsSirenActive(true);
      addToast(
        'LEOPARD DETECTED',
        `Apex predator (Leopard) detected on ${criticalCam.name}. Siren active.`,
        'CRITICAL'
      );
    }
  }, [cameras, activeAlert, setIsSirenActive, addToast]);

  const [newCam, setNewCam] = useState<Partial<Camera>>({
    name: '',
    brand: 'WildGuard',
    model: 'Edge-AI Node',
    sourceType: 'IP_NETWORK',
    protocol: 'RTSP',
    ipAddress: '',
    port: 554,
    streamPath: '/live',
    username: 'admin',
    password: '',
    priority: 'NORMAL',
    zoneId: '',
    sector: 'NORTH SECTOR',
    locationDescription: '',
    detectionEnabled: true,
    minConfidence: 0.65,
    animalCategories: ['leopard', 'human'],
    minDetectionDurationSec: 2,
    zoneDetectionEnabled: true,
    alarmEnabled: true,
    notificationsEnabled: true,
    snapshotEnabled: true,
    recordingEnabled: true,
    alertCooldownSec: 300,
    assignedDeviceId: ''
  });

  useEffect(() => {
    if (showAddModal && newCam.sourceType === 'BROWSER_WEBCAM') {
      const startPreview = async () => {
        try {
          if (previewStream) {
            previewStream.getTracks().forEach(t => t.stop());
          }
          const stream = await navigator.mediaDevices.getUserMedia({
            video: newCam.assignedDeviceId ? { deviceId: { exact: newCam.assignedDeviceId } } : true
          });
          setPreviewStream(stream);
          if (previewVideoRef.current) previewVideoRef.current.srcObject = stream;
        } catch (err) {
          console.error("Failed to start webcam preview:", err);
        }
      };
      startPreview();
    } else {
      if (previewStream) {
        previewStream.getTracks().forEach(t => t.stop());
        setPreviewStream(null);
      }
    }
  }, [showAddModal, newCam.sourceType, newCam.assignedDeviceId]);

  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Group cameras by sector
  const sectors = useMemo(() => {
    const map: Record<string, CameraFeed[]> = {};
    cameras.forEach(cam => {
      const s = cam.sector || 'UNASSIGNED';
      if (!map[s]) map[s] = [];
      map[s].push(cam);
    });
    return map;
  }, [cameras]);

  // Global Status Counters
  const stats = useMemo(() => {
    return {
      total: cameras.length,
      live: cameras.filter(c => c.status !== 'OFFLINE' && c.status !== 'ERROR').length,
      offline: cameras.filter(c => c.status === 'OFFLINE' || c.status === 'ERROR').length,
      aiActive: cameras.filter(c => c.detectionEnabled).length,
      activeAlerts: cameras.filter(c => c.currentDetection && c.currentDetection.threatLevel !== 'LOW').length,
      critical: cameras.filter(c => c.status === 'CRITICAL' || (c.currentDetection && c.currentDetection.threatLevel === 'CRITICAL')).length
    };
  }, [cameras]);

  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [camRes, zoneRes] = await Promise.all([
          fetchApi('/cameras'),
          fetchApi('/zones')
        ]) as [any, any];

        if (camRes.success && zoneRes.success) {
          const fetchedCameras = camRes.cameras.map((cam: Camera) => ({
            ...cam,
            currentDetection: undefined
          }));

          setCameras(fetchedCameras);
          setZones(zoneRes.zones);

          // Auto-select first camera if none selected
          if (fetchedCameras.length > 0 && !selectedCameraId) {
            setSelectedCameraId(fetchedCameras[0].id);
          }
        }

        // Get available media devices
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          setAvailableDevices(devices.filter(d => d.kind === 'videoinput'));
        }
      } catch (err) {
        console.error('Failed to load surveillance data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Real-time WebSocket listeners for camera state
  useEffect(() => {
    const unsubNewInc = wsClient.on('NEW_INCIDENT', (incident: Incident) => {
      setCameras(prev => prev.map(cam => {
        if (cam.id === incident.cameraId) {
          return {
            ...cam,
            status: incident.threatLevel === 'CRITICAL' ? 'CRITICAL' : cam.status,
            currentDetection: {
              threatLevel: incident.threatLevel,
              species: incident.species,
              confidence: incident.confidence,
              distanceMeters: 15, // Mock distance if not in incident
              direction: 'APPROACHING',
              timestamp: incident.timestamp,
              bbox: incident.bbox
            }
          };
        }
        return cam;
      }));
    });

    const unsubAck = wsClient.on('INCIDENT_ACKNOWLEDGED', (incident: Incident) => {
      setCameras(prev => prev.map(cam => {
        if (cam.id === incident.cameraId) {
          return {
            ...cam,
            status: 'AI_ACTIVE', // Or keep as is, but clear critical if needed
            // We keep the detection for context but maybe dim it?
          };
        }
        return cam;
      }));
    });

    const unsubRes = wsClient.on('INCIDENT_RESOLVED', (incident: Incident) => {
      setCameras(prev => prev.map(cam => {
        if (cam.id === incident.cameraId) {
          return {
            ...cam,
            status: 'STREAMING',
            currentDetection: undefined
          };
        }
        return cam;
      }));
    });

    return () => {
      unsubNewInc();
      unsubAck();
      unsubRes();
    };
  }, []);

  // Handle Active Alert Auto-Focus - DISABLED to prevent unwanted switching
  useEffect(() => {
    if (activeAlert) {
      // Add to timeline only, don't switch camera
      setTimeline(prev => {
        if (prev.length > 0 && prev[0].event.includes(activeAlert.species.toUpperCase()) && prev[0].cam === activeAlert.cameraName) {
          return prev;
        }
        return [{
          time: new Date().toLocaleTimeString(),
          event: `${activeAlert.species.toUpperCase()} detected`,
          cam: activeAlert.cameraName,
          level: activeAlert.threatLevel
        }, ...prev].slice(0, 10);
      });
    }
  }, [activeAlert]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if user is typing in an input, textarea or select
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (cameras[index]) setSelectedCameraId(cameras[index].id);
      }
      if (e.key === 'ArrowLeft') {
        const idx = cameras.findIndex(c => c.id === selectedCameraId);
        if (idx > 0) setSelectedCameraId(cameras[idx - 1].id);
      }
      if (e.key === 'ArrowRight') {
        const idx = cameras.findIndex(c => c.id === selectedCameraId);
        if (idx < cameras.length - 1) setSelectedCameraId(cameras[idx + 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cameras, selectedCameraId]);

  const currentCam = cameras.find(c => c.id === selectedCameraId) || cameras[0];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <div className="text-slate-400 font-black text-xs uppercase tracking-widest animate-pulse">
          Synchronizing Command Center...
        </div>
      </div>
    );
  }

  if (cameras.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20">
          <Network className="w-10 h-10 text-rose-500 animate-pulse" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Backend Connectivity Lost</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            The WildGuard AI Command Center is unable to reach the core monitoring server.
            Real-time surveillance feeds and AI threat detection are currently offline.
          </p>
        </div>
        <div className="flex flex-col space-y-3 w-full max-w-xs">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase py-3 rounded-xl transition shadow-lg shadow-emerald-900/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-left">
            <div className="text-[9px] font-black text-slate-500 uppercase mb-1">System Status</div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-[10px] text-rose-400 font-mono">ERR_CONNECTION_REFUSED (5000)</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const nextCam = () => {
    const idx = cameras.findIndex(c => c.id === selectedCameraId);
    if (idx < cameras.length - 1) setSelectedCameraId(cameras[idx + 1].id);
  };

  const prevCam = () => {
    const idx = cameras.findIndex(c => c.id === selectedCameraId);
    if (idx > 0) setSelectedCameraId(cameras[idx - 1].id);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) nextCam();
    if (diff < -50) prevCam();
  };

  const handleCameraAction = async (action: 'START' | 'STOP' | 'RESTART' | 'SNAPSHOT') => {
    if (!selectedCameraId) return;
    const cam = cameras.find(c => c.id === selectedCameraId);
    if (!cam) return;

    try {
      if (action === 'SNAPSHOT') {
        // Mock snapshot
        const timestamp = new Date().toISOString();
        setTimeline(prev => [{
          time: new Date().toLocaleTimeString(),
          event: `Manual snapshot captured`,
          cam: cam.name,
          level: 'LOW'
        }, ...prev].slice(0, 10));
        alert(`Snapshot captured for ${cam.name} at ${timestamp}`);
        return;
      }

      let newStatus: Camera['status'] = cam.status;
      if (action === 'START') newStatus = 'STREAMING';
      if (action === 'STOP') newStatus = 'ONLINE';
      if (action === 'RESTART') {
         // Simulate restart cycle
         setCameras(prev => prev.map(c => c.id === selectedCameraId ? { ...c, status: 'CONNECTING' } : c));
         await new Promise(r => setTimeout(r, 1000));
         newStatus = 'STREAMING';
      }

      const res = await fetchApi<{ success: boolean; camera: any }>(`/cameras/${selectedCameraId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      if (res.success) {
        setCameras(prev => prev.map(c => c.id === selectedCameraId ? { ...c, ...res.camera } : c));
      }
    } catch (err) {
      console.error('Camera action failed:', err);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await fetchApi<{ success: boolean; message: string; stats?: any }>('/cameras/test-connection', {
        method: 'POST',
        body: JSON.stringify(newCam)
      });
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveCamera = async () => {
    try {
      const res = await fetchApi<{ success: boolean; camera: CameraFeed }>('/cameras', {
        method: 'POST',
        body: JSON.stringify(newCam)
      });
      if (res.success) {
        setCameras([...cameras, res.camera]);
        setShowAddModal(false);
        setSelectedCameraId(res.camera.id);
      }
    } catch (err) {
      alert('Failed to save camera');
    }
  };

  return (
    <div className="flex flex-col space-y-4 min-h-[calc(100vh-120px)]">
      
      {/* 9. GLOBAL LIVE STATUS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3">
        <div className="bg-slate-900 border border-slate-800 p-2 md:p-3 rounded-xl flex flex-col items-center justify-center">
          <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase">Cameras</span>
          <span className="text-lg md:text-xl font-black text-white">{stats.total}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-2 md:p-3 rounded-xl flex flex-col items-center justify-center">
          <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase">Live</span>
          <span className="text-lg md:text-xl font-black text-emerald-400">{stats.live}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-2 md:p-3 rounded-xl flex flex-col items-center justify-center">
          <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase">Offline</span>
          <span className="text-lg md:text-xl font-black text-rose-500">{stats.offline}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-2 md:p-3 rounded-xl flex flex-col items-center justify-center">
          <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase">AI Active</span>
          <span className="text-lg md:text-xl font-black text-cyan-400">{stats.aiActive}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-2 md:p-3 rounded-xl flex flex-col items-center justify-center">
          <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase">Alerts</span>
          <span className="text-lg md:text-xl font-black text-amber-500">{stats.activeAlerts}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-2 md:p-3 rounded-xl flex flex-col items-center justify-center">
          <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase">Animals</span>
          <span className="text-lg md:text-xl font-black text-emerald-500">03</span>
        </div>
        <div className="bg-slate-900 border border-rose-900/50 p-2 md:p-3 rounded-xl flex flex-col items-center justify-center shadow-lg shadow-rose-950/20 col-span-2 md:col-span-1">
          <span className="text-[9px] md:text-[10px] text-rose-400 font-bold uppercase">Critical</span>
          <span className="text-lg md:text-xl font-black text-rose-500 animate-pulse">{stats.critical}</span>
        </div>
      </div>

      {/* 3 & 4. CAMERA SWITCHER WITH SECTORS */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
            <Layout className="w-4 h-4" />
            <span>Sector-Based Camera Control</span>
          </h2>
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['FOCUS', 'GRID', 'SECTOR'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                  viewMode === mode ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-6">
          {Object.entries(sectors).map(([sector, cams]) => (
            <div key={sector} className="space-y-2 w-full md:w-auto">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-tighter border-b border-slate-800 pb-1">
                {sector}
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {cams.map(cam => (
                  <button
                    key={cam.id}
                    onClick={() => setSelectedCameraId(cam.id)}
                    className={`group relative flex flex-col p-2 rounded-xl border transition-all w-28 md:w-32 flex-shrink-0 ${
                      selectedCameraId === cam.id
                        ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[9px] font-bold text-slate-300 truncate w-16 md:w-20 text-left">{cam.name}</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        cam.status === 'OFFLINE' ? 'bg-slate-600' :
                        cam.status === 'CRITICAL' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                      }`} />
                    </div>
                    <div className="aspect-video bg-slate-900 rounded overflow-hidden mb-1 flex items-center justify-center">
                       {cam.status === 'OFFLINE' ? <CameraOff className="w-4 h-4 text-slate-700" /> : <Video className="w-4 h-4 text-slate-700" />}
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-[8px] font-bold px-1 rounded uppercase ${
                        cam.status === 'CRITICAL' ? 'text-rose-400' : 'text-slate-500'
                      }`}>
                        {cam.status}
                      </span>
                      {cam.currentDetection && (
                        <span className="text-[8px] font-black text-amber-500">! {cam.currentDetection.threatLevel}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* 16. ADD CAMERA QUICK ACTION */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500 hover:bg-emerald-500/5 transition-all w-28 md:w-32 aspect-[4/5] text-slate-500 hover:text-emerald-500 flex-shrink-0"
          >
            <Plus className="w-6 h-6 mb-2" />
            <span className="text-[10px] font-bold uppercase">Add Camera</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        
        {/* 5. MAIN LIVE VIEW (DYNAMIC MODES) */}
        <div className="lg:col-span-3 space-y-4">

          {viewMode === 'FOCUS' && (
            <div
              className="relative aspect-video rounded-3xl overflow-hidden border-4 border-slate-800 bg-black shadow-2xl group"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Viewport content */}
              {currentCam && (
                <CameraPlayer
                  camera={currentCam}
                  isNightVision={isNightVision}
                  isFocused={true}
                />
              )}

              {/* 6. QUICK CAMERA SWITCH OVERLAYS */}
              <div className="absolute inset-y-0 left-0 w-16 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={prevCam} className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md">
                   <ChevronLeft className="w-6 h-6" />
                 </button>
              </div>
              <div className="absolute inset-y-0 right-0 w-16 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={nextCam} className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md">
                   <ChevronRight className="w-6 h-6" />
                 </button>
              </div>

              {/* 10. CRITICAL EVENT NOTIFICATION OVERLAY */}
              {currentCam?.status === 'CRITICAL' && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-6 py-2 rounded-full font-black text-sm animate-bounce shadow-2xl shadow-rose-900 flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5" />
                  <span>CRITICAL EVENT — {currentCam.name} — LEOPARD DETECTED</span>
                </div>
              )}

              {/* Top Status Badges */}
              <div className="absolute top-4 left-4 flex items-center space-x-2">
                <div className="bg-emerald-600 text-white px-2 py-1 rounded-md text-[10px] font-black uppercase flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>LIVE</span>
                </div>
                <div className="bg-slate-900/80 backdrop-blur-md text-slate-300 px-2 py-1 rounded-md text-[10px] font-bold border border-slate-700">
                  {currentCam?.sourceType === 'SIMULATION' ? 'SIMULATION FEED' : 'REAL IP FEED'}
                </div>
              </div>

              <div className="absolute top-4 right-4 flex flex-col items-end space-y-2">
                 <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-right">
                    <div className="text-[9px] text-slate-500 font-bold uppercase">Active Sector</div>
                    <div className="text-xs text-emerald-400 font-black">{currentCam?.sector || 'NORTH'}</div>
                 </div>
                 <div className={`bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-right ${
                   currentCam?.currentDetection?.threatLevel === 'CRITICAL' ? 'ring-2 ring-rose-500' : ''
                 }`}>
                    <div className="text-[9px] text-slate-500 font-bold uppercase">Threat Level</div>
                    <div className={`text-xs font-black ${
                      currentCam?.currentDetection?.threatLevel === 'CRITICAL' ? 'text-rose-500' : 'text-emerald-500'
                    }`}>
                      {currentCam?.currentDetection?.threatLevel || 'SECURE'}
                    </div>
                 </div>
              </div>

              {/* 13. CAMERA CONTROL BAR */}
              <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-1 md:p-2 flex items-center justify-between shadow-2xl overflow-x-auto scrollbar-hide">
                <div className="flex items-center space-x-1 px-2 md:px-4">
                   <button
                    onClick={() => handleCameraAction('START')}
                    className="p-1.5 md:p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition" title="Start">
                     <Play className="w-4 h-4 md:w-5 md:h-5" />
                   </button>
                   <button
                    onClick={() => handleCameraAction('STOP')}
                    className="p-1.5 md:p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition" title="Stop">
                     <Power className="w-4 h-4 md:w-5 md:h-5" />
                   </button>
                   <button
                    onClick={() => handleCameraAction('RESTART')}
                    className="p-1.5 md:p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition" title="Restart">
                     <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" />
                   </button>
                </div>

                <div className="h-6 md:h-8 w-px bg-slate-800 mx-1 md:mx-2" />

                <div className="flex items-center space-x-1">
                   <button
                    onClick={() => handleCameraAction('SNAPSHOT')}
                    className="p-1.5 md:p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition" title="Capture Snapshot">
                     <Activity className="w-4 h-4 md:w-5 md:h-5" />
                   </button>
                   <button className="p-1.5 md:p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition" title="Record">
                     <Monitor className="w-4 h-4 md:w-5 md:h-5" />
                   </button>
                   <button className="p-1.5 md:p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition" title="Settings">
                     <Settings className="w-4 h-4 md:w-5 md:h-5" />
                   </button>
                </div>

                <div className="h-6 md:h-8 w-px bg-slate-800 mx-1 md:mx-2" />

                <div className="flex items-center space-x-1 px-2 md:px-4">
                   <button
                    onClick={() => setIsNightVision(!isNightVision)}
                    className={`p-1.5 md:p-2 rounded-lg transition ${isNightVision ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:bg-slate-800'}`}
                    title="Night Vision"
                   >
                     <Eye className="w-4 h-4 md:w-5 md:h-5" />
                   </button>
                   <button className="p-1.5 md:p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition" title="Fullscreen">
                     <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
                   </button>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'GRID' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {cameras.map(cam => (
                <button
                  key={cam.id}
                  onClick={() => { setSelectedCameraId(cam.id); setViewMode('FOCUS'); }}
                  className={`relative aspect-video rounded-2xl overflow-hidden border-2 transition-all group ${
                    selectedCameraId === cam.id ? 'border-emerald-500' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <CameraPlayer camera={cam} isNightVision={isNightVision} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[9px] font-bold text-white border border-white/10">
                    {cam.name}
                  </div>
                </button>
              ))}
            </div>
          )}

          {viewMode === 'SECTOR' && (
            <div className="space-y-8">
              {Object.entries(sectors).map(([sector, cams]) => (
                <div key={sector} className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                    <div className="w-2 h-4 bg-emerald-500 rounded-full" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">{sector}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {cams.map(cam => (
                      <button
                        key={cam.id}
                        onClick={() => { setSelectedCameraId(cam.id); setViewMode('FOCUS'); }}
                        className={`relative aspect-video rounded-2xl overflow-hidden border-2 transition-all group ${
                          selectedCameraId === cam.id ? 'border-emerald-500' : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <CameraPlayer camera={cam} isNightVision={isNightVision} />
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[9px] font-bold text-white">
                          {cam.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 20. LIVE DETECTION TIMELINE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-hidden">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center space-x-2">
               <Clock className="w-4 h-4" />
               <span>Live Detection Timeline</span>
             </h3>
             <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
               {timeline.length > 0 ? timeline.map((entry, i) => (
                 <div key={i} className="flex-shrink-0 bg-slate-950 border border-slate-800 p-3 rounded-xl min-w-[200px]">
                   <div className="flex justify-between items-start mb-1">
                     <span className="text-[10px] text-slate-500 font-mono">{entry.time}</span>
                     <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                       entry.level === 'CRITICAL' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'
                     }`}>{entry.level}</span>
                   </div>
                   <div className="text-xs font-bold text-white mb-1">{entry.event}</div>
                   <div className="text-[10px] text-slate-500">{entry.cam}</div>
                 </div>
               )) : (
                 <div className="text-[11px] text-slate-600 italic py-4">Waiting for detection events...</div>
               )}
             </div>
          </div>
        </div>

        {/* SIDEBAR: MINI-MAP & SECTOR STATUS */}
        <div className="space-y-6">

          {/* 8. LIVE CAMERA MINI-MAP */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 aspect-square relative overflow-hidden flex flex-col">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center space-x-2">
              <MapIcon className="w-3.5 h-3.5" />
              <span>Property Map</span>
            </h3>
            <div className="flex-1 bg-slate-950 rounded-xl relative border border-slate-800/50 p-4">
               {/* Simplified Farm Layout */}
               <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-600">NORTH</div>
               <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-600">SOUTH</div>

               {/* Sector Areas */}
               <div className="absolute inset-4 border border-slate-800/30 grid grid-cols-2 grid-rows-3 gap-1 opacity-20">
                 <div className="bg-emerald-500/10 rounded"></div>
                 <div className="bg-amber-500/10 rounded"></div>
                 <div className="bg-blue-500/10 rounded"></div>
                 <div className="bg-rose-500/10 rounded"></div>
                 <div className="bg-cyan-500/10 rounded col-span-2"></div>
               </div>

               {/* Camera Markers */}
               {cameras.map((cam, i) => (
                 <button
                  key={cam.id}
                  onClick={() => setSelectedCameraId(cam.id)}
                  className={`absolute w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center shadow-lg ${
                    selectedCameraId === cam.id ? 'z-20 scale-150 ring-4 ring-white/20' : 'z-10 hover:scale-110'
                  } ${
                    cam.status === 'OFFLINE' ? 'bg-slate-700 border-slate-500' :
                    cam.status === 'CRITICAL' ? 'bg-rose-500 border-white animate-pulse' :
                    'bg-emerald-500 border-white'
                  }`}
                  style={{
                    top: `${25 + (i * 15) % 50}%`,
                    left: `${25 + (i * 25) % 50}%`
                  }}
                  title={cam.name}
                 >
                   <CameraIcon className="w-3 h-3 text-white" />
                   {selectedCameraId === cam.id && (
                     <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-[8px] px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap text-white font-bold">
                       {cam.name}
                     </span>
                   )}
                 </button>
               ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <div className="flex items-center space-x-1 text-[8px] text-slate-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> <span>LIVE</span>
              </div>
              <div className="flex items-center space-x-1 text-[8px] text-slate-400">
                <div className="w-2 h-2 rounded-full bg-rose-500" /> <span>CRITICAL</span>
              </div>
              <div className="flex items-center space-x-1 text-[8px] text-slate-400">
                <div className="w-2 h-2 rounded-full bg-slate-600" /> <span>OFFLINE</span>
              </div>
            </div>
          </div>

          {/* 11. MONITORING SETTINGS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
               <Shield className="w-3.5 h-3.5 text-emerald-400" />
               <span>Control Logic</span>
             </h3>
             <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer group">
                   <div className="flex flex-col">
                     <span className="text-[11px] font-bold text-slate-300 group-hover:text-white transition">Auto-Focus Critical</span>
                     <span className="text-[9px] text-slate-500 italic">Switch to active threats</span>
                   </div>
                   <input
                    type="checkbox"
                    checked={autoFocusCritical}
                    onChange={e => setAutoFocusCritical(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500"
                   />
                </label>
                <label className="flex items-center justify-between cursor-pointer group">
                   <div className="flex flex-col">
                     <span className="text-[11px] font-bold text-slate-300 group-hover:text-white transition">Multi-Camera AI</span>
                     <span className="text-[9px] text-slate-500 italic">Parallel inference stream</span>
                   </div>
                   <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-500" />
                </label>
             </div>
          </div>

          {/* 2. SECTOR SUMMARY */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Sector Status</h3>
             <div className="space-y-3">
                {Object.keys(sectors).map(sector => (
                  <div key={sector} className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800/50">
                    <span className="text-[10px] font-bold text-slate-300">{sector}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] text-slate-500">{sectors[sector].length} CAM</span>
                      <div className={`w-2 h-2 rounded-full ${
                        sectors[sector].some(c => c.status === 'CRITICAL') ? 'bg-rose-500' : 'bg-emerald-500'
                      }`} />
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* SIMULATION COMMANDER */}
          <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-4 space-y-3">
             <div className="flex items-center space-x-2">
               <Terminal className="w-4 h-4 text-emerald-400" />
               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Dev Terminal</span>
             </div>
             <p className="text-[9px] text-emerald-300/70 leading-relaxed italic">
               System operating in Simulation Mode. Use Examiner Toolbar to trigger apex predator scenarios for viva evaluation.
             </p>
          </div>

          {/* ANIMAL INFO TOOLTIP */}
          {currentCam?.currentDetection && (
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest">Species Identified</h3>
                <span className="text-[8px] font-black bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded">
                  {Math.round(currentCam.currentDetection.confidence * 100)}% CONF
                </span>
              </div>

              {wildlifeData[currentCam.currentDetection.species as WildlifeSpecies] && (
                <div className="space-y-3">
                  <div className="aspect-video rounded-xl overflow-hidden border border-slate-800">
                    <img
                      src={wildlifeData[currentCam.currentDetection.species as WildlifeSpecies].imageUrl}
                      alt={currentCam.currentDetection.species}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">{wildlifeData[currentCam.currentDetection.species as WildlifeSpecies].commonName}</div>
                    <div className="text-[9px] text-slate-500 italic mb-1">{wildlifeData[currentCam.currentDetection.species as WildlifeSpecies].scientificName}</div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {wildlifeData[currentCam.currentDetection.species as WildlifeSpecies].description}
                    </p>
                  </div>
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <div className="text-[8px] font-black text-emerald-400 uppercase mb-1">Deterrent Protocol</div>
                    <div className="text-[10px] text-emerald-200 leading-tight">
                      {wildlifeData[currentCam.currentDetection.species as WildlifeSpecies].deterrentMethod}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* 9. ADD CAMERA MODAL INTEGRATION */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Add Surveillance Device</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Rapid Deployment Wizard</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
              {/* LEFT COLUMN: BASIC & NETWORK */}
              <div className="space-y-6">
                <section>
                  <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center">
                    <Info className="w-3.5 h-3.5 mr-2" />
                    Device Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase">Device Name</label>
                      <input
                        type="text"
                        placeholder="e.g. South Perimeter"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                        value={newCam.name}
                        onChange={e => setNewCam({...newCam, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase">Assigned Sector</label>
                      <select
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                        value={newCam.sector}
                        onChange={e => setNewCam({...newCam, sector: e.target.value})}
                      >
                        <option value="NORTH SECTOR">NORTH SECTOR</option>
                        <option value="EAST SECTOR">EAST SECTOR</option>
                        <option value="CROP SECTOR">CROP SECTOR</option>
                        <option value="WATER SECTOR">WATER SECTOR</option>
                        <option value="RESIDENTIAL SECTOR">RESIDENTIAL SECTOR</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase">Farm Zone</label>
                      <select
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                        value={newCam.zoneId}
                        onChange={e => setNewCam({...newCam, zoneId: e.target.value})}
                      >
                        <option value="">Select Zone</option>
                        {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase">Risk Priority</label>
                      <select
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                        value={newCam.priority}
                        onChange={e => setNewCam({...newCam, priority: e.target.value as CameraPriority})}
                      >
                        <option value="LOW">Low Risk</option>
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">High Priority</option>
                        <option value="CRITICAL">Critical Guard</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center">
                    <Network className="w-3.5 h-3.5 mr-2" />
                    Network Configuration
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[9px] font-black text-slate-500 uppercase">IP Endpoint</label>
                        <input
                          type="text"
                          placeholder="192.168.1.xxx"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                          value={newCam.ipAddress}
                          onChange={e => setNewCam({...newCam, ipAddress: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-500 uppercase">Port</label>
                        <input
                          type="number"
                          placeholder="554"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                          value={newCam.port}
                          onChange={e => setNewCam({...newCam, port: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase">Stream Source Type</label>
                      <div className="flex space-x-2">
                        <select
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                          value={newCam.sourceType}
                          onChange={e => {
                            const val = e.target.value as CameraSourceType;
                            setNewCam({
                              ...newCam,
                              sourceType: val,
                              ipAddress: val === 'BROWSER_WEBCAM' ? 'LOCAL_HOST' : newCam.ipAddress,
                              protocol: val === 'BROWSER_WEBCAM' ? 'WEBRTC' : newCam.protocol
                            });
                          }}
                        >
                          <option value="IP_NETWORK">Network Camera (ONVIF)</option>
                          <option value="BROWSER_WEBCAM">Local Device Camera (Mobile/PC)</option>
                          <option value="SIMULATION">Simulation Engine</option>
                        </select>
                        <select
                          className="w-32 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                          value={newCam.protocol}
                          onChange={e => setNewCam({...newCam, protocol: e.target.value as CameraProtocol})}
                        >
                          <option value="RTSP">RTSP</option>
                          <option value="HTTP">HLS</option>
                          <option value="WEBRTC">WebRTC</option>
                        </select>
                      </div>
                    </div>

                    {newCam.sourceType === 'BROWSER_WEBCAM' ? (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase">Select Camera Device</label>
                          <select
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                            value={newCam.assignedDeviceId}
                            onChange={e => setNewCam({...newCam, assignedDeviceId: e.target.value})}
                          >
                            <option value="">Default Camera</option>
                            {availableDevices.map(device => (
                              <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* LIVE PREVIEW BOX */}
                        <div className="aspect-video bg-black rounded-2xl border border-slate-800 overflow-hidden relative group">
                          <video
                            ref={previewVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />
                          <div className="absolute top-2 left-2 bg-emerald-600 text-[8px] font-black text-white px-2 py-1 rounded-md uppercase tracking-widest flex items-center space-x-1">
                            <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                            <span>Live Preview</span>
                          </div>
                          <div className="absolute bottom-2 right-2 text-[8px] text-white/50 font-mono">
                            WEBRTC_FEED_ACTIVE
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-500 italic">Connected to local hardware. AI inference will be applied to this stream.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-500 uppercase flex items-center">
                              <Lock className="w-3 h-3 mr-1" /> Auth User
                            </label>
                            <input
                              type="text"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                              value={newCam.username}
                              onChange={e => setNewCam({...newCam, username: e.target.value})}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-500 uppercase flex items-center">
                              <Lock className="w-3 h-3 mr-1" /> Auth Pass
                            </label>
                            <input
                              type="password"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                              value={newCam.password}
                              onChange={e => setNewCam({...newCam, password: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase">Stream Path</label>
                          <input
                            type="text"
                            placeholder="/live or /Streaming/Channels/101"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                            value={newCam.streamPath}
                            onChange={e => setNewCam({...newCam, streamPath: e.target.value})}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* RIGHT COLUMN: AI & ALERTS */}
              <div className="space-y-6">
                <section>
                  <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center">
                    <Activity className="w-3.5 h-3.5 mr-2" />
                    AI Inference Logic
                  </h3>
                  <div className="space-y-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs text-slate-300 font-bold">Activate Local Inference</span>
                      <input
                        type="checkbox"
                        checked={newCam.detectionEnabled}
                        onChange={e => setNewCam({...newCam, detectionEnabled: e.target.checked})}
                        className="w-4 h-4 accent-emerald-500"
                      />
                    </label>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] text-slate-500 uppercase font-black">
                        <span>Min Confidence</span>
                        <span>{Math.round((newCam.minConfidence || 0) * 100)}%</span>
                      </div>
                      <input
                        type="range" min="0.3" max="0.95" step="0.05"
                        value={newCam.minConfidence}
                        onChange={e => setNewCam({...newCam, minConfidence: parseFloat(e.target.value)})}
                        className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase">Species Watchlist</label>
                      <div className="flex flex-wrap gap-2">
                        {['leopard', 'human'].map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              const cats = newCam.animalCategories || [];
                              if (cats.includes(cat as any)) {
                                setNewCam({...newCam, animalCategories: cats.filter(c => c !== cat)});
                              } else {
                                setNewCam({...newCam, animalCategories: [...cats, cat as any]});
                              }
                            }}
                            className={`px-2 py-1 rounded-lg text-[9px] font-black border transition-all ${
                              newCam.animalCategories?.includes(cat as any)
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                            }`}
                          >
                            {cat.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* TEST CONNECTION PANEL */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white uppercase flex items-center">
                      <Globe className="w-3.5 h-3.5 mr-2 text-cyan-400" />
                      Connectivity Test
                    </span>
                    <button
                      onClick={handleTestConnection}
                      disabled={testingConnection}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-[9px] font-black text-white rounded-lg border border-slate-700 transition"
                    >
                      {testingConnection ? 'RUNNING...' : 'PING DEVICE'}
                    </button>
                  </div>

                  {testResult && (
                    <div className={`p-3 rounded-xl border text-[10px] ${testResult.success ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'}`}>
                      <div className="flex items-center space-x-2 font-black mb-1 uppercase tracking-tighter">
                        {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{testResult.success ? 'HANDSHAKE SUCCESSFUL' : 'HANDSHAKE FAILED'}</span>
                      </div>
                      <p className="opacity-80 leading-tight">{testResult.message}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 rounded-xl text-slate-400 hover:text-white font-black text-[10px] uppercase transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCamera}
                className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase shadow-lg shadow-emerald-900/20 transition"
              >
                Deploy Sensor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
