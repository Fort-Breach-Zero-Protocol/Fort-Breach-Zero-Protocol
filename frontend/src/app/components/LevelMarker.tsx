import { motion } from 'motion/react';
import { Lock, Check, Shield } from 'lucide-react';

interface LevelMarkerProps {
  level: number;
  color: string;
  glowColor: string;
  completed: boolean;
  locked: boolean;
  position: { top: string; left: string };
}

export default function LevelMarker({
  level,
  color,
  glowColor,
  completed,
  locked,
  position
}: LevelMarkerProps) {
  return (
    <motion.div
      className="absolute"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translate(-50%, -50%)'
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: level * 0.1, duration: 0.5, type: 'spring' }}
    >
      <motion.button
        className="relative w-20 h-20 rounded-full flex items-center justify-center font-bold text-xl transition-all"
        style={{
          backgroundColor: locked ? '#1e3a5f' : color,
          boxShadow: locked
            ? '0 0 20px rgba(100, 100, 100, 0.3)'
            : `0 0 30px ${glowColor}`,
          border: `3px solid ${locked ? '#4a5568' : color}`,
          cursor: locked ? 'not-allowed' : 'pointer',
          opacity: locked ? 0.6 : 1
        }}
        whileHover={
          !locked
            ? {
                scale: 1.1,
                boxShadow: `0 0 40px ${glowColor}`
              }
            : {}
        }
        whileTap={!locked ? { scale: 0.95 } : {}}
        disabled={locked}
      >
        {locked ? (
          <Lock size={32} color="#718096" />
        ) : completed ? (
          <Check size={32} color="#fff" />
        ) : (
          <Shield size={32} color="#fff" />
        )}
      </motion.button>

      {/* Level name label */}
      <div
        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-center"
        style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: '0.875rem',
          color: locked ? '#718096' : '#22d3ee',
          textShadow: locked ? 'none' : '0 0 10px rgba(34, 211, 238, 0.5)'
        }}
      >
        Level {level}
      </div>
    </motion.div>
  );
}
