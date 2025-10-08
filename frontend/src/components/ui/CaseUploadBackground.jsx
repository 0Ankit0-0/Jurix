import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

const CaseUploadBackground = () => {
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

    // Enhanced wave grid and particles
    const particles = [];
    const scales = [];
    const waveGrid = [];

    // Create wave grid
    const createWaveGrid = () => {
      waveGrid.length = 0;
      const gridSize = 40;
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

    // Create particles
    const createParticles = () => {
      particles.length = 0;
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          alpha: Math.random() * 0.5 + 0.2
        });
      }
    };

    // Create animated scales
    const createScales = () => {
      scales.length = 0;
      // Add a few scale outlines in corners
      const positions = [
        { x: canvas.width * 0.1, y: canvas.height * 0.1 },
        { x: canvas.width * 0.9, y: canvas.height * 0.1 },
        { x: canvas.width * 0.1, y: canvas.height * 0.9 },
        { x: canvas.width * 0.9, y: canvas.height * 0.9 }
      ];

      positions.forEach(pos => {
        scales.push({
          x: pos.x,
          y: pos.y,
          rotation: 0,
          scale: 0.8 + Math.random() * 0.4,
          opacity: 0.1 + Math.random() * 0.1
        });
      });
    };

    createWaveGrid();
    createParticles();
    createScales();

    // Draw scale outline
    const drawScale = (x, y, rotation, scale, opacity) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);
      ctx.globalAlpha = opacity;

      // Draw simple scale outline
      ctx.strokeStyle = theme === 'dark' ? 'rgba(184, 134, 11, 0.3)' : 'rgba(180, 83, 9, 0.25)';
      ctx.lineWidth = 2;

      // Left pan
      ctx.beginPath();
      ctx.arc(-20, 0, 15, Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();

      // Right pan
      ctx.beginPath();
      ctx.arc(20, 0, 15, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();

      // Balance beam
      ctx.beginPath();
      ctx.moveTo(-35, 0);
      ctx.lineTo(35, 0);
      ctx.stroke();

      // Center pivot
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    };

    // Animation loop
    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (theme === 'dark') {
        gradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
        gradient.addColorStop(0.5, 'rgba(30, 41, 59, 0.9)');
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
      } else {
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        gradient.addColorStop(0.5, 'rgba(249, 250, 251, 0.95)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.98)');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw straight grid
      ctx.strokeStyle = theme === 'dark' 
        ? 'rgba(59, 130, 246, 0.15)' 
        : 'rgba(148, 163, 184, 0.18)';
      ctx.lineWidth = 1;

      const gridSize = 40;
      
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

      // Draw enhanced particles with glow
      particles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle with glow
        const glowGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        
        if (theme === 'dark') {
          glowGradient.addColorStop(0, `rgba(59, 130, 246, ${particle.alpha})`);
          glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        } else {
          glowGradient.addColorStop(0, `rgba(99, 102, 241, ${particle.alpha * 0.8})`);
          glowGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        }

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw core
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = theme === 'dark' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(99, 102, 241, 0.6)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw scales
      scales.forEach(scale => {
        scale.rotation += 0.005;
        drawScale(scale.x, scale.y, scale.rotation, scale.scale, scale.opacity);
      });

      ctx.globalAlpha = 1;

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

export default CaseUploadBackground;