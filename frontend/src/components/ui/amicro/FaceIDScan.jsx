import React from 'react';
import { motion } from 'framer-motion';

export const FaceIDScan = ({ label = "AI Multimodal Audit Active", subtitle = "Analyzing image with Gemini 3.6 Flash..." }) => (
  <div
    style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: 'rgba(11, 25, 44, 0.92)',
      border: '1px solid rgba(234, 88, 12, 0.4)',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(12px)',
      overflow: 'hidden',
    }}
  >
    {/* Grid & Corner HUD Brackets */}
    <div style={{ position: 'absolute', top: '8px', left: '8px', width: '12px', height: '12px', borderTop: '2px solid #EA580C', borderLeft: '2px solid #EA580C' }} />
    <div style={{ position: 'absolute', top: '8px', right: '8px', width: '12px', height: '12px', borderTop: '2px solid #EA580C', borderRight: '2px solid #EA580C' }} />
    <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '12px', height: '12px', borderBottom: '2px solid #EA580C', borderLeft: '2px solid #EA580C' }} />
    <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '12px', height: '12px', borderBottom: '2px solid #EA580C', borderRight: '2px solid #EA580C' }} />

    {/* Center Scanner Frame */}
    <div
      style={{
        width: '64px',
        height: '64px',
        border: '2px solid #1E3E62',
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#070F1E',
      }}
    >
      <svg viewBox="0 0 24 24" style={{ width: '32px', height: '32px', fill: 'rgba(234, 88, 12, 0.85)' }}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      </svg>

      {/* Laser Scanning Bar */}
      <motion.div
        animate={{ top: ["-100%", "100%", "-100%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute',
          left: 0,
          width: '100%',
          height: '32px',
          background: 'linear-gradient(to bottom, transparent, rgba(234, 88, 12, 0.4), #EA580C)',
          borderBottom: '2px solid #EA580C',
          boxShadow: '0 0 15px #EA580C',
        }}
      />
    </div>

    {/* Status Label */}
    <div style={{ marginTop: '12px', textAlign: 'center' }}>
      <div
        style={{
          fontSize: '12px',
          fontWeight: '700',
          letterSpacing: '1px',
          color: '#EA580C',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EA580C', display: 'inline-block' }} />
        {label}
      </div>
      <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', margin: 0 }}>{subtitle}</p>
    </div>
  </div>
);

export default FaceIDScan;

