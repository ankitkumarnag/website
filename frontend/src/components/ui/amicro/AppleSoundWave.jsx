import React from 'react';
import { motion } from 'framer-motion';

export const AppleSoundWave = ({ isListening = true, color = "saffron" }) => {
  const barHeights = [2, 4, 6, 4, 2, 5, 3, 6, 2];
  
  const barBg = color === "green" ? "#16A34A" : "#EA580C";

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        height: '32px',
        padding: '4px 14px',
        backgroundColor: 'rgba(11, 25, 44, 0.85)',
        border: '1px solid #1E3E62',
        borderRadius: '999px',
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)',
      }}
    >
      {barHeights.map((val, i) => (
        <motion.div
          key={i}
          animate={isListening ? { height: [4, val * 5, 4] } : { height: 4 }}
          transition={{
            duration: 0.8,
            repeat: isListening ? Infinity : 0,
            delay: i * 0.08,
            ease: "easeInOut"
          }}
          style={{
            width: '4px',
            borderRadius: '999px',
            backgroundColor: barBg,
          }}
        />
      ))}
    </div>
  );
};

export default AppleSoundWave;

