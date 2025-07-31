import React, { useRef, useEffect, useState } from 'react';

interface AudioSource {
  id: string;
  name: string;
  type: 'noise' | 'voice' | 'music' | 'ambient' | 'unknown';
  decibel: number;
  frequency: number;
  position: { x: number; y: number; z: number };
  distance: number;
  visible: boolean;
  color: string;
}

interface SonarViewProps {
  audioSources: AudioSource[];
  isRecording: boolean;
}

const SonarView: React.FC<SonarViewProps> = ({ audioSources, isRecording }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [listenerPosition, setListenerPosition] = useState({ x: 250, y: 250 });
  const [isDragging, setIsDragging] = useState(false);
  const [pulseRadius, setPulseRadius] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw sonar background
      drawSonarBackground(ctx, canvas.width, canvas.height);
      
      // Draw range circles
      drawRangeCircles(ctx, listenerPosition);
      
      // Draw audio sources
      audioSources.forEach(source => {
        drawAudioSource(ctx, source, listenerPosition);
      });
      
      // Draw listener position
      drawListener(ctx, listenerPosition);
      
      // Draw pulse effect if recording
      if (isRecording) {
        drawPulse(ctx, listenerPosition);
      }
      
      // Draw labels
      drawLabels(ctx, audioSources, listenerPosition);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioSources, isRecording, listenerPosition, pulseRadius]);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setPulseRadius(prev => (prev + 5) % 150);
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const drawSonarBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Gradient background
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  const drawRangeCircles = (ctx: CanvasRenderingContext2D, center: { x: number; y: number }) => {
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= 5; i++) {
      const radius = i * 50;
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Range labels
      ctx.fillStyle = '#a0aec0';
      ctx.font = '12px Arial';
      ctx.fillText(`${i * 10}m`, center.x + radius - 15, center.y - 5);
    }
  };

  const drawAudioSource = (ctx: CanvasRenderingContext2D, source: AudioSource, center: { x: number; y: number }) => {
    // Use consistent positioning based on source ID for stable visualization
    const angle = (parseInt(source.id.replace(/\D/g, '')) || 0) * 0.5;
    const distance = source.distance * 5; // Scale for visualization
    const x = center.x + Math.cos(angle) * distance;
    const y = center.y + Math.sin(angle) * distance;
    
    // Sound wave effect
    const intensity = Math.max(0.2, source.decibel / 120);
    const waveRadius = 10 + (source.decibel / 120) * 20;
    
    // Draw sound waves
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `${source.color}${Math.floor((1 - i * 0.3) * 255).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 2 - i * 0.5;
      ctx.beginPath();
      ctx.arc(x, y, waveRadius + i * 15, 0, 2 * Math.PI);
      ctx.stroke();
    }
    
    // Draw source marker
    ctx.fillStyle = source.color;
    ctx.beginPath();
    ctx.arc(x, y, 8 * intensity, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw connection line to listener
    ctx.strokeStyle = `${source.color}40`;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Store position for label drawing
    source.position = { x: x - center.x, y: y - center.y, z: 0 };
  };

  const drawListener = (ctx: CanvasRenderingContext2D, position: { x: number; y: number }) => {
    // Listener icon
    ctx.fillStyle = '#e53e3e';
    ctx.beginPath();
    ctx.arc(position.x, position.y, 12, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(position.x, position.y, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Direction indicator
    ctx.strokeStyle = '#e53e3e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(position.x, position.y - 15);
    ctx.lineTo(position.x, position.y - 25);
    ctx.stroke();
  };

  const drawPulse = (ctx: CanvasRenderingContext2D, center: { x: number; y: number }) => {
    const alpha = (150 - pulseRadius) / 150;
    ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(center.x, center.y, pulseRadius, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const drawLabels = (ctx: CanvasRenderingContext2D, sources: AudioSource[], center: { x: number; y: number }) => {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    
    sources.forEach((source, index) => {
      const angle = (index / sources.length) * 2 * Math.PI;
      const labelX = center.x + Math.cos(angle) * 280;
      const labelY = center.y + Math.sin(angle) * 280;
      
      // Label background
      const metrics = ctx.measureText(source.name);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(labelX - metrics.width / 2 - 5, labelY - 15, metrics.width + 10, 20);
      
      // Label text
      ctx.fillStyle = source.color;
      ctx.fillText(source.name, labelX, labelY);
      
      // DB info
      ctx.font = '10px Arial';
      ctx.fillStyle = '#a0aec0';
      ctx.fillText(`${source.decibel.toFixed(1)} dB`, labelX, labelY + 12);
      
      ctx.font = 'bold 14px Arial';
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const distance = Math.sqrt((x - listenerPosition.x) ** 2 + (y - listenerPosition.y) ** 2);
    
    if (distance <= 15) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Keep listener within canvas bounds
    const clampedX = Math.max(20, Math.min(x, canvas.width - 20));
    const clampedY = Math.max(20, Math.min(y, canvas.height - 20));
    
    setListenerPosition({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="w-full h-full border border-gray-200 rounded-lg cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded-lg text-sm">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Listener (Drag to move)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border-2 border-gray-400 rounded-full"></div>
            <span>Range circles (10m each)</span>
          </div>
          <div className="text-xs text-gray-300 mt-2">
            Position: ({listenerPosition.x}, {listenerPosition.y})
          </div>
        </div>
      </div>
      
      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
          Recording Active
        </div>
      )}
    </div>
  );
};

export default SonarView;