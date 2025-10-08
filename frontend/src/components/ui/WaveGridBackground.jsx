import { useEffect, useRef, useState } from 'react';

const WaveGridBackground = () => {
  const canvasRef = useRef(null);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Colors based on theme
    const colors = {
      light: {
        background: '#fafaf9', // ivory-white
        grid: '#d4af37', // golden
        highlights: '#f59e0b', // amber
        waves: '#fbbf24', // yellow
        particles: '#d4af37', // golden particles
        particleGlow: '#f59e0b', // amber glow
      },
      dark: {
        background: '#0f172a', // deep navy
        grid: '#06b6d4', // cyan
        highlights: '#0891b2', // cyan-600
        waves: '#22d3ee', // cyan-400
        depth: '#1e293b', // slate-800
        particles: '#22d3ee', // cyan particles
        particleGlow: '#06b6d4', // cyan glow
      }
    };

    const theme = isDark ? colors.dark : colors.light;

    // Grid parameters
    const gridSize = 50;

    // Highlight streaks
    const highlights = [];
    for (let i = 0; i < 3; i++) {
      highlights.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.5 + Math.random() * 1,
        opacity: 0.1 + Math.random() * 0.2,
      });
    }

    // Glowing particles
    const particles = [];
    const createParticles = () => {
      particles.length = 0;
      for (let i = 0; i < 100; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: Math.random() * 3 + 1,
          alpha: Math.random() * 0.6 + 0.3,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    createParticles();

    let animationFrame = 0;

    // Animation loop
    const animate = () => {
      animationFrame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fill background
      ctx.fillStyle = theme.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw straight grid
      ctx.strokeStyle = theme.grid;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;

      // Vertical lines (straight)
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines (straight)
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw highlight streaks
      ctx.globalAlpha = 1;
      highlights.forEach((highlight) => {
        ctx.strokeStyle = theme.highlights;
        ctx.lineWidth = 2;
        ctx.globalAlpha = highlight.opacity;

        ctx.beginPath();
        ctx.moveTo(highlight.x, 0);
        ctx.lineTo(highlight.x, canvas.height);
        ctx.stroke();

        // Move highlight
        highlight.x += highlight.speed;
        if (highlight.x > canvas.width) {
          highlight.x = 0;
          highlight.opacity = 0.1 + Math.random() * 0.2;
        }
      });

      // Draw glowing particles
      particles.forEach((particle) => {
        // Calculate pulsing alpha
        const pulseAlpha = particle.alpha * (0.7 + 0.3 * Math.sin(animationFrame * particle.pulseSpeed + particle.pulsePhase));
        
        // Draw glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 4
        );
        gradient.addColorStop(0, theme.particles + Math.floor(pulseAlpha * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(0.5, theme.particleGlow + Math.floor(pulseAlpha * 0.3 * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw core particle
        ctx.fillStyle = theme.particles;
        ctx.globalAlpha = pulseAlpha;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Update particle position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around screen edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });

      // Add depth shadows for dark mode
      if (isDark) {
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = theme.depth;

        // Create subtle 3D effect
        for (let i = 0; i < 5; i++) {
          const offset = i * 2;
          ctx.fillRect(offset, offset, canvas.width - offset * 2, canvas.height - offset * 2);
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    // Listen for theme changes and update smoothly
    const observer = new MutationObserver(() => {
      const newIsDark = document.documentElement.classList.contains('dark');
      if (newIsDark !== isDark) {
        setIsDark(newIsDark);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      observer.disconnect();
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default WaveGridBackground;