import React, { useEffect, useRef } from 'react';

const ParallaxBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;

      // Apply transform to each layer
      const layers = containerRef.current.querySelectorAll('.parallax-layer');
      layers.forEach((layer, index) => {
        const speed = (index + 1) * 0.1; // Different speeds for each layer
        const yPos = -(scrolled * speed);
        layer.style.transform = `translateY(${yPos}px)`;
      });
    };

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;

      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;

      const layers = containerRef.current.querySelectorAll('.parallax-layer');
      layers.forEach((layer, index) => {
        const depth = (index + 1) * 0.05;
        const xOffset = (mouseX - 0.5) * depth * 100;
        const yOffset = (mouseY - 0.5) * depth * 100;
        layer.style.transform += ` translate(${xOffset}px, ${yOffset}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0">
      {/* Distant layer */}
      <div className="parallax-layer absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-indigo-900/20"></div>

      {/* Mid-ground layer */}
      <div className="parallax-layer absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-pink-500/5"></div>

      {/* Foreground layer */}
      <div className="parallax-layer absolute inset-0 bg-gradient-to-bl from-transparent via-violet-500/3 to-transparent"></div>

      {/* Additional subtle layer for depth */}
      <div className="parallax-layer absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent"></div>
    </div>
  );
};

export default ParallaxBackground;
