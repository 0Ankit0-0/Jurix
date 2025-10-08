import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

const CircuitBackground = () => {
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

    // Circuit nodes and connections
    const nodes = [];
    const connections = [];
    const pulses = [];

    // Create circuit grid
    const createCircuit = () => {
      const cols = Math.floor(canvas.width / 80);
      const rows = Math.floor(canvas.height / 80);

      nodes.length = 0;
      connections.length = 0;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = (i + 0.5) * (canvas.width / cols) + (Math.random() - 0.5) * 40;
          const y = (j + 0.5) * (canvas.height / rows) + (Math.random() - 0.5) * 40;

          nodes.push({
            x,
            y,
            active: Math.random() > 0.7,
            pulseTime: Math.random() * Math.PI * 2
          });
        }
      }

      // Create connections
      nodes.forEach((node, i) => {
        const nearbyNodes = nodes.filter((otherNode, j) => {
          if (i === j) return false;
          const distance = Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
          );
          return distance < 120;
        });

        nearbyNodes.forEach(otherNode => {
          if (!connections.some(conn =>
            (conn.from === node && conn.to === otherNode) ||
            (conn.from === otherNode && conn.to === node)
          )) {
            connections.push({
              from: node,
              to: otherNode,
              active: Math.random() > 0.6,
              pulseOffset: Math.random() * Math.PI * 2
            });
          }
        });
      });
    };

    createCircuit();

    // Animation loop
    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isDark = theme === 'dark';

      // Draw connections
      connections.forEach(connection => {
        const gradient = ctx.createLinearGradient(
          connection.from.x, connection.from.y,
          connection.to.x, connection.to.y
        );

        if (isDark) {
          gradient.addColorStop(0, 'rgba(0, 255, 255, 0.1)');
          gradient.addColorStop(1, 'rgba(138, 43, 226, 0.1)');
        } else {
          gradient.addColorStop(0, 'rgba(184, 134, 11, 0.1)');
          gradient.addColorStop(1, 'rgba(192, 192, 192, 0.1)');
        }

        ctx.strokeStyle = gradient;
        ctx.lineWidth = connection.active ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(connection.from.x, connection.from.y);
        ctx.lineTo(connection.to.x, connection.to.y);
        ctx.stroke();

        // Add pulse effect
        if (connection.active) {
          const pulseProgress = (Math.sin(time * 0.002 + connection.pulseOffset) + 1) / 2;
          if (pulseProgress > 0.8) {
            const pulseX = connection.from.x + (connection.to.x - connection.from.x) * pulseProgress;
            const pulseY = connection.from.y + (connection.to.y - connection.from.y) * pulseProgress;

            const pulseGradient = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, 20);
            if (isDark) {
              pulseGradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
              pulseGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
            } else {
              pulseGradient.addColorStop(0, 'rgba(0, 191, 255, 0.6)');
              pulseGradient.addColorStop(1, 'rgba(0, 191, 255, 0)');
            }

            ctx.fillStyle = pulseGradient;
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, 20, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Draw nodes
      nodes.forEach(node => {
        const nodeSize = node.active ? 4 : 2;

        if (isDark) {
          ctx.fillStyle = node.active ? 'rgba(0, 255, 255, 0.8)' : 'rgba(138, 43, 226, 0.4)';
        } else {
          ctx.fillStyle = node.active ? 'rgba(184, 134, 11, 0.8)' : 'rgba(192, 192, 192, 0.4)';
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect for active nodes
        if (node.active) {
          const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 15);
          if (isDark) {
            glowGradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
            glowGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
          } else {
            glowGradient.addColorStop(0, 'rgba(0, 191, 255, 0.2)');
            glowGradient.addColorStop(1, 'rgba(0, 191, 255, 0)');
          }

          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 15, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Add occasional wave distortions
      if (Math.random() < 0.005) {
        const waveX = Math.random() * canvas.width;
        const waveY = Math.random() * canvas.height;

        const waveGradient = ctx.createRadialGradient(waveX, waveY, 0, waveX, waveY, 100);
        if (isDark) {
          waveGradient.addColorStop(0, 'rgba(255, 215, 0, 0.1)');
          waveGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        } else {
          waveGradient.addColorStop(0, 'rgba(255, 215, 0, 0.05)');
          waveGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        }

        ctx.fillStyle = waveGradient;
        ctx.beginPath();
        ctx.arc(waveX, waveY, 100, 0, Math.PI * 2);
        ctx.fill();
      }

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

export default CircuitBackground;
