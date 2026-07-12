import React, { useState, useEffect, useRef } from 'react';
import { GameResult } from '../types';
import {
  Gamepad2,
  Trophy,
  Timer,
  CheckCircle,
  RotateCcw,
  Star,
  Info
} from 'lucide-react';

interface MatchingGameProps {
  onComplete: (result: GameResult) => void;
  onNavigate: (targetTab: string) => void;
  existingResults: GameResult[];
}

interface GameItem {
  id: string;
  term: string;
  definition: string;
}

const gamePool: GameItem[] = [
  { id: '1', term: 'Sender', definition: 'อุปกรณ์หรือบุคคลที่เป็นต้นทางสร้างและส่งข้อมูล' },
  { id: '2', term: 'Receiver', definition: 'อุปกรณ์หรือบุคคลปลายทางที่เป็นผู้รับข้อมูล' },
  { id: '3', term: 'Message', definition: 'ข้อมูลดิบหรือข่าวสารที่ต้องการรับส่งผ่านเครือข่าย' },
  { id: '4', term: 'Transmission Medium', definition: 'สื่อกลางที่เป็นช่องทางหรือเส้นทางให้ข้อมูลเดินทาง' },
  { id: '5', term: 'Protocol', definition: 'กฎระเบียบ กติกา หรือข้อตกลงมาตรฐานในการสื่อสารข้อมูล' },
  { id: '6', term: 'Switch', definition: 'ฮาร์ดแวร์คอยเชื่อมต่อและรวมอุปกรณ์ภายในเครือข่ายวงเดียวกัน' },
  { id: '7', term: 'Router', definition: 'ฮาร์ดแวร์เชื่อมต่อและนำทางข้อมูลข้ามวงเครือข่ายที่ต่างกัน' },
  { id: '8', term: 'Access Point', definition: 'อุปกรณ์ที่กระจายสัญญาณไร้สายเปลี่ยนสาย LAN เป็น Wi-Fi' },
  { id: '9', term: 'DNS', definition: 'บริการที่แปลงชื่อเว็บไซต์ให้กลายเป็นหมายเลข IP Address' },
  { id: '10', term: 'DHCP', definition: 'บริการที่ทำการแจกจ่ายหมายเลข IP Address ให้แก่อุปกรณ์อัตโนมัติ' },
  { id: '11', term: 'Web', definition: 'บริการเรียกดูเอกสารเว็บเพจและข้อมูลผ่านเบราว์เซอร์' },
  { id: '12', term: 'Email', definition: 'บริการรับส่งจดหมายและแฟ้มข้อมูลอิเล็กทรอนิกส์ผ่านเครือข่าย' },
  { id: '13', term: 'Fiber Optic', definition: 'สายสัญญาณใยแก้วนำแสง ทำงานด้วยการส่งแสงความเร็วสูงสุด' },
  { id: '14', term: 'Wi-Fi', definition: 'มาตรฐานสื่อกลางการเชื่อมต่อข้อมูลแบบไร้สายใช้คลื่นวิทยุ' }
];

