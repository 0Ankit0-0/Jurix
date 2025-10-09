import { useEffect, useRef, useState } from 'react';

const WaveGridBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let mounted = true;

    // 🎨 Colors based on theme
    const getColors = (dark) => ({
      light: {
        background: '#fafaf9',
        grid: 'rgba(212, 175, 55, 0.3)',
        highlights: 'rgba(245, 158, 11, 0.2)',
        particles: 'rgba(212, 175, 55, 0.6)',
        particleGlow: 'rgba(245, 158, 11, 0.3)',
      },
      dark: {
        background: '#0f172a',
        grid: 'rgba(6, 182, 212, 0.3)',
        highlights: 'rgba(8, 145, 178, 0.2)',
        particles: 'rgba(34, 211, 238, 0.6)',
        particleGlow: 'rgba(6, 182, 212, 0.3)',
      }
    })[dark ? 'dark' : 'light'];

    let colors = getColors(isDark);

    // ⚛️ Create particles (moved ABOVE resizeCanvas to fix ReferenceError)
    const createParticles = () => {
      if (!mounted) return;
      const rect = canvas.getBoundingClientRect();
      particlesRef.current = [];

      for (let i = 0; i < 100; i++) {
        particlesRef.current.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: Math.random() * 3 + 1,
          alpha: Math.random() * 0.6 + 0.3,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    // 🧭 Resize + scale canvas
    const resizeCanvas = () => {
      if (!mounted) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform before scaling
      ctx.scale(dpr, dpr);

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      createParticles();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // ⚡ Grid + highlights setup
    const gridSize = 50;
    const highlights = [];
    for (let i = 0; i < 3; i++) {
      highlights.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.5 + Math.random(),
        opacity: 0.1 + Math.random() * 0.2,
      });
    }

    let animationFrame = 0;

    // 🎞️ Animation loop
    const animate = () => {
      if (!mounted) return;

      animationFrame++;
      const rect = canvas.getBoundingClientRect();

      // Background
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Grid
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;
      for (let x = 0; x <= rect.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, rect.height);
        ctx.stroke();
      }
      for (let y = 0; y <= rect.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(rect.width, y);
        ctx.stroke();
      }

      // Highlights
      ctx.globalAlpha = 1;
      highlights.forEach((highlight) => {
        ctx.strokeStyle = colors.highlights;
        ctx.lineWidth = 2;
        ctx.globalAlpha = highlight.opacity;

        ctx.beginPath();
        ctx.moveTo(highlight.x, 0);
        ctx.lineTo(highlight.x, rect.height);
        ctx.stroke();

        highlight.x += highlight.speed;
        if (highlight.x > rect.width) {
          highlight.x = 0;
          highlight.opacity = 0.1 + Math.random() * 0.2;
        }
      });

      // Particles
      particlesRef.current.forEach((particle) => {
        const pulseAlpha =
          particle.alpha *
          (0.7 + 0.3 * Math.sin(animationFrame * particle.pulseSpeed + particle.pulsePhase));

        // Glow gradient
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 4
        );
        gradient.addColorStop(0, `rgba(255, 215, 0, ${pulseAlpha})`);
        gradient.addColorStop(0.5, `rgba(255, 215, 0, ${pulseAlpha * 0.3})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = colors.particles;
        ctx.globalAlpha = pulseAlpha;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Movement + wrap
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0) particle.x = rect.width;
        if (particle.x > rect.width) particle.x = 0;
        if (particle.y < 0) particle.y = rect.height;
        if (particle.y > rect.height) particle.y = 0;
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 🌓 Theme watcher
    const observer = new MutationObserver(() => {
      const newIsDark = document.documentElement.classList.contains('dark');
      if (newIsDark !== isDark) {
        setIsDark(newIsDark);
        colors = getColors(newIsDark);
        createParticles(); // reinitialize with new colors
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      mounted = false;
      window.removeEventListener('resize', resizeCanvas);
      observer.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default WaveGridBackground;
