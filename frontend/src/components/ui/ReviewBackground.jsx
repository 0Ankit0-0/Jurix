import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

const ReviewBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Morphing blobs
    const blobs = [];

    // Create blobs
    const createBlobs = () => {
      blobs.length = 0;
      for (let i = 0; i < 3; i++) {
        blobs.push({
          x: canvas.width * (0.2 + i * 0.3),
          y: canvas.height * (0.3 + Math.random() * 0.4),
          baseX: canvas.width * (0.2 + i * 0.3),
          baseY: canvas.height * (0.3 + Math.random() * 0.4),
          radius: 80 + Math.random() * 40,
          points: [],
          time: Math.random() * Math.PI * 2,
          speed: 0.02 + Math.random() * 0.01
        });

        // Create points for blob shape
        const points = 8;
        for (let j = 0; j < points; j++) {
          const angle = (j / points) * Math.PI * 2;
          const distance = blobs[i].radius * (0.8 + Math.random() * 0.4);
          blobs[i].points.push({
            angle,
            baseDistance: distance,
            distance,
            offset: Math.random() * Math.PI * 2
          });
        }
      }
    };

    createBlobs();

    // Animation loop
    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (theme === 'dark') {
        gradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
        gradient.addColorStop(0.5, 'rgba(30, 58, 138, 0.9)');
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
      } else {
        gradient.addColorStop(0, 'rgba(248, 250, 252, 0.95)');
        gradient.addColorStop(0.5, 'rgba(241, 245, 249, 0.9)');
        gradient.addColorStop(1, 'rgba(248, 250, 252, 0.95)');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw morphing blobs
      blobs.forEach((blob, index) => {
        blob.time += blob.speed;

        // Update blob position with subtle movement
        blob.x = blob.baseX + Math.sin(blob.time * 0.5) * 20;
        blob.y = blob.baseY + Math.cos(blob.time * 0.3) * 15;

        // Update points
        blob.points.forEach(point => {
          point.distance = point.baseDistance + Math.sin(blob.time + point.offset) * 15;
        });

        // Draw blob
        ctx.save();
        ctx.translate(blob.x, blob.y);

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, blob.radius * 1.5);
        if (theme === 'dark') {
          if (index === 0) {
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
          } else if (index === 1) {
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');
          } else {
            gradient.addColorStop(0, 'rgba(245, 158, 11, 0.3)');
            gradient.addColorStop(1, 'rgba(245, 158, 11, 0.05)');
          }
        } else {
          if (index === 0) {
            gradient.addColorStop(0, 'rgba(30, 58, 138, 0.2)');
            gradient.addColorStop(1, 'rgba(30, 58, 138, 0.02)');
          } else if (index === 1) {
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
          } else {
            gradient.addColorStop(0, 'rgba(184, 134, 11, 0.2)');
            gradient.addColorStop(1, 'rgba(184, 134, 11, 0.02)');
          }
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();

        blob.points.forEach((point, i) => {
          const x = Math.cos(point.angle) * point.distance;
          const y = Math.sin(point.angle) * point.distance;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            // Curve to next point
            const nextPoint = blob.points[(i + 1) % blob.points.length];
            const nextX = Math.cos(nextPoint.angle) * nextPoint.distance;
            const nextY = Math.sin(nextPoint.angle) * nextPoint.distance;

            const cp1x = x + (nextX - x) * 0.5;
            const cp1y = y + (nextY - y) * 0.5;

            ctx.quadraticCurveTo(cp1x, cp1y, nextX, nextY);
          }
        });

        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // Draw subtle floating legal icons
      const icons = ['⚖️', '📜', '🔍', '📋'];
      icons.forEach((icon, index) => {
        const x = canvas.width * (0.1 + index * 0.2) + Math.sin(time * 0.001 + index) * 10;
        const y = canvas.height * 0.8 + Math.cos(time * 0.0015 + index) * 5;

        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.font = '24px serif';
        ctx.fillStyle = theme === 'dark' ? '#94a3b8' : '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText(icon, x, y);
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
};

export default ReviewBackground;
