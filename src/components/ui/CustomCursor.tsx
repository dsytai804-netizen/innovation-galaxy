import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.tagName === 'BUTTON' ||
                          target.tagName === 'A' ||
                          target.style.cursor === 'pointer';
      setIsPointer(isClickable);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* 外圈 - 大圆 */}
      <div
        className="fixed pointer-events-none z-50 transition-all duration-150 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          className={`rounded-full border-2 transition-all duration-200 ${
            isPointer
              ? 'w-12 h-12 border-blue-400 bg-blue-400/10'
              : 'w-10 h-10 border-white/30'
          }`}
        />
      </div>

      {/* 内圈 - 小点 */}
      <div
        className="fixed pointer-events-none z-50 transition-all duration-100 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          className={`rounded-full transition-all duration-200 ${
            isPointer
              ? 'w-2 h-2 bg-blue-400'
              : 'w-1.5 h-1.5 bg-white'
          }`}
        />
      </div>
    </>
  );
};
