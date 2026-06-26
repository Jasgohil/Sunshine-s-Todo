import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  Music,
  Moon
} from 'lucide-react';

const FocusModePage: React.FC = () => {
  // Timer states
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalDuration, setTotalDuration] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);

  // View states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ambientTheme, setAmbientTheme] = useState<'aurora' | 'nebula' | 'breathing'>('aurora');
  const [bgSound, setBgSound] = useState<'none' | 'rain' | 'forest' | 'lofi'>('none');

  const timerRef = useRef<any>(null);

  // Sync custom time with timer when changed
  useEffect(() => {
    setIsActive(false);
    setTimeLeft(customMinutes * 60);
    setTotalDuration(customMinutes * 60);
  }, [customMinutes]);

  // Handle countdown interval
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            alert('Focus session complete! Take a deep breath and stretch. 🧘');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(customMinutes * 60);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Toggle local fullscreen view overlay
  const toggleFullscreenView = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Ambient themes classes
  const getThemeClasses = () => {
    if (ambientTheme === 'aurora') {
      return 'bg-gradient-to-tr from-green-950/40 via-slate-950 to-blue-950/40';
    }
    if (ambientTheme === 'nebula') {
      return 'bg-gradient-to-tr from-purple-950/40 via-zinc-950 to-rose-950/40';
    }
    return 'bg-[#090909]';
  };

  return (
    <div className="max-w-4xl mx-auto select-none pb-12 h-full flex flex-col justify-between min-h-[480px]">
      
      {/* Distraction-free Workspace Container */}
      <div className="flex-1 bg-card border border-border/60 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden shadow-2xl">
        
        {/* Breathing backdrop animation when active */}
        {isActive && (
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.35, 0.15],
            }}
            transition={{
              repeat: Infinity,
              duration: 8,
              ease: 'easeInOut',
            }}
            className="absolute w-[420px] h-[420px] rounded-full bg-gradient-to-r from-sunshine-gold/20 to-sunshine-orange/15 blur-3xl pointer-events-none z-0"
          ></motion.div>
        )}

        {/* Minimal timer workspace */}
        <div className="text-center space-y-4 z-10">
          <motion.span
            animate={{ opacity: isActive ? [0.6, 1, 0.6] : 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-xs font-black tracking-widest text-sunshine-gold uppercase block"
          >
            DEEP FOCUS ZONE
          </motion.span>
          
          <h2 className="text-6xl md:text-7xl font-extrabold font-serif tracking-tight text-sunshine-textNearWhite">
            {formatTime(timeLeft)}
          </h2>
          
          <p className="text-xs text-sunshine-textMuted max-w-xs mx-auto">
            "Your mind is like water. When it's turbulent, it's difficult to see. When it's calm, everything becomes clear."
          </p>
        </div>

        {/* Quick controls row */}
        <div className="flex items-center gap-5 mt-8 z-10">
          {/* Reset */}
          <button
            onClick={resetTimer}
            className="p-3 rounded-full bg-[#141414] border border-border text-sunshine-textMuted hover:text-sunshine-gold hover:border-sunshine-gold transition-all cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw size={16} />
          </button>

          {/* Play / Pause */}
          <button
            onClick={toggleTimer}
            className="h-14 w-32 rounded-full bg-gradient-to-r from-sunshine-gold to-sunshine-orange text-sunshine-darkBg font-black text-sm tracking-wide shadow-lg shadow-sunshine-gold/20 flex items-center justify-center gap-2 hover:shadow-sunshine-gold/30 transition-all duration-300 transform active:scale-[0.98] cursor-pointer"
          >
            {isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            <span>{isActive ? 'Pause' : 'Start'}</span>
          </button>

          {/* Fullscreen Trigger */}
          <button
            onClick={toggleFullscreenView}
            className="p-3 rounded-full bg-[#141414] border border-border text-sunshine-textMuted hover:text-sunshine-gold hover:border-sunshine-gold transition-all cursor-pointer"
            title="Enter Fullscreen Focus"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        {/* Custom duration select slider */}
        {!isActive && (
          <div className="mt-8 flex items-center gap-4 w-64 z-10">
            <span className="text-[10px] font-bold text-sunshine-textMuted uppercase tracking-wider">Minutes:</span>
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={customMinutes}
              onChange={(e) => setCustomMinutes(Number(e.target.value))}
              className="flex-1 bg-border h-1 rounded-lg cursor-pointer accent-sunshine-gold"
            />
            <span className="text-xs font-bold text-sunshine-gold w-10 text-right">{customMinutes}m</span>
          </div>
        )}
      </div>

      {/* FULLSCREEN OVERLAY PORTAL (Framer Motion!) */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 flex flex-col justify-between p-8 select-none overflow-hidden text-foreground ${getThemeClasses()}`}
          >
            {/* Ambient Aurora Orbs */}
            {isActive && ambientTheme === 'aurora' && (
              <>
                <motion.div
                  animate={{
                    x: [0, 40, -20, 0],
                    y: [0, -30, 40, 0],
                  }}
                  transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
                  className="absolute top-[10%] left-[20%] w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"
                ></motion.div>
                <motion.div
                  animate={{
                    x: [0, -30, 40, 0],
                    y: [0, 40, -30, 0],
                  }}
                  transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
                  className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"
                ></motion.div>
              </>
            )}

            {/* Ambient Nebula Orbs */}
            {isActive && ambientTheme === 'nebula' && (
              <>
                <motion.div
                  animate={{
                    x: [0, 50, -30, 0],
                    y: [0, -40, 50, 0],
                  }}
                  transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
                  className="absolute top-[15%] right-[20%] w-[380px] h-[380px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none"
                ></motion.div>
                <motion.div
                  animate={{
                    x: [0, -40, 30, 0],
                    y: [0, 30, -40, 0],
                  }}
                  transition={{ repeat: Infinity, duration: 14, ease: 'linear' }}
                  className="absolute bottom-[10%] left-[15%] w-[350px] h-[350px] rounded-full bg-rose-500/10 blur-[120px] pointer-events-none"
                ></motion.div>
              </>
            )}

            {/* Starry backdrop visualizer if active */}
            {isActive && (
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
            )}

            {/* Fullscreen Header: Controls */}
            <div className="flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <Moon className="text-sunshine-gold animate-pulse" size={20} />
                <span className="text-xs font-black tracking-widest bg-gradient-to-r from-sunshine-gold to-sunshine-orange bg-clip-text text-transparent">
                  SUNSHINE SILENCE
                </span>
              </div>

              {/* Theme & Audio Selectors */}
              <div className="flex items-center gap-3 bg-black/40 border border-white/5 px-4 py-2 rounded-2xl backdrop-blur-md">
                {/* Theme Selector */}
                <div className="flex items-center gap-2 border-r border-white/10 pr-3">
                  <Sparkles size={12} className="text-sunshine-gold" />
                  <select
                    value={ambientTheme}
                    onChange={(e) => setAmbientTheme(e.target.value as any)}
                    className="bg-transparent border-none text-[10px] font-bold uppercase text-sunshine-textNearWhite focus:outline-none cursor-pointer"
                  >
                    <option value="aurora" className="bg-card">Aurora theme</option>
                    <option value="nebula" className="bg-card">Nebula theme</option>
                    <option value="breathing" className="bg-card">Dark theme</option>
                  </select>
                </div>

                {/* Sound Selector */}
                <div className="flex items-center gap-2">
                  <Volume2 size={12} className="text-sunshine-orange" />
                  <select
                    value={bgSound}
                    onChange={(e) => setBgSound(e.target.value as any)}
                    className="bg-transparent border-none text-[10px] font-bold uppercase text-sunshine-textNearWhite focus:outline-none cursor-pointer"
                  >
                    <option value="none" className="bg-card">No sound</option>
                    <option value="rain" className="bg-card">Rain shower</option>
                    <option value="forest" className="bg-card">Quiet forest</option>
                    <option value="lofi" className="bg-card">Deep Lo-Fi</option>
                  </select>
                </div>
              </div>

              {/* Exit Fullscreen */}
              <button
                onClick={toggleFullscreenView}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-sunshine-textNearWhite hover:bg-white/10 hover:text-sunshine-gold transition-all cursor-pointer"
                title="Exit Fullscreen"
              >
                <Minimize2 size={16} />
              </button>
            </div>

            {/* Giant Center Timer */}
            <div className="my-auto flex flex-col items-center justify-center text-center space-y-6 z-10">
              <motion.span
                animate={{ scale: isActive ? [1, 1.03, 1] : 1 }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="text-md font-black tracking-[0.25em] text-sunshine-gold uppercase"
              >
                {isActive ? 'SHHH... IN FOCUS' : 'READY TO FOCUS'}
              </motion.span>
              
              <motion.h1
                layoutId="fullscreenTimer"
                className="text-8xl md:text-[10rem] font-bold font-serif tracking-tighter text-sunshine-textNearWhite leading-none"
              >
                {formatTime(timeLeft)}
              </motion.h1>

              {/* Breathing indicator label */}
              {isActive && (
                <motion.p
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                  className="text-xs font-semibold text-sunshine-textMuted tracking-wider italic"
                >
                  Inhale confidence. Exhale distractions.
                </motion.p>
              )}
            </div>

            {/* Fullscreen Footer: Controls */}
            <div className="flex justify-center items-center gap-6 z-10">
              {/* Reset */}
              <button
                onClick={resetTimer}
                className="p-4 rounded-full bg-white/5 border border-white/10 text-sunshine-textMuted hover:bg-white/10 hover:text-sunshine-gold transition-all cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw size={20} />
              </button>

              {/* Play/Pause */}
              <button
                onClick={toggleTimer}
                className="h-16 w-40 rounded-full bg-gradient-to-r from-sunshine-gold to-sunshine-orange text-sunshine-darkBg font-black text-sm tracking-wide shadow-lg shadow-sunshine-gold/20 flex items-center justify-center gap-3 hover:shadow-sunshine-gold/30 transition-all duration-300 transform active:scale-[0.98] cursor-pointer"
              >
                {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                <span>{isActive ? 'Pause' : 'Resume'}</span>
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default FocusModePage;
