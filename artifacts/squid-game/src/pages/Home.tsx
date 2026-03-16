import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameEngine } from '@/hooks/use-game-engine';
import { LandingScreen, AnnouncementScreen, LoseScreen, WinScreen, RewardScreen, GrandVictoryScreen } from './GameScreens';
import { RedLightGreenLight } from '@/games/RedLightGreenLight';
import { DalgonaCandy } from '@/games/DalgonaCandy';
import { TugOfWar } from '@/games/TugOfWar';
import { Marbles } from '@/games/Marbles';
import { GlassBridge } from '@/games/GlassBridge';
import { SquidGameFinal } from '@/games/SquidGameFinal';

export default function Home() {
  const {
    gamePhase,
    currentRound,
    announcementCount,
    audio,
    startGame,
    handleRoundWin,
    handleRoundLose,
    advanceToNextRound,
    takeReward,
    returnToMenu,
  } = useGameEngine();

  useEffect(() => {
    audio.playMusic();
    return () => { audio.stopMusic(); };
  }, [audio.playMusic, audio.stopMusic]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-950 selection:bg-squid-pink/30">
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px)',
      }} />

      <div className="relative w-full h-full max-w-[480px] mx-auto bg-black shadow-[0_0_80px_rgba(0,0,0,0.8)]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${import.meta.env.BASE_URL}squid-game-bg.png)`,
            opacity: gamePhase === 'LANDING' ? 1 : 0.15
          }}
        />

        <button
          onClick={audio.toggleMute}
          className="absolute top-4 right-4 z-[60] w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-zinc-300 hover:bg-black/80 transition-colors"
          aria-label={audio.isMuted ? 'Unmute' : 'Mute'}
        >
          {audio.isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>

        <AnimatePresence mode="wait">
          {gamePhase === 'LANDING' && (
            <LandingScreen key="landing" startGame={startGame} returnToMenu={returnToMenu} />
          )}
          {gamePhase === 'ANNOUNCING' && (
            <AnnouncementScreen
              key={`announce-${currentRound}`}
              count={announcementCount}
              roundNumber={currentRound}
            />
          )}
          {gamePhase === 'LOST' && (
            <LoseScreen key="lose" startGame={startGame} currentRound={currentRound} />
          )}
          {gamePhase === 'WON' && (
            <WinScreen
              key="win"
              currentRound={currentRound}
              onTakeReward={takeReward}
              onContinue={advanceToNextRound}
            />
          )}
          {gamePhase === 'REWARD' && (
            <RewardScreen key="reward" currentRound={currentRound} returnToMenu={returnToMenu} />
          )}
          {gamePhase === 'GRAND_VICTORY' && (
            <GrandVictoryScreen key="grand-victory" returnToMenu={returnToMenu} />
          )}
        </AnimatePresence>

        {gamePhase === 'PLAYING' && (
          <div className="absolute inset-0 flex flex-col">
            {currentRound === 1 && (
              <RedLightGreenLight
                key="rlgl"
                onWin={handleRoundWin}
                onLose={handleRoundLose}
                audio={audio}
              />
            )}
            {currentRound === 2 && (
              <DalgonaCandy
                key="dalgona"
                onWin={handleRoundWin}
                onLose={handleRoundLose}
                audio={audio}
              />
            )}
            {currentRound === 3 && (
              <TugOfWar
                key="tow"
                onWin={handleRoundWin}
                onLose={handleRoundLose}
                audio={audio}
              />
            )}
            {currentRound === 4 && (
              <Marbles
                key="marbles"
                onWin={handleRoundWin}
                onLose={handleRoundLose}
                audio={audio}
              />
            )}
            {currentRound === 5 && (
              <GlassBridge
                key="glass"
                onWin={handleRoundWin}
                onLose={handleRoundLose}
                audio={audio}
              />
            )}
            {currentRound === 6 && (
              <SquidGameFinal
                key="final"
                onWin={handleRoundWin}
                onLose={handleRoundLose}
                audio={audio}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
