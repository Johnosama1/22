import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

type Lang = 'en' | 'ar';

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  'landing.title.line1': { en: 'Welcome to the', ar: 'مرحبًا بك في' },
  'landing.title.line2': { en: 'Games', ar: 'الألعاب' },
  'landing.subtitle': { en: 'Player 456, your debt is overwhelming.\nSurvive, and win the ultimate prize.', ar: 'اللاعب 456، ديونك هائلة.\nانجُ واربح الجائزة الكبرى.' },
  'landing.play': { en: 'PLAY', ar: 'ابدأ' },
  'announce.round': { en: 'Round', ar: 'الجولة' },
  'announce.of': { en: 'of', ar: 'من' },
  'announce.1': { en: 'The first game is...', ar: 'اللعبة الأولى هي...' },
  'announce.2': { en: 'The second game is...', ar: 'اللعبة الثانية هي...' },
  'announce.3': { en: 'The third game is...', ar: 'اللعبة الثالثة هي...' },
  'announce.4': { en: 'The fourth game is...', ar: 'اللعبة الرابعة هي...' },
  'announce.5': { en: 'The fifth game is...', ar: 'اللعبة الخامسة هي...' },
  'announce.6': { en: 'The final game is...', ar: 'اللعبة الأخيرة هي...' },
  'round.1': { en: 'Red Light, Green Light', ar: 'ضوء أحمر، ضوء أخضر' },
  'round.2': { en: 'Dalgona Candy', ar: 'حلوى دالغونا' },
  'round.3': { en: 'Tug of War', ar: 'شد الحبل' },
  'round.4': { en: 'Marbles', ar: 'الكرات الزجاجية' },
  'round.5': { en: 'Glass Bridge', ar: 'جسر الزجاج' },
  'round.6': { en: 'Squid Game', ar: 'لعبة الحبار' },
  'lose.title': { en: 'ELIMINATED', ar: 'تم الإقصاء' },
  'lose.message': { en: 'You failed', ar: 'لقد فشلت في' },
  'lose.money': { en: 'All your money is gone.', ar: 'ذهبت كل أموالك.' },
  'lose.playAgain': { en: 'Play Again', ar: 'العب مرة أخرى' },
  'win.title': { en: 'Congratulations', ar: 'تهانينا' },
  'win.survived': { en: 'You survived', ar: 'لقد نجوت من' },
  'win.prize': { en: 'Prize so far:', ar: 'الجائزة حتى الآن:' },
  'win.conquered': { en: 'You have conquered all the games!', ar: 'لقد تغلبت على جميع الألعاب!' },
  'win.claimGrand': { en: 'Claim the Grand Prize', ar: 'احصل على الجائزة الكبرى' },
  'win.takeOrContinue': { en: 'Do you want to take the money and leave, or continue playing for a bigger reward?', ar: 'هل تريد أخذ المال والمغادرة، أم المتابعة لجائزة أكبر؟' },
  'win.takeMoney': { en: 'YES — Take money', ar: 'نعم — خذ المال' },
  'win.continue': { en: 'NO — Continue', ar: 'لا — أكمل' },
  'reward.transferred': { en: 'Transferred to your account.', ar: 'تم التحويل إلى حسابك.' },
  'reward.leftAfter': { en: 'You chose to leave after Round', ar: 'اخترت المغادرة بعد الجولة' },
  'reward.returnHome': { en: 'Return Home', ar: 'العودة للرئيسية' },
  'grand.amount': { en: '45.6 BILLION WON', ar: '45.6 مليار وون' },
  'grand.champion': { en: 'GRAND CHAMPION', ar: 'البطل الأعظم' },
  'grand.survived': { en: 'Player 456 — You survived all 6 games.', ar: 'اللاعب 456 — نجوت من جميع الألعاب الستة.' },
  'grand.playAgain': { en: 'Play Again', ar: 'العب مرة أخرى' },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  const toggleLang = useCallback(() => {
    setLang(prev => prev === 'en' ? 'ar' : 'en');
  }, []);

  const t = useCallback((key: string) => {
    return translations[key]?.[lang] ?? key;
  }, [lang]);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
