import React, { useState, useEffect } from 'react';
import {
  Gamepad2, Brain, Eye, Clock, Users, Heart, AlertTriangle, CheckCircle,
  Target, BookOpen, Award, ArrowRight, Menu, X, Star, TrendingUp,
  Sparkles, Trash2, Shield, Lightbulb, ShieldCheck, Zap,
  BarChart3, Layers, Moon, Sun, Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useToast } from './components/Toast';

// ============== TYPES ==============
interface SurveyData { daily: number; weekly1_2: number; weekly3_4: number; less: number; total: number; }
interface BenefitData { name: string; value: number; }
interface RecItem { id: number; text: string; completed: boolean; }
interface QuizAnswer { question: number; answer: number; }
interface QuizResult { score: number; message: string; advice: string; recommendations: string[]; }
interface SurveyResponse { id: string; createdAt: string; freq: string; benefits: string[]; sleep: string; negative: string; }

// ============== CONSTANTS ==============
const ADMIN_PASSWORD = 'admin2026';
const SURVEY_STORAGE_KEY = 'gameSurveyResponses';

const INITIAL_SURVEY: SurveyData = { daily: 5, weekly1_2: 3, weekly3_4: 2, less: 1, total: 11 };
const INITIAL_BENEFITS: BenefitData[] = [
  { name: 'Снятие стресса', value: 9 },
  { name: 'Логика', value: 8 },
  { name: 'Реакция', value: 7 },
  { name: 'Команда', value: 5 },
  { name: 'Английский', value: 4 },
  { name: 'Креативность', value: 4 },
];
const BENEFIT_OPTIONS = [
  { key: 'stress', label: 'Снятие стресса и отдых' },
  { key: 'logic', label: 'Развитие логического мышления' },
  { key: 'reaction', label: 'Улучшение реакции и внимания' },
  { key: 'team', label: 'Развитие командной работы' },
  { key: 'english', label: 'Изучение английского' },
  { key: 'creativity', label: 'Креативность и творчество' },
];
const INITIAL_NEGATIVE = { no: 8, yes: 3 };
const SLEEP_DATA = [
  { name: 'Иногда', value: 7 },
  { name: 'Регулярно', value: 1 },
  { name: 'Нет проблем', value: 3 },
];

const HISTORY = [
  {
    year: '1952', title: 'OXO', desc: 'Первая компьютерная игра — крестики-нолики',
    detail: 'OXO создал британский учёный А. Дуглас на компьютере EDSAC в Кембридже как часть диссертации о взаимодействии человека и машины. Игрок соревновался с компьютером в крестики-нолики на дисплее из электронных ламп.',
    tips: ['Первое доказательство, что ЭВМ может играть с человеком', 'Заложила основу искусственного интеллекта в играх'],
  },
  {
    year: '1972', title: 'Pong', desc: 'Начало коммерческой индустрии (Atari)',
    detail: 'Pong — аркадный симулятор настольного тенниса от компании Atari, основанной Ноланом Бушнеллом. Игра стала первым коммерчески успешным проектом и принесла миллионы долларов, доказав, что игры — это бизнес.',
    tips: ['Первая массовая аркадная игра', 'Породила целую индустрию игровых автоматов', 'Простота «двух полосок и точки» стала легендой'],
  },
  {
    year: '1980-е', title: 'Эра приставок', desc: 'Pac-Man, Mario, Tetris, Nintendo и Sega',
    detail: 'Золотой век аркад и домашних консолей. Nintendo выпустила NES, Sega — свои системы. Появились культовые франшизы: Super Mario Bros, The Legend of Zelda. Советский Tetris покорил весь мир, став самой продаваемой игрой.',
    tips: ['Игры пришли в каждый дом', 'Появились первые игровые "звёзды" — Марио, Пакман', 'Сформировались основные жанры'],
  },
  {
    year: '1990-е', title: '3D и сети', desc: 'Doom, Quake, Warcraft, StarCraft',
    detail: 'Революция трёхмерной графики. Doom и Quake создали жанр шутеров от первого лица. Warcraft и StarCraft заложили основу стратегий в реальном времени. Появился мультиплеер по локальной сети и интернету.',
    tips: ['Переход от 2D к полному 3D', 'Зарождение сетевой и киберспортивной культуры', 'Игры стали социальным явлением'],
  },
  {
    year: '2000-е', title: 'MMO эпоха', desc: 'World of Warcraft и онлайн-игры',
    detail: 'Массовые многопользовательские онлайн-игры (MMORPG) объединили миллионы игроков в виртуальных мирах. World of Warcraft достиг 12 млн подписчиков. Развитие интернета сделало онлайн-игры основным форматом.',
    tips: ['Виртуальные миры с тысячами игроков одновременно', 'Появление игровых экономик и сообществ', 'Игры как постоянное хобби, а не разовое развлечение'],
  },
  {
    year: '2010–2020-е', title: 'Современность', desc: 'Мобильные, VR/AR, киберспорт',
    detail: 'Смартфоны сделали игры доступными каждому. Киберспорт превратился в индустрию с призовыми фондами в миллионы долларов и стадионами зрителей. VR и AR технологии (Oculus, Pokémon GO) открыли новые форматы. Облачный гейминг стирает границы платформ.',
    tips: ['Игры — на каждом смартфоне', 'Киберспорт = профессиональная карьера', 'VR/AR размывают границу реальности и игры'],
  },
];

const GENRES = [
  { name: 'Экшен', icon: Target, desc: 'Динамичные игры со скоростью реакции и точностью', develops: 'реакцию, внимание, координацию', watch: 'эмоциональное возбуждение и усталость глаз', choose: 'игры с понятным возрастным рейтингом', examples: 'шутеры, файтинги, аркады' },
  { name: 'RPG', icon: Award, desc: 'Развитие персонажа, сюжет, выбор и квесты', develops: 'чтение, погружение, принятие решений', watch: 'длинные сессии из-за обилия заданий', choose: 'обращайте внимание на возрастной рейтинг', examples: 'сюжетные RPG, MMORPG' },
  { name: 'Стратегии', icon: Brain, desc: 'Планирование, ресурсы, тактика на много ходов', develops: 'логическое мышление и планирование', watch: 'желание «ещё один раунд»', choose: 'стратегии с обучающим режимом', examples: 'RTS, пошаговые, экономические' },
  { name: 'Симуляторы', icon: Gamepad2, desc: 'Имитация реальных процессов и профессий', develops: 'аккуратность, понимание систем', watch: 'монотонность без перерывов', choose: 'реалистичные с понятными целями', examples: 'авто, авиа, спорт, экономика' },
  { name: 'Песочницы', icon: Star, desc: 'Свобода действий, строительство, креатив', develops: 'креативность и пространственное мышление', watch: 'потерю времени без чёткого финала', choose: 'безопасные серверы и приватность', examples: 'Minecraft, Roblox, Terraria' },
  { name: 'Хорроры', icon: AlertTriangle, desc: 'Напряжение, страх и тревожная атмосфера', develops: 'внимательность в стрессе', watch: 'тревожность и плохой сон', choose: 'не играть детям и перед сном', examples: 'survival horror, квесты' },
];

const POSITIVES = [
  { icon: Brain, title: 'Когнитивное развитие', text: 'Логика, память, концентрация внимания', detail: 'Исследования Рочестерского университета показали: 30 минут экшен-игр в день улучшают пространственное мышление на 25% и способность переключать внимание между задачами.' },
  { icon: Target, title: 'Реакция и моторика', text: 'Скорость реакции, координация рук и глаз', detail: 'Геймеры реагируют на визуальные стимулы на 15% быстрее не-геймеров. Координация глаз-рука развивается особенно в шутерах и файтингах.' },
  { icon: TrendingUp, title: 'Принятие решений', text: 'Быстрый анализ в условиях ограниченного времени', detail: 'Стратегии в реальном времени (RTS) требуют принятия до 10 решений в секунду. Это тренирует префронтальную кору мозга.' },
  { icon: BookOpen, title: 'Иностранные языки', text: 'Расширение словарного запаса на английском', detail: '78% игр используют английский язык. Игроки неосознанно запоминают 500-1000 слов за год активной игры.' },
  { icon: Users, title: 'Социализация', text: 'Командная работа и общение с друзьями', detail: 'MMORPG и командные шутеры учат координации, распределению ролей и коммуникации. 65% игроков находят новых друзей через игры.' },
  { icon: Heart, title: 'Снятие стресса', text: 'Эффективная релаксация после учёбы', detail: '20 минут игры снижают уровень кортизола на 17%. Игры активируют систему вознаграждения мозга, давая ощущение достижения.' },
  { icon: Star, title: 'Креативность', text: 'Песочницы развивают творческое мышление', detail: 'Minecraft-игроки показывают на 30% лучшие результаты в тестах на дивергентное мышление — способность находить нестандартные решения.' },
  { icon: Award, title: 'Перспективы', text: 'Карьера в киберспорте и разработке', detail: 'Индустрия видеоигр создаёт 150,000 рабочих мест в год. Профессиональные киберспортсмены зарабатывают от $50,000 до $5 млн в год.' },
];

