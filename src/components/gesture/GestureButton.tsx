import React, { useState } from 'react';
import { Hand } from 'lucide-react';
import { useGestureStore } from '../../stores/useGestureStore';
import { loadMediaPipe } from '../../services/gesture/mediapipeLoader';

export const GestureButton: React.FC = () => {
  const { isActive, setActive, setError } = useGestureStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (isActive) {
      // Deactivate gesture control
      setActive(false);
      return;
    }

    // Ask for confirmation before activating camera
    const confirmed = window.confirm(
      '手势控制需要访问您的摄像头。\n\n' +
      '摄像头仅用于手势识别，不会录制或上传任何数据。\n\n' +
      '是否开启手势控制？'
    );

    if (!confirmed) {
      return;
    }

    // Activate gesture control
    setIsLoading(true);
    setError(null);

    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user',
        },
      });

      // Stop the test stream immediately (we'll create a new one in GestureCameraView)
      stream.getTracks().forEach((track) => track.stop());

      // Load MediaPipe
      await loadMediaPipe();

      // Activate gesture control
      setActive(true);
    } catch (error) {
      console.error('Failed to initialize gesture control:', error);

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setError('摄像头权限被拒绝，请在浏览器设置中允许访问摄像头');
        } else if (error.name === 'NotFoundError') {
          setError('未找到摄像头设备');
        } else {
          setError(`初始化失败: ${error.message}`);
        }
      } else {
        setError('初始化手势控制失败');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        background: isActive
          ? 'rgba(34, 197, 94, 0.2)'
          : 'rgba(99, 102, 241, 0.15)',
        border: `1px solid ${
          isActive ? 'rgba(34, 197, 94, 0.4)' : 'rgba(129, 140, 248, 0.3)'
        }`,
        borderRadius: '8px',
        fontSize: '12px',
        color: isActive ? 'rgb(134, 239, 172)' : 'rgb(129 140 248)',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        opacity: isLoading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          if (isActive) {
            e.currentTarget.style.background = 'rgba(34, 197, 94, 0.3)';
            e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.5)';
          } else {
            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.25)';
            e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (isActive) {
          e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)';
          e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.4)';
        } else {
          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.3)';
        }
      }}
    >
      <Hand style={{ width: '14px', height: '14px' }} />
      <span>{isLoading ? '加载中...' : isActive ? '手势控制' : '手势控制'}</span>
    </button>
  );
};
