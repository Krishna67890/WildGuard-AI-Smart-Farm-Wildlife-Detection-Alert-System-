import React, { useState, useEffect, useRef } from 'react';
import { Camera, ThreatLevel, WildlifeSpecies, BoundingBox, CameraFeed } from '../../types/index';
import { Maximize, Minimize, RotateCcw, FlipHorizontal, ShieldAlert, Activity, Cpu } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';

interface CameraPlayerProps {
  camera: CameraFeed;
  isNightVision: boolean;
  isFocused?: boolean;
  className?: string;
  showHud?: boolean;
}

export const CameraPlayer: React.FC<CameraPlayerProps> = ({
  camera,
  isNightVision,
  isFocused = false,
  className = "",
  showHud = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isWideScreen, setIsWideScreen] = useState<boolean>(false);
  const { setIsSirenActive, addToast } = useAlert();

  useEffect(() => {
    if (camera.sourceType === 'BROWSER_WEBCAM') {
      const constraints = {
        video: camera.assignedDeviceId ? { deviceId: { exact: camera.assignedDeviceId } } : true,
        audio: false
      };
      navigator.mediaDevices.getUserMedia(constraints)
        .then(s => {
          setStream(s);
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(err => console.error("Webcam access denied:", err));
    }
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [camera.sourceType, camera.assignedDeviceId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let tick = 0;
    let lastLeopardDetectionTime = 0;

    const render = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.save();

      // Handle Rotation and Flipping
      ctx.translate(w / 2, h / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      if (isFlipped) ctx.scale(-1, 1);
      ctx.translate(-w / 2, -h / 2);

      if (camera.sourceType === 'BROWSER_WEBCAM' && videoRef.current && videoRef.current.readyState === 4) {
        ctx.drawImage(videoRef.current, 0, 0, w, h);
        if (isNightVision) {
          ctx.globalCompositeOperation = 'difference';
          ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
          ctx.fillRect(0, 0, w, h);
          ctx.globalCompositeOperation = 'source-over';
        }
      } else {
        // Draw background
        ctx.fillStyle = isNightVision ? '#020617' : '#0f172a';
        ctx.fillRect(0, 0, w, h);

        if (camera.status === 'OFFLINE') {
          ctx.fillStyle = '#ef4444';
          ctx.font = `${isFocused ? '20px' : '12px'} font-mono`;
          ctx.textAlign = 'center';
          ctx.fillText('CAMERA OFFLINE', w/2, h/2);
          ctx.restore();
          return;
        }

        // Draw Grid
        ctx.strokeStyle = isNightVision ? 'rgba(34, 197, 94, 0.15)' : 'rgba(51, 65, 85, 0.2)';
        ctx.lineWidth = 1;
        const step = isFocused ? 40 : 20;
        for(let i=0; i<w; i+=step) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
        for(let i=0; i<h; i+=step) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }
      }

      ctx.restore();

      // Simulation detection
      const detection = camera.currentDetection;
      if (detection) {
        // LEOPARD ALARM LOGIC: Only alarm if leopard detected
        if (detection.species === 'leopard' && detection.confidence > 0.8) {
          const now = Date.now();
          if (now - lastLeopardDetectionTime > 5000) { // Cooldown 5s
            setIsSirenActive(true);
            addToast("🚨 LEOPARD DETECTED!", "Emergency protocols activated.", "CRITICAL");
            lastLeopardDetectionTime = now;
          }
        }

        let boxX, boxY, boxW, boxH;

        if (detection.bbox) {
          boxX = detection.bbox.x * w;
          boxY = detection.bbox.y * h;
          boxW = detection.bbox.width * w;
          boxH = detection.bbox.height * h;
        } else {
          const oscillation = Math.sin(tick * 0.02) * (isFocused ? 30 : 15);
          boxX = w * 0.4 + oscillation;
          boxY = h * 0.4;
          boxW = isFocused ? 150 : 80;
          boxH = isFocused ? 120 : 60;
        }

        const color = detection.species === 'leopard' ? '#ef4444' : '#eab308';
        ctx.strokeStyle = color;
        ctx.lineWidth = isFocused ? 3 : 2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Advanced HUD Overlays
        ctx.fillStyle = `${color}22`;
        ctx.fillRect(boxX, boxY, boxW, boxH);

        // Bounding box corners
        const cornerSize = isFocused ? 15 : 8;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        // Top Left
        ctx.beginPath(); ctx.moveTo(boxX, boxY + cornerSize); ctx.lineTo(boxX, boxY); ctx.lineTo(boxX + cornerSize, boxY); ctx.stroke();
        // Top Right
        ctx.beginPath(); ctx.moveTo(boxX + boxW - cornerSize, boxY); ctx.lineTo(boxX + boxW, boxY); ctx.lineTo(boxX + boxW, boxY + cornerSize); ctx.stroke();
        // Bottom Left
        ctx.beginPath(); ctx.moveTo(boxX, boxY + boxH - cornerSize); ctx.lineTo(boxX, boxY + boxH); ctx.lineTo(boxX + cornerSize, boxY + boxH); ctx.stroke();
        // Bottom Right
        ctx.beginPath(); ctx.moveTo(boxX + boxW - cornerSize, boxY + boxH); ctx.lineTo(boxX + boxW, boxY + boxH); ctx.lineTo(boxX + boxW, boxY + boxH - cornerSize); ctx.stroke();

        if (showHud && (isFocused || boxW > 40)) {
          ctx.fillStyle = color;
          const labelH = isFocused ? 28 : 18;
          ctx.fillRect(boxX, boxY - labelH, boxW, labelH);
          ctx.fillStyle = '#fff';
          ctx.font = `bold ${isFocused ? '14px' : '10px'} 'JetBrains Mono', monospace`;
          ctx.fillText(`TARGET: ${detection.species.toUpperCase()}`, boxX + 5, boxY - (labelH/2) + 5);

          ctx.font = `${isFocused ? '10px' : '7px'} monospace`;
          ctx.fillText(`CONF: ${Math.round(detection.confidence*100)}%`, boxX + 5, boxY - 2);

          // Advanced side data
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(boxX + boxW + 4, boxY, isFocused ? 140 : 90, isFocused ? 80 : 50);
          ctx.strokeStyle = color;
          ctx.strokeRect(boxX + boxW + 4, boxY, isFocused ? 140 : 90, isFocused ? 80 : 50);

          ctx.fillStyle = '#fff';
          ctx.font = `${isFocused ? '11px' : '8px'} monospace`;
          ctx.fillText(`RANGE: ${detection.distanceMeters || 12.4}m`, boxX + boxW + 10, boxY + (isFocused ? 20 : 12));
          ctx.fillText(`THREAT: ${detection.threatLevel}`, boxX + boxW + 10, boxY + (isFocused ? 40 : 25));
          ctx.fillText(`STATUS: TRACKING`, boxX + boxW + 10, boxY + (isFocused ? 60 : 38));
        }
      } else if (showHud) {
        // Scanning effect
        ctx.strokeStyle = isNightVision ? 'rgba(34, 197, 94, 0.4)' : 'rgba(51, 65, 85, 0.5)';
        ctx.lineWidth = 1;
        const scanY = (Math.sin(tick * 0.03) + 1) * h / 2;
        ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(w, scanY); ctx.stroke();

        ctx.fillStyle = isNightVision ? '#4ade8033' : '#94a3b833';
        ctx.fillRect(0, scanY - 2, w, 4);
      }

      if (showHud) {
        // UI Borders and Frame info
        ctx.strokeStyle = isNightVision ? '#22c55e' : '#64748b';
        ctx.lineWidth = 1;
        ctx.strokeRect(5, 5, w - 10, h - 10);

        ctx.fillStyle = isNightVision ? '#4ade80' : '#94a3b8';
        ctx.font = `${isFocused ? '12px' : '9px'} monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(`REC ● | CAM_${camera.id.slice(-4)} | ${new Date().toLocaleTimeString()}`, 15, 25);

        if (isFocused) {
          ctx.fillText(`GPU_LOAD: 42% | INF_TIME: 18ms | VOLTS: 12.2V`, 15, h - 15);
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [camera, isNightVision, isFocused, showHud, rotation, isFlipped]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const rotate = () => setRotation((prev) => (prev + 90) % 360);
  const flip = () => setIsFlipped(!isFlipped);
  const toggleWide = () => setIsWideScreen(!isWideScreen);

  return (
    <div
      ref={containerRef}
      className={`relative group overflow-hidden bg-black border-2 border-slate-800 transition-all duration-300 ${isWideScreen ? 'aspect-video' : 'aspect-square'} ${className}`}
    >
      {camera.sourceType === 'BROWSER_WEBCAM' && (
        <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      )}
      <canvas
        ref={canvasRef}
        width={isFocused || isFullscreen ? 1920 : 640}
        height={isFocused || isFullscreen ? 1080 : 640}
        className="w-full h-full object-cover shadow-2xl"
      />

      {/* Advanced Control Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={rotate} className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full text-white" title="Rotate">
            <RotateCcw size={18} />
          </button>
          <button onClick={flip} className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full text-white" title="Flip">
            <FlipHorizontal size={18} />
          </button>
          <button onClick={toggleWide} className="px-3 py-1 bg-slate-800/50 hover:bg-slate-700 rounded-lg text-white text-xs font-mono">
            {isWideScreen ? '16:9' : '1:1'}
          </button>
        </div>

        <div className="flex gap-2 items-center">
          {camera.currentDetection?.species === 'leopard' && (
             <div className="flex items-center gap-2 px-3 py-1 bg-red-600 animate-pulse rounded text-white text-xs font-bold">
               <ShieldAlert size={14} /> LEOPARD DETECTED
             </div>
          )}
          <button onClick={toggleFullscreen} className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full text-white">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>

      {/* Corner Tech Accents */}
      <div className="absolute top-2 right-2 flex flex-col items-end pointer-events-none">
        <Activity size={16} className="text-blue-500 mb-1 opacity-50" />
        <Cpu size={16} className="text-emerald-500 opacity-50" />
      </div>
    </div>
  );
};
