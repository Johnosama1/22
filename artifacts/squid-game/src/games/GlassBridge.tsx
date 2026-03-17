import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onWin: () => void;
  onLose: () => void;
  audio: { playGlassShatter: () => void; playGlassStep: () => void; initAudio: () => void };
}

const BRIDGE_LENGTH = 18;
const AI_PLAYERS = 2;

type PanelState = 'unknown' | 'safe' | 'broken' | 'revealed-safe';

interface BridgeRow {
  safeSide: 'left' | 'right';
  leftState: PanelState;
  rightState: PanelState;
}

export function GlassBridge({ onWin, onLose, audio }: Props) {
  const [bridge, setBridge] = useState<BridgeRow[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [showResult, setShowResult] = useState<'win' | 'lose' | null>(null);
  const [aiPhase, setAiPhase] = useState(true);
  const [aiMessage, setAiMessage] = useState('');
  const doneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const timerIds: ReturnType<typeof setTimeout>[] = [];
    const intervalIds: ReturnType<typeof setInterval>[] = [];

    const rows: BridgeRow[] = Array.from({ length: BRIDGE_LENGTH }).map(() => ({
      safeSide: Math.random() < 0.5 ? 'left' : 'right',
      leftState: 'unknown',
      rightState: 'unknown',
    }));
    setBridge(rows);

    let step = 0;
    let aiIdx = 0;
    const runAI = () => {
      if (cancelled) return;
      if (aiIdx >= AI_PLAYERS) {
        setAiPhase(false);
        setAiMessage('');
        return;
      }
      setAiMessage(`Player ${100 + aiIdx} is attempting the bridge...`);
      const aiInterval = setInterval(() => {
        if (cancelled) { clearInterval(aiInterval); return; }
        if (step >= BRIDGE_LENGTH) {
          clearInterval(aiInterval);
          setAiMessage(`Player ${100 + aiIdx} made it across!`);
          aiIdx++;
          step = 0;
          const t = setTimeout(runAI, 1000);
          timerIds.push(t);
          return;
        }
        const row = rows[step];
        const choosesCorrectly = Math.random() < 0.5;
        if (choosesCorrectly) {
          if (row.safeSide === 'left') row.leftState = 'revealed-safe';
          else row.rightState = 'revealed-safe';
          step++;
          setBridge([...rows]);
        } else {
          if (row.safeSide === 'left') row.rightState = 'broken';
          else row.leftState = 'broken';
          setBridge([...rows]);
          setAiMessage(`Player ${100 + aiIdx} fell!`);
          clearInterval(aiInterval);
          aiIdx++;
          step = 0;
          const t = setTimeout(runAI, 1200);
          timerIds.push(t);
        }
      }, 600);
      intervalIds.push(aiInterval);
    };
    const initTimer = setTimeout(runAI, 1000);
    timerIds.push(initTimer);

    return () => {
      cancelled = true;
      timerIds.forEach(clearTimeout);
      intervalIds.forEach(clearInterval);
    };
  }, []);

  useEffect(() => {
    if (aiPhase || doneRef.current) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.1 && !doneRef.current) {
          doneRef.current = true;
          setTimeout(() => {
            setShowResult('lose');
            setTimeout(onLose, 1500);
          }, 0);
          return 0;
        }
        return Math.max(0, t - 0.1);
      });
    }, 100);
    return () => clearInterval(timer);
  }, [aiPhase, onLose]);

  const handleChoose = useCallback((side: 'left' | 'right') => {
    if (doneRef.current || aiPhase || currentStep >= BRIDGE_LENGTH) return;
    const row = bridge[currentStep];
    if (!row) return;

    const newBridge = [...bridge];
    const isCorrect = side === row.safeSide;

    if (isCorrect) {
      if (side === 'left') newBridge[currentStep] = { ...row, leftState: 'safe' };
      else newBridge[currentStep] = { ...row, rightState: 'safe' };
      setBridge(newBridge);
      audio.playGlassStep();
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (nextStep >= BRIDGE_LENGTH) {
        doneRef.current = true;
        setShowResult('win');
        setTimeout(onWin, 1500);
      }
    } else {
      if (side === 'left') newBridge[currentStep] = { ...row, leftState: 'broken' };
      else newBridge[currentStep] = { ...row, rightState: 'broken' };
      setBridge(newBridge);
      audio.playGlassShatter();
      doneRef.current = true;
      setShowResult('lose');
      setTimeout(onLose, 1500);
    }
  }, [bridge, currentStep, aiPhase, onWin, onLose, audio]);

  const visibleStart = Math.max(0, currentStep - 2);
  const visibleEnd = Math.min(BRIDGE_LENGTH, currentStep + 6);
  const visibleRows = bridge.slice(visibleStart, visibleEnd);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/60 to-black/95" />

      <div className="z-10 flex flex-col items-center gap-4 w-full max-w-lg px-4">
        {!aiPhase && (
          <div className="flex justify-between items-center w-full">
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
              <span className="text-zinc-400 font-mono text-xs uppercase">Time </span>
              <span className={`text-2xl font-mono font-bold ${timeLeft <= 15 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {timeLeft.toFixed(1)}s
              </span>
            </div>
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
              <span className="text-zinc-400 font-mono text-xs uppercase">Step </span>
              <span className="text-2xl font-mono font-bold text-squid-teal">{currentStep}/{BRIDGE_LENGTH}</span>
            </div>
          </div>
        )}

        {aiPhase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/60 backdrop-blur-md px-6 py-4 rounded-lg border border-yellow-600/30 text-center"
          >
            <p className="text-yellow-400 font-mono text-sm">{aiMessage || 'AI players go first...'}</p>
            <p className="text-zinc-500 font-mono text-xs mt-1">Watch and learn which panels are safe</p>
          </motion.div>
        )}

        <div className="relative w-full perspective-[800px]" style={{ height: 400 }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ transform: 'rotateX(30deg)', transformOrigin: 'center bottom' }}>
            {visibleRows.map((row, vi) => {
              const idx = visibleStart + vi;
              const isCurrent = idx === currentStep && !aiPhase;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 items-center"
                >
                  <span className="text-zinc-600 font-mono text-[10px] w-6 text-right">{idx + 1}</span>
                  <button
                    onClick={() => handleChoose('left')}
                    disabled={!isCurrent || doneRef.current}
                    className={`w-20 h-10 rounded border-2 transition-all duration-200 ${
                      row.leftState === 'broken' ? 'bg-red-900/50 border-red-700 opacity-40 line-through' :
                      row.leftState === 'safe' ? 'bg-squid-teal/30 border-squid-teal shadow-[0_0_10px_rgba(0,229,255,0.3)]' :
                      row.leftState === 'revealed-safe' ? 'bg-yellow-900/30 border-yellow-600/50' :
                      isCurrent ? 'bg-white/10 border-white/40 hover:bg-white/20 hover:border-white/60 cursor-pointer' :
                      'bg-white/5 border-white/10'
                    }`}
                  >
                    {row.leftState === 'broken' && <span className="text-red-400 text-xs">✕</span>}
                    {row.leftState === 'safe' && <span className="text-squid-teal text-xs">✓</span>}
                    {row.leftState === 'revealed-safe' && <span className="text-yellow-500 text-xs">?</span>}
                  </button>
                  <button
                    onClick={() => handleChoose('right')}
                    disabled={!isCurrent || doneRef.current}
                    className={`w-20 h-10 rounded border-2 transition-all duration-200 ${
                      row.rightState === 'broken' ? 'bg-red-900/50 border-red-700 opacity-40' :
                      row.rightState === 'safe' ? 'bg-squid-teal/30 border-squid-teal shadow-[0_0_10px_rgba(0,229,255,0.3)]' :
                      row.rightState === 'revealed-safe' ? 'bg-yellow-900/30 border-yellow-600/50' :
                      isCurrent ? 'bg-white/10 border-white/40 hover:bg-white/20 hover:border-white/60 cursor-pointer' :
                      'bg-white/5 border-white/10'
                    }`}
                  >
                    {row.rightState === 'broken' && <span className="text-red-400 text-xs">✕</span>}
                    {row.rightState === 'safe' && <span className="text-squid-teal text-xs">✓</span>}
                    {row.rightState === 'revealed-safe' && <span className="text-yellow-500 text-xs">?</span>}
                  </button>
                </motion.div>
              );
            })}
          </div>

          <div className="absolute bottom-0 w-full text-center">
            <span className="text-zinc-600 font-mono text-[10px] uppercase">← Left | Right →</span>
          </div>
        </div>

        {!aiPhase && (
          <p className="text-zinc-500 font-mono text-xs text-center">
            Choose left or right panel. Yellow panels were revealed by AI players.
          </p>
        )}
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"
        >
          <div className="text-center">
            <span className={`text-5xl font-black tracking-widest ${showResult === 'win' ? 'text-squid-teal text-glow-teal' : 'text-red-500'}`}>
              {showResult === 'win' ? 'BRIDGE CROSSED!' : 'GLASS SHATTERED!'}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