const NEGATIVES = [
  { icon: AlertTriangle, title: 'Игровая зависимость', text: 'Gaming Disorder признана ВОЗ (МКБ-11)', detail: 'Затрагивает 1-3% игроков. Симптомы: потеря контроля, приоритет игр над всем остальным, продолжение несмотря на негативные последствия.' },
  { icon: Eye, title: 'Проблемы со зрением', text: 'Синдром компьютерного зрения, сухость глаз', detail: '60% геймеров испытывают сухость глаз. Правило 20-20-20: каждые 20 минут смотреть на объект в 6 метрах в течение 20 секунд.' },
  { icon: Clock, title: 'Нарушения сна', text: 'Игра допоздна приводит к бессоннице', detail: 'Синий свет экранов подавляет мелатонин на 50%. Игра за 2 часа до сна увеличивает время засыпания в 2 раза.' },
  { icon: Target, title: 'Снижение успеваемости', text: 'Отнимает время от учёбы и важных дел', detail: 'Исследование: студенты, играющие более 3 часов в день, имеют средний балл на 0.5 ниже. Ключ — баланс и планирование времени.' },
  { icon: AlertTriangle, title: 'Психология', text: 'Агрессивность, изоляция, тревожность', detail: 'Прямая связь не подтверждена. Риск возникает при уже существующих проблемах. Важно отслеживать изменения в поведении.' },
  { icon: Heart, title: 'Здоровье', text: 'Осанка, гиподинамия, туннельный синдром', detail: '8 часов игры без перерывов = риск болей в спине 70%. Туннельный синдром запястья встречается у 20% профессиональных игроков.' },
];

const BASE_RECOMMENDATIONS: RecItem[] = [
  { id: 1, text: 'Контролировать время игры — устанавливать лимит и не превышать его', completed: false },
  { id: 2, text: 'Не играть допоздна — завершать минимум за 1 час до сна', completed: false },
  { id: 3, text: 'Делать перерывы — каждые 30–45 минут отдыхать 5–10 минут', completed: false },
  { id: 4, text: 'Беречь зрение — гимнастика для глаз, правильное расстояние до экрана', completed: false },
  { id: 5, text: 'Следить за осанкой — сидеть прямо, не сутулиться', completed: false },
  { id: 6, text: 'Совмещать с физической активностью — прогулки и спорт', completed: false },
];

const TEEN_RECOMMENDATIONS = [
  'Ставь таймер до начала игры, а не после того как заигрался',
  'Сначала учёба и дела, потом игра как награда',
  'Каждые 30–45 минут — короткий перерыв: глаза, вода, разминка',
  'Не начинай матч, если до сна меньше часа',
];

const PARENT_RECOMMENDATIONS = [
  'Обсуждайте правила заранее: сколько и во что играть',
  'Смотрите возрастной рейтинг, а не только популярность',
  'Не запрещайте резко — договоритесь о понятном режиме',
  'Обращайте внимание на сон, настроение и общение',
];

const AGE_GROUPS = [
  { age: '3–6 лет', label: 'Дошкольный', time: '15–20 мин/день', tips: 'Только развивающие, строго возрастные игры' },
  { age: '7–10 лет', label: 'Младший школьный', time: '30–60 мин/день', tips: 'Контроль родителей, образовательные игры' },
  { age: '11–14 лет', label: 'Подростки', time: '1–1.5 ч/день', tips: 'Соблюдение режима, баланс с учёбой' },
  { age: '15–17 лет', label: 'Старшие', time: '1.5–2 ч/день', tips: 'Самоконтроль, избегать ночных сессий' },
];

const SOURCES = [
  'ВОЗ. МКБ-11. Игровое расстройство',
  'Newzoo. Global Games Market Report 2023',
  'APA. Resolution on Violent Video Games, 2020',
  'Bavelier D., Green C. S. Nature, 2003',
  'Przybylski A. K. Psychological Science, 2017',
  'Войскунский А. Е. Психологический журнал, 2004',
  'Зайцева О. Б. Молодой учёный, 2016',
  'PEGI — система возрастных рейтингов',
];

const QUIZ_QUESTIONS = [
  { q: 'Как часто вы играете в компьютерные игры?', options: ['Каждый день', '3–5 раз в неделю', '1–2 раза в неделю', 'Реже 1 раза в неделю'] },
  { q: 'Сколько в среднем длится одна сессия?', options: ['Менее 1 часа', '1–2 часа', '2–3 часа', 'Более 3 часов'] },
  { q: 'Часто ли играете после 23:00?', options: ['Почти никогда', 'Иногда', 'Довольно часто', 'Почти каждый день'] },
  { q: 'Игры мешают учёбе или делам?', options: ['Никогда', 'Редко', 'Иногда', 'Часто'] },
  { q: 'Чувствуете усталость глаз или раздражительность?', options: ['Нет', 'Редко', 'Иногда', 'Часто'] },
];

