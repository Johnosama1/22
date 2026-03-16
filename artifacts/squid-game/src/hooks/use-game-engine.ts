import { useState, useCallback, useEffect, useRef } from 'react';
import { useAudio } from './use-audio';

export type GamePhase = 'LANDING' | 'ANNOUNCING' | 'PLAYING' | 'WON' | 'LOST' | 'REWARD' | 'GRAND_VICTORY';

export const ROUND_INFO: Record<number, { name: string; announcement: string }> = {
  1: { name: 'Red Light, Green Light', announcement: 'The first game is...' },
  2: { name: 'Dalgona Candy', announcement: 'The second game is...' },
  3: { name: 'Tug of War', announcement: 'The third game is...' },
  4: { name: 'Marbles', announcement: 'The fourth game is...' },
  5: { name: 'Glass Bridge', announcement: 'The fifth game is...' },
  6: { name: 'Squid Game', announcement: 'The final game is...' },
};

export const TOTAL_ROUNDS = 6;

export function useGameEngine() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('LANDING');
  const [currentRound, setCurrentRound] = useState(1);
  const [announcementCount, setAnnouncementCount] = useState(3);
  const audio = useAudio();

  const startGame = useCallback(() => {
    audio.initAudio();
    audio.playMusic();
    setCurrentRound(1);
    setAnnouncementCount(3);
    setGamePhase('ANNOUNCING');
  }, [audio]);

  const startRound = useCallback((round: number) => {
    audio.initAudio();
    setCurrentRound(round);
    setAnnouncementCount(3);
    setGamePhase('ANNOUNCING');
  }, [audio]);

  const handleRoundWin = useCallback(() => {
    audio.playWin();
    setGamePhase('WON');
  }, [audio]);

  const handleRoundLose = useCallback(() => {
    audio.playShot();
    setGamePhase('LOST');
  }, [audio]);

  const advanceToNextRound = useCallback(() => {
    if (currentRound >= TOTAL_ROUNDS) {
      setGamePhase('GRAND_VICTORY');
    } else {
      startRound(currentRound + 1);
    }
  }, [currentRound, startRound]);

  const takeReward = useCallback(() => {
    setGamePhase('REWARD');
  }, []);

  const returnToMenu = useCallback(() => {
    setCurrentRound(1);
    setGamePhase('LANDING');
  }, []);

  useEffect(() => {
    if (gamePhase !== 'ANNOUNCING') return;
    const timer = setInterval(() => {
      setAnnouncementCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGamePhase('PLAYING');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gamePhase, currentRound]);

  return {
    gamePhase,
    setGamePhase,
    currentRound,
    announcementCount,
    audio,
    startGame,
    startRound,
    handleRoundWin,
    handleRoundLose,
    advanceToNextRound,
    takeReward,
    returnToMenu,
  };
}
