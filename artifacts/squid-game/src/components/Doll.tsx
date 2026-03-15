import { motion } from 'framer-motion';
import { LightState } from '@/games/RedLightGreenLight';

interface DollProps {
  lightState: LightState;
}

export function Doll({ lightState }: DollProps) {
  const isRedLight = lightState === 'RED';

  return (
    <div className="absolute top-[10%] left-1/2 -translate-x-1/2 z-0 flex flex-col items-center perspective-1000">
      <motion.div
        animate={{ rotateY: isRedLight ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative transform-style-3d w-20 h-20 md:w-32 md:h-32"
      >
        {/* Front of Doll (Facing away during green light) */}
        <div className="absolute inset-0 backface-hidden bg-[#222] rounded-full overflow-hidden shadow-2xl flex items-center justify-center">
          {/* Hairback */}
          <div className="w-full h-full bg-black" />
        </div>

        {/* Back of Doll (Facing players during red light -> rotateY(180) makes it visible) */}
        <div 
          className="absolute inset-0 backface-hidden rounded-full bg-orange-100 overflow-hidden shadow-2xl border-4 border-black"
          style={{ transform: 'rotateY(180deg)' }}
        >
          {/* Scary Face */}
          <div className="relative w-full h-full pt-4 md:pt-6 px-3">
            {/* Eyes */}
            <div className="flex justify-between w-full px-2 md:px-4">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-red-600 rounded-full shadow-[0_0_10px_red] animate-pulse" />
              <div className="w-3 h-3 md:w-4 md:h-4 bg-red-600 rounded-full shadow-[0_0_10px_red] animate-pulse" />
            </div>
            {/* Mouth */}
            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-4 h-1 md:w-6 md:h-1.5 bg-black rounded-full" />
            {/* Hair front */}
            <div className="absolute top-0 inset-x-0 h-6 bg-black rounded-b-full opacity-90" />
          </div>
        </div>
      </motion.div>

      {/* Body / Dress */}
      <div className="w-24 h-32 md:w-40 md:h-48 bg-orange-500 mt-[-10px] rounded-t-3xl shadow-xl border-x-4 border-black relative overflow-hidden flex justify-center">
         <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#ffee58]" />
      </div>
      
      {/* Tree / Post placeholder */}
      <div className="absolute -z-10 bottom-0 w-8 h-full bg-zinc-800 translate-y-1/2" />
    </div>
  );
}
