import { motion, AnimatePresence } from 'framer-motion';
import { GameState } from '@/hooks/use-game-engine';
import { NeonButton, SquidShapes, LandingCharacter } from '@/components/UIComponents';

interface ScreenProps {
  startGame: () => void;
  setGameState: (state: GameState) => void;
}

export function LandingScreen({ startGame }: ScreenProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0, transition: { duration: 1 } }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center crt-overlay"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0" />
      
      <div className="z-10 flex flex-col items-center gap-12 text-center px-4 max-w-2xl">
        <SquidShapes />
        
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
            Welcome to the <br/>
            <span className="text-squid-pink text-glow-pink">Games</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 font-mono">
            Player 456, your debt is overwhelming.
            <br />Survive, and win the ultimate prize.
          </p>
        </div>

        <div className="py-4">
          <LandingCharacter />
        </div>

        <NeonButton onClick={startGame} variant="pink" className="mt-4 scale-110">
          PLAY
        </NeonButton>
      </div>
    </motion.div>
  );
}

function TypewriterText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05, duration: 0.05 }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

function MaskedGuard() {
  return (
    <div className="relative flex flex-col items-center">
      <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-b from-red-700 to-red-900 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] border-2 border-red-600">
        <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-black/80 flex items-center justify-center">
          <div className="w-8 h-8 md:w-12 md:h-12 border-3 border-red-500 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
        </div>
      </div>
      <div className="w-24 h-16 md:w-32 md:h-20 bg-gradient-to-b from-red-800 to-red-900 rounded-b-lg -mt-2 shadow-xl" />
      <div className="absolute -bottom-2 w-16 h-4 bg-black/30 rounded-full blur-sm" />
    </div>
  );
}

export function AnnouncementScreen({ count }: { count: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black crt-overlay"
    >
      <div className="max-w-3xl px-8 text-center space-y-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <MaskedGuard />
        </motion.div>
        
        <div className="space-y-4">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-4xl font-mono text-white leading-relaxed"
          >
            <TypewriterText text="The first game is..." />
          </motion.h2>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <span className="text-squid-teal font-display font-black tracking-widest text-glow-teal text-3xl md:text-5xl uppercase block">
              Red Light, Green Light
            </span>
          </motion.div>
        </div>

        <motion.div 
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-6xl md:text-8xl font-black text-squid-pink text-glow-pink"
        >
          {count}
        </motion.div>
      </div>
    </motion.div>
  );
}

export function LoseScreen({ startGame }: ScreenProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.1 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 crt-overlay"
    >
      <div className="text-center space-y-8 px-6">
        <h2 className="text-5xl md:text-7xl font-black text-red-600 tracking-widest uppercase shadow-red-500/50 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">
          ELIMINATED
        </h2>
        <p className="text-xl md:text-2xl text-zinc-400 font-mono">
          You lost the game.<br/>All your money is gone.
        </p>
        <div className="pt-8">
          <NeonButton onClick={startGame} variant="pink">
            Play Again
          </NeonButton>
        </div>
      </div>
    </motion.div>
  );
}

export function WinScreen({ startGame, setGameState }: ScreenProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-squid-green/95 backdrop-blur-md crt-overlay"
    >
      <div className="text-center space-y-12 max-w-2xl px-6">
        <SquidShapes />
        <div className="space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase drop-shadow-xl">
            Congratulations
          </h2>
          <p className="text-xl md:text-2xl text-emerald-200 font-mono">
            You survived the first game.
          </p>
        </div>

        <div className="bg-black/40 p-8 rounded-xl border border-white/10 space-y-8">
          <p className="text-lg md:text-xl text-white">
            Do you want to take the money and leave, or continue playing for a bigger reward?
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <NeonButton onClick={() => setGameState('REWARD')} variant="pink">
              YES — Take money
            </NeonButton>
            <NeonButton 
              onClick={() => setGameState('NEXT_ROUND')} 
              variant="teal"
            >
              NO — Continue
            </NeonButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function NextRoundScreen({ setGameState }: { setGameState: (s: GameState) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 crt-overlay"
    >
      <div className="text-center space-y-12 max-w-2xl px-6">
        <SquidShapes />
        <div className="space-y-6">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase drop-shadow-xl text-glow-teal">
            Next Round<br/>Coming Soon...
          </h2>
          <p className="text-xl md:text-2xl text-zinc-400 font-mono">
            The games will continue. Stay alert.
          </p>
        </div>
        <div className="pt-8">
          <NeonButton onClick={() => setGameState('LANDING')} variant="pink">
            Return to Menu
          </NeonButton>
        </div>
      </div>
    </motion.div>
  );
}

export function RewardScreen({ setGameState }: { setGameState: (s: GameState) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black crt-overlay"
    >
      <div className="text-center space-y-8">
        <motion.div 
          animate={{ rotateY: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 mx-auto bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(250,204,21,0.5)] border-4 border-yellow-600"
        >
          <span className="text-5xl font-bold text-yellow-700">₩</span>
        </motion.div>
        
        <h2 className="text-4xl md:text-6xl font-black text-yellow-400 tracking-widest">
          45.6 BILLION WON
        </h2>
        <p className="text-xl text-zinc-400 font-mono">Transferred to your account.</p>
        
        <div className="pt-8">
          <NeonButton onClick={() => setGameState('LANDING')} variant="pink">
            Return Home
          </NeonButton>
        </div>
      </div>
    </motion.div>
  );
}
