import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Info, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import LevelMarker from './components/LevelMarker';
import backgroundImage from '@/assets/885408bc9f9e51f743a471a27b12eef7765bbfd6.png';

export default function Home() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fullname, setFullname] = useState('');

  const username = localStorage.getItem('username') || 'Agent';
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://localhost:3000/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.ok) {
          const user = await response.json();
          setFullname(`${user.firstname} ${user.lastname}`);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const levels = [
    { id: 1, name: 'Ice', color: '#60a5fa', glowColor: 'rgba(96, 165, 250, 0.9)', completed: false, locked: false, position: { top: '30%', left: '15%' } },
    { id: 2, name: 'Valley', color: '#4ade80', glowColor: 'rgba(74, 222, 128, 0.9)', completed: false, locked: true, position: { top: '60%', left: '30%' } },
    { id: 3, name: 'Center', color: '#a78bfa', glowColor: 'rgba(167, 139, 250, 0.9)', completed: false, locked: true, position: { top: '40%', left: '50%' } },
    { id: 4, name: 'Lava', color: '#fb923c', glowColor: 'rgba(251, 146, 60, 0.9)', completed: false, locked: true, position: { top: '65%', left: '70%' } },
    { id: 5, name: 'Volcano', color: '#f87171', glowColor: 'rgba(248, 113, 113, 0.9)', completed: false, locked: true, position: { top: '35%', left: '85%' } },
  ];

  return (
    <div
      className="h-[100vh] relative flex flex-col overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#1e3a5f', // fallback color
      }}
    >
      {/* Gradient overlay for uniform effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a5f]/80 via-[#1e3a5f]/60 to-[#1e3a5f]/50" />

      {/* HEADER */}
      <motion.header
        className="relative z-20 px-12 py-8 flex items-center justify-between"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Shield size={32} color="#22d3ee" />
          <h1
            className="tracking-wider text-cyan-400"
            style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '2rem' }}
          >
            FORT BREACH
          </h1>
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-6 py-2 bg-transparent border border-cyan-400/30 text-cyan-400 hover:border-cyan-400/60 transition-all"
            style={{
              clipPath:
                'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'
            }}
          >
            <User size={20} />
            <span style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {username}
            </span>
          </button>

          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 w-48 bg-[#0f2847]/90 border border-cyan-400/30 shadow-lg z-30"
              style={{
                clipPath:
                  'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
              }}
            >
              <button className="w-full px-6 py-3 text-left text-cyan-400 hover:text-orange-400 hover:bg-[#1e3a5f]/50 flex items-center gap-3">
                <Info size={18} />
                About Us
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-6 py-3 text-left text-orange-400 hover:text-orange-300 hover:bg-[#1e3a5f]/50 flex items-center gap-3 border-t border-cyan-400/20"
              >
                <LogOut size={18} />
                Logout
              </button>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* MAIN MAP CONTENT */}
      <div className="relative flex-1 overflow-hidden z-10">
        {/* Fullname Display */}
        {fullname && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute top-8 left-12 z-20 px-6 py-3 bg-[#0f2847]/80 border border-cyan-400/40 rounded-lg"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            <p className="text-cyan-300 text-lg font-semibold">
              {fullname}
            </p>
          </motion.div>
        )}

        {/* Optional vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.4) 100%)',
          }}
        />

        {/* Path SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M 15% 30% Q 22% 45%, 30% 60% Q 40% 50%, 50% 40% Q 60% 50%, 70% 65% Q 78% 50%, 85% 35%"
            fill="none"
            stroke="rgba(255, 223, 128, 0.7)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="20, 12"
            filter="url(#glow)"
          />
        </svg>

        {/* Level Markers */}
        {levels.map((level) => (
          <LevelMarker
            key={level.id}
            level={level.id}
            color={level.color}
            glowColor={level.glowColor}
            completed={level.completed}
            locked={level.locked}
            position={level.position}
          />
        ))}
      </div>
    </div>
  );
}
