import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onWin: () => void;
  onLose: () => void;
  audio: { playMarbleClink: () => void; initAudio: () => void };
}

const TOTAL_MARBLES = 20;
const GAME_TIME = 90;

type RoundPhase = 'BET' | 'GUESS' | 'REVEAL' | 'RESULT';

export function Marbles({ onWin, onLose, audio }: Props) {
  const [playerMarbles, setPlayerMarbles] = useState(10);
  const [opponentMarbles, setOpponentMarbles] = useState(10);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [bet, setBet] = useState(1);
  const [guess, setGuess] = useState<'odd' | 'even' | null>(null);
  const [opponentHand, setOpponentHand] = useState(0);
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('BET');
  const [roundResult, setRoundResult] = useState<string>('');
  const [showFinal, setShowFinal] = useState<'win' | 'lose' | null>(null);
  const doneRef = useRef(false);
  const playerMarblesRef = useRef(10);
  const opponentMarblesRef = useRef(10);

  useEffect(() => {
    playerMarblesRef.current = playerMarbles;
  }, [playerMarbles]);

  useEffect(() => {
    opponentMarblesRef.current = opponentMarbles;
  }, [opponentMarbles]);

  useEffect(() => {
    if (doneRef.current) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.1 && !doneRef.current) {
          doneRef.current = true;
          setTimeout(() => {
            if (playerMarblesRef.current >= opponentMarblesRef.current) {
              setShowFinal('win');
              setTimeout(onWin, 1500);
            } else {
              setShowFinal('lose');
              setTimeout(onLose, 1500);
            }
          }, 0);
          return 0;
        }
        return Math.max(0, t - 0.1);
      });
    }, 100);
    return () => clearInterval(timer);
  }, [onWin, onLose]);

  const checkGameEnd = useCallback((pMarbles: number, oMarbles: number) => {
    if (pMarbles <= 0) {
      doneRef.current = true;
      setShowFinal('lose');
      setTimeout(onLose, 1500);
      return true;
    }
    if (oMarbles <= 0) {
      doneRef.current = true;
      setShowFinal('win');
      setTimeout(onWin, 1500);
      return true;
    }
    return false;
  }, [onWin, onLose]);

  const handleGuess = useCallback((g: 'odd' | 'even') => {
    if (doneRef.current) return;
    setGuess(g);
    const maxOpp = Math.min(opponentMarbles, 5);
    const cheatRoll = Math.random();
    let hand: number;
    if (cheatRoll < 0.6) {
      const desiredParity = g === 'odd' ? 0 : 1;
      const candidates = Array.from({ length: maxOpp }, (_, i) => i + 1).filter(n => n % 2 === desiredParity);
      hand = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : 1 + Math.floor(Math.random() * maxOpp);
    } else {
      hand = 1 + Math.floor(Math.random() * maxOpp);
    }
    setOpponentHand(hand);
    setRoundPhase('REVEAL');
    audio.playMarbleClink();

    const isOdd = hand % 2 !== 0;
    const correct = (g === 'odd' && isOdd) || (g === 'even' && !isOdd);

    setTimeout(() => {
      const actualBet = Math.min(bet, playerMarbles, opponentMarbles);
      let newPlayer: number;
      let newOpponent: number;
      if (correct) {
        newPlayer = playerMarbles + actualBet;
        newOpponent = opponentMarbles - actualBet;
        setRoundResult(`Correct! You win ${actualBet} marble${actualBet > 1 ? 's' : ''}`);
      } else {
        newPlayer = playerMarbles - actualBet;
        newOpponent = opponentMarbles + actualBet;
        setRoundResult(`Wrong! You lose ${actualBet} marble${actualBet > 1 ? 's' : ''}`);
      }
      setPlayerMarbles(newPlayer);
      setOpponentMarbles(newOpponent);
      setRoundPhase('RESULT');

      if (!checkGameEnd(newPlayer, newOpponent)) {
        setTimeout(() => {
          setRoundPhase('BET');
          setGuess(null);
          setOpponentHand(0);
          setBet(1);
          setRoundResult('');
        }, 1500);
      }
    }, 1200);
  }, [bet, playerMarbles, opponentMarbles, checkGameEnd]);

  const maxBet = Math.min(playerMarbles, opponentMarbles, 5);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 to-black/90" />

      <div className="z-10 flex flex-col items-center gap-5 w-full max-w-lg px-4">
        <div className="flex justify-between items-center w-full">
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
            <span className="text-zinc-400 font-mono text-xs uppercase">Time </span>
            <span className={`text-2xl font-mono font-bold ${timeLeft <= 15 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {Math.ceil(timeLeft)}s
            </span>
          </div>
        </div>

        <div className="flex justify-between w-full gap-4">
          <div className="flex-1 bg-black/50 backdrop-blur-md rounded-xl border border-squid-teal/30 p-4 text-center">
            <div className="text-zinc-400 font-mono text-xs uppercase mb-2">You (456)</div>
            <div className="flex flex-wrap justify-center gap-1">
              {Array.from({ length: playerMarbles }).map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_4px_rgba(59,130,246,0.5)]" />
              ))}
            </div>
            <div className="text-3xl font-bold text-squid-teal mt-2">{playerMarbles}</div>
          </div>
          <div className="flex items-center text-zinc-600 font-bold text-xl">VS</div>
          <div className="flex-1 bg-black/50 backdrop-blur-md rounded-xl border border-red-500/30 p-4 text-center">
            <div className="text-zinc-400 font-mono text-xs uppercase mb-2">Opponent</div>
            <div className="flex flex-wrap justify-center gap-1">
              {Array.from({ length: opponentMarbles }).map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
              ))}
            </div>
            <div className="text-3xl font-bold text-red-400 mt-2">{opponentMarbles}</div>
          </div>
        </div>

        <div className="bg-black/50 backdrop-blur-md rounded-xl border border-white/10 p-6 w-full">
          <AnimatePresence mode="wait">
            {roundPhase === 'BET' && (
              <motion.div key="bet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4">
                <p className="text-zinc-300 font-mono text-sm">Choose your bet:</p>
                <div className="flex justify-center items-center gap-4">
                  <button onClick={() => setBet(Math.max(1, bet - 1))} className="w-10 h-10 rounded-full bg-zinc-700 text-white font-bold text-xl hover:bg-zinc-600">-</button>
                  <span className="text-4xl font-bold text-yellow-400 w-12 text-center">{bet}</span>
                  <button onClick={() => setBet(Math.min(maxBet, bet + 1))} className="w-10 h-10 rounded-full bg-zinc-700 text-white font-bold text-xl hover:bg-zinc-600">+</button>
                </div>
                <p className="text-zinc-500 font-mono text-xs">marble{bet > 1 ? 's' : ''} at stake</p>
                <p className="text-zinc-300 font-mono text-sm mt-4">Guess: Odd or Even?</p>
                <div className="flex gap-4 justify-center pointer-events-auto">
                  <button onClick={() => handleGuess('odd')} className="px-8 py-3 rounded-lg font-bold text-lg bg-purple-700 text-white hover:bg-purple-600 border border-purple-500 transition-all active:scale-95">
                    ODD
                  </button>
                  <button onClick={() => handleGuess('even')} className="px-8 py-3 rounded-lg font-bold text-lg bg-amber-700 text-white hover:bg-amber-600 border border-amber-500 transition-all active:scale-95">
                    EVEN
                  </button>
                </div>
              </motion.div>
            )}

            {roundPhase === 'REVEAL' && (
              <motion.div key="reveal" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                <p className="text-zinc-400 font-mono text-sm">You guessed: <span className="text-white font-bold uppercase">{guess}</span></p>
                <motion.div
                  initial={{ rotateY: 180 }}
                  animate={{ rotateY: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-6xl font-black text-yellow-400"
                >
                  {opponentHand}
                </motion.div>
                <p className="text-zinc-500 font-mono text-xs">
                  Opponent reveals {opponentHand} marble{opponentHand > 1 ? 's' : ''} ({opponentHand % 2 === 0 ? 'even' : 'odd'})
                </p>
              </motion.div>
            )}

            {roundPhase === 'RESULT' && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
                <p className={`text-2xl font-bold ${roundResult.startsWith('Correct') ? 'text-squid-teal' : 'text-red-400'}`}>
                  {roundResult}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {showFinal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"
        >
          <span className={`text-5xl font-black tracking-widest ${showFinal === 'win' ? 'text-squid-teal text-glow-teal' : 'text-red-500'}`}>
            {showFinal === 'win' ? 'ALL MARBLES WON!' : 'ALL MARBLES LOST!'}
          </span>
        </motion.div>
      )}
    </div>
  );
}
