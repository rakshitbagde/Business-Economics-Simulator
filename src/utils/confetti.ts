/**
 * Lightweight, zero-dependency Canvas confetti and Rupee burst emitter.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  symbol?: string;
}

export function fireConfettiBurst(options?: { count?: number; hasRupees?: boolean }) {
  if (typeof window === 'undefined') return;

  const count = options?.count ?? 60;
  const hasRupees = options?.hasRupees ?? true;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#F97316'];
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const isRupee = hasRupees && Math.random() < 0.25;
    particles.push({
      x: width * (0.3 + Math.random() * 0.4),
      y: height * 0.45,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 12 - 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: isRupee ? 18 : 6 + Math.random() * 6,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      opacity: 1,
      symbol: isRupee ? '₹' : undefined,
    });
  }

  let animationFrameId: number;
  const startTime = Date.now();
  const duration = 2500; // 2.5 seconds

  function render() {
    const elapsed = Date.now() - startTime;
    if (elapsed > duration) {
      cancelAnimationFrame(animationFrameId);
      canvas.remove();
      return;
    }

    ctx!.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.98; // air resistance
      p.rotation += p.rotationSpeed;
      p.opacity = Math.max(0, 1 - elapsed / duration);

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rotation);
      ctx!.globalAlpha = p.opacity;

      if (p.symbol) {
        ctx!.font = `bold ${p.size}px 'Plus Jakarta Sans', sans-serif`;
        ctx!.fillStyle = '#F59E0B'; // golden coin
        ctx!.textAlign = 'center';
        ctx!.textBaseline = 'middle';
        ctx!.fillText(p.symbol, 0, 0);
      } else {
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      }

      ctx!.restore();
    }

    animationFrameId = requestAnimationFrame(render);
  }

  render();
}
