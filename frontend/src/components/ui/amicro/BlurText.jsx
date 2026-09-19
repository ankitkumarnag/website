import React from 'react';
import { motion } from 'framer-motion';

export function BlurText({
  text = "",
  duration = 0.5,
  staggerDelay = 0.03,
  initialBlur = '10px',
  className = '',
  style = {},
}) {
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay * 4,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 12, filter: `blur(${initialBlur})` },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10%' }}
      className={className}
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        columnGap: '0.4em',
        rowGap: '0.2em',
        ...style,
      }}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={wordVariants}
          style={{ display: 'inline-block' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

export default BlurText;

