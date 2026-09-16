import React, { useState, useEffect, useRef } from 'react';
import { Camera, ThreatLevel, WildlifeSpecies, BoundingBox, CameraFeed } from '../../types/index';

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
  const [stream, setStream] = useState<MediaStream | null>(null);

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

    const render = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;

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
          return;
        }

        // Draw Grid / Environment
        ctx.strokeStyle = isNightVision ? 'rgba(34, 197, 94, 0.15)' : 'rgba(51, 65, 85, 0.2)';
        ctx.lineWidth = 1;
        const step = isFocused ? 40 : 20;
        for(let i=0; i<w; i+=step) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
        for(let i=0; i<h; i+=step) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }
      }

      // Simulation detection
      const detection = camera.currentDetection;
      if (detection) {
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

        const color = detection.threatLevel === 'CRITICAL' ? '#ef4444' : '#eab308';
        ctx.strokeStyle = color;
        ctx.lineWidth = isFocused ? 3 : 2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Advanced Detection Overlays (Telemetry HUD)
        ctx.fillStyle = `${color}22`;
        ctx.fillRect(boxX, boxY, boxW, boxH);

        // Bounding box crosshairs
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        // Top-Left corner crosshair
        ctx.beginPath(); ctx.moveTo(boxX - 5, boxY); ctx.lineTo(boxX + 15, boxY); ctx.moveTo(boxX, boxY - 5); ctx.lineTo(boxX, boxY + 15); ctx.stroke();
        // Bottom-Right corner crosshair
        ctx.beginPath(); ctx.moveTo(boxX + boxW + 5, boxY + boxH); ctx.lineTo(boxX + boxW - 15, boxY + boxH); ctx.moveTo(boxX + boxW, boxY + boxH + 5); ctx.lineTo(boxX + boxW, boxY + boxH - 15); ctx.stroke();

        if (showHud && (isFocused || boxW > 40)) {
          ctx.fillStyle = color;
          const labelH = isFocused ? 25 : 15;
          ctx.fillRect(boxX, boxY - labelH, boxW, labelH);
          ctx.fillStyle = '#fff';
          ctx.font = `bold ${isFocused ? '12px' : '9px'} sans-serif`;
          ctx.fillText(`${detection.species.toUpperCase()} ${Math.round(detection.confidence*100)}%`, boxX + 5, boxY - (labelH/3));

          // Advanced sidebar metrics next to bounding box
          ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
          ctx.fillRect(boxX + boxW + 4, boxY, isFocused ? 120 : 80, isFocused ? 65 : 45);
          ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
          ctx.strokeRect(boxX + boxW + 4, boxY, isFocused ? 120 : 80, isFocused ? 65 : 45);

          ctx.fillStyle = '#94a3b8';
          ctx.font = `${isFocused ? '10px' : '7px'} monospace`;
          ctx.fillText(`DIST: ${detection.distanceMeters || 12}m`, boxX + boxW + 8, boxY + (isFocused ? 15 : 10));
          ctx.fillText(`DIR: ${detection.direction || 'APPROACHING'}`, boxX + boxW + 8, boxY + (isFocused ? 30 : 20));
          ctx.fillText(`VEL: ${(1.2 + Math.sin(tick*0.01)*0.4).toFixed(1)} m/s`, boxX + boxW + 8, boxY + (isFocused ? 45 : 30));
        }
      } else if (showHud) {
        // Render Active Scanning Reticle when no target detected
        ctx.strokeStyle = isNightVision ? 'rgba(34, 197, 94, 0.3)' : 'rgba(51, 65, 85, 0.4)';
        ctx.lineWidth = 1;
        const scanY = (Math.sin(tick * 0.03) + 1) * h / 2;
        ctx.beginPath();
        ctx.moveTo(10, scanY);
        ctx.lineTo(w - 10, scanY);
        ctx.stroke();
      }

      if (showHud) {
        // HUD Text
        ctx.fillStyle = isNightVision ? '#4ade80' : '#94a3b8';
        ctx.font = `${isFocused ? '10px' : '8px'} monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(`● LIVE | ${camera.name}`, isFocused ? 20 : 10, isFocused ? 30 : 20);

        if (isFocused) {
          ctx.fillText(`AI: ${camera.detectionEnabled ? 'ACTIVE' : 'OFF'} | FPS: ${camera.fps} | LATENCY: ${camera.latencyMs}ms`, 20, 45);
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [camera, isNightVision, isFocused, showHud]);

  return (
    <div className={`relative w-full h-full ${className} overflow-hidden bg-black`}>
      {camera.sourceType === 'BROWSER_WEBCAM' && (
        <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      )}
      <canvas
        ref={canvasRef}
        width={isFocused ? 1280 : 640}
        height={720}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
