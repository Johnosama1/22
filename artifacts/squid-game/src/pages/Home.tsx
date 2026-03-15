import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameEngine } from '@/hooks/use-game-engine';
import { Character } from '@/components/Character';
import { Doll } from '@/components/Doll';
import { LandingScreen, AnnouncementScreen, LoseScreen, WinScreen, RewardScreen, NextRoundScreen } from './GameScreens';
import { NeonButton } from '@/components/UIComponents';

export default function Home() {
  const {
    gameState,
    setGameState,
    lightState,
    players,
    timeLeft,
    announcementCount,
    startGame,
    handleUserMove
  } = useGameEngine();

  // Determine track tint based on light state
  const isRed = lightState === 'RED';

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black selection:bg-squid-pink/30">
      
      {/* Base Background Image (Persists across states, dimmed in game) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ 
          backgroundImage: `url(${import.meta.env.BASE_URL}squid-game-bg.png)`,
          opacity: gameState === 'LANDING' ? 1 : 0.2
        }}
      />

      {/* Screen Overlays */}
      <AnimatePresence mode="wait">
        {gameState === 'LANDING' && (
          <LandingScreen key="landing" startGame={startGame} setGameState={setGameState} />
        )}
        {gameState === 'ANNOUNCING' && (
          <AnnouncementScreen key="announce" count={announcementCount} />
        )}
        {gameState === 'LOST' && (
          <LoseScreen key="lose" startGame={startGame} setGameState={setGameState} />
        )}
        {gameState === 'WON' && (
          <WinScreen key="win" startGame={startGame} setGameState={setGameState} />
        )}
        {gameState === 'REWARD' && (
          <RewardScreen key="reward" setGameState={setGameState} />
        )}
        {gameState === 'NEXT_ROUND' && (
          <NextRoundScreen key="next-round" setGameState={setGameState} />
        )}
      </AnimatePresence>

      {/* Main Game Arena */}
      <div className="absolute inset-0 flex flex-col pointer-events-none">
        
        {/* Sky/Atmosphere Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-b transition-colors duration-500 z-0 ${isRed ? 'from-red-900/40 to-transparent' : 'from-squid-teal/10 to-transparent'}`} />
        
        {/* Track / Field Area */}
        <div className="absolute bottom-0 w-full h-[80%] perspective-[1000px] z-10">
          <div 
            className="absolute inset-0 bg-squid-dirt shadow-[inset_0_50px_100px_rgba(0,0,0,0.8)]"
            style={{ transformOrigin: 'bottom', transform: 'rotateX(40deg) scale(1.5)' }}
          >
            {/* Grid lines on dirt */}
            <div className="w-full h-full bg-stripes opacity-20" />
            
            {/* Finish Line */}
            <div className="absolute top-[20%] w-full h-4 bg-squid-pink/80 shadow-[0_0_20px_rgba(255,10,120,0.8)]" />
          </div>
          
          {/* Game Entities (Only render if not on landing/reward screens to save performance) */}
          {(gameState === 'PLAYING' || gameState === 'ANNOUNCING') && (
            <div className="absolute inset-0">
              <Doll lightState={lightState} />
              
              <div className="relative w-full h-full max-w-5xl mx-auto">
                {players.map((player) => (
                  <Character key={player.id} player={player} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Playing UI overlay (Timers, Buttons) */}
      <AnimatePresence>
        {gameState === 'PLAYING' && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute inset-0 z-40 pointer-events-none flex flex-col justify-between p-6"
          >
            {/* Top Bar: Timer and Light Indicator */}
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

            {/* Bottom Bar: Controls */}
            <div className="flex justify-center pb-8 pointer-events-auto">
              <button
                onPointerDown={handleUserMove}
                className={`
                  relative px-16 py-6 rounded-full font-black text-3xl tracking-widest uppercase transition-all duration-100 active:scale-95
                  ${isRed 
                    ? 'bg-zinc-800 text-zinc-500 border-b-4 border-zinc-900 shadow-inner' 
                    : 'bg-squid-teal text-black border-b-8 border-teal-800 hover:brightness-110 hover:shadow-[0_0_40px_rgba(0,229,255,0.4)]'
                  }
                `}
              >
                MOVE
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-mono text-white/50 tracking-normal whitespace-nowrap hidden md:block">
                  Press SPACE or CLICK
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen edge alert visual when red light */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 shadow-[inset_0_0_100px_rgba(220,38,38,0.3)] z-30
          ${gameState === 'PLAYING' && isRed ? 'opacity-100' : 'opacity-0'}
        `}
      />
    </div>
  );
}
