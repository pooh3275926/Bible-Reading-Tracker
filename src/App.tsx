import { useState, useEffect, useMemo } from 'react';
import { BIBLE_BOOKS, TOTAL_CHAPTERS } from './data/bible';
import { motion, AnimatePresence } from 'motion/react';

function ProgressBar({ progress, color = 'bg-[#C1A594]', height = 'h-1.5' }: { progress: number; color?: string; height?: string }) {
  return (
    <div className={`w-full bg-[#E8E3DD] rounded-full overflow-hidden ${height}`}>
      <motion.div
        className={`h-full ${color} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

function BookCard({ 
  book, 
  readChapters, 
  toggleChapter 
}: { 
  book: typeof BIBLE_BOOKS[0]; 
  readChapters: Record<string, boolean>; 
  toggleChapter: (bookId: string, chapter: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const readCount = Array.from({ length: book.chapters }).filter((_, i) => readChapters[`${book.id}-${i + 1}`]).length;
  const progress = (readCount / book.chapters) * 100;
  const isCompleted = readCount === book.chapters;

  return (
    <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(74,66,61,0.03)] mb-4 overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 text-left active:bg-[#F5F3EF]/50 transition-colors"
      >
        <div className="flex justify-between items-end mb-3">
          <div>
            <h3 className={`text-lg font-serif font-bold transition-colors ${isCompleted ? 'text-[#98A89D]' : 'text-[#4A423D]'}`}>
              {book.name}
            </h3>
            <p className="text-xs text-[#8C847D] mt-1 tracking-wide">{readCount} / {book.chapters} 章</p>
          </div>
          <div className={`text-2xl font-serif transition-colors ${isCompleted ? 'text-[#98A89D]' : 'text-[#C1A594]'}`}>
            {Math.round(progress)}%
          </div>
        </div>
        <ProgressBar progress={progress} color={isCompleted ? 'bg-[#98A89D]' : 'bg-[#C1A594]'} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-5 pt-0 grid grid-cols-5 gap-3">
              {Array.from({ length: book.chapters }).map((_, i) => {
                const chapter = i + 1;
                const isRead = readChapters[`${book.id}-${chapter}`];
                return (
                  <button
                    key={chapter}
                    onClick={() => toggleChapter(book.id, chapter)}
                    className={`
                      aspect-square rounded-full flex items-center justify-center text-sm transition-all duration-300
                      ${isRead 
                        ? 'bg-[#98A89D] text-white shadow-md shadow-[#98A89D]/30 scale-105' 
                        : 'bg-[#F5F3EF] text-[#8C847D] hover:bg-[#E8E3DD] active:scale-95'}
                    `}
                  >
                    {chapter}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [readChapters, setReadChapters] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'OT' | 'NT'>('OT');

  useEffect(() => {
    const savedStart = localStorage.getItem('bible_start_date');
    const savedEnd = localStorage.getItem('bible_end_date');
    const savedChapters = localStorage.getItem('bible_read_chapters');

    if (savedStart) setStartDate(savedStart);
    if (savedEnd) setEndDate(savedEnd);
    if (savedChapters) {
      try {
        setReadChapters(JSON.parse(savedChapters));
      } catch (e) {
        console.error('Failed to parse saved chapters', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bible_start_date', startDate);
    localStorage.setItem('bible_end_date', endDate);
    localStorage.setItem('bible_read_chapters', JSON.stringify(readChapters));
  }, [startDate, endDate, readChapters]);

  const toggleChapter = (bookId: string, chapter: number) => {
    setReadChapters(prev => {
      const key = `${bookId}-${chapter}`;
      const newState = { ...prev };
      if (newState[key]) {
        delete newState[key];
      } else {
        newState[key] = true;
      }
      return newState;
    });
  };

  const totalRead = Object.keys(readChapters).length;
  const overallProgress = (totalRead / TOTAL_CHAPTERS) * 100;

  const dateStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const daysPassed = start ? Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))) : 0;
    const totalDays = start && end ? Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))) : null;
    const daysRemaining = totalDays ? Math.max(0, totalDays - daysPassed) : null;

    return { start, end, daysPassed, totalDays, daysRemaining };
  }, [startDate, endDate]);

  return (
    <div className="min-h-screen bg-[#E8E3DD] flex justify-center font-sans">
      <div className="w-full max-w-md bg-[#F5F3EF] min-h-screen shadow-2xl relative overflow-y-auto pb-20">
        
        {/* Header */}
        <header className="pt-12 pb-6 px-6">
          <h1 className="text-3xl font-serif text-[#4A423D] tracking-wide font-bold">靈修旅程</h1>
          <p className="text-[#8C847D] text-sm mt-2 tracking-wide">每日與神同行，記錄讀經時光</p>
        </header>

        {/* Date Inputs */}
        <div className="px-6 mb-6 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_rgba(74,66,61,0.03)]">
            <label className="block text-[10px] font-medium text-[#8C847D] tracking-wider mb-2">開始日期</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-transparent text-[#4A423D] text-sm outline-none font-medium" 
            />
          </div>
          <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_rgba(74,66,61,0.03)]">
            <label className="block text-[10px] font-medium text-[#8C847D] tracking-wider mb-2">目標日期</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-transparent text-[#4A423D] text-sm outline-none font-medium" 
            />
          </div>
        </div>

        {/* Overall Progress */}
        <div className="px-6 mb-8">
          <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgba(74,66,61,0.04)] relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-[#C1A594]/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <h2 className="text-[11px] font-medium text-[#8C847D] mb-2 tracking-widest uppercase">總進度</h2>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-serif text-[#4A423D]">{overallProgress.toFixed(1)}</span>
              <span className="text-xl font-serif text-[#C1A594]">%</span>
            </div>
            
            <ProgressBar progress={overallProgress} height="h-2" />
            <p className="text-right text-xs text-[#8C847D] mt-3 tracking-wide">{totalRead} / {TOTAL_CHAPTERS} 章</p>

            <div className="mt-8 pt-6 border-t border-[#F5F3EF] grid grid-cols-2 gap-6">
              <div>
                <p className="text-[11px] text-[#8C847D] mb-1 tracking-wider">已進行</p>
                <p className="text-2xl font-serif text-[#4A423D]">
                  {dateStats.start ? dateStats.daysPassed : '-'} <span className="text-sm text-[#8C847D] font-sans">天</span>
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#8C847D] mb-1 tracking-wider">剩餘</p>
                <p className="text-2xl font-serif text-[#4A423D]">
                  {dateStats.totalDays ? dateStats.daysRemaining : '-'} <span className="text-sm text-[#8C847D] font-sans">天</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 mb-6">
          <div className="flex p-1.5 bg-[#E8E3DD] rounded-full">
            <button
              onClick={() => setActiveTab('OT')}
              className={`flex-1 py-3 text-sm font-medium rounded-full transition-all duration-300 ${
                activeTab === 'OT' 
                  ? 'bg-white text-[#4A423D] shadow-sm' 
                  : 'text-[#8C847D] hover:text-[#4A423D]'
              }`}
            >
              舊約
            </button>
            <button
              onClick={() => setActiveTab('NT')}
              className={`flex-1 py-3 text-sm font-medium rounded-full transition-all duration-300 ${
                activeTab === 'NT' 
                  ? 'bg-white text-[#4A423D] shadow-sm' 
                  : 'text-[#8C847D] hover:text-[#4A423D]'
              }`}
            >
              新約
            </button>
          </div>
        </div>

        {/* Book List */}
        <div className="px-6">
          {BIBLE_BOOKS.filter(b => b.testament === activeTab).map(book => (
            <BookCard 
              key={book.id} 
              book={book} 
              readChapters={readChapters} 
              toggleChapter={toggleChapter} 
            />
          ))}
        </div>

      </div>
    </div>
  );
}
