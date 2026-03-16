import { motion } from 'framer-motion';
import { NeonButton, SquidShapes, LandingCharacter } from '@/components/UIComponents';
import { TOTAL_ROUNDS } from '@/hooks/use-game-engine';
import { useLanguage } from '@/hooks/use-language';

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

export function LandingScreen({ startGame }: { startGame: () => void; returnToMenu: () => void }) {
  const { t, lang, toggleLang } = useLanguage();
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
            {t('landing.title.line1')} <br/>
            <span className="text-squid-pink text-glow-pink">{t('landing.title.line2')}</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 font-mono whitespace-pre-line">
            {t('landing.subtitle')}
          </p>
        </div>
        <div className="py-4">
          <LandingCharacter />
        </div>
        <NeonButton onClick={startGame} variant="pink" className="mt-4 scale-110">
          {t('landing.play')}
        </NeonButton>
        <button
          onClick={toggleLang}
          className="mt-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-zinc-300 font-mono text-sm hover:bg-white/20 transition-colors"
        >
          {lang === 'en' ? 'العربية' : 'English'}
        </button>
      </div>
    </motion.div>
  );
}

export function AnnouncementScreen({ count, roundNumber }: {
  count: number;
  roundNumber: number;
  roundName: string;
  announcementText: string;
}) {
  const { t } = useLanguage();
  const announcementKey = `announce.${roundNumber}`;
  const roundNameKey = `round.${roundNumber}`;
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

        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 font-mono text-sm uppercase tracking-widest"
          >
            {t('announce.round')} {roundNumber} {t('announce.of')} {TOTAL_ROUNDS}
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-4xl font-mono text-white leading-relaxed"
          >
            <TypewriterText text={t(announcementKey)} />
          </motion.h2>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <span className="text-squid-teal font-display font-black tracking-widest text-glow-teal text-3xl md:text-5xl uppercase block">
              {t(roundNameKey)}
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

export function LoseScreen({ startGame, currentRound }: {
  startGame: () => void;
  returnToMenu: () => void;
  roundName: string;
  currentRound: number;
}) {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 crt-overlay"
    >
      <div className="text-center space-y-8 px-6">
        <h2 className="text-5xl md:text-7xl font-black text-red-600 tracking-widest uppercase shadow-red-500/50 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">
          {t('lose.title')}
        </h2>
        <p className="text-xl md:text-2xl text-zinc-400 font-mono">
          {t('lose.message')} {t(`round.${currentRound}`)}.<br/>{t('lose.money')}
        </p>
        <div className="pt-8">
          <NeonButton onClick={startGame} variant="pink">
            {t('lose.playAgain')}
          </NeonButton>
        </div>
      </div>
    </motion.div>
  );
}

const ROUND_PRIZES: Record<number, string> = {
  1: '₩100 Million',
  2: '₩500 Million',
  3: '₩2 Billion',
  4: '₩10 Billion',
  5: '₩25 Billion',
  6: '₩45.6 Billion',
};

export function WinScreen({ currentRound, onTakeReward, onContinue }: {
  currentRound: number;
  roundName: string;
  onTakeReward: () => void;
  onContinue: () => void;
}) {
  const { t } = useLanguage();
  const isFinalRound = currentRound >= TOTAL_ROUNDS;
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
            {t('win.title')}
          </h2>
          <p className="text-xl md:text-2xl text-emerald-200 font-mono">
            {t('win.survived')} {t(`round.${currentRound}`)}!
          </p>
          <p className="text-lg text-yellow-300 font-mono">
            {t('win.prize')} {ROUND_PRIZES[currentRound]}
          </p>
        </div>

        <div className="bg-black/40 p-8 rounded-xl border border-white/10 space-y-8">
          {isFinalRound ? (
            <>
              <p className="text-lg md:text-xl text-white">
                {t('win.conquered')}
              </p>
              <NeonButton onClick={onContinue} variant="teal">
                {t('win.claimGrand')}
              </NeonButton>
            </>
          ) : (
            <>
              <p className="text-lg md:text-xl text-white">
                {t('win.takeOrContinue')}
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <NeonButton onClick={onTakeReward} variant="pink">
                  {t('win.takeMoney')}
                </NeonButton>
                <NeonButton onClick={onContinue} variant="teal">
                  {t('win.continue')}
                </NeonButton>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function RewardScreen({ currentRound, returnToMenu }: {
  currentRound: number;
  returnToMenu: () => void;
}) {
  const { t } = useLanguage();
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
          {ROUND_PRIZES[currentRound]}
        </h2>
        <p className="text-xl text-zinc-400 font-mono">{t('reward.transferred')}</p>
        <p className="text-sm text-zinc-600 font-mono">{t('reward.leftAfter')} {currentRound}.</p>

        <div className="pt-8">
          <NeonButton onClick={returnToMenu} variant="pink">
            {t('reward.returnHome')}
          </NeonButton>
        </div>
      </div>
    </motion.div>
  );
}

export function GrandVictoryScreen({ returnToMenu }: { returnToMenu: () => void }) {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black crt-overlay"
    >
      <div className="text-center space-y-8 max-w-2xl px-6">
        <SquidShapes />

        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 mx-auto bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(250,204,21,0.6)] border-4 border-yellow-600"
        >
          <span className="text-6xl font-bold text-yellow-800">₩</span>
        </motion.div>

        <div className="space-y-4">
          <h2 className="text-5xl md:text-7xl font-black text-yellow-400 tracking-widest drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">
            {t('grand.amount')}
          </h2>
          <p className="text-2xl text-squid-teal font-mono text-glow-teal">
            {t('grand.champion')}
          </p>
          <p className="text-lg text-zinc-400 font-mono">
            {t('grand.survived')}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-3 gap-2 text-xs font-mono text-zinc-500">
            {[1, 2, 3, 4, 5, 6].map(r => (
              <div key={r} className="bg-black/40 rounded p-2 border border-white/5">
                <span className="text-squid-teal block">{t('announce.round')} {r}</span>{t(`round.${r}`)}
              </div>
            ))}
          </div>
          <div className="pt-4">
            <NeonButton onClick={returnToMenu} variant="pink">
              {t('grand.playAgain')}
            </NeonButton>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
