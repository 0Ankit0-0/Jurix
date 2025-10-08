import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

const JudgmentBackground = ({ showVerdict = false }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const { theme } = useTheme();
  const [emanationProgress, setEmanationProgress] = useState(0);

  useEffect(() => {
    if (showVerdict) {
      // Animate emanation when verdict is shown
      const animateEmanation = () => {
        setEmanationProgress(prev => {
          if (prev < 1) {
            return prev + 0.02;
          }
          return 1;
        });
      };

      const interval = setInterval(animateEmanation, 50);
      return () => clearInterval(interval);
    } else {
      setEmanationProgress(0);
    }
  }, [showVerdict]);

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

    // Ink diffusion particles
    const inkParticles = [];

    // Create ink particles
    const createInkParticles = () => {
      inkParticles.length = 0;
      for (let i = 0; i < 50; i++) {
        inkParticles.push({
          x: canvas.width / 2 + (Math.random() - 0.5) * 200,
          y: canvas.height / 2 + (Math.random() - 0.5) * 200,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: 1 + Math.random() * 3,
          alpha: 0.1 + Math.random() * 0.3,
          hue: 45 + Math.random() * 15 // Golden hues
        });
      }
    };

    createInkParticles();

    // Animation loop
    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw base gradient
      const baseGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (theme === 'dark') {
        baseGradient.addColorStop(0, 'rgba(2, 6, 23, 0.95)');
        baseGradient.addColorStop(0.5, 'rgba(15, 23, 42, 0.9)');
        baseGradient.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
      } else {
        baseGradient.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
        baseGradient.addColorStop(0.5, 'rgba(30, 58, 138, 0.85)');
        baseGradient.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
      }
      ctx.fillStyle = baseGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw golden light emanation
      if (emanationProgress > 0) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxRadius = Math.max(canvas.width, canvas.height) * 0.8;

        const emanationGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, maxRadius * emanationProgress
        );

        emanationGradient.addColorStop(0, `rgba(255, 215, 0, ${0.3 * emanationProgress})`);
        emanationGradient.addColorStop(0.5, `rgba(255, 215, 0, ${0.1 * emanationProgress})`);
        emanationGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

        ctx.fillStyle = emanationGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * emanationProgress, 0, Math.PI * 2);
        ctx.fill();

        // Add subtle rays emanating outward
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          const rayLength = maxRadius * emanationProgress * 0.8;

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(angle);

          const rayGradient = ctx.createLinearGradient(0, 0, rayLength, 0);
          rayGradient.addColorStop(0, `rgba(255, 215, 0, ${0.4 * emanationProgress})`);
          rayGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

          ctx.strokeStyle = rayGradient;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(rayLength, 0);
          ctx.stroke();

          ctx.restore();
        }
      }

      // Draw ink diffusion particles
      inkParticles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Add subtle glow
        const glowGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        glowGradient.addColorStop(0, `hsla(${particle.hue}, 80%, 70%, ${particle.alpha * 0.3})`);
        glowGradient.addColorStop(1, `hsla(${particle.hue}, 80%, 70%, 0)`);

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw subtle parchment texture effect
      ctx.save();
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = theme === 'dark' ? '#f8f9fa' : '#1e293b';

      for (let i = 0; i < 20; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = 50 + Math.random() * 100;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [theme, emanationProgress]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
};

export default JudgmentBackground;
