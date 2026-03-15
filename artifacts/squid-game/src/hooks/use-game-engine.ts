import { useState, useEffect, useCallback, useRef } from 'react';
import { useAudio } from './use-audio';

export type GameState = 'LANDING' | 'ANNOUNCING' | 'PLAYING' | 'WON' | 'LOST' | 'REWARD' | 'NEXT_ROUND';
export type LightState = 'GREEN' | 'RED';

export interface PlayerData {
  id: string;
  isUser: boolean;
  number: string;
  progress: number; // 0 to 100
  status: 'ALIVE' | 'ELIMINATED' | 'FINISHED';
  speed: number;
  discipline: number; // 0 to 1, higher means less likely to move on red
}

const TOTAL_DISTANCE = 100;
const USER_MOVE_STEP = 3;

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState>('LANDING');
  const [lightState, setLightState] = useState<LightState>('GREEN');
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds to finish
  const [announcementCount, setAnnouncementCount] = useState(3);
  
  const audio = useAudio();
  const gameLoopRef = useRef<number | null>(null);
  const lightTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Game
  const startGame = useCallback(() => {
    audio.initAudio();
    
    // Generate AI players
    const initialPlayers: PlayerData[] = Array.from({ length: 11 }).map((_, i) => ({
      id: i === 0 ? 'user' : `ai-${i}`,
      isUser: i === 0,
      number: i === 0 ? '456' : Math.floor(Math.random() * 455).toString().padStart(3, '0'),
      progress: 0,
      status: 'ALIVE',
      speed: 0.2 + Math.random() * 0.4, // Random speed
      discipline: 0.7 + Math.random() * 0.3, // High discipline, mostly
    }));

    setPlayers(initialPlayers);
    setTimeLeft(60);
    setLightState('GREEN');
    setAnnouncementCount(3);
    setGameState('ANNOUNCING');
  }, [audio]);

  // Announcement Sequence
  useEffect(() => {
    if (gameState === 'ANNOUNCING') {
      const timer = setInterval(() => {
        setAnnouncementCount((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState('PLAYING');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  // Handle Game Loop (AI Movement & Global Timers)
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      audio.stopDrone();
      return;
    }

    audio.playDrone(lightState === 'RED');

    gameLoopRef.current = window.setInterval(() => {
      setPlayers(currentPlayers => {
        let anyChanges = false;
        const newPlayers = currentPlayers.map(p => {
          if (p.status !== 'ALIVE' || p.isUser) return p;

          let newStatus = p.status;
          let newProgress = p.progress;

          if (lightState === 'GREEN') {
            // AI moves forward
            newProgress = Math.min(TOTAL_DISTANCE, p.progress + p.speed);
            if (newProgress >= TOTAL_DISTANCE) newStatus = 'FINISHED';
            anyChanges = true;
          } else if (lightState === 'RED') {
            // AI has a chance to fail on RED
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
          setGameState('LOST');
          return 0;
        }
        return t - 0.1;
      });

    }, 100);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, lightState, audio]);

  // Handle Light Switching
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const switchLight = () => {
      setLightState(prev => {
        const next = prev === 'GREEN' ? 'RED' : 'GREEN';
        // Red lights are usually shorter (1-3s), Green lights longer (3-5s)
        const duration = next === 'RED' ? 1000 + Math.random() * 2000 : 3000 + Math.random() * 3000;
        lightTimerRef.current = setTimeout(switchLight, duration);
        return next;
      });
    };

    lightTimerRef.current = setTimeout(switchLight, 3000);

    return () => {
      if (lightTimerRef.current) clearTimeout(lightTimerRef.current);
    };
  }, [gameState]);

  // User Action: Move
  const handleUserMove = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    setPlayers(current => {
      const user = current.find(p => p.isUser);
      if (!user || user.status !== 'ALIVE') return current;

      if (lightState === 'RED') {
        // Instant elimination if moving on red
        audio.playShot();
        setGameState('LOST');
        return current.map(p => p.isUser ? { ...p, status: 'ELIMINATED' } : p);
      } else {
        // Advance
        const newProgress = Math.min(TOTAL_DISTANCE, user.progress + USER_MOVE_STEP);
        if (newProgress >= TOTAL_DISTANCE) {
          audio.stopDrone();
          audio.playWin();
          setGameState('WON');
          return current.map(p => p.isUser ? { ...p, status: 'FINISHED', progress: newProgress } : p);
        }
        return current.map(p => p.isUser ? { ...p, progress: newProgress } : p);
      }
    });
  }, [gameState, lightState, audio]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && gameState === 'PLAYING') {
        e.preventDefault();
        handleUserMove();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUserMove, gameState]);

  return {
    gameState,
    setGameState,
    lightState,
    players,
    timeLeft,
    announcementCount,
    startGame,
    handleUserMove
  };
}