// ============== SECTION WRAPPER ==============
const Section: React.FC<{ children: React.ReactNode; className?: string; dark?: boolean; id?: string }> = ({ children, className = '', dark, id }) => (
  <section id={id} className={dark ? 'bg-[#0a0a0b]' : 'bg-[#060608] bg-grid-subtle'}>
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${dark ? 'py-24' : 'py-28'} ${className}`}>{children}</div>
  </section>
);

// ============== MAIN SITE ==============
const MainSite: React.FC<{
  surveyData: SurveyData; benefitsData: BenefitData[];
  negativeData: { no: number; yes: number };
  sleepData: { name: string; value: number }[];
  userSurvey: { freq: string; benefits: string[]; sleep: string; negative: string };
  setUserSurvey: React.Dispatch<React.SetStateAction<{ freq: string; benefits: string[]; sleep: string; negative: string }>>;
  hasAddedSurvey: boolean;
  recommendations: RecItem[]; progress: number;
  quizAnswers: QuizAnswer[]; quizResult: QuizResult | null; showQuizModal: boolean;
  selectedGenre: string | null; setSelectedGenre: (g: string | null) => void;
  submitUserSurvey: () => void; toggleBenefit: (k: string) => void;
  toggleRecommendation: (id: number) => void; resetRecommendations: () => void;
  handleQuizAnswer: (q: number, a: number) => void; calculateQuizResult: () => void;
  closeQuizModal: () => void; toast: ReturnType<typeof useToast>;
}> = (p) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [detailModal, setDetailModal] = useState<{ type: 'benefit' | 'risk' | 'history' | 'myth'; data: any } | null>(null);

  const navItems = [
    { label: 'О сайте', id: 'about' },
    { label: 'Польза', id: 'benefits' },
    { label: 'Риски', id: 'risks' },
    { label: 'История', id: 'history' },
    { label: 'Опрос', id: 'results' },
    { label: 'Тест', id: 'quiz' },
    { label: 'Советы', id: 'recommendations' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); }); },
      { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' }
    );
    document.querySelectorAll('section[id]').forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    setIsMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) { const top = el.getBoundingClientRect().top + window.scrollY - 76; window.scrollTo({ top, behavior: 'smooth' }); }
    }, 50);
  };

  const activeGenre = GENRES.find((g) => g.name === p.selectedGenre) ?? GENRES[0];

  const total = p.surveyData.total;
  const dailyPct = Math.round((p.surveyData.daily / total) * 100);
  const stressPct = Math.round((p.benefitsData[0].value / total) * 100);
  const noNegativePct = Math.round((p.negativeData.no / (p.negativeData.no + p.negativeData.yes)) * 100);
  const sleepPct = Math.round(((p.sleepData[0].value + p.sleepData[1].value) / total) * 100);

  const benefitsChart = p.benefitsData.map((b) => ({ name: b.name, value: Math.round((b.value / total) * 100), count: b.value }));
  const negativePie = [
    { name: 'Не замечают', value: Math.round((p.negativeData.no / (p.negativeData.no + p.negativeData.yes)) * 100), count: p.negativeData.no },
    { name: 'Замечают', value: Math.round((p.negativeData.yes / (p.negativeData.no + p.negativeData.yes)) * 100), count: p.negativeData.yes },
  ];
  const sleepChart = p.sleepData.map((s) => ({ name: s.name, value: Math.round((s.value / total) * 100), count: s.value }));

  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100">
      {/* ===== NAV ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#060608]/80 backdrop-blur-xl border-b border-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('hero')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="font-display font-bold text-base">Игры: Польза и Риски</div>
              <div className="text-[10px] text-zinc-500 -mt-0.5 tracking-wide">Гид по безопасному геймингу</div>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-8 text-sm">
            {navItems.map((it) => (
              <button key={it.id} onClick={() => scrollTo(it.id)} className={`nav-link ${activeSection === it.id ? 'active text-violet-300' : 'text-zinc-400 hover:text-white'}`}>{it.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scrollTo('quiz')} className="hidden sm:flex btn-primary px-5 py-2 rounded-full text-sm font-semibold items-center gap-1.5 text-white">
              Пройти тест <ArrowRight size={14} />
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900/50">
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden border-t border-zinc-900/50 bg-[#060608]">
              <div className="px-4 py-3 flex flex-col gap-1">
                {navItems.map((it) => (
                  <button key={it.id} onClick={() => scrollTo(it.id)} className="text-left py-3 px-3 rounded-lg text-zinc-300 hover:bg-zinc-900/50 text-sm font-medium">{it.label}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ===== HERO ===== */}
      <section id="hero" className="relative min-h-screen flex items-center pt-[72px] overflow-hidden">
        <div className="absolute inset-0 bg-grid-subtle" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
              <span className="eyebrow eyebrow-violet">
                <Sparkles size={13} /> Информационный гид · 2026
              </span>
              <span className="text-xs text-zinc-500 font-medium tracking-wide uppercase">Для подростков, родителей и педагогов</span>
            </div>

            <h1 className="font-display text-[44px] sm:text-7xl md:text-8xl font-extrabold leading-[0.95] mb-8">
              Компьютерные игры:
              <br />
              <span className="gradient-text">польза и риски</span>
            </h1>

            <p className="max-w-xl text-lg sm:text-xl text-zinc-400 leading-relaxed mb-12">
              Разбираемся, как игры влияют на мозг, сон и учёбу. Понятные факты, живая статистика и персональные рекомендации.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-16">
              <button onClick={() => scrollTo('quiz')} className="btn-primary px-8 py-4 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 text-base">
                Пройти тест на баланс <ArrowRight size={18} />
              </button>
              <button onClick={() => scrollTo('benefits')} className="btn-ghost px-8 py-4 rounded-2xl text-zinc-200 font-semibold flex items-center justify-center gap-2">
                Узнать о пользе
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg sm:max-w-2xl">
              {[
                { num: '2.7 млрд', label: 'игроков в мире', icon: Users },
                { num: String(total), label: 'респондентов', icon: BarChart3 },
                { num: `${stressPct}%`, label: 'отмечают пользу', icon: TrendingUp },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center sm:items-start">
                  <s.icon size={20} className="text-violet-400/60 mb-2" />
                  <div className="font-display text-2xl sm:text-4xl font-extrabold gradient-text tabular-nums">{s.num}</div>
                  <div className="text-[11px] sm:text-xs text-zinc-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <Section id="about">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="eyebrow eyebrow-violet mb-6"><BookOpen size={12} /> О сайте</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold leading-[1.05] mt-4">
              Гид, основанный на<br /><span className="gradient-text">данных и науке</span>
            </h2>
            <p className="text-lg text-zinc-400 mt-6 leading-relaxed max-w-md">
              Главная идея — показать, что игры не однозначно вредны или полезны. Важны жанр, время, возраст и влияние на сон и учёбу.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Layers, title: 'Польза и риски', desc: 'Доказательные факты и исследования', color: 'text-violet-400' },
              { icon: BarChart3, title: 'Опрос в реальном времени', desc: 'Живая статистика на странице', color: 'text-emerald-400' },
              { icon: Gamepad2, title: 'Жанры и влияние', desc: 'Что развивает каждый жанр', color: 'text-amber-400' },
              { icon: Lightbulb, title: 'Тест и советы', desc: 'Персональные рекомендации', color: 'text-sky-400' },
            ].map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl p-6 hover:border-violet-500/30 transition-colors">
                <c.icon size={22} className={c.color} />
                <div className="font-display font-bold mt-3 text-sm">{c.title}</div>
                <div className="text-xs text-zinc-500 mt-1 leading-relaxed">{c.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ===== BENEFITS ===== */}
      <Section dark id="benefits">
        <div className="text-center mb-14">
          <span className="eyebrow eyebrow-green"><CheckCircle size={12} /> Позитивное влияние</span>
          <h2 className="font-display text-4xl sm:text-6xl font-bold mt-6">
            Польза от <span className="gradient-text-green">компьютерных игр</span>
          </h2>
          <p className="text-zinc-400 mt-5 max-w-lg mx-auto">Научные исследования подтверждают: умеренный гейминг развивает важные навыки.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POSITIVES.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              onClick={() => setDetailModal({ type: 'benefit', data: item })}
              className="glass rounded-2xl p-6 group hover:border-emerald-500/30 transition-all duration-300 cursor-pointer hover:scale-[1.02]">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-colors">
                <item.icon size={20} className="text-emerald-400" />
              </div>
              <div className="font-display font-bold text-base leading-snug mb-2">{item.title}</div>
              <div className="text-sm text-zinc-400 leading-relaxed">{item.text}</div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400/70 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Подробнее</span>
                <ArrowRight size={12} />
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ===== RISKS ===== */}
      <Section id="risks">
        <div className="text-center mb-14">
          <span className="eyebrow eyebrow-rose"><AlertTriangle size={12} /> Возможные риски</span>
          <h2 className="font-display text-4xl sm:text-6xl font-bold mt-6">
            Чем <span className="gradient-text-rose">опасны</span> компьютерные игры
          </h2>
          <p className="text-zinc-400 mt-5 max-w-lg mx-auto">Проблемы возникают преимущественно при чрезмерном и неконтролируемом использовании.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NEGATIVES.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              onClick={() => setDetailModal({ type: 'risk', data: item })}
              className="glass rounded-2xl p-6 flex gap-4 group hover:border-rose-500/20 transition-all cursor-pointer hover:scale-[1.02]">
              <div className="shrink-0">
                <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
                  <item.icon size={18} className="text-rose-400" />
                </div>
              </div>
              <div className="flex-1">
                <div className="font-display font-bold text-base mb-1.5">{item.title}</div>
                <div className="text-sm text-zinc-400 leading-relaxed">{item.text}</div>
              </div>
              <div className="flex items-center text-rose-400/70 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ===== HISTORY + GENRES ===== */}
      <Section dark id="history">
        {/* History */}
        <div className="mb-20">
          <span className="eyebrow eyebrow-violet"><Clock size={12} /> История</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mt-5 mb-10">Более <span className="gradient-text">70 лет</span> развития</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {HISTORY.map((it, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                onClick={() => setDetailModal({ type: 'history', data: { ...it, icon: Clock, text: it.desc } })}
                className="glass rounded-2xl p-6 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 to-indigo-500" />
                <div className="inline-block px-3 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300 mb-4">
                  {it.year}
                </div>
                <h3 className="font-display font-bold text-xl mb-2">{it.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{it.desc}</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-violet-400/70 opacity-0 hover:opacity-100 transition-opacity">
                  <span>Подробнее</span>
                  <ArrowRight size={12} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Genres */}
        <div>
          <span className="eyebrow eyebrow-violet"><Gamepad2 size={12} /> Жанры</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mt-5 mb-10">Какие игры что <span className="gradient-text">развивают</span></h2>

          <div className="grid lg:grid-cols-[240px_1fr] gap-5">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {GENRES.map((g) => {
                const isActive = activeGenre.name === g.name;
                return (
                  <button key={g.name} onClick={() => p.setSelectedGenre(g.name)}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${isActive ? 'border-violet-500/50 bg-violet-500/[0.08] text-white' : 'border-zinc-800/60 bg-zinc-900/30 text-zinc-400 hover:text-white hover:border-zinc-700'}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isActive ? 'bg-violet-500/20 text-violet-300' : 'bg-zinc-800/60 text-zinc-500'}`}>
                      <g.icon size={15} />
                    </span>
                    <span className="text-sm font-medium">{g.name}</span>
                  </button>
                );
              })}
            </div>

            <motion.div key={activeGenre.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass-strong rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                  <activeGenre.icon size={24} className="text-violet-300" />
                </div>
                <div>
                  <h4 className="font-display text-3xl font-bold text-white">{activeGenre.name}</h4>
                  <div className="text-xs text-zinc-500 mt-1">Примеры: {activeGenre.examples}</div>
                </div>
              </div>
              <p className="text-zinc-300 mb-8 leading-relaxed">{activeGenre.desc}</p>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'Развивает', value: activeGenre.develops, color: 'text-emerald-400', bg: 'bg-emerald-500/[0.06]', border: 'border-emerald-500/20' },
                  { label: 'Следить', value: activeGenre.watch, color: 'text-amber-400', bg: 'bg-amber-500/[0.06]', border: 'border-amber-500/20' },
                  { label: 'Выбор', value: activeGenre.choose, color: 'text-violet-300', bg: 'bg-violet-500/[0.06]', border: 'border-violet-500/20' },
                ].map((b, i) => (
                  <div key={i} className={`rounded-xl ${b.bg} border ${b.border} p-5`}>
                    <div className={`text-[10px] uppercase tracking-wider ${b.color} font-semibold mb-2`}>{b.label}</div>
                    <div className="text-sm text-zinc-300 leading-relaxed">{b.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Age Groups */}
        <div className="mt-20">
          <span className="eyebrow eyebrow-violet"><Users size={12} /> Возраст</span>
          <h3 className="font-display text-3xl sm:text-4xl font-bold mt-5 mb-10">Сколько играть детям</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AGE_GROUPS.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl p-6">
                <div className="font-display text-2xl font-extrabold gradient-text">{a.age}</div>
                <div className="text-xs text-zinc-500 mb-4 mt-1">{a.label}</div>
                <div className="inline-block px-3 py-1 text-xs rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold mb-4">
                  {a.time}
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{a.tips}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ===== RESULTS ===== */}
      <Section id="results">
        <div className="text-center mb-14">
          <span className="eyebrow eyebrow-violet"><TrendingUp size={12} /> Опрос в реальном времени</span>
          <h2 className="font-display text-4xl sm:text-6xl font-bold mt-6">
            Результаты <span className="gradient-text">анкетирования</span>
          </h2>
          <p className="text-zinc-400 mt-5">
            <span className="text-white font-bold">{total}</span> респондентов — данные обновляются при добавлении ответов
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12">
          {[
            { label: 'Играют каждый день', value: dailyPct, sub: `${p.surveyData.daily} из ${total}`, gradient: 'from-violet-500 to-indigo-500', glow: 'shadow-violet-500/10' },
            { label: 'Снимают стресс', value: stressPct, sub: `${p.benefitsData[0].value} человек`, gradient: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/10' },
            { label: 'Не замечают вреда', value: noNegativePct, sub: `Но ${sleepPct}% с проблемами сна`, gradient: 'from-sky-500 to-blue-500', glow: 'shadow-sky-500/10' },
            { label: 'Проблемы со сном', value: sleepPct, sub: 'Иногда или регулярно', gradient: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/10' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className={`relative glass rounded-2xl p-4 sm:p-5 overflow-hidden shadow-lg ${s.glow}`}>
              <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br ${s.gradient} opacity-20 blur-2xl`} />
              <div className="relative">
                <div className="text-[10px] sm:text-[11px] text-zinc-500 uppercase tracking-wider font-medium">{s.label}</div>
                <div className={`font-display text-3xl sm:text-4xl font-extrabold mt-2 bg-gradient-to-br ${s.gradient} bg-clip-text text-transparent tabular-nums`}>
                  {s.value}%
                </div>
                <div className="text-[11px] sm:text-xs mt-1.5 text-zinc-400">{s.sub}</div>
                <div className="mt-3 h-1 bg-zinc-800/60 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${s.value}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`h-full bg-gradient-to-r ${s.gradient} rounded-full`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4 mb-12">
          {/* Частота игры — горизонтальные бары с деталями */}
          <div className="glass rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-display font-bold text-lg">Частота игры</div>
                <div className="text-xs text-zinc-500 mt-0.5">Как часто респонденты играют</div>
              </div>
              <div className="text-[10px] px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-semibold">N = {total}</div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Каждый день', pct: dailyPct, count: p.surveyData.daily, icon: Zap, color: 'from-violet-500 to-indigo-500' },
                { label: '1–2 раза в неделю', pct: Math.round((p.surveyData.weekly1_2 / total) * 100), count: p.surveyData.weekly1_2, icon: Clock, color: 'from-sky-500 to-blue-500' },
                { label: '3–4 раза в неделю', pct: Math.round((p.surveyData.weekly3_4 / total) * 100), count: p.surveyData.weekly3_4, icon: Gamepad2, color: 'from-teal-500 to-emerald-500' },
                { label: 'Реже', pct: Math.round((p.surveyData.less / total) * 100), count: p.surveyData.less, icon: Star, color: 'from-zinc-500 to-zinc-600' },
              ].map((item, i) => (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <item.icon size={14} className="text-zinc-500 group-hover:text-white transition-colors" />
                      <span className="text-xs text-zinc-400 font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">{item.count} чел.</span>
                      <span className="text-sm font-bold text-white tabular-nums">{item.pct}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-zinc-800/60 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Польза */}
          <div className="glass rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-display font-bold text-lg">Позитивные эффекты</div>
                <div className="text-xs text-zinc-500 mt-0.5">Что отмечают игроки</div>
              </div>
              <div className="text-[10px] px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold">multi</div>
            </div>
            <div className="space-y-4">
              {benefitsChart.map((b, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-300 font-medium">{b.name}</span>
                    <span className="text-zinc-500 tabular-nums font-semibold">{b.value}%</span>
                  </div>
                  <div className="h-2.5 bg-zinc-800/60 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${b.value}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.06 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Замечают ли вред — визуальное сравнение */}
          <div className="glass rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-display font-bold text-lg">Замечают ли вред</div>
                <div className="text-xs text-zinc-500 mt-0.5">Самооценка респондентов</div>
              </div>
            </div>
            {/* Визуальный баланс */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300">Не замечают</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-rose-300">Замечают</span>
                  <AlertTriangle size={16} className="text-rose-400" />
                </div>
              </div>
              <div className="h-8 bg-zinc-800/60 rounded-full overflow-hidden flex">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${negativePie[0].value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2 }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-l-full flex items-center justify-center"
                >
                  <span className="text-xs font-bold text-white tabular-nums">{negativePie[0].value}%</span>
                </motion.div>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${negativePie[1].value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-400 rounded-r-full flex items-center justify-center"
                >
                  <span className="text-xs font-bold text-white tabular-nums">{negativePie[1].value}%</span>
                </motion.div>
              </div>
            </div>
            {/* Детали */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-extrabold gradient-text-green tabular-nums">{negativePie[0].value}%</div>
                <div className="text-xs text-zinc-400 mt-1">{negativePie[0].count} человек</div>
                <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">не видят вреда</div>
              </div>
              <div className="bg-rose-500/[0.06] border border-rose-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-extrabold gradient-text-rose tabular-nums">{negativePie[1].value}%</div>
                <div className="text-xs text-zinc-400 mt-1">{negativePie[1].count} человек</div>
                <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">замечают проблемы</div>
              </div>
            </div>
          </div>

          {/* Проблемы со сном — визуализация с иконками */}
          <div className="glass rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-display font-bold text-lg">Проблемы со сном</div>
                <div className="text-xs text-zinc-500 mt-0.5">Если играют допоздна</div>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Иногда', pct: Math.round((sleepChart[0].value)), count: sleepChart[0].count, icon: Moon, color: 'from-amber-500 to-orange-500', desc: 'Периодические нарушения' },
                { label: 'Регулярно', pct: Math.round((sleepChart[1].value)), count: sleepChart[1].count, icon: AlertTriangle, color: 'from-rose-500 to-red-500', desc: 'Постоянные проблемы' },
                { label: 'Нет проблем', pct: Math.round((sleepChart[2].value)), count: sleepChart[2].count, icon: Sun, color: 'from-emerald-500 to-teal-500', desc: 'Сон в порядке' },
              ].map((item, i) => (
                <div key={i} className="group flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 shadow-lg`}>
                    <item.icon size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <div className="text-sm font-semibold text-white">{item.label}</div>
                        <div className="text-[10px] text-zinc-500">{item.desc} · {item.count} чел.</div>
                      </div>
                      <div className="text-lg font-extrabold text-white tabular-nums">{item.pct}%</div>
                    </div>
                    <div className="h-2 bg-zinc-800/60 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.12, ease: 'easeOut' }}
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Предупреждение */}
            <div className="mt-5 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 flex items-start gap-3">
              <Timer size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-amber-300">Важно</div>
                <div className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                  {Math.round(sleepChart[0].value + sleepChart[1].value)}% респондентов имеют проблемы со сном из-за игр. Завершайте игры минимум за 1 час до сна.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis + Form */}
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                <TrendingUp size={18} className="text-violet-300" />
              </div>
              <div className="font-display font-bold text-xl">Анализ данных</div>
            </div>
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
              <p>Игры воспринимаются как способ отдыха и развития: <span className="text-white font-bold">{stressPct}%</span> отмечают снятие стресса, <span className="text-white font-bold">{Math.round((p.benefitsData[1].value / total) * 100)}%</span> — развитие логики.</p>
              <p><span className="text-white font-bold">{sleepPct}%</span> хотя бы иногда замечают проблемы со сном. {noNegativePct > 60 ? 'Большинство не видит явного вреда, но режим дня остаётся главным риском.' : 'Значительная часть отмечает негативное влияние на продуктивность.'}</p>
              <p className="text-violet-300 font-semibold">{sleepPct > 50 || noNegativePct < 70 ? 'Положительное влияние реально, но без контроля риски существенны.' : 'Умеренно-позитивное влияние при сохранении баланса.'}</p>
            </div>
          </div>

          <div className="lg:col-span-2 glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                <Sparkles size={14} className="text-violet-300" />
              </div>
              <div className="font-display font-bold">Ваш голос</div>
            </div>
            <p className="text-xs text-zinc-500 mb-5">Ответы обновят диаграммы выше</p>

            <div className="space-y-4 text-sm">
              <div>
                <div className="text-xs text-zinc-400 mb-2 font-medium">1. Как часто играете?</div>
                <div className="grid grid-cols-2 gap-2">
                  {[['daily', 'Каждый день'], ['weekly1_2', '1–2 раз/нед'], ['weekly3_4', '3–4 раз/нед'], ['less', 'Реже']].map(([k, l]) => (
                    <button key={k} onClick={() => p.setUserSurvey({ ...p.userSurvey, freq: k })}
                      className={`option-btn px-3 py-2.5 rounded-lg text-xs text-left font-medium ${p.userSurvey.freq === k ? 'selected' : ''}`}>{l}</button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-zinc-400 mb-2 font-medium">2. Какая польза? (можно несколько)</div>
                <div className="space-y-1.5">
                  {BENEFIT_OPTIONS.map((o) => {
                    const sel = p.userSurvey.benefits.includes(o.key);
                    return (
                      <button key={o.key} onClick={() => p.toggleBenefit(o.key)}
                        className={`option-btn w-full px-3 py-2.5 rounded-lg text-xs text-left flex items-center gap-2.5 font-medium ${sel ? 'selected' : ''}`}>
                        <span className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition ${sel ? 'bg-violet-500 border-violet-500' : 'border-zinc-600'}`}>
                          {sel && <CheckCircle size={10} className="text-white" />}
                        </span>
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs text-zinc-400 mb-2 font-medium">3. Проблемы со сном?</div>
                <div className="grid grid-cols-3 gap-2">
                  {[['sometimes', 'Иногда'], ['regularly', 'Регулярно'], ['never', 'Нет']].map(([k, l]) => (
                    <button key={k} onClick={() => p.setUserSurvey({ ...p.userSurvey, sleep: k })}
                      className={`option-btn px-2 py-2.5 rounded-lg text-xs font-medium ${p.userSurvey.sleep === k ? 'selected' : ''}`}>{l}</button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-zinc-400 mb-2 font-medium">4. Замечаете вред?</div>
                <div className="grid grid-cols-2 gap-2">
                  {[['no', 'Нет'], ['yes', 'Да']].map(([k, l]) => (
                    <button key={k} onClick={() => p.setUserSurvey({ ...p.userSurvey, negative: k })}
                      className={`option-btn px-3 py-2.5 rounded-lg text-xs font-medium ${p.userSurvey.negative === k ? 'selected' : ''}`}>{l}</button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={p.submitUserSurvey} className="btn-primary w-full mt-5 py-3.5 rounded-xl text-sm font-semibold text-white">
              Отправить ответ
            </button>
            <div className="text-xs text-zinc-500 mt-2 text-center">
              {p.hasAddedSurvey ? '✓ Ответ учтён в диаграммах' : 'Ваши ответы обновят графики мгновенно'}
            </div>
          </div>
        </div>
      </Section>

      {/* ===== QUIZ ===== */}
      <Section dark id="quiz">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="eyebrow eyebrow-violet"><Sparkles size={12} /> Интерактив</span>
            <h2 className="font-display text-4xl sm:text-6xl font-bold mt-6">
              Тест на <span className="gradient-text">баланс</span> в играх
            </h2>
            <p className="mt-5 text-zinc-400 text-lg">5 вопросов · Получите персональные рекомендации</p>
          </div>

          <div className="glass-strong rounded-3xl p-6 sm:p-8">
            {QUIZ_QUESTIONS.map((q, qi) => (
              <div key={qi} className="mb-8 last:mb-0">
                <div className="text-sm font-semibold mb-3 text-white">
                  <span className="text-violet-400 font-extrabold">{qi + 1}.</span> {q.q}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((o, ai) => {
                    const sel = p.quizAnswers.find((a) => a.question === qi)?.answer === ai;
                    return (
                      <button key={ai} onClick={() => p.handleQuizAnswer(qi, ai)}
                        className={`option-btn px-4 py-3 rounded-xl text-sm text-left font-medium ${sel ? 'selected' : ''}`}>{o}</button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button onClick={p.calculateQuizResult} className="btn-primary w-full mt-3 py-4 rounded-2xl text-white font-semibold flex items-center justify-center gap-2">
              Получить результат <Star size={17} />
            </button>
          </div>
        </div>
      </Section>

      {/* ===== MYTHS VS FACTS ===== */}
      <Section id="myths" dark>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="eyebrow eyebrow-rose"><Shield size={12} /> Мифы и реальность</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold mt-6">
              Развенчиваем <span className="gradient-text-rose">мифы</span> об играх
            </h2>
            <p className="mt-5 text-zinc-400 text-lg max-w-lg mx-auto">Не всё, что говорят об играх — правда. Разберёмся в фактах.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { myth: 'Все игры — насилие', fact: 'Только 12% популярных игр содержат насилие. Большинство — головоломки, симуляторы и стратегии.', color: 'rose' },
              { myth: 'Игры развивают агрессию', fact: 'Исследования не подтверждают прямую связь. Агрессия зависит от многих факторов, а не только от контента.', color: 'rose' },
              { myth: 'Игры = зависимость', fact: 'Зависимость (Gaming Disorder) затрагивает лишь 1–3% игроков. Для большинства игры — здоровое хобби.', color: 'rose' },
              { myth: 'Игры портят зрение', fact: 'Умеренное использование безопасно. Важно делать перерывы и соблюдать дистанцию до экрана.', color: 'amber' },
              { myth: 'Игры бесполезны', fact: 'Стратегии развивают планирование, экшен — реакцию, песочницы — креативность.', color: 'amber' },
              { myth: 'Дети не могут контролировать время', fact: 'При правильном обучении и установлении правил дети успешно управляют временем.', color: 'amber' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                onClick={() => setDetailModal({ type: 'myth', data: { icon: Shield, title: item.myth, text: `Распространённое заблуждение: «${item.myth}»`, detail: item.fact, tips: ['Проверяйте источники информации', 'Изучайте научные исследования', 'Не верьте стереотипам'] } })}
                className="glass rounded-2xl p-6 hover:border-zinc-700/60 transition-colors cursor-pointer hover:scale-[1.02]">
                <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider mb-3 ${
                  item.color === 'rose' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                }`}>
                  {item.color === 'rose' ? 'Миф' : 'Частично правда'}
                </div>
                <div className="font-display font-bold text-sm text-white mb-3 line-through decoration-rose-400/50">{item.myth}</div>
                <div className="flex gap-2">
                  <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-zinc-300 leading-relaxed">{item.fact}</div>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-zinc-500 opacity-0 hover:opacity-100 transition-opacity">
                  <span>Подробнее</span>
                  <ArrowRight size={12} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ===== RECOMMENDATIONS ===== */}
      <Section id="recommendations">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-14">
            <span className="eyebrow eyebrow-green"><Lightbulb size={12} /> Рекомендации</span>
            <h2 className="font-display text-4xl sm:text-6xl font-bold mt-6">
              <span className="gradient-text-green">Персональный</span> план действий
            </h2>
            <p className="mt-5 text-zinc-400 text-lg max-w-2xl">
              Пройдите тест выше — и получите конкретные действия именно под ваши привычки. А пока — общие советы для всех.
            </p>
          </div>

          {/* Quiz Result — Hero Card */}
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl mb-8">
            {p.quizResult ? (
              <div className="relative">
                {/* Фон с градиентом на основе score */}
                <div className={`absolute inset-0 ${
                  p.quizResult.score >= 70 ? 'bg-gradient-to-br from-emerald-900/30 via-[#0a0a0b] to-teal-900/20' :
                  p.quizResult.score >= 40 ? 'bg-gradient-to-br from-amber-900/20 via-[#0a0a0b] to-orange-900/15' :
                  'bg-gradient-to-br from-rose-900/20 via-[#0a0a0b] to-red-900/15'
                }`} />
                <div className="relative glass-strong rounded-3xl p-6 sm:p-10">
                  <div className="grid lg:grid-cols-[auto_1fr] gap-10">
                    {/* Score */}
                    <div className="flex flex-col items-center lg:items-start">
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 144 144">
                          <circle cx="72" cy="72" r="62" fill="none" stroke="rgba(63,63,70,0.3)" strokeWidth="8" />
                          <motion.circle
                            cx="72" cy="72" r="62" fill="none"
                            stroke={p.quizResult.score >= 70 ? '#34d399' : p.quizResult.score >= 40 ? '#fbbf24' : '#fb7185'}
                            strokeWidth="8" strokeLinecap="round"
                            strokeDasharray={`${62 * 2 * Math.PI}`}
                            initial={{ strokeDashoffset: 62 * 2 * Math.PI }}
                            whileInView={{ strokeDashoffset: 62 * 2 * Math.PI * (1 - p.quizResult.score / 100) }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                          />
                        </svg>
                        <div className="text-center">
                          <div className="font-display text-4xl font-extrabold text-white tabular-nums">{p.quizResult.score}</div>
                          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">из 100</div>
                        </div>
                      </div>
                      <div className={`mt-4 px-3 py-1.5 rounded-full text-xs font-semibold ${
                        p.quizResult.score >= 70 ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                        p.quizResult.score >= 40 ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                        'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}>
                        {p.quizResult.message}
                      </div>
                    </div>

                    {/* Advice + Recs */}
                    <div>
                      <p className="text-zinc-300 text-base leading-relaxed mb-6">{p.quizResult.advice}</p>
                      <div className="text-xs uppercase tracking-wider text-violet-400 font-semibold mb-3">Что сделать в первую очередь</div>
                      <div className="space-y-2">
                        {p.quizResult.recommendations.map((r, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                            className="flex gap-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50 px-4 py-3.5 text-sm group hover:border-emerald-500/30 transition-colors">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                              <CheckCircle size={14} className="text-emerald-400" />
                            </div>
                            <span className="text-zinc-200">{r}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-strong rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-28 h-28 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
                    <circle cx="72" cy="72" r="62" fill="none" stroke="rgba(63,63,70,0.3)" strokeWidth="8" />
                    <circle cx="72" cy="72" r="62" fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="8"
                      strokeDasharray="20 15" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={28} className="text-violet-400/50" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="font-display text-2xl font-bold text-white mb-2">Ваш план пока не составлен</div>
                  <p className="text-zinc-400 max-w-md">Ответьте на 5 вопросов теста — и здесь появится персональная оценка баланса с конкретными шагами.</p>
                </div>
                <button onClick={() => scrollTo('quiz')} className="btn-primary px-7 py-3.5 rounded-2xl text-sm font-semibold text-white whitespace-nowrap flex items-center gap-2">
                  Пройти тест <ArrowRight size={16} />
                </button>
              </div>
            )}
          </motion.div>

          {/* Teens + Parents — Redesigned */}
          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            {/* Подросткам */}
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="glass rounded-2xl p-6 sm:p-8 relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-colors" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <Gamepad2 size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-xl">Подросткам</div>
                    <div className="text-xs text-zinc-500">4 главных правила</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {TEEN_RECOMMENDATIONS.map((r, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-violet-300">{i + 1}</span>
                      </div>
                      <div className="text-sm text-zinc-300 leading-relaxed">{r}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Родителям */}
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
              className="glass rounded-2xl p-6 sm:p-8 relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Users size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-xl">Родителям</div>
                    <div className="text-xs text-zinc-500">4 ключевых действия</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {PARENT_RECOMMENDATIONS.map((r, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-emerald-300">{i + 1}</span>
                      </div>
                      <div className="text-sm text-zinc-300 leading-relaxed">{r}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Признаки зависимости */}
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative overflow-hidden glass rounded-2xl p-6 sm:p-8">
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-rose-400" />
                </div>
                <div>
                  <div className="font-display font-bold text-lg text-white">Признаки игровой зависимости</div>
                  <div className="text-xs text-zinc-500">Если вы заметили 3 или более — стоит обратиться к специалисту</div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5">
                {[
                  'Потеря контроля над временем игры',
                  'Приоритет игр над учёбой и общением',
                  'Раздражительность без возможности играть',
                  'Ложь о времени, проведённом в играх',
                  'Продолжение игры несмотря на проблемы',
                  'Использование игр для ухода от реальности',
                ].map((sign, i) => (
                  <div key={i} className="flex gap-3 px-4 py-3 rounded-xl border border-rose-500/10 bg-rose-500/[0.03] text-sm">
                    <AlertTriangle size={14} className="text-rose-400/70 shrink-0 mt-0.5" />
                    <span className="text-zinc-300 leading-relaxed">{sign}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-3.5 rounded-xl bg-rose-500/[0.06] border border-rose-500/20 flex items-start gap-3">
                <ShieldCheck size={16} className="text-rose-300 shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-400 leading-relaxed">
                  <span className="font-semibold text-rose-300">Важно: </span>
                  При обнаружении 3 и более признаков рекомендуется обратиться к психологу. Игровая зависимость (Gaming Disorder) включена в МКБ-11 ВОЗ.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ===== CONCLUSION + SOURCES ===== */}
      <Section dark id="sources">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass rounded-3xl p-6 sm:p-8">
            <span className="eyebrow eyebrow-violet mb-5"><Shield size={12} /> Главный вывод</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-5">
              Игры могут <span className="gradient-text">приносить пользу</span>, если соблюдать баланс
            </h2>
            <p className="text-zinc-300 mb-6 leading-relaxed">Развитие реакции, логики и отдых — реальные плюсы. Но при долгих сессиях и игре допоздна появляются риски для сна, учёбы и здоровья.</p>
            <div className="space-y-4">
              {['Игры — отдых, а не основное занятие', 'Лимит времени, перерывы и не играть перед сном', 'Родителям и подросткам — обсуждать выбор игр'].map((t, i) => (
                <div key={i} className="flex gap-3 text-sm text-zinc-300">
                  <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-6 sm:p-8">
            <span className="eyebrow eyebrow-violet mb-5"><BookOpen size={12} /> Источники</span>
            <h3 className="font-display text-xl font-bold mb-5">Список литературы</h3>
            <ul className="space-y-3 text-sm">
              {SOURCES.map((s, i) => (
                <li key={i} className="flex gap-3 text-zinc-400 leading-relaxed">
                  <span className="text-violet-400/50 tabular-nums w-6 shrink-0 font-mono text-xs">{(i + 1).toString().padStart(2, '0')}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-zinc-900/50 py-12 bg-[#060608]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Gamepad2 size={16} className="text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-sm text-white">Компьютерные игры: польза и риски</div>
              <div className="text-xs text-zinc-500">Информационный сайт о безопасном гейминге</div>
            </div>
          </div>
          <div className="text-xs text-zinc-500 text-center md:text-right">
            Образовательный проект · 2026<br />
            Польза, риски, опрос и персональные рекомендации
          </div>
        </div>
      </footer>

      {/* ===== DETAIL MODAL ===== */}
      <AnimatePresence>
        {detailModal && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={() => setDetailModal(null)}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg overflow-hidden rounded-[2rem]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-[#0c0c0e] to-indigo-950/30" />
              <div className="absolute inset-0 bg-[#0c0c0e]/60" />
              <div className="relative p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      detailModal.type === 'benefit' ? 'bg-emerald-500/20 text-emerald-300' :
                      detailModal.type === 'risk' ? 'bg-rose-500/20 text-rose-300' :
                      detailModal.type === 'history' ? 'bg-violet-500/20 text-violet-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      <detailModal.data.icon size={22} />
                    </div>
                    <div>
                      {detailModal.type === 'history' && detailModal.data.year && (
                        <div className="text-xs font-semibold text-violet-300 mb-0.5">{detailModal.data.year}</div>
                      )}
                      <div className="font-display font-bold text-lg text-white">{detailModal.data.title}</div>
                    </div>
                  </div>
                  <button onClick={() => setDetailModal(null)} className="w-9 h-9 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white transition">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
                    <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Кратко</div>
                    <div className="text-zinc-300 leading-relaxed">{detailModal.data.text}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-violet-500/[0.06] border border-violet-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb size={14} className="text-violet-300" />
                      <div className="text-xs uppercase tracking-wider text-violet-300 font-semibold">Подробно</div>
                    </div>
                    <div className="text-zinc-300 leading-relaxed text-sm">{detailModal.data.detail}</div>
                  </div>

                  {detailModal.data.tips && (
                    <div>
                      <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Советы</div>
                      <div className="space-y-2">
                        {detailModal.data.tips.map((tip: string, i: number) => (
                          <div key={i} className="flex gap-2.5 text-sm text-zinc-300">
                            <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                            {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={() => setDetailModal(null)} className="w-full mt-6 py-3.5 rounded-xl border border-zinc-700/50 text-sm text-zinc-300 hover:bg-zinc-800/50 transition">
                  Закрыть
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== QUIZ MODAL ===== */}
      <AnimatePresence>
        {p.showQuizModal && p.quizResult && (() => {
          const s = p.quizResult.score;
          const isGood = s >= 70;
          const isMid = s >= 40 && s < 70;
          const accent = isGood ? 'emerald' : isMid ? 'amber' : 'rose';
          const accentColor = isGood ? '#34d399' : isMid ? '#fbbf24' : '#fb7185';
          const bgGradient = isGood 
            ? 'from-emerald-950/40 via-[#0c0c0e] to-teal-950/30'
            : isMid ? 'from-amber-950/30 via-[#0c0c0e] to-orange-950/20'
            : 'from-rose-950/30 via-[#0c0c0e] to-red-950/20';
          const emoji = isGood ? '🎮' : isMid ? '⚡' : '⚠️';

          return (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" onClick={p.closeQuizModal}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg overflow-hidden rounded-[2rem]"
            >
              {/* Фон */}
              <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient}`} />
              <div className="absolute inset-0 bg-[#0c0c0e]/60" />

              <div className="relative p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{emoji}</span>
                    <span className="font-display font-bold text-base text-white">Результат теста</span>
                  </div>
                  <button onClick={p.closeQuizModal} className="w-8 h-8 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white transition">
                    <X size={16} />
                  </button>
                </div>

                {/* Score Ring */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(63,63,70,0.2)" strokeWidth="8" />
                      <motion.circle
                        cx="80" cy="80" r="68" fill="none"
                        stroke={accentColor}
                        strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${68 * 2 * Math.PI}`}
                        initial={{ strokeDashoffset: 68 * 2 * Math.PI }}
                        animate={{ strokeDashoffset: 68 * 2 * Math.PI * (1 - s / 100) }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="font-display text-5xl font-extrabold text-white tabular-nums"
                      >
                        {s}
                      </motion.div>
                      <div className="text-xs text-zinc-500 font-medium">из 100</div>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="text-center mb-6">
                  <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-3 bg-${accent}-500/15 text-${accent}-300 border border-${accent}-500/30`}>
                    {p.quizResult.message}
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">{p.quizResult.advice}</p>
                </div>

                {/* Top Recommendations */}
                <div className="mb-6">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-3">Ваши первые шаги</div>
                  <div className="space-y-2">
                    {p.quizResult.recommendations.slice(0, 3).map((r, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.12 }}
                        className="flex gap-3 rounded-xl bg-zinc-900/40 border border-zinc-800/40 px-4 py-3 text-sm"
                      >
                        <div className={`w-6 h-6 rounded-md bg-${accent}-500/15 flex items-center justify-center shrink-0`}>
                          <span className={`text-xs font-bold text-${accent}-300`}>{i + 1}</span>
                        </div>
                        <span className="text-zinc-200 leading-relaxed">{r}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2.5">
                  <button
                    onClick={() => { p.closeQuizModal(); scrollTo('recommendations'); }}
                    className="btn-primary flex-1 py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                  >
                    Все рекомендации <ArrowRight size={15} />
                  </button>
                  <button onClick={p.closeQuizModal} className="px-5 py-3.5 border border-zinc-700/50 rounded-xl text-sm text-zinc-300 hover:bg-zinc-800/50 transition">
                    Закрыть
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

// ============== ADMIN PAGE ==============
const AdminPage: React.FC<{
  isAuthenticated: boolean; setIsAuthenticated: (b: boolean) => void;
  password: string; setPassword: (s: string) => void;
  responses: SurveyResponse[]; formatAnswer: (r: SurveyResponse) => string;
  saveResponses: (r: SurveyResponse[]) => void;
}> = (p) => {
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = () => {
    if (p.password === ADMIN_PASSWORD) {
      p.setIsAuthenticated(true);
      p.setPassword('');
      toast.show('success', 'Доступ разрешён', 'Добро пожаловать в админ-панель');
    } else {
      toast.show('error', 'Неверный пароль', 'Проверьте раскладку и регистр');
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100 py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Админ-панель</h1>
              <div className="text-xs text-zinc-500 mt-0.5">Управление ответами опроса</div>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="text-sm text-zinc-400 hover:text-white px-4 py-2 rounded-lg hover:bg-zinc-900/50 font-medium">
            ← На главную
          </button>
        </div>

        {!p.isAuthenticated ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-3xl p-8 max-w-md mx-auto mt-4">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mx-auto mb-5">
              <ShieldCheck size={24} className="text-violet-300" />
            </div>
            <h2 className="font-display text-xl font-bold text-center mb-1">Вход в панель</h2>
            <p className="text-sm text-zinc-500 text-center mb-6">Введите пароль автора сайта</p>
            <input
              type="password" value={p.password} onChange={(e) => p.setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Пароль" autoFocus
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-3 outline-none focus:border-violet-500 text-sm mb-3 placeholder:text-zinc-600"
            />
            <button onClick={handleLogin} className="btn-primary w-full py-3 rounded-xl text-white font-semibold">Войти</button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 px-1">
              <div className="text-sm text-zinc-400">Всего ответов: <span className="text-white font-bold">{p.responses.length}</span></div>
              {p.responses.length > 0 && (
                <button onClick={async () => {
                  const ok = await toast.confirm('Удалить все ответы?', 'Это действие нельзя отменить.');
                  if (ok) { p.saveResponses([]); toast.show('success', 'Готово', 'Все ответы удалены'); }
                }} className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 font-medium">
                  Очистить всё
                </button>
              )}
            </div>
            <div className="space-y-3">
              {p.responses.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center text-sm text-zinc-500">
                  <ShieldCheck size={32} className="mx-auto mb-3 text-zinc-600" />
                  Пока нет сохранённых ответов
                </div>
              ) : (
                p.responses.map((res, i) => (
                  <motion.div key={res.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-sm font-semibold text-white">Ответ #{i + 1}</div>
                        <div className="text-[10px] text-zinc-500">{new Date(res.createdAt).toLocaleString('ru-RU')}</div>
                      </div>
                      <div className="text-xs text-zinc-400 leading-relaxed">{p.formatAnswer(res)}</div>
                    </div>
                    <button onClick={async () => {
                      const ok = await toast.confirm('Удалить ответ?', `Ответ #${i + 1} будет удалён безвозвратно.`);
                      if (ok) { p.saveResponses(p.responses.filter((r) => r.id !== res.id)); toast.show('success', 'Удалено', `Ответ #${i + 1} удалён`); }
                    }} className="flex items-center gap-1.5 text-xs text-rose-300 px-3 py-2 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 shrink-0 font-medium">
                      <Trash2 size={13} /> Удалить
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ============== APP ROOT ==============
const App: React.FC = () => {
  const toast = useToast();
  const [surveyData, setSurveyData] = useState<SurveyData>(INITIAL_SURVEY);
  const [benefitsData, setBenefitsData] = useState<BenefitData[]>(INITIAL_BENEFITS);
  const [negativeData, setNegativeData] = useState(INITIAL_NEGATIVE);
  const [sleepData, setSleepData] = useState(SLEEP_DATA);
  const [userSurvey, setUserSurvey] = useState<{ freq: string; benefits: string[]; sleep: string; negative: string }>({ freq: '', benefits: [], sleep: '', negative: '' });
  const [hasAddedSurvey, setHasAddedSurvey] = useState(false);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [recommendations, setRecommendations] = useState<RecItem[]>(BASE_RECOMMENDATIONS);
  const [progress, setProgress] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('gameRecommendations');
    if (saved) { try { setRecommendations(JSON.parse(saved)); } catch {} }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(SURVEY_STORAGE_KEY);
    if (saved) { try { const parsed = JSON.parse(saved) as SurveyResponse[]; setSurveyResponses(parsed); applySurveyResponses(parsed); } catch { localStorage.removeItem(SURVEY_STORAGE_KEY); } }
  }, []);

  useEffect(() => {
    const done = recommendations.filter((r) => r.completed).length;
    setProgress(Math.round((done / recommendations.length) * 100));
    localStorage.setItem('gameRecommendations', JSON.stringify(recommendations));
  }, [recommendations]);

  const applySurveyResponses = (responses: SurveyResponse[]) => {
    const ns = { ...INITIAL_SURVEY }; const nb = INITIAL_BENEFITS.map((b) => ({ ...b }));
    const nn = { ...INITIAL_NEGATIVE }; const nsleep = SLEEP_DATA.map((s) => ({ ...s }));
    responses.forEach((r) => {
      if (r.freq === 'daily') ns.daily++; else if (r.freq === 'weekly1_2') ns.weekly1_2++; else if (r.freq === 'weekly3_4') ns.weekly3_4++; else ns.less++; ns.total++;
      (r.benefits ?? []).forEach((k) => { const idx = BENEFIT_OPTIONS.findIndex((o) => o.key === k); if (idx !== -1) nb[idx].value++; });
      if (r.negative === 'no') nn.no++; else nn.yes++;
      if (r.sleep === 'sometimes') nsleep[0].value++; else if (r.sleep === 'regularly') nsleep[1].value++; else nsleep[2].value++;
    });
    setSurveyData(ns); setBenefitsData(nb); setNegativeData(nn); setSleepData(nsleep);
  };

  const saveSurveyResponses = (responses: SurveyResponse[]) => { setSurveyResponses(responses); localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(responses)); applySurveyResponses(responses); };
  const formatSurveyAnswer = (r: SurveyResponse) => {
    const freqL: Record<string, string> = { daily: 'Каждый день', weekly1_2: '1-2 раз/нед', weekly3_4: '3-4 раз/нед', less: 'Реже' };
    const sleepL: Record<string, string> = { sometimes: 'Иногда', regularly: 'Регулярно', never: 'Нет' };
    const bens = (r.benefits ?? []).map((k) => BENEFIT_OPTIONS.find((o) => o.key === k)?.label).filter(Boolean).join(', ');
    return `Частота: ${freqL[r.freq] ?? r.freq}; польза: ${bens || '—'}; сон: ${sleepL[r.sleep] ?? r.sleep}; вред: ${r.negative === 'yes' ? 'да' : 'нет'}`;
  };

  const submitUserSurvey = () => {
    if (!userSurvey.freq || !userSurvey.sleep || !userSurvey.negative) { toast.show('error', 'Заполните все поля', 'Ответьте на вопросы 1, 3 и 4 анкеты'); return; }
    const next: SurveyResponse = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, createdAt: new Date().toISOString(), ...userSurvey };
    saveSurveyResponses([...surveyResponses, next]);
    setHasAddedSurvey(true);
    setUserSurvey({ freq: '', benefits: [], sleep: '', negative: '' });
    toast.show('success', 'Спасибо!', 'Ваш ответ учтён в общей статистике');
  };

  const toggleBenefit = (k: string) => setUserSurvey((prev) => ({ ...prev, benefits: prev.benefits.includes(k) ? prev.benefits.filter((i) => i !== k) : [...prev.benefits, k] }));
  const toggleRecommendation = (id: number) => setRecommendations((prev) => prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)));
  const resetRecommendations = () => { setRecommendations(BASE_RECOMMENDATIONS); localStorage.removeItem('gameRecommendations'); };

  const handleQuizAnswer = (q: number, a: number) => {
    const i = quizAnswers.findIndex((x) => x.question === q);
    const next = [...quizAnswers];
    if (i !== -1) next[i] = { question: q, answer: a }; else next.push({ question: q, answer: a });
    setQuizAnswers(next);
  };

  const calculateQuizResult = () => {
    if (quizAnswers.length !== QUIZ_QUESTIONS.length) { toast.show('error', 'Тест не завершён', `Отвечено ${quizAnswers.length} из ${QUIZ_QUESTIONS.length} вопросов`); return; }
    const risk = quizAnswers.reduce((s, a) => s + a.answer, 0);
    const score = Math.round(100 - (risk / 15) * 100);
    let message = '', advice = '';
    if (score >= 85) { message = 'Отличный баланс!'; advice = 'Вы ответственно подходите к играм.'; }
    else if (score >= 65) { message = 'Хороший баланс'; advice = 'Здоровое отношение. Следите за сном и перерывами.'; }
    else if (score >= 45) { message = 'Средний баланс'; advice = 'Установите лимиты времени и завершайте игры раньше.'; }
    else { message = 'Стоит пересмотреть привычки'; advice = 'Начните с базовых рекомендаций: лимит, перерывы, не играть перед сном.'; }
    const aBQ = (q: number) => quizAnswers.find((a) => a.question === q)?.answer ?? 0;
    const recs: string[] = [];
    if (aBQ(0) >= 1) recs.push(aBQ(0) === 0 ? 'Сохраняйте текущую частоту, если не мешает учёбе и сну.' : 'Выделите 1–2 дня в неделю без игр.');
    if (aBQ(1) >= 2) recs.push('Сократите сессию до 60–90 минут — ставьте таймер до запуска.');
    else recs.push('Держите сессии короткими — легче сохранить концентрацию.');
    if (aBQ(2) >= 1) recs.push('Заканчивайте игры за час до сна, не начинайте онлайн-матчи поздно.');
    if (aBQ(3) >= 2) recs.push('Правило: сначала учёба и дела, потом игра как награда.');
    if (aBQ(4) >= 2) recs.push('Делайте перерыв на 5–10 минут после каждых 30–45 минут игры.');
    if (recs.length < 3) recs.push('Регулярно проверяйте сон, настроение, учёбу и общение.');
    setQuizResult({ score, message, advice, recommendations: recs });
    setShowQuizModal(true);
    setQuizAnswers([]);
  };

  const closeQuizModal = () => setShowQuizModal(false);

  return (
    <Routes>
      <Route path="/" element={
        <MainSite surveyData={surveyData} benefitsData={benefitsData} negativeData={negativeData} sleepData={sleepData}
          userSurvey={userSurvey} setUserSurvey={setUserSurvey} hasAddedSurvey={hasAddedSurvey}
          recommendations={recommendations} progress={progress} quizAnswers={quizAnswers} quizResult={quizResult}
          showQuizModal={showQuizModal} selectedGenre={selectedGenre} setSelectedGenre={setSelectedGenre}
          submitUserSurvey={submitUserSurvey} toggleBenefit={toggleBenefit}
          toggleRecommendation={toggleRecommendation} resetRecommendations={resetRecommendations}
          handleQuizAnswer={handleQuizAnswer} calculateQuizResult={calculateQuizResult} closeQuizModal={closeQuizModal} toast={toast} />
      } />
      <Route path="/admin-2026" element={
        <AdminPage isAuthenticated={isAdminAuthenticated} setIsAuthenticated={setIsAdminAuthenticated}
          password={adminPassword} setPassword={setAdminPassword} responses={surveyResponses}
          formatAnswer={formatSurveyAnswer} saveResponses={saveSurveyResponses} />
      } />
    </Routes>
  );
};

export default App;
