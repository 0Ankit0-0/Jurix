import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

const ProcessingBackground = ({ progress = 0 }) => {
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

    // Neural network nodes and connections
    const nodes = [];
    const connections = [];
    const pulses = [];

    // Create neural network
    const createNetwork = () => {
      const cols = Math.floor(canvas.width / 60);
      const rows = Math.floor(canvas.height / 60);

      nodes.length = 0;
      connections.length = 0;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          nodes.push({
            x: (i + 0.5) * (canvas.width / cols) + (Math.random() - 0.5) * 20,
            y: (j + 0.5) * (canvas.height / rows) + (Math.random() - 0.5) * 20,
            active: Math.random() > 0.6,
            pulseTime: Math.random() * Math.PI * 2,
            layer: i
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
          // Connect to next layer or nearby
          return distance < 80 && (otherNode.layer === node.layer + 1 || distance < 40);
        });

        nearbyNodes.forEach(otherNode => {
          if (!connections.some(conn =>
            (conn.from === node && conn.to === otherNode) ||
            (conn.from === otherNode && conn.to === node)
          )) {
            connections.push({
              from: node,
              to: otherNode,
              active: Math.random() > 0.5,
              pulseOffset: Math.random() * Math.PI * 2,
              strength: Math.random()
            });
          }
        });
      });
    };

    createNetwork();

    // Animation loop
    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw dark grid background
      if (theme === 'dark') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      } else {
        ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid
      ctx.strokeStyle = theme === 'dark' ? 'rgba(30, 41, 59, 0.3)' : 'rgba(51, 65, 85, 0.2)';
      ctx.lineWidth = 1;

      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw connections
      connections.forEach(connection => {
        const gradient = ctx.createLinearGradient(
          connection.from.x, connection.from.y,
          connection.to.x, connection.to.y
        );

        // Color based on progress
        const hue = 200 + (progress * 60); // Blue to cyan
        const alpha = connection.active ? 0.6 : 0.2;

        gradient.addColorStop(0, `hsla(${hue}, 70%, 50%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${hue + 20}, 70%, 60%, ${alpha})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = connection.active ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(connection.from.x, connection.from.y);
        ctx.lineTo(connection.to.x, connection.to.y);
        ctx.stroke();

        // Add pulse effect
        if (connection.active) {
          const pulseProgress = (Math.sin(time * 0.003 + connection.pulseOffset) + 1) / 2;
          if (pulseProgress > 0.7) {
            const pulseX = connection.from.x + (connection.to.x - connection.from.x) * pulseProgress;
            const pulseY = connection.from.y + (connection.to.y - connection.from.y) * pulseProgress;

            const pulseGradient = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, 15);
            pulseGradient.addColorStop(0, `hsla(${hue}, 80%, 70%, 0.8)`);
            pulseGradient.addColorStop(1, `hsla(${hue}, 80%, 70%, 0)`);

            ctx.fillStyle = pulseGradient;
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, 15, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Draw nodes
      nodes.forEach(node => {
        const nodeSize = node.active ? 3 : 2;
        const hue = 200 + (progress * 60);

        if (node.active) {
          ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
        } else {
          ctx.fillStyle = `hsla(${hue}, 50%, 40%, 0.4)`;
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
        ctx.fill();

        // Add glow for active nodes
        if (node.active) {
          const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 10);
          glowGradient.addColorStop(0, `hsla(${hue}, 80%, 70%, 0.4)`);
          glowGradient.addColorStop(1, `hsla(${hue}, 80%, 70%, 0)`);

          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Add occasional data bursts
      if (Math.random() < 0.01) {
        const burstX = Math.random() * canvas.width;
        const burstY = Math.random() * canvas.height;

        const burstGradient = ctx.createRadialGradient(burstX, burstY, 0, burstX, burstY, 50);
        const hue = 200 + (progress * 60);
        burstGradient.addColorStop(0, `hsla(${hue}, 80%, 70%, 0.3)`);
        burstGradient.addColorStop(1, `hsla(${hue}, 80%, 70%, 0)`);

        ctx.fillStyle = burstGradient;
        ctx.beginPath();
        ctx.arc(burstX, burstY, 50, 0, Math.PI * 2);
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
  }, [theme, progress]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
};

export default ProcessingBackground;