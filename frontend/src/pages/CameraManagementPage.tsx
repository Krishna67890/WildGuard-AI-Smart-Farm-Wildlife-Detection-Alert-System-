import React, { useState, useEffect, useRef } from 'react';
import {
  Camera as CameraIcon, Plus, Settings, Video, Network, Shield,
  Bell, Activity, RefreshCw, Trash2, CheckCircle2, AlertTriangle,
  Play, Square, Info, Lock, Globe, Database, Search
} from 'lucide-react';
import { fetchApi } from '../services/api';
import { Camera, CameraSourceType, CameraProtocol, CameraPriority, RecordingMode, WildlifeSpecies, Zone } from '../types/index';
import { useAuth } from '../context/AuthContext';

export const CameraManagementPage: React.FC = () => {
  const { canAdmin } = useAuth();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; stats?: any } | null>(null);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

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
    locationDescription: '',
    detectionEnabled: true,
    minConfidence: 0.65,
    animalCategories: ['leopard', 'tiger', 'elephant', 'wild_boar', 'human'],
    minDetectionDurationSec: 2,
    zoneDetectionEnabled: true,
    alarmEnabled: true,
    notificationsEnabled: true,
    snapshotEnabled: true,
    recordingEnabled: true,
    alertCooldownSec: 300,
    recordingMode: 'AI_DETECTION'
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

  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);

  const fetchCameras = async () => {
    try {
      const res = await fetchApi<{ success: boolean; cameras: Camera[] }>('/cameras');
      if (res.success) setCameras(res.cameras);

      const zonesRes = await fetchApi<{ success: boolean; zones: Zone[] }>('/zones');
      if (zonesRes.success) setZones(zonesRes.zones);

      // Get available media devices for webcam support
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAvailableDevices(devices.filter(d => d.kind === 'videoinput'));
      }
    } catch (err) {
      console.error('Failed to fetch cameras:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await fetchApi<{ success: boolean; message: string; stats?: any }>('/cameras/test-connection', {
        method: 'POST',
        body: JSON.stringify({
          ipAddress: newCam.ipAddress,
          port: newCam.port,
          protocol: newCam.protocol,
          streamUrl: newCam.mainStreamUrl,
          username: newCam.username,
          password: newCam.password
        })
      });
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTestingConnection(false);
    }
  };

  const resetForm = () => {
    setNewCam({
      name: '',
      brand: '',
      model: '',
      sourceType: 'IP_NETWORK',
      protocol: 'RTSP',
      ipAddress: '',
      port: 554,
      streamPath: '',
      username: '',
      password: '',
      priority: 'NORMAL',
      zoneId: '',
      locationDescription: '',
      detectionEnabled: true,
      minConfidence: 0.65,
      animalCategories: ['leopard', 'tiger', 'elephant', 'wild_boar', 'human'],
      minDetectionDurationSec: 2,
      zoneDetectionEnabled: true,
      alarmEnabled: true,
      notificationsEnabled: true,
      snapshotEnabled: true,
      recordingEnabled: true,
      alertCooldownSec: 300,
      recordingMode: 'AI_DETECTION'
    });
    setTestResult(null);
  };

  const handleSaveCamera = async () => {
    if (!newCam.name || (!newCam.ipAddress && newCam.sourceType !== 'BROWSER_WEBCAM')) {
      alert('Please fill in required fields (Name and IP Address)');
      return;
    }

    try {
      // Auto-construct RTSP URL if missing and data exists
      let finalCam = { ...newCam };
      if (finalCam.sourceType === 'IP_NETWORK' && finalCam.protocol === 'RTSP' && !finalCam.mainStreamUrl) {
        const auth = finalCam.username ? `${finalCam.username}:${finalCam.password}@` : '';
        finalCam.mainStreamUrl = `rtsp://${auth}${finalCam.ipAddress}:${finalCam.port}${finalCam.streamPath || '/live'}`;
      }

      const res = await fetchApi<{ success: boolean; camera: Camera }>('/cameras', {
        method: 'POST',
        body: JSON.stringify(finalCam)
      });

      if (res.success) {
        setCameras([...cameras, res.camera]);
        setShowAddModal(false);
        resetForm();
      }
    } catch (err: any) {
      alert(`Failed to save camera: ${err.message}`);
    }
  };

  const handleDeleteCamera = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this camera?')) return;
    // Implementation for delete...
  };

  const toggleCameraStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'STREAMING' ? 'ONLINE' : 'STREAMING';
    try {
      await fetchApi(`/cameras/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      setCameras(cameras.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
    } catch (err) {
      console.error('Failed to update camera status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <CameraIcon className="w-5 h-5 text-emerald-400" />
            <span>IP Camera & Surveillance Management</span>
          </h1>
          <p className="text-xs text-slate-400">
            Configure high-definition network streams, AI detection parameters, and ethical deterrence rules
          </p>
        </div>

        {canAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Camera</span>
          </button>
        )}
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cameras.map(cam => (
          <div key={cam.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-xl">
            {/* Camera Preview Placeholder */}
            <div className="aspect-video bg-black relative flex items-center justify-center group">
              {cam.status === 'STREAMING' || cam.status === 'ONLINE' ? (
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                  <Video className="w-12 h-12 text-slate-700" />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>LIVE PREVIEW</span>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 flex flex-col items-center">
                  <AlertTriangle className="w-8 h-8 mb-2" />
                  <span className="text-xs font-bold uppercase">Offline</span>
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                <button
                  onClick={() => toggleCameraStatus(cam.id, cam.status)}
                  className="p-3 bg-emerald-600 rounded-full text-white hover:bg-emerald-500 transition"
                >
                  {cam.status === 'STREAMING' ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button className="p-3 bg-slate-700 rounded-full text-white hover:bg-slate-600 transition">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-sm">{cam.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{cam.ipAddress}:{cam.port} [{cam.protocol}]</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  cam.status === 'ONLINE' || cam.status === 'STREAMING' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {cam.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block uppercase mb-0.5 font-bold text-[9px]">Location</span>
                  <span className="text-slate-200 truncate block">{cam.locationDescription}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block uppercase mb-0.5 font-bold text-[9px]">Priority</span>
                  <span className={`font-bold ${cam.priority === 'HIGH' ? 'text-rose-400' : 'text-emerald-400'}`}>{cam.priority}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1" title="AI Detection">
                    <Activity className={`w-3.5 h-3.5 ${cam.detectionEnabled ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className="text-[10px] text-slate-400">AI</span>
                  </div>
                  <div className="flex items-center space-x-1" title="Alerts Enabled">
                    <Bell className={`w-3.5 h-3.5 ${cam.alarmEnabled ? 'text-amber-400' : 'text-slate-600'}`} />
                    <span className="text-[10px] text-slate-400">Alert</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteCamera(cam.id)}
                  className="text-slate-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add Camera Card */}
        {canAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="border-2 border-dashed border-slate-800 rounded-2xl aspect-video flex flex-col items-center justify-center text-slate-500 hover:border-emerald-500 hover:text-emerald-500 transition-all bg-slate-900/40"
          >
            <Plus className="w-10 h-10 mb-2" />
            <span className="font-bold text-sm">Add New Source</span>
          </button>
        )}
      </div>

      {/* Add Camera Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
              <div>
                <h2 className="text-xl font-bold text-white">Add IP / Network Camera</h2>
                <p className="text-xs text-slate-400">Configure new surveillance source and AI parameters</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <Trash2 className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* LEFT COLUMN: BASIC & NETWORK */}
              <div className="space-y-6">
                <section>
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center">
                    <Info className="w-3.5 h-3.5 mr-2" />
                    Camera Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Camera Name</label>
                      <input
                        type="text"
                        placeholder="e.g. North Perimeter"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                        value={newCam.name}
                        onChange={e => setNewCam({...newCam, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Brand / Model</label>
                      <input
                        type="text"
                        placeholder="e.g. Hikvision"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                        value={newCam.brand}
                        onChange={e => setNewCam({...newCam, brand: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Farm Zone</label>
                      <select
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                        value={newCam.zoneId}
                        onChange={e => setNewCam({...newCam, zoneId: e.target.value})}
                      >
                        <option value="">Select Zone</option>
                        {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Priority</label>
                      <select
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                        value={newCam.priority}
                        onChange={e => setNewCam({...newCam, priority: e.target.value as CameraPriority})}
                      >
                        <option value="LOW">Low</option>
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center">
                    <Network className="w-3.5 h-3.5 mr-2" />
                    Network Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">IP Address</label>
                        <input
                          type="text"
                          placeholder="192.168.1.100"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                          value={newCam.ipAddress}
                          onChange={e => setNewCam({...newCam, ipAddress: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Port</label>
                        <input
                          type="number"
                          placeholder="554"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                          value={newCam.port}
                          onChange={e => setNewCam({...newCam, port: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Protocol & Source Type</label>
                      <div className="flex space-x-2">
                        <select
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
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
                          <option value="IP_NETWORK">IP / Network Camera</option>
                          <option value="BROWSER_WEBCAM">Local Device Camera (Mobile/PC)</option>
                          <option value="SIMULATION">Simulation (Test Mode)</option>
                        </select>
                        <select
                          className="w-32 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                          value={newCam.protocol}
                          onChange={e => setNewCam({...newCam, protocol: e.target.value as CameraProtocol})}
                        >
                          <option value="RTSP">RTSP</option>
                          <option value="HTTP">HTTP/HLS</option>
                          <option value="WEBRTC">WebRTC</option>
                        </select>
                      </div>
                    </div>

                    {newCam.sourceType === 'BROWSER_WEBCAM' ? (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Select Camera Device</label>
                          <select
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
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
                        <div className="aspect-video bg-black rounded-xl border border-slate-800 overflow-hidden relative group">
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
                            <span>Hardware Active</span>
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-500 italic">This will use the camera of the current mobile or PC device.</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Stream URL / Path</label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="/live"
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                              value={newCam.streamPath}
                              onChange={e => setNewCam({...newCam, streamPath: e.target.value})}
                            />
                            <div className="bg-slate-800 rounded-lg px-3 flex items-center text-[10px] text-slate-400 font-mono">
                              {newCam.protocol}://...
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center">
                              <Lock className="w-3 h-3 mr-1" /> Username
                            </label>
                            <input
                              type="text"
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                              value={newCam.username}
                              onChange={e => setNewCam({...newCam, username: e.target.value})}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center">
                              <Lock className="w-3 h-3 mr-1" /> Password
                            </label>
                            <input
                              type="password"
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                              value={newCam.password}
                              onChange={e => setNewCam({...newCam, password: e.target.value})}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </section>
              </div>

              {/* RIGHT COLUMN: AI & ALERTS */}
              <div className="space-y-6">
                <section>
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4 flex items-center">
                    <Activity className="w-3.5 h-3.5 mr-2" />
                    AI Detection Settings
                  </h3>
                  <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs text-slate-300">Enable Edge AI Inference</span>
                      <input
                        type="checkbox"
                        checked={newCam.detectionEnabled}
                        onChange={e => setNewCam({...newCam, detectionEnabled: e.target.checked})}
                        className="w-4 h-4 accent-emerald-500"
                      />
                    </label>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold">
                        <span>Min Confidence</span>
                        <span>{Math.round((newCam.minConfidence || 0) * 100)}%</span>
                      </div>
                      <input
                        type="range" min="0.3" max="0.95" step="0.05"
                        value={newCam.minConfidence}
                        onChange={e => setNewCam({...newCam, minConfidence: parseFloat(e.target.value)})}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Detection Categories</label>
                      <div className="flex flex-wrap gap-2">
                        {['leopard', 'tiger', 'elephant', 'wild_boar', 'human', 'deer', 'monkey'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => {
                              const cats = newCam.animalCategories || [];
                              if (cats.includes(cat as any)) {
                                setNewCam({...newCam, animalCategories: cats.filter(c => c !== cat)});
                              } else {
                                setNewCam({...newCam, animalCategories: [...cats, cat as any]});
                              }
                            }}
                            className={`px-2 py-1 rounded text-[9px] font-bold border transition ${
                              newCam.animalCategories?.includes(cat as any)
                                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}
                          >
                            {cat.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-4 flex items-center">
                    <Bell className="w-3.5 h-3.5 mr-2" />
                    Alert & Deterrence
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                      <input type="checkbox" checked={newCam.alarmEnabled} onChange={e => setNewCam({...newCam, alarmEnabled: e.target.checked})} className="accent-rose-500" />
                      <span className="text-[11px] text-slate-300">Sound Alarm</span>
                    </label>
                    <label className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                      <input type="checkbox" checked={newCam.notificationsEnabled} onChange={e => setNewCam({...newCam, notificationsEnabled: e.target.checked})} className="accent-rose-500" />
                      <span className="text-[11px] text-slate-300">Push Notifications</span>
                    </label>
                    <label className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                      <input type="checkbox" checked={newCam.snapshotEnabled} onChange={e => setNewCam({...newCam, snapshotEnabled: e.target.checked})} className="accent-rose-500" />
                      <span className="text-[11px] text-slate-300">Auto Snapshot</span>
                    </label>
                    <label className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                      <input type="checkbox" checked={newCam.recordingEnabled} onChange={e => setNewCam({...newCam, recordingEnabled: e.target.checked})} className="accent-rose-500" />
                      <span className="text-[11px] text-slate-300">Event Recording</span>
                    </label>
                  </div>
                </section>

                {/* TEST CONNECTION PANEL */}
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase flex items-center">
                      <Globe className="w-3.5 h-3.5 mr-2 text-cyan-400" />
                      Connection Verification
                    </span>
                    <button
                      onClick={handleTestConnection}
                      disabled={testingConnection}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-[10px] font-bold text-white rounded-lg border border-slate-700 transition"
                    >
                      {testingConnection ? 'CONNECTING...' : 'TEST CONNECTION'}
                    </button>
                  </div>

                  {testResult && (
                    <div className={`p-3 rounded-lg border text-xs ${testResult.success ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'}`}>
                      <div className="flex items-center space-x-2 font-bold mb-1">
                        {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        <span>{testResult.success ? 'SUCCESS: Camera Reachable' : 'FAILED: Unable to Connect'}</span>
                      </div>
                      {testResult.success ? (
                        <div className="grid grid-cols-3 gap-2 mt-2 font-mono text-[10px]">
                          <div>Latency: <span className="text-white">{testResult.stats.latency}ms</span></div>
                          <div>Res: <span className="text-white">{testResult.stats.resolution}</span></div>
                          <div>FPS: <span className="text-white">{testResult.stats.fps}</span></div>
                        </div>
                      ) : (
                        <p className="mt-1 opacity-80">{testResult.message}. Possible reasons: Incorrect IP/Port, Credentials, or Firewall.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex justify-end space-x-3 sticky bottom-0">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 rounded-xl text-slate-400 hover:text-white font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCamera}
                className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
              >
                Save Camera Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
