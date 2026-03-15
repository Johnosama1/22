import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

type Shape = 'circle' | 'triangle' | 'star' | 'umbrella';

const SHAPES: Shape[] = ['circle', 'triangle', 'star', 'umbrella'];

const SHAPE_DIFFICULTY: Record<Shape, number> = {
  circle: 0.75,
  triangle: 0.65,
  star: 0.45,
  umbrella: 0.35,
};

interface AIPlayer {
  id: number;
  shape: Shape;
  status: 'cutting' | 'success' | 'failed';
  progress: number;
}

function getShapePath(shape: Shape, cx: number, cy: number, size: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const steps = 60;

  switch (shape) {
    case 'circle':
      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        points.push({ x: cx + Math.cos(angle) * size, y: cy + Math.sin(angle) * size });
      }
      break;
    case 'triangle':
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const seg = t * 3;
        const vertices = [
          { x: cx, y: cy - size },
          { x: cx + size * 0.87, y: cy + size * 0.5 },
          { x: cx - size * 0.87, y: cy + size * 0.5 },
        ];
        const si = Math.floor(seg) % 3;
        const ei = (si + 1) % 3;
        const frac = seg - Math.floor(seg);
        points.push({
          x: vertices[si].x + (vertices[ei].x - vertices[si].x) * frac,
          y: vertices[si].y + (vertices[ei].y - vertices[si].y) * frac,
        });
      }
      break;
    case 'star': {
      const spikes = 5;
      const totalPts = spikes * 2;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const idx = t * totalPts;
        const ci = Math.floor(idx) % totalPts;
        const ni = (ci + 1) % totalPts;
        const frac = idx - Math.floor(idx);
        const getStarPt = (index: number) => {
          const angle = (index / totalPts) * Math.PI * 2 - Math.PI / 2;
          const r = index % 2 === 0 ? size : size * 0.45;
          return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
        };
        const p1 = getStarPt(ci);
        const p2 = getStarPt(ni);
        points.push({ x: p1.x + (p2.x - p1.x) * frac, y: p1.y + (p2.y - p1.y) * frac });
      }
      break;
    }
    case 'umbrella': {
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        if (t < 0.5) {
          const angle = Math.PI + (t / 0.5) * Math.PI;
          points.push({ x: cx + Math.cos(angle) * size, y: cy - size * 0.2 + Math.sin(angle) * size * 0.6 });
        } else if (t < 0.8) {
          const frac = (t - 0.5) / 0.3;
          points.push({ x: cx, y: cy - size * 0.2 + frac * size * 1.1 });
        } else {
          const frac = (t - 0.8) / 0.2;
          const angle = Math.PI / 2 + frac * Math.PI;
          const hookR = size * 0.2;
          points.push({ x: cx + hookR + Math.cos(angle) * hookR, y: cy + size * 0.9 + Math.sin(angle) * hookR });
        }
      }
      break;
    }
  }
  return points;
}

function getShapeSVGPath(shape: Shape, cx: number, cy: number, size: number): string {
  const pts = getShapePath(shape, cx, cy, size);
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';
}

interface Props {
  onWin: () => void;
  onLose: () => void;
  audio: { playCrack: () => void; initAudio: () => void };
}

