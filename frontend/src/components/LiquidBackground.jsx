import { useEffect, useRef } from 'react';

export default function LiquidBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);

    // Initial soft fluid blobs
    const colors = ['#7C6AF7', '#9B8FFF', '#34D399', '#7C6AF7', '#1C1C28'];
    const blobs = Array.from({ length: 5 }).map((_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      radius: Math.random() * 250 + 200, // Large blobs for a liquid feel
      color: colors[i % colors.length]
    }));

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Screen mode naturally makes the colors bleed and glow together
      ctx.globalCompositeOperation = 'screen';

      blobs.forEach((blob) => {
        // Bounds checking (bounce)
        if (blob.x < -blob.radius) blob.vx *= -1;
        if (blob.x > width + blob.radius) blob.vx *= -1;
        if (blob.y < -blob.radius) blob.vy *= -1;
        if (blob.y > height + blob.radius) blob.vy *= -1;

        // Attract softly towards mouse
        const dx = mouseX - blob.x;
        const dy = mouseY - blob.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < 600) {
          blob.vx += (dx / dist) * 0.015;
          blob.vy += (dy / dist) * 0.015;
        }

        // Limit speed
        const speed = Math.sqrt(blob.vx * blob.vx + blob.vy * blob.vy);
        if (speed > 2.5) {
          blob.vx = (blob.vx / speed) * 2.5;
          blob.vy = (blob.vy / speed) * 2.5;
        }

        blob.x += blob.vx;
        blob.y += blob.vy;

        // Draw radial gradient
        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
        gradient.addColorStop(0, `${blob.color}50`); // 31% opacity approx
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          filter: 'blur(30px) url(#gooey)',
          opacity: 0.85
        }}
      />
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 40 -20" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
    </>
  );
}
