import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Info, Shield, Trophy, X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LevelMarker from './components/LevelMarker';
import backgroundImage from '@/assets/885408bc9f9e51f743a471a27b12eef7765bbfd6.png';
import { getUserProfile, getLeaderboard } from '@/utils/api';

export default function Home() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fullname, setFullname] = useState('');
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [levelToUnlock, setLevelToUnlock] = useState<number | null>(null);
  const [userPoints, setUserPoints] = useState<{[key: string]: number}>({});
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const username = localStorage.getItem('username') || 'Agent';
  const token = localStorage.getItem('token');

  // When arriving from a completed level, wipe in-app history and pin the stack to /home
  useEffect(() => {
    const shouldResetHistory = sessionStorage.getItem('resetHistoryOnHome') === 'true';
    if (!shouldResetHistory) return;

    const history = (window.top || window).history;
    history.replaceState(null, '', '/home');
    history.pushState(null, '', '/home');

    const handlePopState = () => {
      history.pushState(null, '', '/home');
    };

    (window.top || window).addEventListener('popstate', handlePopState);

    // Clear the flag so normal navigation works on future visits
    sessionStorage.removeItem('resetHistoryOnHome');

    return () => {
      (window.top || window).removeEventListener('popstate', handlePopState);
    };
  }, []);

  const updateUnlockedLevels = (levelCompleted: number) => {
    // Unlock all levels up to and including the completed level + 1
    const unlocked = [];
    for (let i = 1; i <= Math.min(levelCompleted + 1, 5); i++) {
      unlocked.push(i);
    }
    setUnlockedLevels(unlocked);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        return null;
      }

      try {
        const user = await getUserProfile();
        
        // Set user info
        if (user.fullname) {
          setFullname(`${user.fullname.firstname} ${user.fullname.lastname || ''}`);
        }
        
        // Update unlocked levels based on backend data
        updateUnlockedLevels(user.levelCompleted || 0);
        
        // Set user points
        if (user.points) {
          setUserPoints(user.points);
        }
        return user;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    };

    (async () => {
      const user = await fetchUserData();

      // Check if returning from completed level
    const urlParams = new URLSearchParams(window.location.search);
    const levelCompleted = urlParams.get('levelCompleted');
    
    if (levelCompleted) {
      const completedLevel = parseInt(levelCompleted);
      const nextLevel = completedLevel + 1;
      const latestCompleted = user?.levelCompleted || 0;
      
      // Clear URL parameters
      window.history.replaceState({}, '', '/home');
      
      // Show unlock animation only when this visit reflects a newly completed level
      // i.e., the completed level from URL equals backend's latest completed
      // This avoids showing animation on replays or already-unlocked levels
      if (nextLevel <= 5 && completedLevel === latestCompleted) {
        setTimeout(() => {
          setLevelToUnlock(nextLevel);
          setShowUnlockAnimation(true);
          
          // Re-fetch user data to update levels
          fetchUserData();
          
          setTimeout(() => {
            setShowUnlockAnimation(false);
            setLevelToUnlock(null);
          }, 2000);
        }, 500);
      } else {
        // Re-fetch to update the UI even if no next level
        fetchUserData();
      }
    }
    })();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleLeaderboardClick = async () => {
    setIsDropdownOpen(false);
    setShowLeaderboard(true);
    setLoadingLeaderboard(true);
    
    try {
      const data = await getLeaderboard();
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };


  const handleLevelClick = (levelId: number) => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (levelId === 1) {
      navigate('/game');
      return;
    }
    
    if (levelId === 2) {
      if (unlockedLevels.includes(2)) {
        navigate('/game2');
      }
      return;
    }
    
    if (levelId === 3) {
      if (unlockedLevels.includes(3)) {
        navigate('/game3');
      }
      return;
    }
    
    if (levelId === 4) {
      if (unlockedLevels.includes(4)) {
        navigate('/game4');
      }
      return;
    }
    
    if (levelId === 5) {
      if (unlockedLevels.includes(5)) {
        navigate('/game5');
      }
      return;
    }
  };

  const levels = [
    { id: 1, name: 'Ice', color: '#60a5fa', glowColor: 'rgba(96, 165, 250, 0.9)', completed: false, locked: false, position: { top: '30%', left: '15%' } },
    { id: 2, name: 'Valley', color: '#4ade80', glowColor: 'rgba(74, 222, 128, 0.9)', completed: false, locked: !unlockedLevels.includes(2), position: { top: '60%', left: '30%' } },
    { id: 3, name: 'Center', color: '#a78bfa', glowColor: 'rgba(167, 139, 250, 0.9)', completed: false, locked: !unlockedLevels.includes(3), position: { top: '40%', left: '50%' } },
    { id: 4, name: 'Lava', color: '#fb923c', glowColor: 'rgba(251, 146, 60, 0.9)', completed: false, locked: !unlockedLevels.includes(4), position: { top: '65%', left: '70%' } },
    { id: 5, name: 'Volcano', color: '#f87171', glowColor: 'rgba(248, 113, 113, 0.9)', completed: false, locked: !unlockedLevels.includes(5), position: { top: '35%', left: '85%' } },
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
              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/about-us');
                }}
                className="w-full px-6 py-3 text-left text-cyan-400 hover:text-orange-400 hover:bg-[#1e3a5f]/50 flex items-center gap-3">
                <Info size={18} />
                About Us
              </button>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/game-info');
                }}
                className="w-full px-6 py-3 text-left text-cyan-400 hover:text-orange-400 hover:bg-[#1e3a5f]/50 flex items-center gap-3 border-t border-cyan-400/20"
              >
                <BookOpen size={18} />
                Game Info
              </button>
              <button
                onClick={handleLeaderboardClick}
                className="w-full px-6 py-3 text-left text-cyan-400 hover:text-orange-400 hover:bg-[#1e3a5f]/50 flex items-center gap-3 border-t border-cyan-400/20"
              >
                <Trophy size={18} />
                Leaderboard
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
            onLevelClick={handleLevelClick}
            showUnlockAnimation={showUnlockAnimation && levelToUnlock === level.id}
          />
        ))}
      </div>

      {/* Unlock Animation Overlay */}
      {showUnlockAnimation && levelToUnlock && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 1, repeat: 1 }}
            >
              <Shield size={100} className="mx-auto text-cyan-400 mb-4" />
            </motion.div>
            <h2 
              className="text-5xl font-bold text-cyan-400 mb-2"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              LEVEL {levelToUnlock} UNLOCKED!
            </h2>
            <p 
              className="text-2xl text-white"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              {levels.find(l => l.id === levelToUnlock)?.name} Zone Accessible
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setShowLeaderboard(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0f2847]/95 border-2 border-cyan-400/50 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
              style={{
                clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
              }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-900/50 to-cyan-800/50 p-6 border-b border-cyan-400/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy size={32} className="text-orange-400" />
                  <h2 className="text-3xl font-bold text-cyan-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    LEADERBOARD
                  </h2>
                </div>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-cyan-400 hover:text-orange-400 transition-colors"
                >
                  <X size={28} />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
                {loadingLeaderboard ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="text-cyan-400 text-xl" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                      Loading...
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    {leaderboardData.length === 0 ? (
                      <div className="text-center text-cyan-400 py-8" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        No data available
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {leaderboardData.map((player, index) => (
                          <motion.div
                            key={player.username}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center gap-4 p-4 rounded-lg border ${
                              player.username === username
                                ? 'bg-cyan-900/30 border-cyan-400/60'
                                : 'bg-[#1e3a5f]/30 border-cyan-400/20'
                            } hover:border-cyan-400/40 transition-all`}
                          >
                            {/* Rank */}
                            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-700/20 border border-cyan-400/30">
                              <span className="text-2xl font-bold text-cyan-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                              </span>
                            </div>

                            {/* Player Info */}
                            <div className="flex-1">
                              <div className="text-lg font-semibold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                {player.fullname?.firstname} {player.fullname?.lastname || ''}
                              </div>
                              <div className="text-sm text-cyan-300" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                @{player.username}
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="text-right">
                              <div className="text-2xl font-bold text-orange-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                {player.totalPoints}
                              </div>
                              <div className="text-xs text-cyan-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                Total Points
                              </div>
                              <div className="text-xs text-cyan-300 mt-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                Level {player.levelCompleted}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
