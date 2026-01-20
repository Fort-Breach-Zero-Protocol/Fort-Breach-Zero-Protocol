import { motion } from 'motion/react';
import { useState } from 'react';

interface GlitchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function GlitchButton({ children, onClick, type = 'button', disabled = false }: GlitchButtonProps) {
  const [isGlitching, setIsGlitching] = useState(false);

  const handleHover = () => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 300);
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={handleHover}
      className="relative w-full overflow-hidden bg-gradient-to-r from-orange-500 to-red-600 px-8 py-4 clip-corner disabled:opacity-50 disabled:cursor-not-allowed"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
      }}
    >
      {/* Button background with glitch effect */}
      <motion.div
        className="absolute inset-0 bg-orange-400"
        animate={isGlitching ? {
          x: [0, -2, 2, -2, 0],
          opacity: [0, 0.5, 0.3, 0.5, 0],
        } : {}}
        transition={{ duration: 0.3 }}
      />
      
      {/* Text with glitch effect */}
      <motion.span
        className="relative z-10 tracking-wider text-black font-rajdhani uppercase"
        style={{ fontFamily: 'Orbitron, sans-serif' }}
        animate={isGlitching ? {
          x: [0, -1, 1, -1, 0],
          textShadow: [
            '0 0 0 rgba(255, 0, 0, 0)',
            '2px 0 0 rgba(255, 0, 0, 0.7), -2px 0 0 rgba(0, 255, 255, 0.7)',
            '-2px 0 0 rgba(255, 0, 0, 0.7), 2px 0 0 rgba(0, 255, 255, 0.7)',
            '2px 0 0 rgba(255, 0, 0, 0.7), -2px 0 0 rgba(0, 255, 255, 0.7)',
            '0 0 0 rgba(255, 0, 0, 0)',
          ],
        } : {}}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.span>

      {/* Scan line effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-transparent opacity-20"
        animate={{
          y: ['-100%', '200%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.button>
  );
}