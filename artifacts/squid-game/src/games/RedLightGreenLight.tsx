import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Character } from '@/components/Character';
import { Doll } from '@/components/Doll';

export type LightState = 'GREEN' | 'RED';

export interface PlayerData {
  id: string;
  isUser: boolean;
  number: string;
  progress: number;
  status: 'ALIVE' | 'ELIMINATED' | 'FINISHED';
  speed: number;
  discipline: number;
}

const TOTAL_DISTANCE = 100;
const USER_MOVE_STEP = 2;

interface Props {
  onWin: () => void;
  onLose: () => void;
  audio: {
    playShot: () => void;
    playDollTurn: () => void;
  };
}

export function RedLightGreenLight({ onWin, onLose, audio }: Props) {
  const [lightState, setLightState] = useState<LightState>('GREEN');
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [timeLeft, setTimeLeft] = useState(45);
  const gameLoopRef = useRef<number | null>(null);
  const lightTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRed = lightState === 'RED';
  const doneRef = useRef(false);

  useEffect(() => {
    const initialPlayers: PlayerData[] = Array.from({ length: 11 }).map((_, i) => ({
      id: i === 0 ? 'user' : `ai-${i}`,
      isUser: i === 0,
      number: i === 0 ? '456' : Math.floor(Math.random() * 455).toString().padStart(3, '0'),
      progress: 0,
      status: 'ALIVE',
      speed: 0.2 + Math.random() * 0.4,
      discipline: 0.85 + Math.random() * 0.13,
    }));
    setPlayers(initialPlayers);
    setTimeLeft(45);
    setLightState('GREEN');
    doneRef.current = false;
  }, []);


  useEffect(() => {
    gameLoopRef.current = window.setInterval(() => {
      if (doneRef.current) return;
      setPlayers(currentPlayers => {
        let anyChanges = false;
        const newPlayers = currentPlayers.map(p => {
          if (p.status !== 'ALIVE' || p.isUser) return p;
          let newStatus: PlayerData['status'] = p.status;
          let newProgress = p.progress;
          if (lightState === 'GREEN') {
            newProgress = Math.min(TOTAL_DISTANCE, p.progress + p.speed);
            if (newProgress >= TOTAL_DISTANCE) newStatus = 'FINISHED';
            anyChanges = true;
          } else if (lightState === 'RED') {
            if (Math.random() > p.discipline) {
              newStatus = 'ELIMINATED';
              audio.playShot();
              anyChanges = true;
            }
          }
          return { ...p, status: newStatus, progress: newProgress };
        });
        return anyChanges ? newPlayers : currentPlayers;
      });
      setTimeLeft(t => {
        if (t <= 0.1) {
          doneRef.current = true;
          setTimeout(onLose, 0);
          return 0;
        }
        return t - 0.1;
      });
    }, 100);
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [lightState]);

  useEffect(() => {
    const switchLight = () => {
      setLightState(prev => {
        const next = prev === 'GREEN' ? 'RED' : 'GREEN';
        if (next === 'RED') audio.playDollTurn();
        const duration = next === 'RED' ? 2000 + Math.random() * 2000 : 2000 + Math.random() * 2000;
        lightTimerRef.current = setTimeout(switchLight, duration);
        return next;
      });
    };
    lightTimerRef.current = setTimeout(switchLight, 2500);
    return () => { if (lightTimerRef.current) clearTimeout(lightTimerRef.current); };
  }, []);

  const handleUserMove = useCallback(() => {
    if (doneRef.current) return;
    setPlayers(current => {
      const user = current.find(p => p.isUser);
      if (!user || user.status !== 'ALIVE') return current;
      if (lightState === 'RED') {
        doneRef.current = true;
        audio.playShot();
        setTimeout(onLose, 0);
        return current.map(p => p.isUser ? { ...p, status: 'ELIMINATED' } : p);
      } else {
        const newProgress = Math.min(TOTAL_DISTANCE, user.progress + USER_MOVE_STEP);
        if (newProgress >= TOTAL_DISTANCE) {
          doneRef.current = true;
          setTimeout(onWin, 0);
          return current.map(p => p.isUser ? { ...p, status: 'FINISHED', progress: newProgress } : p);
        }
        return current.map(p => p.isUser ? { ...p, progress: newProgress } : p);
      }
    });
  }, [lightState, onWin, onLose, audio]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleUserMove();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUserMove]);

  return (
    <>
      <div className={`absolute inset-0 bg-gradient-to-b transition-colors duration-500 z-0 ${isRed ? 'from-red-900/40 to-transparent' : 'from-squid-teal/10 to-transparent'}`} />
      <div className="absolute bottom-0 w-full h-[80%] perspective-[1000px] z-10">
        <div
          className="absolute inset-0 bg-squid-dirt shadow-[inset_0_50px_100px_rgba(0,0,0,0.8)]"
          style={{ transformOrigin: 'bottom', transform: 'rotateX(40deg) scale(1.5)' }}
        >
          <div className="w-full h-full bg-stripes opacity-20" />
          <div className="absolute top-[20%] w-full h-4 bg-squid-pink/80 shadow-[0_0_20px_rgba(255,10,120,0.8)]" />
        </div>
        <div className="absolute inset-0">
          <Doll lightState={lightState} />
          <div className="relative w-full h-full max-w-5xl mx-auto">
            {players.map((player) => (
              <Character key={player.id} player={player} />
            ))}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="absolute inset-0 z-40 pointer-events-none flex flex-col justify-between p-6"
      >
        <div className="flex justify-between items-start w-full max-w-7xl mx-auto">
          <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-lg border border-white/10 flex items-center gap-4 shadow-xl">
            <span className="text-zinc-400 font-mono text-sm uppercase">Time Left</span>
            <span className={`text-3xl font-mono font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {timeLeft.toFixed(1)}s
            </span>
          </div>
          <div className="flex gap-2 p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-xl">
            <div className={`w-8 h-8 rounded-full transition-all duration-300 ${!isRed ? 'bg-green-500 shadow-[0_0_20px_#22c55e]' : 'bg-green-950 opacity-30'}`} />
            <div className={`w-8 h-8 rounded-full transition-all duration-300 ${isRed ? 'bg-red-600 shadow-[0_0_20px_#dc2626]' : 'bg-red-950 opacity-30'}`} />
          </div>
        </div>
        <div className="flex justify-center pb-8 pointer-events-auto">
          <button
            onPointerDown={handleUserMove}
            className={`relative px-16 py-6 rounded-full font-black text-3xl tracking-widest uppercase transition-all duration-100 active:scale-95 ${isRed ? 'bg-zinc-800 text-zinc-500 border-b-4 border-zinc-900 shadow-inner' : 'bg-squid-teal text-black border-b-8 border-teal-800 hover:brightness-110 hover:shadow-[0_0_40px_rgba(0,229,255,0.4)]'}`}
          >
            MOVE
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-mono text-white/50 tracking-normal whitespace-nowrap hidden md:block">
              Press SPACE or CLICK
            </span>
          </button>
        </div>
      </motion.div>

      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 shadow-[inset_0_0_100px_rgba(220,38,38,0.3)] z-30 ${isRed ? 'opacity-100' : 'opacity-0'}`} />
    </>
  );
}
