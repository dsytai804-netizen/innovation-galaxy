import React, { useEffect, useState, useRef } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
  id: string;
}

export const CustomCursor: React.FC = () => {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [cursorType, setCursorType] = useState<'default' | 'interactive'>('default');
  const [trail, setTrail] = useState<TrailPoint[]>([]);

  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      setCursorPos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      // Add point to trail (throttle to every 12ms for smoother trail)
      if (now - lastUpdateRef.current > 12) {
        setTrail((prev) => {
          const newTrail = [...prev, {
            x: e.clientX,
            y: e.clientY,
            timestamp: now,
            id: `${now}-${Math.random()}`
          }];
          // Keep last 30 points for longer, smoother trail
          return newTrail.slice(-30);
        });
        lastUpdateRef.current = now;
      }

      // Detect data-cursor attribute
      const target = (e.target as HTMLElement).closest('[data-cursor]') as HTMLElement | null;
      const type = (target?.dataset.cursor as 'default' | 'interactive') || 'default';
      setCursorType(type);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setTrail([]);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Clean up old trail points
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      setTrail((prev) => prev.filter((point) => now - point.timestamp < 600));
      animationFrameRef.current = requestAnimationFrame(cleanup);
    };

    animationFrameRef.current = requestAnimationFrame(cleanup);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!isVisible) return null;

  const isInteractive = cursorType === 'interactive';
  const now = Date.now();

  // Calculate trail points with opacity based on age
  const trailPoints = trail.map((point) => {
    const age = now - point.timestamp;
    const opacity = Math.max(0, 1 - age / 600); // Fade over 600ms
    const scale = 0.3 + opacity * 0.7; // Scale from 0.3 to 1.0
    return { ...point, opacity, scale };
  });

  return (
    <>
      {/* Light Streak Trail with Glow Effect */}
      {trailPoints.length > 0 && (
        <svg
          className="fixed top-0 left-0 w-full h-full pointer-events-none z-[49]"
          style={{ mixBlendMode: 'screen' }}
        >
          <defs>
            {/* Radial gradient for each particle */}
            <radialGradient id="particleGradient">
              <stop offset="0%" stopColor={isInteractive ? '#A78BFA' : '#60A5FA'} stopOpacity="1" />
              <stop offset="40%" stopColor={isInteractive ? '#8B5CF6' : '#3B82F6'} stopOpacity="0.8" />
              <stop offset="70%" stopColor={isInteractive ? '#6366F1' : '#1E40AF'} stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            {/* Strong glow filter */}
            <filter id="strongGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Soft outer glow */}
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feFlood floodColor={isInteractive ? '#8B5CF6' : '#60A5FA'} floodOpacity="0.4"/>
              <feComposite in2="blur" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Render each trail point as a glowing particle */}
          {trailPoints.map((point, index) => {
            const size = 3 * point.scale; // 减小核心尺寸
            const glowSize = 8 * point.scale; // 减小光晕尺寸

            return (
              <g key={point.id}>
                {/* Outer soft glow */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={glowSize}
                  fill="url(#particleGradient)"
                  opacity={point.opacity * 0.2}
                  filter="url(#softGlow)"
                />

                {/* Middle glow layer */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={size * 1.2}
                  fill={isInteractive ? '#8B5CF6' : '#60A5FA'}
                  opacity={point.opacity * 0.5}
                  filter="url(#strongGlow)"
                />

                {/* Core bright particle */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={size * 0.4}
                  fill={isInteractive ? '#C4B5FD' : '#DBEAFE'}
                  opacity={point.opacity * 0.95}
                  filter="url(#strongGlow)"
                />

                {/* Energy streak connecting to next point */}
                {index < trailPoints.length - 1 && (
                  <line
                    x1={point.x}
                    y1={point.y}
                    x2={trailPoints[index + 1].x}
                    y2={trailPoints[index + 1].y}
                    stroke={isInteractive ? '#8B5CF6' : '#60A5FA'}
                    strokeWidth={1 * point.scale}
                    strokeOpacity={point.opacity * 0.4}
                    strokeLinecap="round"
                    filter="url(#strongGlow)"
                  />
                )}
              </g>
            );
          })}
        </svg>
      )}

      {/* Main cursor with enhanced glow */}
      <div
        className="fixed pointer-events-none z-50"
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Outer expanding glow ring */}
        <div
          className={`absolute rounded-full transition-all duration-300 ${
            isInteractive ? 'w-10 h-10' : 'w-8 h-8'
          }`}
          style={{
            background: isInteractive
              ? 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(99, 102, 241, 0.1) 50%, transparent 70%)'
              : 'radial-gradient(circle, rgba(96, 165, 250, 0.3) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)',
            filter: 'blur(8px)',
            transform: 'translate(-50%, -50%)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />

        {/* Middle glow ring */}
        <div
          className={`absolute rounded-full transition-all duration-200 ${
            isInteractive ? 'w-6 h-6' : 'w-5 h-5'
          }`}
          style={{
            background: isInteractive
              ? 'radial-gradient(circle, rgba(167, 139, 250, 0.6) 0%, rgba(139, 92, 246, 0.3) 60%, transparent 80%)'
              : 'radial-gradient(circle, rgba(147, 197, 253, 0.6) 0%, rgba(96, 165, 250, 0.3) 60%, transparent 80%)',
            filter: 'blur(4px)',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Core bright dot */}
        <div
          className={`relative rounded-full transition-all duration-200 ${
            isInteractive
              ? 'w-2 h-2'
              : 'w-1.5 h-1.5'
          }`}
          style={{
            background: isInteractive
              ? 'radial-gradient(circle, #FFFFFF 0%, #C4B5FD 50%, #8B5CF6 100%)'
              : 'radial-gradient(circle, #FFFFFF 0%, #DBEAFE 50%, #60A5FA 100%)',
            boxShadow: isInteractive
              ? '0 0 8px rgba(167, 139, 250, 1), 0 0 16px rgba(139, 92, 246, 0.8), 0 0 24px rgba(99, 102, 241, 0.4)'
              : '0 0 6px rgba(147, 197, 253, 1), 0 0 12px rgba(96, 165, 250, 0.8), 0 0 18px rgba(59, 130, 246, 0.4)',
            animation: 'glow 1.5s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* Inject keyframe animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.2);
              opacity: 0.7;
            }
          }

          @keyframes glow {
            0% {
              filter: brightness(1);
            }
            100% {
              filter: brightness(1.4);
            }
          }
        `}
      </style>
    </>
  );
};
