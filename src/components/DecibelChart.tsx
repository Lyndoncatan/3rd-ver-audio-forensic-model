import React, { useEffect, useRef, useState } from 'react';

interface DecibelChartProps {
  currentDecibel: number;
}

const DecibelChart: React.FC<DecibelChartProps> = ({ currentDecibel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [decibelHistory, setDecibelHistory] = useState<number[]>([]);
  const maxDataPoints = 100;

  useEffect(() => {
    if (currentDecibel > 0) {
      setDecibelHistory(prev => {
        const newHistory = [...prev, currentDecibel];
        return newHistory.slice(-maxDataPoints);
      });
    }
  }, [currentDecibel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || decibelHistory.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up chart dimensions
    const padding = 20;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    // Draw background grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Horizontal grid lines (decibel levels)
    for (let i = 0; i <= 10; i++) {
      const y = padding + (i / 10) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`${120 - (i * 12)}`, padding - 5, y + 3);
    }

    // Vertical grid lines (time)
    const timeSteps = 5;
    for (let i = 0; i <= timeSteps; i++) {
      const x = padding + (i / timeSteps) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();
    }

    // Draw decibel line
    if (decibelHistory.length > 1) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      ctx.beginPath();

      decibelHistory.forEach((db, index) => {
        const x = padding + (index / (maxDataPoints - 1)) * chartWidth;
        const y = padding + ((120 - db) / 120) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw gradient fill
      ctx.lineTo(padding + chartWidth, canvas.height - padding);
      ctx.lineTo(padding, canvas.height - padding);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, padding, 0, canvas.height - padding);
      gradient.addColorStop(0, '#8b5cf6aa');
      gradient.addColorStop(1, '#8b5cf6aa');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw current point
      const currentX = padding + ((decibelHistory.length - 1) / (maxDataPoints - 1)) * chartWidth;
      const currentY = padding + ((120 - currentDecibel) / 120) * chartHeight;

      ctx.fillStyle = '#7c3aed';
      ctx.beginPath();
      ctx.arc(currentX, currentY, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Highlight high decibel areas
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();

      let inHighZone = false;
      decibelHistory.forEach((db, index) => {
        const x = padding + (index / (maxDataPoints - 1)) * chartWidth;
        const y = padding + ((120 - db) / 120) * chartHeight;

        if (db > 80) {
          if (!inHighZone) {
            ctx.moveTo(x, y);
            inHighZone = true;
          } else {
            ctx.lineTo(x, y);
          }
        } else {
          if (inHighZone) {
            ctx.stroke();
            ctx.beginPath();
            inHighZone = false;
          }
        }
      });

      if (inHighZone) {
        ctx.stroke();
      }
    }

    // Chart title and stats
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Real-time Audio Level', canvas.width / 2, 15);

    // Current stats
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6b7280';
    const maxDb = Math.max(...decibelHistory);
    const avgDb = decibelHistory.reduce((a, b) => a + b, 0) / decibelHistory.length;
    
    ctx.fillText(`Current: ${currentDecibel.toFixed(1)} dB`, 10, canvas.height - 25);
    ctx.fillText(`Max: ${maxDb.toFixed(1)} dB`, 10, canvas.height - 15);
    ctx.fillText(`Avg: ${avgDb.toFixed(1)} dB`, 10, canvas.height - 5);

  }, [decibelHistory, currentDecibel]);

  return (
    <div className="mt-4">
      <canvas
        ref={canvasRef}
        width={300}
        height={150}
        className="w-full border border-gray-200 rounded-lg bg-white"
      />
    </div>
  );
};

export default DecibelChart;