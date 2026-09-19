import React, { useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

export function MagneticButton({
  children,
  range = 60,
  strength = 0.4,
  className = '',
  style = {},
  onClick,
  type = 'button',
}) {
  const ref = useRef(null);

  const springConfig = { stiffness: 180, damping: 14, mass: 0.5 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const dist = Math.hypot(clientX - centerX, clientY - centerY);

    if (dist < range) {
      const targetX = (clientX - centerX) * strength;
      const targetY = (clientY - centerY) * strength;
      x.set(targetX);
      y.set(targetY);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      style={{
        x,
        y,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: '14px',
        height: '44px',
        padding: '0 24px',
        boxShadow: '0 8px 20px rgba(234, 88, 12, 0.35)',
        cursor: 'pointer',
        border: '1px solid rgba(234, 88, 12, 0.5)',
        outline: 'none',
        ...style,
      }}
    >
      <span style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
        {children}
      </span>
    </motion.button>
  );
}

export default MagneticButton;