export function DalgonaCandy({ onWin, onLose, audio }: Props) {
  const [shape] = useState<Shape>(() => SHAPES[Math.floor(Math.random() * SHAPES.length)]);
  const [traceProgress, setTraceProgress] = useState(0);
  const [crackLevel, setCrackLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTracing, setIsTracing] = useState(false);
  const [needlePos, setNeedlePos] = useState({ x: 0, y: 0 });
  const [showResult, setShowResult] = useState<'win' | 'lose' | null>(null);
  const [aiPlayers, setAiPlayers] = useState<AIPlayer[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const doneRef = useRef(false);
  const pathPointsRef = useRef(getShapePath(shape, 200, 200, 80));
  const currentSegmentRef = useRef(0);
  const lastPosRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    const players: AIPlayer[] = Array.from({ length: 8 }).map((_, i) => ({
      id: i + 1,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      status: 'cutting' as const,
      progress: 0,
    }));
    setAiPlayers(players);
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
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

      setAiPlayers(prev => prev.map(p => {
        if (p.status !== 'cutting') return p;
        const newProgress = p.progress + 1.5 + Math.random() * 2;
        if (newProgress >= 100) {
          const success = Math.random() < SHAPE_DIFFICULTY[p.shape];
          return { ...p, progress: 100, status: success ? 'success' : 'failed' };
        }
        if (Math.random() < 0.005) {
          return { ...p, status: 'failed' };
        }
        return { ...p, progress: newProgress };
      }));
    }, 100);
    return () => clearInterval(timer);
  }, [onLose]);

  const getSVGPoint = useCallback((e: React.PointerEvent) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 400;
    const y = ((e.clientY - rect.top) / rect.height) * 400;
    return { x, y };
  }, []);

  const checkProximity = useCallback((pos: { x: number; y: number }) => {
    if (doneRef.current) return;
    const pts = pathPointsRef.current;
    const target = pts[currentSegmentRef.current];
    if (!target) return;

    const now = performance.now();
    if (lastPosRef.current) {
      const dx = pos.x - lastPosRef.current.x;
      const dy = pos.y - lastPosRef.current.y;
      const dt = now - lastPosRef.current.time;
      if (dt > 0) {
        const speed = Math.sqrt(dx * dx + dy * dy) / dt;
        if (speed > 1.5 && isTracing) {
          audio.playCrack();
          setCrackLevel(prev => {
            const next = prev + 5;
            if (next >= 100 && !doneRef.current) {
              doneRef.current = true;
              setTimeout(() => {
                setShowResult('lose');
                setTimeout(onLose, 1500);
              }, 0);
              return 100;
            }
            return Math.min(next, 100);
          });
        }
      }
    }
    lastPosRef.current = { x: pos.x, y: pos.y, time: now };

    const dist = Math.sqrt((pos.x - target.x) ** 2 + (pos.y - target.y) ** 2);
    const tolerance = 25;

    if (dist < tolerance) {
      currentSegmentRef.current++;
      const progress = (currentSegmentRef.current / pts.length) * 100;
      setTraceProgress(progress);
      if (currentSegmentRef.current >= pts.length) {
        doneRef.current = true;
        setShowResult('win');
        setTimeout(onWin, 1500);
      }
    } else if (dist > tolerance * 2.5 && isTracing) {
      audio.playCrack();
      setCrackLevel(prev => {
        const next = prev + 3;
        if (next >= 100 && !doneRef.current) {
          doneRef.current = true;
          setTimeout(() => {
            setShowResult('lose');
            setTimeout(onLose, 1500);
          }, 0);
          return 100;
        }
        return Math.min(next, 100);
      });
    }
  }, [isTracing, onWin, onLose, audio]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const pt = getSVGPoint(e);
    if (!pt) return;
    setNeedlePos(pt);
    if (isTracing) checkProximity(pt);
  }, [getSVGPoint, isTracing, checkProximity]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsTracing(true);
    lastPosRef.current = null;
    const pt = getSVGPoint(e);
    if (pt) {
      setNeedlePos(pt);
      checkProximity(pt);
    }
  }, [getSVGPoint, checkProximity]);

  const candyColor = crackLevel > 50 ? `hsl(30, ${60 - crackLevel * 0.4}%, ${55 + crackLevel * 0.2}%)` : '#d4a548';
  const aiSuccessCount = aiPlayers.filter(p => p.status === 'success').length;
  const aiFailedCount = aiPlayers.filter(p => p.status === 'failed').length;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/40 to-black/80" />

      <div className="z-10 flex flex-col items-center gap-3 w-full max-w-md px-4">
        <div className="flex justify-between items-center w-full">
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
            <span className="text-zinc-400 font-mono text-xs uppercase">Time </span>
            <span className={`text-2xl font-mono font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {timeLeft.toFixed(1)}s
            </span>
          </div>
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-center">
            <span className="text-zinc-400 font-mono text-xs uppercase block">Shape</span>
            <span className="text-squid-teal font-bold uppercase">{shape}</span>
          </div>
        </div>

        <div className="flex gap-2 w-full justify-center">
          {aiPlayers.map(p => (
            <div key={p.id} className={`w-5 h-5 rounded-full border text-[6px] flex items-center justify-center font-mono ${
              p.status === 'success' ? 'bg-squid-teal/30 border-squid-teal text-squid-teal' :
              p.status === 'failed' ? 'bg-red-900/30 border-red-700 text-red-500 line-through' :
              'bg-zinc-800 border-zinc-600 text-zinc-500'
            }`}>
              {p.status === 'success' ? '✓' : p.status === 'failed' ? '✕' : Math.floor(p.progress) + '%'}
            </div>
          ))}
        </div>
        <div className="text-zinc-500 font-mono text-[10px] text-center">
          AI Players: {aiSuccessCount} passed · {aiFailedCount} failed · {aiPlayers.filter(p => p.status === 'cutting').length} cutting
        </div>

        <div className="w-full bg-zinc-800/50 rounded-full h-2 border border-white/10">
          <div className="h-full bg-squid-teal rounded-full transition-all" style={{ width: `${traceProgress}%` }} />
        </div>

        <div className="relative bg-gradient-to-b from-amber-700/90 to-amber-900/90 rounded-full w-[280px] h-[280px] md:w-[340px] md:h-[340px] border-4 border-amber-600/50 shadow-[0_0_40px_rgba(180,120,30,0.3),inset_0_0_30px_rgba(0,0,0,0.3)] flex items-center justify-center overflow-hidden"
          style={{ cursor: 'none' }}
        >
          {crackLevel > 20 && (
            <div className="absolute inset-0 z-20 pointer-events-none" style={{ opacity: crackLevel / 100 }}>
              {Array.from({ length: Math.floor(crackLevel / 15) }).map((_, i) => (
                <div key={i} className="absolute bg-amber-950/60" style={{
                  width: `${1 + Math.random()}px`,
                  height: `${20 + Math.random() * 40}px`,
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }} />
              ))}
            </div>
          )}

          <svg
            ref={svgRef}
            viewBox="0 0 400 400"
            className="w-full h-full touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => { setIsTracing(false); lastPosRef.current = null; }}
            onPointerLeave={() => { setIsTracing(false); lastPosRef.current = null; }}
          >
            <path
              d={getShapeSVGPath(shape, 200, 200, 80)}
              fill="none"
              stroke={candyColor}
              strokeWidth="3"
              strokeDasharray="6 4"
              opacity={0.8}
            />
            {traceProgress > 0 && (
              <path
                d={getShapeSVGPath(shape, 200, 200, 80)}
                fill="none"
                stroke="#00e5ff"
                strokeWidth="2"
                strokeDasharray={`${traceProgress * 5} 9999`}
                opacity={0.9}
              />
            )}
            <g transform={`translate(${needlePos.x}, ${needlePos.y})`}>
              <line x1="0" y1="-15" x2="0" y2="5" stroke="#ccc" strokeWidth="1.5" />
              <circle cx="0" cy="5" r="2" fill="#aaa" />
              {isTracing && <circle cx="0" cy="0" r="6" fill="none" stroke="#00e5ff" strokeWidth="0.5" opacity="0.5" />}
            </g>
          </svg>
        </div>

        <div className="flex items-center gap-2 w-full">
          <span className="text-zinc-500 font-mono text-xs">CRACK</span>
          <div className="flex-1 bg-zinc-800/50 rounded-full h-2 border border-white/10">
            <div className={`h-full rounded-full transition-all ${crackLevel > 70 ? 'bg-red-500' : crackLevel > 40 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${crackLevel}%` }} />
          </div>
        </div>

        <p className="text-zinc-500 font-mono text-xs text-center">
          Trace the shape slowly and carefully. Moving too fast or off-path cracks the candy.
        </p>
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"
        >
          <span className={`text-5xl font-black tracking-widest ${showResult === 'win' ? 'text-squid-teal text-glow-teal' : 'text-red-500'}`}>
            {showResult === 'win' ? 'SHAPE CUT!' : 'CANDY BROKEN!'}
          </span>
        </motion.div>
      )}
    </div>
  );
}
