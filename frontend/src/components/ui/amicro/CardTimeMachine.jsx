import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const DEFAULT_STAGES = [
  { stage: 'Stage 0', title: 'Citizen Intake', date: 'Day 0', desc: 'Complaint logged with GPS & photo timestamp', bg: '#0B192C' },
  { stage: 'Stage 1', title: 'Gemini AI Verified', date: 'Day 0 (+5m)', desc: 'Multimodal vision confirmed pothole depth', bg: '#1E3E62' },
  { stage: 'Stage 2', title: 'SLA & Contractor Assigned', date: 'Day 1', desc: 'Ward 14 Infrastructure Team dispatched', bg: '#0B192C' },
  { stage: 'Stage 3', title: 'Field Inspection', date: 'Day 2', desc: 'On-site measurement & repair material arrived', bg: '#1E3E62' },
  { stage: 'Stage 4', title: 'Fully Resolved', date: 'Day 3', desc: 'Civic audit verified with before/after photos', bg: '#15803D' },
];

export const CardTimeMachine = ({ stages = DEFAULT_STAGES, className = '' }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleTimelineHover = (index) => {
    setHoveredIndex(index);
    setActiveIndex(Math.round(index));
  };

  const timelineNodes = useMemo(() => {
    const nodes = [];
    stages.forEach((item, i) => {
      nodes.push({ type: 'main', index: i, date: item.date, title: item.title });
      if (i < stages.length - 1) {
        for (let j = 0; j < 2; j++) {
          nodes.push({ type: 'sub', index: i + (j + 1) * 0.33 });
        }
      }
    });
    return nodes;
  }, [stages]);

  const activeStage = stages[activeIndex] || stages[0];

  return (
    <div
      className={className}
      style={{
        width: '100%',
        background: 'linear-gradient(135deg, rgba(11, 25, 44, 0.96) 0%, rgba(30, 62, 98, 0.88) 100%)',
        color: '#F8FAFC',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justify: 'space-between',
        justifyContent: 'space-between',
        gap: '20px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        border: '1px solid rgba(234, 88, 12, 0.3)',
        padding: '20px 24px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        boxSizing: 'border-box',
      }}
    >
      {/* Radial Background Accent */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at top left, rgba(234,88,12,0.18), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Left: Active Stage Details & Metadata */}
      <div
        style={{
          flex: '1 1 240px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 10,
          textAlign: 'left',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: '999px',
            background: 'rgba(234, 88, 12, 0.15)',
            border: '1px solid rgba(234, 88, 12, 0.4)',
            color: '#EA580C',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            width: 'fit-content',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#EA580C',
              boxShadow: '0 0 8px #EA580C',
              display: 'inline-block',
            }}
          />
          Grievance Audit Scrubber
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '700',
            color: '#F8FAFC',
            lineHeight: 1.3,
          }}
        >
          {activeStage.stage}: <span style={{ color: '#EA580C' }}>{activeStage.title}</span>
        </h3>

        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: '#94A3B8',
            lineHeight: 1.5,
            maxWidth: '380px',
          }}
        >
          {activeStage.desc}
        </p>

        <div
          style={{
            fontSize: '12px',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '4px',
          }}
        >
          <span>Logged Timestamp:</span>
          <span
            style={{
              fontFamily: 'monospace',
              color: '#F8FAFC',
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'rgba(30, 62, 98, 0.6)',
              border: '1px solid #1E3E62',
              fontSize: '11px',
              fontWeight: '600',
            }}
          >
            {activeStage.date}
          </span>
        </div>
      </div>

      {/* Center: 3D Stacked Cards */}
      <div
        style={{
          position: 'relative',
          flex: '0 0 240px',
          height: '140px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '800px',
          zIndex: 10,
        }}
      >
        {stages.map((item, i) => {
          const offset = i - activeIndex;
          const isPast = i < activeIndex;

          return (
            <motion.div
              key={i}
              initial={false}
              animate={{
                z: isPast ? 180 : -offset * 50,
                y: isPast ? 240 : -offset * 10,
                rotateX: isPast ? -20 : offset * 3,
                opacity: isPast ? 0 : 1 - Math.abs(offset) * 0.22,
                scale: isPast ? 1.2 : 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 24,
              }}
              style={{
                position: 'absolute',
                borderRadius: '14px',
                display: 'flex',
                height: '125px',
                width: '210px',
                transformOrigin: 'center',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: '12px 14px',
                border: '1px solid rgba(234, 88, 12, 0.35)',
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.55)',
                pointerEvents: 'none',
                zIndex: stages.length - i,
                backgroundColor: item.bg || '#0B192C',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                  paddingBottom: '6px',
                  marginBottom: '6px',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#EA580C',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                  }}
                >
                  {item.stage}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.65)',
                    fontFamily: 'monospace',
                  }}
                >
                  {item.date}
                </span>
              </div>
              <h4
                style={{
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.title}
              </h4>
              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.75)',
                  lineHeight: '1.35',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {item.desc}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Right: Vertical Timeline Scrubber Bar */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          zIndex: 20,
          padding: '2px',
        }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {timelineNodes.map((node, i) => {
          if (node.type === 'main') {
            const index = node.index;
            const isSelected = activeIndex === index;

            return (
              <button
                key={`main-${index}`}
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  padding: '3px 0',
                  width: '90px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  outline: 'none',
                }}
                onMouseEnter={() => handleTimelineHover(index)}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(index);
                }}
              >
                {hoveredIndex === index ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.12 }}
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '40px',
                      fontSize: '11px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      color: isSelected ? '#EA580C' : 'rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    {node.date}
                  </motion.span>
                ) : null}
                <motion.div
                  animate={{
                    scaleX: hoveredIndex === null ? 1 : isSelected ? 1.4 : Math.abs(index - hoveredIndex) < 0.5 ? 1.25 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  style={{
                    height: '4px',
                    width: '28px',
                    borderRadius: '999px',
                    transformOrigin: 'right',
                    backgroundColor: isSelected ? '#EA580C' : 'rgba(255, 255, 255, 0.4)',
                    boxShadow: isSelected ? '0 0 10px #EA580C' : 'none',
                  }}
                />
              </button>
            );
          } else {
            const isHoveringNear = hoveredIndex !== null && Math.abs(node.index - hoveredIndex) <= 0.5;

            return (
              <div
                key={`sub-${node.index}`}
                style={{
                  padding: '2px 0',
                  width: '90px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => handleTimelineHover(node.index)}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(Math.round(node.index));
                }}
              >
                <motion.div
                  animate={{
                    scaleX: hoveredIndex === null ? 1 : isHoveringNear ? 1.2 : 1,
                    opacity: hoveredIndex === null ? 0.3 : isHoveringNear ? 0.6 : 0.3,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  style={{
                    height: '3px',
                    width: '18px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    transformOrigin: 'right',
                  }}
                />
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

export default CardTimeMachine;

