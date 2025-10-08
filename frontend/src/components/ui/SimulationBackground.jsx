import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

const SimulationBackground = () => {
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

    // Enhanced wave grid, light rays and neural connections
    const waveGrid = [];
    const lightRays = [];
    const neuralNodes = [];
    const neuralConnections = [];

    // Create wave grid
    const createWaveGrid = () => {
      waveGrid.length = 0;
      const gridSize = 50;
      const cols = Math.ceil(canvas.width / gridSize);
      const rows = Math.ceil(canvas.height / gridSize);
      
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          waveGrid.push({
            x: i * gridSize,
            y: j * gridSize,
            baseY: j * gridSize,
            offset: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    // Create light rays
    const createLightRays = () => {
      lightRays.length = 0;
      for (let i = 0; i < 5; i++) {
        lightRays.push({
          x: Math.random() * canvas.width,
          y: -50,
          angle: Math.PI / 2 + (Math.random() - 0.5) * 0.5,
          speed: 1 + Math.random() * 2,
          length: 200 + Math.random() * 100,
          opacity: 0.1 + Math.random() * 0.2,
          width: 2 + Math.random() * 3
        });
      }
    };

    // Create neural network
    const createNeuralNetwork = () => {
      neuralNodes.length = 0;
      neuralConnections.length = 0;

      // Create nodes around chat areas
      const chatAreas = [
        { x: canvas.width * 0.2, y: canvas.height * 0.3 },
        { x: canvas.width * 0.8, y: canvas.height * 0.7 }
      ];

      chatAreas.forEach(area => {
        for (let i = 0; i < 8; i++) {
          neuralNodes.push({
            x: area.x + (Math.random() - 0.5) * 100,
            y: area.y + (Math.random() - 0.5) * 100,
            active: Math.random() > 0.5,
            pulseTime: Math.random() * Math.PI * 2
          });
        }
      });

      // Create connections between nearby nodes
      neuralNodes.forEach((node, i) => {
        neuralNodes.slice(i + 1).forEach(otherNode => {
          const distance = Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
          );
          if (distance < 120) {
            neuralConnections.push({
              from: node,
              to: otherNode,
              active: Math.random() > 0.6,
              pulseOffset: Math.random() * Math.PI * 2
            });
          }
        });
      });
    };

    createWaveGrid();
    createLightRays();
    createNeuralNetwork();

    // Animation loop
    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background with better light mode support
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (theme === 'dark') {
        bgGradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
        bgGradient.addColorStop(0.5, 'rgba(30, 41, 59, 0.9)');
        bgGradient.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
      } else {
        bgGradient.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        bgGradient.addColorStop(0.5, 'rgba(249, 250, 251, 0.95)');
        bgGradient.addColorStop(1, 'rgba(255, 255, 255, 0.98)');
      }
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw straight grid
      ctx.strokeStyle = theme === 'dark' 
        ? 'rgba(59, 130, 246, 0.12)' 
        : 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = 1;

      const gridSize = 50;
      
      // Horizontal lines (straight)
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Vertical lines (straight)
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw subtle courtroom silhouette layers
      ctx.save();

      const drawCourtroomLayer = (offset, alpha) => {
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = theme === 'dark' 
          ? 'rgba(148, 163, 184, 0.15)' 
          : 'rgba(148, 163, 184, 0.12)';
        ctx.lineWidth = 1;

        // Judge's bench
        ctx.strokeRect(canvas.width * 0.35 + offset, canvas.height * 0.1 + offset, canvas.width * 0.3, canvas.height * 0.15);

        // Witness stand
        ctx.strokeRect(canvas.width * 0.15 + offset, canvas.height * 0.4 + offset, canvas.width * 0.15, canvas.height * 0.2);

        // Defense table
        ctx.strokeRect(canvas.width * 0.05 + offset, canvas.height * 0.7 + offset, canvas.width * 0.2, canvas.height * 0.1);

        // Prosecution table
        ctx.strokeRect(canvas.width * 0.75 + offset, canvas.height * 0.7 + offset, canvas.width * 0.2, canvas.height * 0.1);
      };

      drawCourtroomLayer(0, 0.08);
      drawCourtroomLayer(2, 0.04);
      drawCourtroomLayer(-2, 0.02);

      ctx.restore();

      // Draw light rays
      lightRays.forEach(ray => {
        ray.y += ray.speed;
        if (ray.y > canvas.height + ray.length) {
          ray.y = -50;
          ray.x = Math.random() * canvas.width;
        }

        const gradient = ctx.createLinearGradient(
          ray.x, ray.y,
          ray.x + Math.cos(ray.angle) * ray.length,
          ray.y + Math.sin(ray.angle) * ray.length
        );

        if (theme === 'dark') {
          gradient.addColorStop(0, `rgba(251, 191, 36, ${ray.opacity})`);
          gradient.addColorStop(1, `rgba(251, 191, 36, 0)`);
        } else {
          gradient.addColorStop(0, `rgba(251, 191, 36, ${ray.opacity * 0.6})`);
          gradient.addColorStop(1, `rgba(251, 191, 36, 0)`);
        }

        ctx.strokeStyle = gradient;
        ctx.lineWidth = ray.width;
        ctx.beginPath();
        ctx.moveTo(ray.x, ray.y);
        ctx.lineTo(
          ray.x + Math.cos(ray.angle) * ray.length,
          ray.y + Math.sin(ray.angle) * ray.length
        );
        ctx.stroke();
      });

      // Draw neural connections
      neuralConnections.forEach(connection => {
        if (connection.active) {
          const gradient = ctx.createLinearGradient(
            connection.from.x, connection.from.y,
            connection.to.x, connection.to.y
          );

          if (theme === 'dark') {
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0.4)');
          } else {
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0.3)');
          }

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(connection.from.x, connection.from.y);
          ctx.lineTo(connection.to.x, connection.to.y);
          ctx.stroke();

          // Add pulse effect
          const pulseProgress = (Math.sin(time * 0.004 + connection.pulseOffset) + 1) / 2;
          if (pulseProgress > 0.8) {
            const pulseX = connection.from.x + (connection.to.x - connection.from.x) * pulseProgress;
            const pulseY = connection.from.y + (connection.to.y - connection.from.y) * pulseProgress;

            const pulseGradient = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, 10);
            if (theme === 'dark') {
              pulseGradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
              pulseGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
            } else {
              pulseGradient.addColorStop(0, 'rgba(99, 102, 241, 0.6)');
              pulseGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
            }

            ctx.fillStyle = pulseGradient;
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, 10, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Draw neural nodes with theme support
      neuralNodes.forEach(node => {
        if (node.active) {
          ctx.fillStyle = theme === 'dark' 
            ? 'rgba(59, 130, 246, 0.6)' 
            : 'rgba(99, 102, 241, 0.5)';
          ctx.beginPath();
          ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
          ctx.fill();

          // Glow effect
          const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 8);
          if (theme === 'dark') {
            glowGradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
            glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
          } else {
            glowGradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
            glowGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
          }

          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
          ctx.fill();
        }
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

export default SimulationBackground;