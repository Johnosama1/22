import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onWin: () => void;
  onLose: () => void;
  audio: { initAudio: () => void };
}

const TEAM_SIZE = 10;
const WIN_THRESHOLD = 100;
const GAME_TIME = 30;

export function TugOfWar({ onWin, onLose }: Props) {
  const [position, setPosition] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [pullCount, setPullCount] = useState(0);
  const [showResult, setShowResult] = useState<'win' | 'lose' | null>(null);
  const doneRef = useRef(false);
  const lastPullRef = useRef(0);

  useEffect(() => {
    if (doneRef.current) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.1 && !doneRef.current) {
          doneRef.current = true;
          setTimeout(() => {
            if (position <= 0) {
              setShowResult('win');
              setTimeout(onWin, 1500);
            } else {
              setShowResult('lose');
              setTimeout(onLose, 1500);
            }
          }, 0);
          return 0;
        }
        return Math.max(0, t - 0.1);
      });

      setPosition(prev => {
        if (doneRef.current) return prev;
        const enemyForce = 1.5 + Math.random() * 2;
        const teamAIForce = 1.0 + Math.random() * 1.5;
        const drift = enemyForce - teamAIForce;
        const next = prev + drift;
        if (next >= WIN_THRESHOLD) {
          doneRef.current = true;
          setTimeout(() => {
            setShowResult('lose');
            setTimeout(onLose, 1500);
          }, 0);
          return WIN_THRESHOLD;
        }
        if (next <= -WIN_THRESHOLD) {
          doneRef.current = true;
          setTimeout(() => {
            setShowResult('win');
            setTimeout(onWin, 1500);
          }, 0);
          return -WIN_THRESHOLD;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [onWin, onLose, position]);

  const handlePull = useCallback(() => {
    if (doneRef.current) return;
    const now = Date.now();
    const rapid = now - lastPullRef.current < 200;
    lastPullRef.current = now;
    const force = rapid ? 6 : 4;
    setPullCount(c => c + 1);
    setPosition(prev => {
      const next = prev - force;
      if (next <= -WIN_THRESHOLD) {
        doneRef.current = true;
        setTimeout(() => {
          setShowResult('win');
          setTimeout(onWin, 1500);
        }, 0);
        return -WIN_THRESHOLD;
      }
      return next;
    });
  }, [onWin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); handlePull(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePull]);

  const pct = ((position + WIN_THRESHOLD) / (WIN_THRESHOLD * 2)) * 100;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-950/50 to-black/90" />

      <div className="z-10 flex flex-col items-center gap-6 w-full max-w-2xl px-4">
        <div className="flex justify-between items-center w-full">
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
            <span className="text-zinc-400 font-mono text-xs uppercase">Time </span>
            <span className={`text-2xl font-mono font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {timeLeft.toFixed(1)}s
            </span>
          </div>
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
            <span className="text-zinc-400 font-mono text-xs uppercase">Pulls </span>
            <span className="text-2xl font-mono font-bold text-squid-teal">{pullCount}</span>
          </div>
        </div>

        <div className="relative w-full">
          <div className="flex justify-between text-zinc-500 font-mono text-xs mb-1">
            <span className="text-squid-teal">YOUR TEAM</span>
            <span className="text-red-400">ENEMY TEAM</span>
          </div>

          <div className="relative w-full bg-amber-950/60 rounded-lg overflow-hidden border border-amber-800/40 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" style={{ height: 60 }}>
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/30 z-10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[90%] h-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 rounded-full shadow-inner relative">
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow-[0_0_15px_rgba(239,68,68,0.6)]"
                  style={{ left: `${pct}%`, marginLeft: -12 }}
                  animate={{ x: 0 }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-2">
            <span className={`text-xs font-mono ${position < -30 ? 'text-squid-teal' : 'text-zinc-600'}`}>WINNING</span>
            <span className={`text-xs font-mono ${position > 30 ? 'text-red-400' : 'text-zinc-600'}`}>LOSING</span>
          </div>
        </div>

        <div className="relative w-full h-40 bg-gradient-to-b from-sky-900/30 to-amber-950/40 rounded-lg border border-white/5 overflow-hidden">
          <div className="absolute bottom-0 w-full h-2 bg-amber-800/60" />
          <div className="absolute bottom-2 left-[10%] flex gap-1">
            {Array.from({ length: TEAM_SIZE }).map((_, i) => (
              <div key={`team-${i}`} className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-orange-200" />
                <div className="w-4 h-5 bg-squid-green-light rounded-t-sm -mt-0.5" />
              </div>
            ))}
          </div>
          <div className="absolute bottom-2 right-[10%] flex gap-1">
            {Array.from({ length: TEAM_SIZE }).map((_, i) => (
              <div key={`enemy-${i}`} className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-orange-200" />
                <div className="w-4 h-5 bg-squid-green-light rounded-t-sm -mt-0.5" />
              </div>
            ))}
          </div>
          <div className="absolute bottom-6 left-[25%] right-[25%] h-1 bg-amber-600 rounded-full" />
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-zinc-600 font-mono text-[10px] uppercase">High Platform Arena</div>
        </div>

        <div className="flex justify-center pointer-events-auto">
          <button
            onPointerDown={handlePull}
            className="px-16 py-6 rounded-full font-black text-3xl tracking-widest uppercase bg-squid-teal text-black border-b-8 border-teal-800 hover:brightness-110 hover:shadow-[0_0_40px_rgba(0,229,255,0.4)] active:scale-95 active:border-b-4 transition-all duration-75"
          >
            PULL!
            <span className="block text-xs font-mono text-teal-900 tracking-normal mt-1">
              MASH SPACE or CLICK
            </span>
          </button>
        </div>
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"
        >
          <span className={`text-5xl font-black tracking-widest ${showResult === 'win' ? 'text-squid-teal text-glow-teal' : 'text-red-500'}`}>
            {showResult === 'win' ? 'YOUR TEAM WINS!' : 'YOUR TEAM FALLS!'}
          </span>
        </motion.div>
      )}
    </div>
  );
}
