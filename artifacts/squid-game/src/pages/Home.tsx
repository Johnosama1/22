import { AnimatePresence } from 'framer-motion';
import { useGameEngine, ROUND_INFO } from '@/hooks/use-game-engine';
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

  const roundInfo = ROUND_INFO[currentRound];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black selection:bg-squid-pink/30">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}squid-game-bg.png)`,
          opacity: gamePhase === 'LANDING' ? 1 : 0.15
        }}
      />

      <AnimatePresence mode="wait">
        {gamePhase === 'LANDING' && (
          <LandingScreen key="landing" startGame={startGame} returnToMenu={returnToMenu} />
        )}
        {gamePhase === 'ANNOUNCING' && (
          <AnnouncementScreen
            key={`announce-${currentRound}`}
            count={announcementCount}
            roundNumber={currentRound}
            roundName={roundInfo.name}
            announcementText={roundInfo.announcement}
          />
        )}
        {gamePhase === 'LOST' && (
          <LoseScreen key="lose" startGame={startGame} returnToMenu={returnToMenu} roundName={roundInfo.name} />
        )}
        {gamePhase === 'WON' && (
          <WinScreen
            key="win"
            currentRound={currentRound}
            roundName={roundInfo.name}
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
  );
}
