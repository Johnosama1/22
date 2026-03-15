import { motion } from 'framer-motion';
import { PlayerData } from '@/hooks/use-game-engine';
import { cn } from '@/lib/utils';

interface CharacterProps {
  player: PlayerData;
}

export function Character({ player }: CharacterProps) {
  const isEliminated = player.status === 'ELIMINATED';
  const isFinished = player.status === 'FINISHED';

  return (
    <motion.div
      className="absolute bottom-0 z-10 flex flex-col items-center justify-end"
      initial={{ left: `${(parseInt(player.id.replace('ai-', '')) || 0) * 8 + 5}%`, bottom: '0%' }}
      animate={{ 
        bottom: `${player.progress * 0.8}%`, // Max 80% to keep below doll
        opacity: isEliminated ? 0.3 : 1,
        scale: isFinished ? 0.8 : 1, // Shrink slightly in distance
      }}
      transition={{ 
        type: 'tween', 
        ease: 'linear', 
        duration: player.isUser ? 0.1 : 0.2 // faster transition for user responsiveness
      }}
      style={{
        zIndex: Math.floor(100 - player.progress) // Closer players render on top
      }}
    >
      <div className={cn(
        "relative flex flex-col items-center transition-all duration-300",
        isEliminated && "grayscale brightness-50"
      )}>
        {/* Head */}
        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-orange-200 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.4)] z-20" />
        
        {/* Body (Tracksuit) */}
        <div className={cn(
          "w-8 h-10 md:w-10 md:h-12 rounded-t-xl relative flex justify-center pt-2 shadow-xl overflow-hidden -mt-1 z-10",
          player.isUser ? "bg-squid-teal" : "bg-squid-green-light"
        )}>
          {/* Jacket detail */}
          <div className="absolute w-[2px] h-full bg-white/40 left-1/2 -translate-x-1/2 top-0" />
          
          {/* Player Number Bib */}
          <div className="w-5 h-3 md:w-6 md:h-4 bg-white/90 rounded-[2px] text-[6px] md:text-[8px] font-mono text-black font-bold flex items-center justify-center z-10 shadow-sm border border-black/10">
            {player.number}
          </div>
        </div>

        {/* Legs */}
        <div className="flex gap-1.5 -mt-1 z-0">
          <div className={cn("w-3 h-7 md:w-4 md:h-8 rounded-b-md", player.isUser ? "bg-squid-teal" : "bg-squid-green-light")} />
          <div className={cn("w-3 h-7 md:w-4 md:h-8 rounded-b-md", player.isUser ? "bg-squid-teal" : "bg-squid-green-light")} />
        </div>

        {/* Elimination blood effect */}
        {isEliminated && (
          <motion.div 
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-red-600 rounded-full blur-md z-30 pointer-events-none mix-blend-overlay"
          />
        )}
        
        {/* Player Indicator (Arrow) */}
        {player.isUser && !isEliminated && (
          <motion.div 
            animate={{ y: [0, -5, 0] }} 
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute -top-6 text-squid-pink drop-shadow-[0_0_5px_rgba(255,10,120,0.8)]"
          >
            ▼
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
