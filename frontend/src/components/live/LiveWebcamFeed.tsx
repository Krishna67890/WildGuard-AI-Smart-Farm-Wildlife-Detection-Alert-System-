import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CameraOff, Volume2, VolumeX, ShieldAlert, Zap, RefreshCw, Eye, EyeOff, Maximize, Minimize, FlipHorizontal } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';
import { fetchApi, AI_URL } from '../../services/api';
import { audioSiren } from '../../services/audioSiren';

interface LiveWebcamFeedProps {
  onStop: () => void;
  cameraId?: string;
  zoneId?: string;
}

interface DetectionBox {
  label: string;
  species: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export const LiveWebcamFeed: React.FC<LiveWebcamFeedProps> = ({
  onStop,
  cameraId = 'cam-1',
  zoneId = 'zone-1'
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [aiConnected, setAiConnected] = useState<boolean | null>(null);
  const [isNightVision, setIsNightVision] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [lastDetectionStats, setLastDetectionStats] = useState<{ count: number; fps: number; leopard: boolean }>({
    count: 0,
    fps: 0,
    leopard: false
  });

  const { setIsSirenActive, addToast, isMuted } = useAlert();

  // Internal references to avoid react re-render closures
  const detectionsRef = useRef<DetectionBox[]>([]);
  const isInferringRef = useRef<boolean>(false);
  const lastAlarmTimeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(Date.now());
  const frameCountRef = useRef<number>(0);
  const fpsRef = useRef<number>(0);
  const activeAlertDurationTimer = useRef<any>(null);

  // 1. Initialize user webcam stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const startWebcam = async () => {
      try {
        setCameraError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: false
        });

        activeStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(e => console.warn('Autoplay prevented:', e));
        }
      } catch (err: any) {
        console.error('Webcam access error:', err);
        setCameraError(err.message || 'Unable to access your camera. Please check browser permissions.');
      }
    };

    startWebcam();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
      if (activeAlertDurationTimer.current) {
        clearTimeout(activeAlertDurationTimer.current);
      }
      audioSiren.stopSiren();
      setIsSirenActive(false);
    };
  }, []);

  // 2. Periodic Inference Loop: sends frames to backend / AI service
  useEffect(() => {
    if (!stream) return;

    // Off-screen canvas for capturing lightweight JPEG snapshots
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = 480;
    captureCanvas.height = 360;
    const captureCtx = captureCanvas.getContext('2d');

    const sendFrameForInference = async () => {
      if (isInferringRef.current || !videoRef.current || videoRef.current.readyState < 2) {
        return;
      }

      try {
        isInferringRef.current = true;
        if (!captureCtx) return;

        captureCtx.drawImage(videoRef.current, 0, 0, captureCanvas.width, captureCanvas.height);
        const frameDataUrl = captureCanvas.toDataURL('image/jpeg', 0.65);

        // Attempt detection through backend API proxy with fallback to direct AI_URL
        let response: {
          success: boolean;
          detections: DetectionBox[];
          leopardAlert: boolean;
          alarmTriggered: boolean;
          cooldownRemaining?: number;
          error?: string;
        };

        try {
          response = await fetchApi<{
            success: boolean;
            detections: DetectionBox[];
            leopardAlert: boolean;
            alarmTriggered: boolean;
            cooldownRemaining?: number;
            error?: string;
          }>('/ai/detect-frame', {
            method: 'POST',
            body: JSON.stringify({
              image: frameDataUrl,
              cameraId,
              zoneId
            })
          });
        } catch (backendErr) {
          // Fallback: direct inference call to AI detection service (e.g. VITE_AI_URL or localhost:8000)
          try {
            const directRes = await fetch(`${AI_URL}/detect`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
              },
              body: JSON.stringify({
                image: frameDataUrl,
                cameraId,
                zoneId
              })
            });

            if (!directRes.ok) {
              const errBody = await directRes.json().catch(() => ({}));
              throw new Error(errBody.error || `Direct AI endpoint error (${directRes.status})`);
            }

            const directData = await directRes.json();
            if (!directData || directData.success === false) {
              throw new Error(directData?.error || 'Direct AI inference returned unsuccessful status');
            }
            response = directData;
          } catch (directErr) {
            const bMsg = backendErr instanceof Error ? backendErr.message : String(backendErr);
            const dMsg = directErr instanceof Error ? directErr.message : String(directErr);
            throw new Error(`Inference failed [Backend: ${bMsg} | Direct AI: ${dMsg}]`);
          }
        }

        if (response && response.success) {
          setAiConnected(true);
          const dets = Array.isArray(response.detections) ? response.detections : [];
          detectionsRef.current = dets;

          // Check if leopard detected with confidence > 0.50
          const leopardTarget = dets.find(d =>
            d.species.toLowerCase() === 'leopard' && d.confidence > 0.50
          );

          const isLeopard = Boolean(leopardTarget);
          setLastDetectionStats(prev => ({
            ...prev,
            count: dets.length,
            leopard: isLeopard
          }));

          // Trigger browser audio alarm with 5-second cooldown
          if (isLeopard) {
            const now = Date.now();
            const elapsed = now - lastAlarmTimeRef.current;

            if (elapsed >= 5000) {
              lastAlarmTimeRef.current = now;
              const confPercent = Math.round((leopardTarget?.confidence || 0.90) * 100);

              // Sound browser acoustic siren
              if (!isMuted) {
                audioSiren.startSiren();
                setIsSirenActive(true);
              }

              addToast(
                '🚨 LEOPARD DETECTED VIA WEBCAM!',
                `Panthera pardus confirmed (${confPercent}% conf). Browser siren & Python alarm triggered!`,
                'CRITICAL'
              );

              // Siren duration pulse (3.5s of acoustic sound, followed by remaining 1.5s silence in the 5s cooldown cycle)
              if (activeAlertDurationTimer.current) {
                clearTimeout(activeAlertDurationTimer.current);
              }
              activeAlertDurationTimer.current = setTimeout(() => {
                audioSiren.stopSiren();
                setIsSirenActive(false);
              }, 3500);
            }
          }
        } else {
          setAiConnected(false);
          detectionsRef.current = [];
        }
      } catch (err) {
        setAiConnected(false);
        detectionsRef.current = [];
      } finally {
        isInferringRef.current = false;
      }
    };

    // Inference pulse every 380ms for optimal balance of responsiveness and performance
    const intervalId = setInterval(sendFrameForInference, 380);
    return () => clearInterval(intervalId);
  }, [stream, cameraId, zoneId, isMuted, setIsSirenActive, addToast]);

  // 3. Canvas Render Loop: Draws video and overlays bounding boxes with labels
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const render = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;

      // Track FPS
      frameCountRef.current++;
      const now = Date.now();
      if (now - lastFrameTimeRef.current >= 1000) {
        fpsRef.current = frameCountRef.current;
        frameCountRef.current = 0;
        lastFrameTimeRef.current = now;
        setLastDetectionStats(prev => ({ ...prev, fps: fpsRef.current }));
      }

      ctx.clearRect(0, 0, w, h);

      // Draw Webcam Video
      if (videoRef.current && videoRef.current.readyState >= 2) {
        ctx.save();
        if (isFlipped) {
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoRef.current, 0, 0, w, h);
        ctx.restore();

        if (isNightVision) {
          ctx.globalCompositeOperation = 'difference';
          ctx.fillStyle = 'rgba(0, 255, 60, 0.22)';
          ctx.fillRect(0, 0, w, h);
          ctx.globalCompositeOperation = 'source-over';
        }
      } else {
        // Fallback placeholder
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#64748b';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('INITIALIZING WEBCAM SENSOR...', w / 2, h / 2);
      }

      const detections = detectionsRef.current;
      const hasLeopard = detections.some(d => d.species.toLowerCase() === 'leopard' && d.confidence > 0.50);
      const isAlarmCooling = (Date.now() - lastAlarmTimeRef.current) < 5000;

      // 4. Render Bounding Boxes with Labels (Requirement 4)
      detections.forEach(det => {
        const isLeopard = det.species.toLowerCase() === 'leopard' && det.confidence > 0.50;
        const color = isLeopard ? '#ef4444' : (det.species.toLowerCase() === 'human' ? '#06b6d4' : '#eab308');

        // Coordinate transformation (flip X if mirror view is on)
        let bx = det.bbox.x * w;
        if (isFlipped) {
          bx = w - (det.bbox.x + det.bbox.width) * w;
        }
        const by = det.bbox.y * h;
        const bw = det.bbox.width * w;
        const bh = det.bbox.height * h;

        // Bounding box fill overlay
        ctx.fillStyle = isLeopard ? 'rgba(239, 68, 68, 0.18)' : 'rgba(6, 182, 212, 0.12)';
        ctx.fillRect(bx, by, bw, bh);

        // Bounding box outline
        ctx.strokeStyle = color;
        ctx.lineWidth = isLeopard ? 3 : 2;
        ctx.strokeRect(bx, by, bw, bh);

        // Tactical Corner Highlights
        const cornerLen = Math.min(22, Math.max(8, bw * 0.2, bh * 0.2));
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = isLeopard ? 4 : 3;

        // Top-Left
        ctx.beginPath(); ctx.moveTo(bx, by + cornerLen); ctx.lineTo(bx, by); ctx.lineTo(bx + cornerLen, by); ctx.stroke();
        // Top-Right
        ctx.beginPath(); ctx.moveTo(bx + bw - cornerLen, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + cornerLen); ctx.stroke();
        // Bottom-Left
        ctx.beginPath(); ctx.moveTo(bx, by + bh - cornerLen); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + cornerLen, by + bh); ctx.stroke();
        // Bottom-Right
        ctx.beginPath(); ctx.moveTo(bx + bw - cornerLen, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - cornerLen); ctx.stroke();

        // Label Tag Above Box
        const confPercent = Math.round(det.confidence * 100);
        const tagText = isLeopard
          ? `🚨 ALERT: LEOPARD (${confPercent}%)`
          : `${det.species.toUpperCase()} (${confPercent}%)`;

        ctx.font = `bold ${isLeopard ? '12px' : '11px'} 'JetBrains Mono', monospace`;
        const textWidth = ctx.measureText(tagText).width;
        const tagH = 22;
        const tagY = Math.max(tagH + 4, by);

        // Label Background
        ctx.fillStyle = color;
        ctx.fillRect(bx, tagY - tagH, textWidth + 12, tagH);

        // Label Text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(tagText, bx + 6, tagY - 6);

        // Side Telemetry Card for Confirmed Leopard
        if (isLeopard && bw > 60) {
          const sideW = 140;
          const sideH = 62;
          const sideX = Math.min(w - sideW - 6, bx + bw + 6);
          const sideY = by;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          ctx.fillRect(sideX, sideY, sideW, sideH);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1;
          ctx.strokeRect(sideX, sideY, sideW, sideH);

          ctx.fillStyle = '#f87171';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`TARGET: PANTHERA PARDUS`, sideX + 8, sideY + 16);

          ctx.fillStyle = '#ffffff';
          ctx.font = '9px monospace';
          ctx.fillText(`THREAT LEVEL: CRITICAL`, sideX + 8, sideY + 32);
          ctx.fillText(`ACOUSTIC SIREN: ACTIVE`, sideX + 8, sideY + 48);
        }
      });

      // 5. Emergency HUD Top Banner when Leopard Detected or Cooldown Active
      if (hasLeopard || isAlarmCooling) {
        const bannerH = 46;
        ctx.fillStyle = 'rgba(220, 38, 38, 0.92)';
        ctx.fillRect(0, 0, w, bannerH);

        // Flashing border
        const flashAlpha = 0.5 + 0.5 * Math.sin(tick * 0.15);
        ctx.strokeStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, w - 4, bannerH - 4);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`🚨 CRITICAL THREAT: LEOPARD DETECTED – ACOUSTIC ALARM TRIGGERED`, 16, 28);

        const remCooldown = Math.max(0, (5000 - (Date.now() - lastAlarmTimeRef.current)) / 1000).toFixed(1);
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`SIREN COOLDOWN: ${remCooldown}s`, w - 16, 28);
      }

      // HUD Static Borders & Status
      ctx.strokeStyle = hasLeopard ? '#ef4444' : (isNightVision ? '#22c55e' : '#475569');
      ctx.lineWidth = 1;
      ctx.strokeRect(6, 6, w - 12, h - 12);

      // HUD Bottom Bar Info
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(6, h - 26, w - 12, 20);

      ctx.fillStyle = hasLeopard ? '#fca5a5' : '#94a3b8';
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`SOURCE: WEBCAM | OPTICAL CAM-01 | CONF FILTER: >50% | TARGET: LEOPARD`, 14, h - 12);

      ctx.textAlign = 'right';
      ctx.fillText(`INFERENCE: ${detections.length} TARGETS | RENDERING: ${fpsRef.current} FPS`, w - 14, h - 12);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isFlipped, isNightVision]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-700 shadow-2xl transition-all"
    >
      {/* Hidden live video element providing the media stream */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="hidden"
      />

      {/* Main interactive display canvas */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="w-full h-auto aspect-video bg-black block"
      />

      {/* Camera permission error overlay */}
      {cameraError && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
          <CameraOff className="w-12 h-12 text-rose-500 animate-bounce" />
          <h3 className="text-sm font-bold text-white">Camera Access Blocked</h3>
          <p className="text-xs text-slate-400 max-w-sm">{cameraError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-all"
          >
            Retry Permission
          </button>
        </div>
      )}

      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto z-10">
        <div className="flex items-center space-x-2">
          {/* Live pulsing tag */}
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-rose-600 text-white font-mono text-[10px] font-bold shadow-md">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>LIVE WEBCAM AI</span>
          </span>

          {/* AI Service connection status badge */}
          <span className={`px-2 py-1 rounded-md font-mono text-[10px] font-bold flex items-center space-x-1 border ${
            aiConnected === true
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
              : aiConnected === false
              ? 'bg-amber-950/80 text-amber-300 border-amber-700'
              : 'bg-slate-900/80 text-slate-300 border-slate-700'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${aiConnected === true ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
            <span>{aiConnected === true ? 'AI Service Connected' : 'AI Service: Waiting on Server...'}</span>
          </span>
        </div>

        {/* Quick Toolbar Controls */}
        <div className="flex items-center space-x-1.5 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setIsNightVision(!isNightVision)}
            title="Toggle Night Vision Shader"
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
              isNightVision ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isNightVision ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsFlipped(!isFlipped)}
            title="Mirror Camera View"
            className={`p-1.5 rounded-lg text-xs transition-all ${
              isFlipped ? 'text-emerald-400 bg-slate-800' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-all"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onStop}
            title="Disconnect Webcam"
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-all shadow"
          >
            <CameraOff className="w-3 h-3" />
            <span>Stop Webcam</span>
          </button>
        </div>
      </div>

      {/* Informative Guidance Banner if AI Service is Offline */}
      {aiConnected === false && (
        <div className="absolute bottom-10 left-3 right-3 bg-amber-950/90 border border-amber-600/80 p-2.5 rounded-xl text-amber-200 text-xs flex items-center justify-between pointer-events-auto z-10 shadow-lg">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
            <span>AI detection service offline. Start it in terminal: <code>python yolo_detector.py</code> (or verify VITE_AI_URL / VITE_BACKEND_URL)</span>
          </div>
          <span className="text-[10px] text-amber-300 font-bold uppercase">Ready to connect</span>
        </div>
      )}
    </div>
  );
};
