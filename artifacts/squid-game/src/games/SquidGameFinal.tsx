import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onWin: () => void;
  onLose: () => void;
  audio: { playClash: () => void; playTensionDrone: () => void; stopDrone: () => void; initAudio: () => void };
}

type Action = 'MOVE' | 'DODGE' | 'ATTACK';
type DefenderAction = 'BLOCK' | 'ATTACK' | 'REST';
type TurnPhase = 'CHOOSE' | 'RESOLVE' | 'DONE';

interface TurnResult {
  playerAction: Action;
  defenderAction: DefenderAction;
  playerHit: boolean;
  defenderHit: boolean;
  message: string;
}

const SQUID_PATH = "M200,50 L280,120 L280,200 L350,200 L350,280 L280,280 L280,350 L200,420 L120,350 L120,280 L50,280 L50,200 L120,200 L120,120 Z";

export function SquidGameFinal({ onWin, onLose, audio }: Props) {
  const [playerHP, setPlayerHP] = useState(3);
  const [defenderHP, setDefenderHP] = useState(3);
  const [playerPos, setPlayerPos] = useState(0);
  const [turnPhase, setTurnPhase] = useState<TurnPhase>('CHOOSE');
  const [turnHistory, setTurnHistory] = useState<TurnResult[]>([]);
  const [showResult, setShowResult] = useState<'win' | 'lose' | null>(null);
  const [currentResult, setCurrentResult] = useState<TurnResult | null>(null);

  useEffect(() => {
    audio.playTensionDrone();
    return () => { audio.stopDrone(); };
  }, [audio]);

  const resolveAction = useCallback((action: Action) => {
    if (turnPhase !== 'CHOOSE') return;

    const defActions: DefenderAction[] = ['BLOCK', 'ATTACK', 'REST'];
    const weights = action === 'ATTACK' ? [0.5, 0.3, 0.2] : action === 'MOVE' ? [0.3, 0.5, 0.2] : [0.2, 0.4, 0.4];
    const rand = Math.random();
    let cumulative = 0;
    let defAction: DefenderAction = 'REST';
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (rand < cumulative) { defAction = defActions[i]; break; }
    }

    let playerHit = false;
    let defenderHit = false;
    let message = '';
    let newPlayerHP = playerHP;
    let newDefenderHP = defenderHP;
    let newPlayerPos = playerPos;

    if (action === 'MOVE') {
      if (defAction === 'ATTACK') {
        playerHit = true;
        newPlayerHP--;
        message = 'You tried to advance but got hit!';
      } else {
        newPlayerPos = Math.min(5, playerPos + 1);
        message = defAction === 'BLOCK' ? 'You pushed past the block!' : 'You advanced freely!';
      }
    } else if (action === 'ATTACK') {
      if (defAction === 'BLOCK') {
        message = 'Your attack was blocked!';
      } else if (defAction === 'ATTACK') {
        playerHit = Math.random() < 0.5;
        defenderHit = !playerHit;
        if (playerHit) { newPlayerHP--; message = 'Clash! The defender overpowers you!'; }
        else { newDefenderHP--; message = 'Clash! You land a hit!'; }
      } else {
        defenderHit = true;
        newDefenderHP--;
        message = 'Direct hit on the defender!';
      }
    } else {
      if (defAction === 'ATTACK') {
        message = 'You dodged the attack!';
      } else {
        message = defAction === 'BLOCK' ? 'Both players cautious...' : 'A tense standoff...';
      }
    }

    if (playerHit || defenderHit || action === 'ATTACK') {
      audio.playClash();
    }

    const result: TurnResult = { playerAction: action, defenderAction: defAction, playerHit, defenderHit, message };
    setCurrentResult(result);
    setTurnHistory(prev => [...prev, result]);
    setPlayerHP(newPlayerHP);
    setDefenderHP(newDefenderHP);
    setPlayerPos(newPlayerPos);
    setTurnPhase('RESOLVE');

    setTimeout(() => {
      if (newPlayerHP <= 0) {
        audio.stopDrone();
        setShowResult('lose');
        setTurnPhase('DONE');
        setTimeout(onLose, 1500);
      } else if (newDefenderHP <= 0 || newPlayerPos >= 5) {
        audio.stopDrone();
        setShowResult('win');
        setTurnPhase('DONE');
        setTimeout(onWin, 1500);
      } else {
        setTurnPhase('CHOOSE');
        setCurrentResult(null);
      }
    }, 2000);
  }, [turnPhase, playerHP, defenderHP, playerPos, onWin, onLose]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/40 to-black/90" />

      <div className="z-10 flex flex-col items-center gap-4 w-full max-w-lg px-4">
        <div className="flex justify-between items-center w-full">
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-squid-teal/30">
            <span className="text-zinc-400 font-mono text-xs uppercase block">You (Attacker)</span>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`w-6 h-6 rounded-full border-2 ${i < playerHP ? 'bg-squid-teal border-squid-teal shadow-[0_0_8px_rgba(0,229,255,0.5)]' : 'bg-zinc-800 border-zinc-700'}`} />
              ))}
            </div>
          </div>
          <div className="text-zinc-600 font-bold text-lg">VS</div>
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-red-500/30">
            <span className="text-zinc-400 font-mono text-xs uppercase block">Defender</span>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`w-6 h-6 rounded-full border-2 ${i < defenderHP ? 'bg-red-500 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-zinc-800 border-zinc-700'}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="relative w-full" style={{ height: 260 }}>
          <svg viewBox="0 0 400 470" className="w-full h-full opacity-30">
            <path d={SQUID_PATH} fill="none" stroke="#e5e5e5" strokeWidth="3" strokeDasharray="8 4" />
          </svg>

          <motion.div
            className="absolute w-8 flex flex-col items-center"
            animate={{ left: `${25 + playerPos * 10}%`, bottom: `${15 + playerPos * 12}%` }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="w-5 h-5 rounded-full bg-orange-200" />
            <div className="w-6 h-7 bg-squid-green-light rounded-t-sm -mt-1 flex items-center justify-center">
              <span className="text-[6px] font-bold text-black">456</span>
            </div>
            {currentResult?.playerHit && (
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 2 }}
                className="absolute -top-4 text-red-500 font-bold text-xl"
              >
                HIT!
              </motion.div>
            )}
          </motion.div>

          <motion.div
            className="absolute w-8 flex flex-col items-center"
            style={{ right: '25%', top: '15%' }}
            animate={{ x: currentResult?.defenderHit ? [-5, 5, -5, 0] : 0 }}
          >
            <div className="w-5 h-5 rounded-full bg-orange-200" />
            <div className="w-6 h-7 bg-red-700 rounded-t-sm -mt-1 flex items-center justify-center">
              <span className="text-[6px] font-bold text-white">DEF</span>
            </div>
            {currentResult?.defenderHit && (
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 2 }}
                className="absolute -top-4 text-squid-teal font-bold text-xl"
              >
                HIT!
              </motion.div>
            )}
          </motion.div>

          <div className="absolute bottom-0 left-0 w-full flex justify-center">
            <div className="flex gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`w-4 h-2 rounded-sm ${i <= playerPos ? 'bg-squid-teal/60' : 'bg-zinc-800'}`} />
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-black/60 backdrop-blur-md px-4 py-3 rounded-lg border border-white/10 text-center w-full"
            >
              <p className="text-zinc-300 font-mono text-sm">{currentResult.message}</p>
              <p className="text-zinc-600 font-mono text-xs mt-1">
                You: {currentResult.playerAction} | Defender: {currentResult.defenderAction}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {turnPhase === 'CHOOSE' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 pointer-events-auto"
          >
            <button
              onClick={() => resolveAction('MOVE')}
              className="px-6 py-4 rounded-lg font-bold text-sm bg-squid-teal/20 border-2 border-squid-teal text-squid-teal hover:bg-squid-teal/30 active:scale-95 transition-all"
            >
              <span className="block text-2xl mb-1">⬆</span>
              MOVE
            </button>
            <button
              onClick={() => resolveAction('DODGE')}
              className="px-6 py-4 rounded-lg font-bold text-sm bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500/30 active:scale-95 transition-all"
            >
              <span className="block text-2xl mb-1">↔</span>
              DODGE
            </button>
            <button
              onClick={() => resolveAction('ATTACK')}
              className="px-6 py-4 rounded-lg font-bold text-sm bg-red-500/20 border-2 border-red-500 text-red-400 hover:bg-red-500/30 active:scale-95 transition-all"
            >
              <span className="block text-2xl mb-1">⚔</span>
              ATTACK
            </button>
          </motion.div>
        )}

        {turnPhase === 'RESOLVE' && (
          <div className="text-zinc-500 font-mono text-xs animate-pulse">Resolving...</div>
        )}
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"
        >
          <span className={`text-5xl font-black tracking-widest ${showResult === 'win' ? 'text-squid-teal text-glow-teal' : 'text-red-500'}`}>
            {showResult === 'win' ? 'ATTACKER WINS!' : 'DEFENDER WINS!'}
          </span>
        </motion.div>
      )}
    </div>
  );
}
