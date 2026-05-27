import { useEffect, useState, useRef } from 'react';

export default function MomentumScore({ score, previousScore }) {
  const [displayScore, setDisplayScore] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    if (score === undefined || score === null) return;
    const target = Math.round(score);
    const duration = 1000;
    const start = performance.now();
    const startVal = 0;

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [score]);

  const getColor = (s) => {
    if (s <= 33) return '#F87171';
    if (s <= 66) return '#FBBF24';
    return '#7C6AF7';
  };

  const color = getColor(displayScore);
  const trend = previousScore !== undefined && score !== undefined
    ? score - previousScore
    : null;

  return (
    <div className="momentum-card">
      <div className="momentum-label">MOMENTUM</div>
      <div className="momentum-score" style={{ color }}>
        {displayScore}
      </div>
      <div className="momentum-sub">
        <span className="momentum-outof">/ 100</span>
        {trend !== null && (
          <span
            className={`momentum-trend ${trend >= 0 ? 'trend-up' : 'trend-down'}`}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(Math.round(trend))} pts
          </span>
        )}
      </div>
      <div className="momentum-bar-container">
        <div
          className="momentum-bar"
          style={{ width: `${displayScore}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
