import React from 'react';
import { MoveVertical, MousePointer2, Search, Sparkles, Move, Rotate3D } from 'lucide-react';
import { useControlStore } from '../../stores/useControlStore';

export const Footer: React.FC = () => {
  const { controlMode, toggleControlMode } = useControlStore();
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 999,
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          background: 'rgba(30, 36, 51, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          fontSize: '12px',
          color: 'rgb(203 213 225)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          pointerEvents: 'auto'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MoveVertical style={{ width: '14px', height: '14px', color: 'rgb(129 140 248)' }} />
          <span>{controlMode === 'rotation' ? '拖拽旋转' : '拖拽平移'}</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search style={{ width: '14px', height: '14px', color: 'rgb(129 140 248)' }} />
          <span>滚轮缩放</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MousePointer2 style={{ width: '14px', height: '14px', color: 'rgb(129 140 248)' }} />
          <span>单击选择</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles style={{ width: '14px', height: '14px', color: 'rgb(129 140 248)' }} />
          <span>双击展开</span>
        </span>

        {/* Mode Toggle Button */}
        <button
          onClick={toggleControlMode}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(129, 140, 248, 0.3)',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'rgb(129 140 248)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.25)';
            e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.3)';
          }}
        >
          {controlMode === 'rotation' ? (
            <>
              <Move style={{ width: '14px', height: '14px' }} />
              <span>切换平移</span>
            </>
          ) : (
            <>
              <Rotate3D style={{ width: '14px', height: '14px' }} />
              <span>切换旋转</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
