import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, Star } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

// Deterministic star positions
const stars = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: (i * 37 + 13) % 100,
  y: (i * 53 + 7) % 100,
  size: i % 4 === 0 ? 2.5 : i % 3 === 0 ? 2 : 1.5,
  delay: (i * 0.4) % 4,
  duration: 2 + (i % 3) * 0.8,
  opacity: 0.3 + (i % 5) * 0.1,
}));

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  const [avatarError, setAvatarError] = useState(false);

  return (
    <AnimatePresence>
      <motion.div
        style={{ position: 'fixed', inset: 0, zIndex: 50 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(5, 8, 18, 0.88)', backdropFilter: 'blur(6px)' }}
        />

        {/* Twinkling stars */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: 'white',
              opacity: star.opacity,
              animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            }}
          />
        ))}

        {/* Modal card */}
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 40, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          style={{
            position: 'fixed',
            top: '68px',
            right: '16px',
            width: '360px',
            margin: 0,
            padding: '32px 28px 28px',
            background: 'rgba(13, 17, 30, 0.96)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(129, 140, 248, 0.22)',
            boxShadow:
              '0 0 80px rgba(99, 102, 241, 0.12), 0 0 30px rgba(168, 85, 247, 0.08), 0 30px 60px rgba(0,0,0,0.7)',
            textAlign: 'center',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            data-cursor="interactive"
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
            }}
          >
            <X size={13} />
          </button>

          {/* Project badge */}
          <div
            style={{
              fontSize: '10px',
              letterSpacing: '3.5px',
              color: 'rgba(129, 140, 248, 0.75)',
              marginBottom: '28px',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <Star size={9} style={{ fill: 'rgba(129,140,248,0.75)', color: 'rgba(129,140,248,0.75)' }} />
            Innovation Galaxy
            <Star size={9} style={{ fill: 'rgba(129,140,248,0.75)', color: 'rgba(129,140,248,0.75)' }} />
          </div>

          {/* Avatar with rotating gradient border */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '22px' }}>
            <div
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                padding: '3px',
                background: 'conic-gradient(from 0deg, #6366f1, #a855f7, #ec4899, #8b5cf6, #6366f1)',
                animation: 'avatarSpin 8s linear infinite',
                boxShadow: '0 0 35px rgba(99, 102, 241, 0.45), 0 0 60px rgba(168, 85, 247, 0.2)',
              }}
            >
              {!avatarError ? (
                <img
                  src="/avatar.jpeg"
                  alt="Siyu"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    border: '3px solid rgba(13, 17, 30, 1)',
                    display: 'block',
                  }}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                /* Fallback: gradient initials */
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: 700,
                    color: 'white',
                    letterSpacing: '1px',
                    border: '3px solid rgba(13, 17, 30, 1)',
                  }}
                >
                  S
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <h2
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: 'white',
              letterSpacing: '6px',
              marginBottom: '10px',
              textTransform: 'uppercase',
            }}
          >
            Siyu
          </h2>

          {/* Tagline */}
          <p
            style={{
              fontSize: '13.5px',
              color: 'rgb(165, 180, 252)',
              fontStyle: 'italic',
              marginBottom: '20px',
              lineHeight: '1.65',
              letterSpacing: '0.3px',
            }}
          >
            相信每个脑洞，都是一颗等待点燃的星
          </p>

          {/* Tag badges */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '26px',
              flexWrap: 'wrap',
            }}
          >
            {['创意探索者', 'AI 构建者', '点子孵化师'].map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '4px 13px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  color: 'rgba(165, 180, 252, 0.85)',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.22)',
                  letterSpacing: '0.3px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div
            style={{
              height: '1px',
              background:
                'linear-gradient(to right, transparent, rgba(129,140,248,0.28), transparent)',
              marginBottom: '22px',
            }}
          />

          {/* Project description */}
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(148, 163, 184, 0.75)',
              lineHeight: '1.85',
              marginBottom: '28px',
            }}
          >
            Innovation Galaxy 是一个 AI 驱动的创意孵化宇宙，
            <br />
            让每一个灵光一闪都有机会在星系中生长。
          </p>

          {/* GitHub button */}
          <a
            href="https://github.com/dsytai804-netizen/innovation-galaxy/tree/main"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="interactive"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 26px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 500,
              color: 'white',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.55), rgba(168,85,247,0.55))',
              border: '1px solid rgba(129,140,248,0.28)',
              textDecoration: 'none',
              transition: 'all 0.25s',
              boxShadow: '0 4px 20px rgba(99,102,241,0.2)',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, rgba(99,102,241,0.78), rgba(168,85,247,0.78))';
              e.currentTarget.style.boxShadow = '0 4px 30px rgba(99,102,241,0.45)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, rgba(99,102,241,0.55), rgba(168,85,247,0.55))';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Github size={15} />
            查看源代码
          </a>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