export default function MatchingGame({
  onComplete,
  onNavigate,
  existingResults
}: MatchingGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeItems, setActiveItems] = useState<GameItem[]>([]);
  
  // Shuffled pools for UI displaying
  const [termsPool, setTermsPool] = useState<{ id: string; text: string }[]>([]);
  const [defsPool, setDefsPool] = useState<{ id: string; text: string }[]>([]);

  // Selection states
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [selectedDefId, setSelectedDefId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [wrongMatch, setWrongMatch] = useState<{ termId: string; defId: string } | null>(null);

  // Score states
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [victory, setVictory] = useState(false);

  const timeRef = useRef<NodeJS.Timeout | null>(null);

  const bestResult = existingResults.length > 0 
    ? [...existingResults].sort((a, b) => b.score - a.score || a.timeSeconds - b.timeSeconds)[0]
    : null;

  // Initialize Game
  const handleStartGame = () => {
    // Select 8 random matching items from the pool of 14 to make the game elegant, playable, and fit on screen beautifully!
    const pool = [...gamePool];
    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const selected = pool.slice(0, 8); // Play with 8 pairs

    // Set shuffled terms
    const terms = selected.map(item => ({ id: item.id, text: item.term }));
    for (let i = terms.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [terms[i], terms[j]] = [terms[j], terms[i]];
    }

    // Set shuffled definitions
    const defs = selected.map(item => ({ id: item.id, text: item.definition }));
    for (let i = defs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [defs[i], defs[j]] = [defs[j], defs[i]];
    }

    setActiveItems(selected);
    setTermsPool(terms);
    setDefsPool(defs);
    setMatchedIds(new Set());
    setSelectedTermId(null);
    setSelectedDefId(null);
    setWrongMatch(null);
    setScore(0);
    setGameTime(0);
    setVictory(false);
    setIsPlaying(true);
  };

  // Timer Tick
  useEffect(() => {
    if (isPlaying && !victory) {
      timeRef.current = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timeRef.current) clearInterval(timeRef.current);
    }

    return () => {
      if (timeRef.current) clearInterval(timeRef.current);
    };
  }, [isPlaying, victory]);

  // Handle Match Selection Comparison
  useEffect(() => {
    if (selectedTermId && selectedDefId) {
      if (selectedTermId === selectedDefId) {
        // Matched successfully!
        const newMatched = new Set(matchedIds);
        newMatched.add(selectedTermId);
        setMatchedIds(newMatched);
        setScore(prev => prev + 10); // +10 points per correct match
        
        // Reset selections
        setSelectedTermId(null);
        setSelectedDefId(null);

        // Check Victory condition (all 8 matched)
        if (newMatched.size === activeItems.length) {
          handleVictory();
        }
      } else {
        // Failed match! highlight red
        setWrongMatch({ termId: selectedTermId, defId: selectedDefId });
        setScore(prev => Math.max(0, prev - 2)); // Subtract small points for wrong attempt

        const timeout = setTimeout(() => {
          setSelectedTermId(null);
          setSelectedDefId(null);
          setWrongMatch(null);
        }, 800000000); // Trigger timeout but let state settle
        
        setTimeout(() => {
          setSelectedTermId(null);
          setSelectedDefId(null);
          setWrongMatch(null);
        }, 800); // 800ms visual flash
      }
    }
  }, [selectedTermId, selectedDefId]);

  const handleVictory = () => {
    setVictory(true);
    const finalScore = score + 10; // plus final match points
    const finalResult: GameResult = {
      score: finalScore,
      timeSeconds: gameTime,
      datePlayed: new Date().toISOString()
    };
    onComplete(finalResult);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining} นาที`;
  };

  return (
    <div id="matching-game-container" className="max-w-4xl mx-auto pb-16">
      {/* Intro Dashboard (if not playing) */}
      {!isPlaying && (
        <div className="bg-white p-8 rounded-2xl border border-natural-border shadow-sm text-center space-y-6">
          <div className="mx-auto h-16 w-16 bg-natural-sidebar text-natural-accent rounded-2xl flex items-center justify-center border border-natural-border shadow-xs">
            <Gamepad2 className="h-9 w-9" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-natural-heading">
              🎮 เกมจับคู่คำศัพท์ในเครือข่ายคอมพิวเตอร์
            </h3>
            <p className="text-xs text-natural-secondary max-w-md mx-auto leading-relaxed">
              เกมทบทวนคำศัพท์นี้จะสุ่มหยิบยกคำศัพท์ 8 คำจากทั้งบทเรียนที่ 1 และ 2 มาแสดงผล เพื่อท้าทายให้นักเรียนจับคู่กับนิยามหน้าที่ให้สอดคล้องกันให้ถูกต้องและรวดเร็วที่สุด!
            </p>
          </div>

          <div className="bg-natural-sidebar p-4 rounded-xl text-left text-xs text-natural-primary space-y-2 border border-natural-border max-w-md mx-auto">
            <h4 className="font-bold flex items-center gap-1.5 text-natural-heading">
              <Info className="h-4 w-4 shrink-0 text-natural-accent" />
              กติกาการคำนวณผลลัพธ์
            </h4>
            <p>• จับคู่คำศัพท์ถูกต้องรับ <strong>+10 คะแนน</strong></p>
            <p>• หากกดคู่ผิดจะหัก <strong>-2 คะแนน</strong></p>
            <p>• จับคู่ครบ 8 คู่ได้ครบถ้วนเป็นอันสิ้นสุดเกม</p>
            <p className="font-semibold text-natural-heading">📌 เล่นเกมจนผ่านจบ 1 ครั้ง เพื่อปลดล็อกเข้าทำแบบทดสอบหลังเรียน</p>
          </div>

          {bestResult && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl max-w-md mx-auto flex items-center justify-between text-xs">
              <div className="text-left">
                <span className="font-bold text-amber-800">🏆 สถิติที่ดีที่สุดของคุณ:</span>
                <p className="text-slate-600 mt-0.5">คะแนนสูงสุด: {bestResult.score} | เวลา: {formatTime(bestResult.timeSeconds)}</p>
              </div>
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="button"
              id="start-game-btn"
              onClick={handleStartGame}
              className="py-3 px-8 bg-natural-accent hover:bg-natural-accent-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Gamepad2 className="h-4 w-4" />
              เริ่มต้นเล่นเกมท้าทายสมอง
            </button>
          </div>
        </div>
      )}

      {/* Active Play Interface */}
      {isPlaying && !victory && (
        <div className="space-y-6">
          {/* Dashboard Header Bar */}
          <div className="bg-white p-4 rounded-xl border border-natural-border shadow-sm flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 text-natural-secondary">
              <Timer className="h-4 w-4 text-natural-accent" />
              <span>เวลาที่ผ่านไป: <strong className="font-bold font-mono text-natural-heading">{formatTime(gameTime)}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 text-natural-secondary">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>คะแนนปัจจุบัน: <strong className="font-bold text-natural-primary">{score}</strong></span>
            </div>

            <div className="text-natural-primary font-bold">
              จับคู่ได้: {matchedIds.size}/8 คู่
            </div>
          </div>

          {/* Core Matching Board Grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Terms */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-natural-secondary uppercase tracking-wider px-2">
                คำศัพท์ด้านเครือข่าย
              </h4>
              <div className="space-y-2">
                {termsPool.map((term) => {
                  const isMatched = matchedIds.has(term.id);
                  const isSelected = selectedTermId === term.id;
                  const isWrong = wrongMatch?.termId === term.id;

                  let borderStyle = 'border-natural-border hover:bg-natural-sidebar text-natural-primary';
                  if (isMatched) {
                    borderStyle = 'border-emerald-300 bg-emerald-50 text-emerald-800 font-bold opacity-50 cursor-not-allowed';
                  } else if (isWrong) {
                    borderStyle = 'border-red-400 bg-red-50 text-red-800 animate-shake';
                  } else if (isSelected) {
                    borderStyle = 'border-natural-accent bg-natural-sidebar text-natural-primary font-bold scale-[1.01]';
                  }

                  return (
                    <button
                      key={term.id}
                      type="button"
                      disabled={isMatched || !!wrongMatch}
                      onClick={() => setSelectedTermId(term.id)}
                      className={`w-full text-left p-4 border-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${borderStyle}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{term.text}</span>
                        {isMatched && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Definitions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-natural-secondary uppercase tracking-wider px-2">
                นิยามคำศัพท์และหน้าที่
              </h4>
              <div className="space-y-2">
                {defsPool.map((def) => {
                  const isMatched = matchedIds.has(def.id);
                  const isSelected = selectedDefId === def.id;
                  const isWrong = wrongMatch?.defId === def.id;

                  let borderStyle = 'border-natural-border hover:bg-natural-sidebar text-natural-primary';
                  if (isMatched) {
                    borderStyle = 'border-emerald-300 bg-emerald-50 text-emerald-800 opacity-50 cursor-not-allowed';
                  } else if (isWrong) {
                    borderStyle = 'border-red-400 bg-red-50 text-red-800 animate-shake';
                  } else if (isSelected) {
                    borderStyle = 'border-natural-accent bg-natural-sidebar text-natural-primary font-bold scale-[1.01]';
                  }

                  return (
                    <button
                      key={def.id}
                      type="button"
                      disabled={isMatched || !!wrongMatch}
                      onClick={() => setSelectedDefId(def.id)}
                      className={`w-full text-left p-4 border-2 rounded-xl text-xs transition-all cursor-pointer ${borderStyle}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="leading-relaxed">{def.text}</span>
                        {isMatched && <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsPlaying(false)}
              className="text-xs font-semibold text-natural-secondary hover:text-natural-heading underline cursor-pointer"
            >
              ยกเลิกและกลับหน้าแรกเกม
            </button>
          </div>
        </div>
      )}

      {/* Victory Victory Victory Screen */}
      {victory && (
        <div id="victory-screen" className="bg-white p-8 rounded-2xl border-2 border-amber-300 shadow-sm text-center space-y-6">
          <div className="mx-auto h-20 w-20 bg-natural-sidebar text-natural-accent rounded-full flex items-center justify-center border border-natural-border shadow-xs relative">
            <Trophy className="h-10 w-10 animate-bounce text-amber-500" />
            <Star className="absolute top-0 right-0 h-5 w-5 text-yellow-500 fill-current animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-natural-heading font-sans tracking-tight">
              🎉 ขอแสดงความยินดีด้วย! คุณผ่านการทดสอบจับคู่
            </h3>
            <p className="text-xs text-natural-secondary max-w-sm mx-auto">
              คุณสามารถจดจำคำศัพท์และองค์ประกอบระบบเครือข่ายของบทเรียนทั้ง 2 บทได้อย่างถูกต้องสมบูรณ์!
            </p>
          </div>

          <div className="bg-natural-sidebar p-5 rounded-2xl border border-natural-border max-w-sm mx-auto grid grid-cols-2 gap-4 divide-x divide-natural-border-alt">
            <div>
              <span className="block text-[10px] text-natural-secondary font-bold uppercase">คะแนนที่ได้รับ</span>
              <strong className="text-xl font-extrabold text-natural-accent">{score + 10}</strong>
            </div>
            <div>
              <span className="block text-[10px] text-natural-secondary font-bold uppercase">เวลาที่ใช้ไป</span>
              <strong className="text-xl font-extrabold text-natural-primary">{formatTime(gameTime)}</strong>
            </div>
          </div>

          <p className="text-xs text-emerald-600 font-bold">
            ✓ ปลดล็อกแบบทดสอบหลังเรียนเรียบร้อยแล้ว!
          </p>

          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              id="replay-game-btn"
              onClick={handleStartGame}
              className="py-2.5 px-4 border border-natural-border hover:bg-natural-sidebar text-natural-primary text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              เล่นท้าทายใหม่อีกครั้ง
            </button>
            <button
              type="button"
              id="navigate-posttest-btn"
              onClick={() => onNavigate('posttest')}
              className="py-2.5 px-6 bg-natural-accent hover:bg-natural-accent-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              เข้าสู่แบบทดสอบหลังเรียน
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
