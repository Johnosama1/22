import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function NeonButton({ 
  children, 
  onClick, 
  variant = 'pink',
  className
}: { 
  children: ReactNode; 
  onClick: () => void; 
  variant?: 'pink' | 'teal';
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative px-8 py-4 font-display font-black text-2xl tracking-widest uppercase overflow-hidden rounded-md transition-all duration-300",
        "border-2 bg-black/50 backdrop-blur-sm group",
        variant === 'pink' 
          ? "border-squid-pink text-white hover:bg-squid-pink/20 hover:text-squid-pink hover:shadow-[0_0_30px_rgba(255,10,120,0.6)]" 
          : "border-squid-teal text-white hover:bg-squid-teal/20 hover:text-squid-teal hover:shadow-[0_0_30px_rgba(0,229,255,0.6)]",
        className
      )}
    >
      <span className="relative z-10">{children}</span>
      <div className={cn(
        "absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] opacity-20",
        variant === 'pink' ? "bg-gradient-to-r from-transparent via-squid-pink to-transparent" : "bg-gradient-to-r from-transparent via-squid-teal to-transparent"
      )} />
    </button>
  );
}

export function SquidShapes() {
  return (
    <div className="flex gap-4 md:gap-8 items-center justify-center opacity-80">
      <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-squid-pink rounded-full box-glow-pink" />
      <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-b-[28px] md:border-l-[24px] md:border-r-[24px] md:border-b-[42px] border-l-transparent border-r-transparent border-b-squid-pink filter drop-shadow-[0_0_10px_rgba(255,10,120,0.5)]" />
      <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-squid-pink box-glow-pink" />
    </div>
  );
}

export function LandingCharacter() {
  return (
    <div className="relative flex flex-col items-center">
      <motion.div 
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex flex-col items-center z-10"
      >
        <div className="w-12 h-12 rounded-full bg-orange-200 shadow-[inset_-3px_-3px_6px_rgba(0,0,0,0.3)] z-20" />
        <div className="w-20 h-24 rounded-t-2xl bg-squid-green-light relative flex justify-center pt-4 shadow-2xl overflow-hidden -mt-2 z-10 border border-black/20">
          <div className="absolute w-[3px] h-full bg-black/20 left-1/2 -translate-x-1/2 top-0" />
          <div className="w-12 h-8 bg-white/95 rounded-sm text-sm font-mono text-black font-bold flex items-center justify-center z-10 shadow-md border border-black/10">
            456
          </div>
        </div>
        <div className="flex gap-2 -mt-2 z-0">
          <div className="w-8 h-16 bg-squid-green-light rounded-b-lg border-l border-r border-b border-black/20 shadow-inner" />
          <div className="w-8 h-16 bg-squid-green-light rounded-b-lg border-l border-r border-b border-black/20 shadow-inner" />
        </div>
      </motion.div>
      <div className="w-24 h-4 bg-black/40 rounded-[100%] blur-sm absolute -bottom-2" />
    </div>
  );
}
