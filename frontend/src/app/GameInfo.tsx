import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Info, Swords, Sparkles, Gauge, Lock, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import backgroundImage from '@/assets/885408bc9f9e51f743a471a27b12eef7765bbfd6.png';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import obstaclePlatform from '@/assets/obstacle-platform.png';
import obstacleGate from '@/assets/obstacle-gate.png';
import obstaclePortalHero from '@/assets/obstacle-portal-hero.png';
import obstaclePortalEnemy from '@/assets/obstacle-portal-enemy.png';

export default function GameInfo() {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'How To Play',
      icon: Info,
      points: [
        'Choose your avatar first.',
        'Each round, you and the enemy spawn characters.',
        'The side with more characters reaching the end wins the round.',
        'There are 3 rounds per level (Level 5 has 5), win the majority to clear the level.',
      ],
    },
    {
      title: 'Spawns & Lanes',
      icon: Swords,
      points: [
        'Level 1: 7 characters to spawn (same for enemy).',
        'Level 2: 10 characters. Levels 3–4: 15. Level 5: 25.',
        'After Level 2, you can spawn only 2 characters per lane.',
        'Place wisely to outnumber the enemy at the finish.',
      ],
    },
    {
      title: 'Abilities',
      icon: Sparkles,
      points: [
        'Abilities per level: L1→1, L2→2, L3→3, L4 & L5→4 (use each one time).',
        'Stack Overflow: Pick a lane and destroy enemy units in it.',
        'Threat Hash: Tells you how many characters the enemy will spawn this round.',
        'Recursion Call: Respawn your previous-round characters in a chosen lane (after Round 1).',
        'Merge Protocol: Merge 2 of your units in a lane; the merged unit cannot die on collision.',
      ],
    },
    {
      title: 'Winning The Level',
      icon: Gauge,
      points: [
        'Win more rounds than the enemy.',
        'Level 5 has 5 rounds — you must win 3 rounds to finish.',
      ],
    },
    {
      title: 'Scoring',
      icon: Sparkles,
      points: [
        'Your points = 100 - (troops used) - (5 × abilities used).',
        'Use fewer troops and abilities to maximize your score.',
        'Best scores are saved and counted on the leaderboard.',
      ],
    },
  ];

  return (
    <div
      className="min-h-screen relative flex flex-col overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#1e3a5f',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a5f]/90 via-[#1e3a5f]/80 to-[#1e3a5f]/70" />

      <motion.header
        className="relative z-20 px-12 py-8 flex items-center justify-between border-b border-cyan-400/20"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <Shield size={32} color="#22d3ee" />
          <h1 className="tracking-wider text-cyan-400" style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '2rem' }}>
            FORT BREACH
          </h1>
        </div>

        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 px-6 py-2 bg-transparent border border-cyan-400/30 text-cyan-400 hover:border-cyan-400/60 transition-all"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
            fontFamily: 'Rajdhani, sans-serif',
          }}
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>
      </motion.header>

      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-12 space-y-10">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-3" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              GAME INFO
            </h1>
            <p className="text-lg md:text-xl text-cyan-300" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Simple rules, abilities, and obstacles for quick play.
            </p>
          </motion.section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="bg-[#0f2847]/60 border border-cyan-400/30 rounded-lg p-6 h-full flex flex-col gap-4 hover:border-cyan-400/60 transition-all"
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 flex items-center justify-center rounded-full bg-cyan-900/40 border border-cyan-400/40">
                      <Icon size={22} className="text-orange-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-cyan-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      {section.title}
                    </h3>
                  </div>
                  <ul className="space-y-2 text-cyan-200 text-base leading-relaxed" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {section.points.map((point) => (
                      <li key={point} className="pl-2">• {point}</li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#0f2847]/60 border border-cyan-400/30 rounded-lg p-6 space-y-6"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 flex items-center justify-center rounded-full bg-cyan-900/40 border border-cyan-400/40">
                <Lock size={22} className="text-orange-300" />
              </div>
              <h3 className="text-2xl font-bold text-orange-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Obstacles
              </h3>
            </div>
            <ul className="space-y-2 text-cyan-200 text-base leading-relaxed" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              <li>Survival Platform: 50% chance to survive when stepping on it.</li>
              <li>Gate: One player must press the red button; then the gate opens and others can pass.</li>
              <li>Portal: Entering a green portal turns your unit into an enemy and it comes out from another portal.</li>
            </ul>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <figure className="bg-[#0b203a]/60 p-3 rounded border border-cyan-400/20">
                <ImageWithFallback
                  src={obstaclePlatform}
                  alt="Survival platform"
                  className="w-full h-40 object-cover rounded"
                />
                <figcaption className="mt-2 text-sm text-cyan-200">Survival Platform (50% survival)</figcaption>
              </figure>
              <figure className="bg-[#0b203a]/60 p-3 rounded border border-cyan-400/20">
                <ImageWithFallback
                  src={obstacleGate}
                  alt="Gate with button"
                  className="w-full h-40 object-cover rounded"
                />
                <figcaption className="mt-2 text-sm text-cyan-200">Gate opens after button press</figcaption>
              </figure>
              <figure className="bg-[#0b203a]/60 p-3 rounded border border-cyan-400/20">
                <ImageWithFallback
                  src={obstaclePortalHero}
                  alt="Hero entering portal"
                  className="w-full h-40 object-cover rounded"
                />
                <figcaption className="mt-2 text-sm text-cyan-200">Portal converts your unit to enemy</figcaption>
              </figure>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <figure className="bg-[#0b203a]/60 p-3 rounded border border-cyan-400/20">
                <ImageWithFallback
                  src={obstaclePortalEnemy}
                  alt="Enemy emerging from portal"
                  className="w-full h-40 object-cover rounded"
                />
                <figcaption className="mt-2 text-sm text-cyan-200">Enemy emerges from linked portal</figcaption>
              </figure>

            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}