import React from 'react';
import { motion } from 'framer-motion';

export const RadarSweep = ({ size = "md", label = "Live Ward Telemetry" }) => {
  const sizePx = {
    sm: 40,
    md: 64,
    lg: 96,
  }[size] || 64;

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px',
        backgroundColor: 'rgba(11, 25, 44, 0.92)',
        border: '1px solid #1E3E62',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: `${sizePx}px`,
          height: `${sizePx}px`,
          borderRadius: '50%',
          border: '1px solid rgba(234, 88, 12, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: '#070F1E',
        }}
      >
        {/* Concentric rings */}
        <div style={{ position: 'absolute', inset: '8px', borderRadius: '50%', border: '1px solid #1E3E62' }} />
        <div style={{ position: 'absolute', inset: '16px', borderRadius: '50%', border: '1px solid rgba(30, 62, 98, 0.6)' }} />
        
        {/* Center dot */}
        <div style={{ position: 'absolute', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EA580C', boxShadow: '0 0 8px #EA580C' }} />

        {/* Sweep hand with Saffron conical glow */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: 'center',
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, transparent 60%, rgba(234,88,12,0.1) 75%, rgba(234,88,12,0.3) 90%, rgba(234,88,12,0.8) 100%)',
          }}
        />
      </div>
      {label && (
        <span
          style={{
            marginTop: '10px',
            fontSize: '10px',
            fontWeight: '700',
            color: '#EA580C',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }} />
          {label}
        </span>
      )}
    </div>
  );
};

export default RadarSweep;

