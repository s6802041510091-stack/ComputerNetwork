import React, { useState, useEffect } from 'react';
import { Lesson, LessonProgress, ExerciseQuestion } from '../types';
import {
  Clock,
  Target,
  PlayCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  Bookmark,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

interface LessonViewProps {
  lesson: Lesson;
  progress: LessonProgress;
  onSaveProgress: (lessonId: string, updates: Partial<LessonProgress>) => void;
  onNavigate: (targetTab: string) => void;
  onSubmitThoughtAnswer: (lessonId: string, answer: string) => void;
  savedThoughtAnswer?: string;
}

export default function LessonView({
  lesson,
  progress,
  onSaveProgress,
  onNavigate,
  onSubmitThoughtAnswer,
  savedThoughtAnswer = ''
}: LessonViewProps) {
  // Navigation variables
  const prevTab = lesson.id === 'lesson2' ? 'lesson1' : 'dashboard';
  const nextTab = lesson.id === 'lesson1' ? 'lesson2' : 'game';

  // Thought Question state
  const [thoughtAnswer, setThoughtAnswer] = useState(savedThoughtAnswer);
  const [thoughtSubmitted, setThoughtSubmitted] = useState(!!savedThoughtAnswer);

  // Exercise States
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});
  const [tempOrderItems, setTempOrderItems] = useState<Record<string, string[]>>({});
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  // Load saved thought answer on lesson change
  useEffect(() => {
    setThoughtAnswer(savedThoughtAnswer);
    setThoughtSubmitted(!!savedThoughtAnswer);
    // Reset exercise states
    setExerciseStarted(false);
    setUserAnswers({});
    setSubmittedQuestions({});
    setTempOrderItems({});
    setQuizScore(0);
    setQuizFinished(false);
    setLocalErrors({});
  }, [lesson.id, savedThoughtAnswer]);

  // Handle thought submit
  const handleThoughtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thoughtAnswer.trim()) return;
    onSubmitThoughtAnswer(lesson.id, thoughtAnswer);
    setThoughtSubmitted(true);
  };

  // Initialize Ordering item list if question type is 'order'
  const initOrderItems = (question: ExerciseQuestion) => {
    if (tempOrderItems[question.id]) return;
    // We want to shuffle orderItems initially, but make sure it is not in the correct order!
    const items = [...(question.orderItems || [])];
    // Simple shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    setTempOrderItems((prev) => ({ ...prev, [question.id]: items }));
  };

  const handleMoveOrderItem = (questionId: string, index: number, direction: 'up' | 'down') => {
    const items = [...(tempOrderItems[questionId] || [])];
    if (direction === 'up' && index > 0) {
      [items[index], items[index - 1]] = [items[index - 1], items[index]];
    } else if (direction === 'down' && index < items.length - 1) {
      [items[index], items[index + 1]] = [items[index + 1], items[index]];
    }
    setTempOrderItems((prev) => ({ ...prev, [questionId]: items }));
  };

  // Submit Answer for single question
  const handleSubmitSingleAnswer = (question: ExerciseQuestion) => {
    const qId = question.id;
    const userAnswer = userAnswers[qId];

    if (userAnswer === undefined && question.type !== 'order') {
      setLocalErrors((prev) => ({ ...prev, [qId]: 'โปรดเลือกคำตอบก่อนส่งตรวจ' }));
      return;
    } else {
      setLocalErrors((prev) => {
        const copy = { ...prev };
        delete copy[qId];
        return copy;
      });
    }

    let isCorrect = false;

    if (question.type === 'choice' || question.type === 'fill' || question.type === 'scenario') {
      isCorrect = userAnswer === question.answer;
    } else if (question.type === 'boolean') {
      // boolean can be a string 'true' / 'false' or actual boolean
      isCorrect = String(userAnswer) === String(question.answer);
    } else if (question.type === 'order') {
      const userOrder = tempOrderItems[qId] || [];
      const correctOrder = question.answer as string[];
      isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
      setUserAnswers((prev) => ({ ...prev, [qId]: userOrder }));
    }

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }

    setSubmittedQuestions((prev) => ({ ...prev, [qId]: true }));
  };

  // Check if all questions are submitted
  const handleFinishExercise = () => {
    // Check if all 5 are submitted
    const totalQuestionsCount = lesson.exerciseQuestions.length;
    const submittedCount = Object.keys(submittedQuestions).length;

    if (submittedCount < totalQuestionsCount) {
      setLocalErrors((prev) => ({ ...prev, global: 'โปรดทำแบบฝึกหัดให้ครบทั้ง 5 ข้อก่อนสรุปผลคะแนน' }));
      return;
    } else {
      setLocalErrors((prev) => {
        const copy = { ...prev };
        delete copy.global;
        return copy;
      });
    }

    const finalScore = quizScore;
    const isPassed = finalScore >= 3; // 60% of 5 is 3

    // Update progress counters
    const newAttempts = progress.attemptsCount + 1;
    const maxScore = Math.max(progress.maxScore, finalScore);

    onSaveProgress(lesson.id, {
      lastScore: finalScore,
      maxScore: maxScore,
      attemptsCount: newAttempts,
      status: isPassed ? 'completed' : 'studying',
      dateUpdated: new Date().toISOString(),
      ...(isPassed && progress.status !== 'completed' ? { dateCompleted: new Date().toISOString() } : {})
    });

    setQuizFinished(true);
  };

  const handleResetExercise = () => {
    setUserAnswers({});
    setSubmittedQuestions({});
    setTempOrderItems({});
    setQuizScore(0);
    setQuizFinished(false);
    setExerciseStarted(true);
  };

  // Mark Completed manually (if passed)
  const handleMarkAsCompleted = () => {
    if (progress.maxScore < 3) return;
    onSaveProgress(lesson.id, {
      status: 'completed',
      dateCompleted: new Date().toISOString()
    });
  };

  return (
    <div id={`lesson-view-${lesson.id}`} className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Lesson Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 py-1 px-3 bg-white/20 text-white rounded-full text-xs font-bold backdrop-blur-md">
            <Clock className="h-3.5 w-3.5" />
            เวลาเรียนรู้โดยประมาณ {lesson.estimatedTime}
          </div>
          <h2 id="lesson-hero-title" className="text-xl sm:text-2xl font-bold font-sans tracking-tight">
            {lesson.title}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-blue-100">
            <span>สถานะบทเรียน:</span>
            <span className={`px-2 py-0.5 rounded font-bold ${
              progress.status === 'completed'
                ? 'bg-emerald-500 text-white'
                : progress.status === 'studying'
                ? 'bg-amber-400 text-slate-900'
                : 'bg-slate-500 text-white'
            }`}>
              {progress.status === 'completed' ? '✓ เรียนจบแล้ว' : progress.status === 'studying' ? '● กำลังศึกษา' : '○ ยังไม่เริ่ม'}
            </span>
            {progress.attemptsCount > 0 && (
              <span>| ทำแบบฝึกหัดแล้ว {progress.attemptsCount} ครั้ง (คะแนนสูงสุด: {progress.maxScore}/5)</span>
            )}
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Sparkles className="h-48 w-48 -mr-10 -mb-10" />
        </div>
      </div>

      {/* Learning Objectives Box */}
      <div id="learning-objectives-card" className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-3">
        <h4 className="text-xs font-bold text-blue-800 flex items-center gap-2">
          <Target className="h-4 w-4" />
          จุดประสงค์การเรียนรู้ประจำบทเรียน
        </h4>
        <ul className="text-xs text-slate-600 space-y-2 pl-2">
          {lesson.objectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="font-bold text-blue-500 shrink-0">{i + 1}.</span>
              <span>{obj}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Curriculum Text Sections */}
      <div id="lesson-content-body" className="space-y-6">
        {lesson.subsections.map((section, idx) => (
          <div key={idx} id={`subsection-${idx}`} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 font-sans tracking-tight border-b border-slate-100 pb-2 flex items-center gap-2">
              {section.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-normal whitespace-pre-wrap">
              {section.content}
            </p>

            {/* Sub-Contents with bullet lists or tables */}
            {section.subContent && (
              <div className="mt-4 space-y-3">
                {section.subContent.map((sub, sIdx) => {
                  const isTable = sub.text.includes('|') || sub.text.includes('• ') && sub.subtitle.includes('เปรียบเทียบ');
                  
                  return (
                    <div key={sIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                      <h4 className="font-bold text-slate-700 mb-2">{sub.subtitle}</h4>
                      
                      {/* Check if text is just bullet points to format them nicely */}
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {sub.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Connection Diagram / Diagram illustration for Lesson 2 */}
      {lesson.id === 'lesson2' && (
        <div id="connection-diagram-card" className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
            🖥️ แผนผังจำลองโครงสร้างสายเชื่อมต่อระบบเครือข่ายอินเทอร์เน็ต
          </h4>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center font-mono text-[10px] sm:text-xs overflow-x-auto">
            <div className="inline-block text-left min-w-[500px] space-y-2 py-2">
              <div className="text-cyan-400 font-bold text-center">┌──────────────────────────────────────┐</div>
              <div className="text-cyan-400 font-bold text-center">│       Internet (อินเทอร์เน็ตภายนอก)        │</div>
              <div className="text-cyan-400 font-bold text-center">└──────────────────┬───────────────────┘</div>
              <div className="text-center text-slate-400">│ (สายใยแก้วนำแสง Fiber Optic ความเร็วสูง)</div>
              <div className="text-center text-slate-300">▼</div>
              <div className="text-blue-400 font-bold text-center">┌──────────────────────────────────────┐</div>
              <div className="text-blue-400 font-bold text-center">│   Modem / ONT (แปลงสัญญาณแสงภายนอก)   │</div>
              <div className="text-blue-400 font-bold text-center">└──────────────────┬───────────────────┘</div>
              <div className="text-center text-slate-400">│ (สาย LAN หัวต่อ RJ45)</div>
              <div className="text-center text-slate-300">▼</div>
              <div className="text-indigo-400 font-bold text-center">┌──────────────────────────────────────┐</div>
              <div className="text-indigo-400 font-bold text-center">│  Router (ค้นหาทิศทาง, จัดสรร IP, จ่ายเน็ต)  │</div>
              <div className="text-indigo-400 font-bold text-center">└──────────┬───────────────────────┬───┘</div>
              <div className="flex justify-around text-slate-400 text-[10px] px-8">
                <span>│ (สาย LAN)</span>
                <span>│ (สาย LAN พ่วงต่อ)</span>
              </div>
              <div className="flex justify-around text-slate-300">
                <span>▼</span>
                <span>▼</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-800 p-2 rounded bg-slate-950/50">
                  <div className="text-emerald-400 font-bold text-center">Switch (รวมสาย LAN ในบ้าน)</div>
                  <div className="text-slate-400 text-[10px] text-center mt-1">┌────┴────┐</div>
                  <div className="text-slate-500 text-[10px] text-center">Computer 1 & 2</div>
                </div>
                <div className="border border-slate-800 p-2 rounded bg-slate-950/50">
                  <div className="text-purple-400 font-bold text-center">Access Point (จุดปล่อยไร้สาย)</div>
                  <div className="text-slate-400 text-[10px] text-center mt-1">((( Wi-Fi )))</div>
                  <div className="text-slate-500 text-[10px] text-center">Smartphones & Tablets</div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            *คำอธิบาย: สัญญาณอินเทอร์เน็ตภายนอกถูกแปลโดย Modem แล้วเข้าสู่ Router เพื่อจัดตั้งเครือข่ายแจกจ่ายข้อมูล จากนั้นส่งสัญญาณต่อให้ Switch (สำหรับอุปกรณ์มีสาย) และ Access Point (เพื่อกระจายคลื่น Wi-Fi สำหรับโทรศัพท์มือถือ)
          </p>
        </div>
      )}

      {/* Embedded YouTube video section */}
      <div id="video-section-card" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <PlayCircle className="text-red-500 h-5 w-5" />
          สื่อการเรียนรู้แบบวิดีโอ (Embedded Learning Video)
        </h3>
        <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative">
          <iframe
            id={`video-player-${lesson.id}`}
            src={lesson.videoUrl}
            title={lesson.videoTitle}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div className="space-y-1">
          <h4 id="video-display-title" className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <span>วิดีโอประกอบ:</span>
            <span className="text-blue-600 underline font-semibold flex items-center gap-1 cursor-pointer">
              {lesson.videoTitle}
              <ExternalLink className="h-3 w-3" />
            </span>
          </h4>
          <p id="video-display-desc" className="text-[11px] text-slate-500 leading-relaxed italic">
            “{lesson.videoDescription}”
          </p>
        </div>
      </div>

      {/* Responsive columns: Examples and Trivia */}
      <div id="extras-columns" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Example Box */}
        <div id="example-box-card" className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/80 space-y-3">
          <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-2">
            💡 {lesson.exampleBox.title}
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-wrap">
            {lesson.exampleBox.description}
          </p>
        </div>

        {/* Trivia "รู้หรือไม่" Box */}
        <div id="trivia-box-card" className="bg-amber-50/40 p-6 rounded-2xl border border-amber-100 space-y-3">
          <h4 className="text-xs font-bold text-amber-800 flex items-center gap-2">
            ✨ {lesson.triviaBox.title}
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            {lesson.triviaBox.content}
          </p>
        </div>
      </div>

      {/* Thought Question ("คำถามชวนคิด") Section */}
      <div id="thought-question-card" className="bg-white p-6 sm:p-8 rounded-2xl border border-natural-border shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-natural-secondary uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="text-natural-accent h-5 w-5" />
          คำถามชวนคิด (Active Reflection)
        </h3>
        <blockquote className="border-l-4 border-natural-accent pl-4 py-1 text-xs text-slate-700 font-bold bg-natural-sidebar/40 pr-2 rounded-r-lg">
          “{lesson.thoughtQuestion}”
        </blockquote>

        <form onSubmit={handleThoughtSubmit} className="space-y-3">
          <textarea
            id="thought-textarea"
            className="w-full p-4 border border-natural-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-natural-accent text-slate-800 bg-natural-bg/50 focus:bg-white transition-all resize-none h-28"
            placeholder="เขียนความคิดเห็นหรือคำตอบของคุณลงที่นี่..."
            value={thoughtAnswer}
            onChange={(e) => setThoughtAnswer(e.target.value)}
            disabled={thoughtSubmitted}
            required
          />
          <div className="flex justify-end">
            {!thoughtSubmitted ? (
              <button
                type="submit"
                id="submit-thought-btn"
                className="py-2 px-5 bg-natural-accent hover:bg-natural-accent-hover text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                บันทึกคำตอบชวนคิด
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                  ✓ บันทึกคำตอบเรียนรู้เรียบร้อยแล้ว
                </span>
                <button
                  type="button"
                  id="edit-thought-btn"
                  onClick={() => setThoughtSubmitted(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold underline cursor-pointer"
                >
                  แก้ไขคำตอบ
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Summary Box ("กล่องสรุปสาระสำคัญ") */}
      <div id="summary-points-card" className="bg-natural-sidebar p-6 rounded-2xl border border-natural-border space-y-4">
        <h4 className="text-xs font-bold text-natural-heading uppercase tracking-wider flex items-center gap-2">
          📌 สรุปสาระสำคัญประจำบทเรียน (Key Takeaways)
        </h4>
        <div className="space-y-3">
          {lesson.summaryPoints.map((pt, index) => (
            <div key={index} className="flex gap-2.5 items-start text-xs text-slate-600 leading-relaxed">
              <span className="h-5 w-5 rounded-full bg-white text-natural-primary border border-natural-border-alt font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                {index + 1}
              </span>
              <span>{pt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Exercises Section ("แบบฝึกหัดระหว่างเรียน 5 ข้อ") */}
      <div id="exercise-container-card" className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-natural-sidebar shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 font-sans tracking-tight">
              ✍️ แบบฝึกหัดระหว่างเรียน (5 ข้อประจำบทเรียน)
            </h3>
            <p className="text-xs text-slate-500">
              *ต้องได้คะแนนอย่างน้อย 60% (3 เต็ม 5 คะแนน) จึงจะผ่านเกณฑ์ความรู้บทเรียนนี้
            </p>
          </div>
          {!exerciseStarted && !quizFinished && (
            <button
              type="button"
              id="start-exercise-btn"
              onClick={() => {
                setExerciseStarted(true);
                // Trigger ordering questions shuffle
                lesson.exerciseQuestions.forEach(q => {
                  if (q.type === 'order') {
                    initOrderItems(q);
                  }
                });
              }}
              className="py-2.5 px-6 bg-natural-primary hover:bg-natural-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              เริ่มทำแบบฝึกหัด
            </button>
          )}
        </div>

        {/* Start rendering questions */}
        {exerciseStarted && (
          <div className="space-y-8">
            {lesson.exerciseQuestions.map((q, idx) => {
              const qId = q.id;
              const isSubmitted = submittedQuestions[qId];
              const userAnswer = userAnswers[qId];

              // Check if correct
              let isCorrectAnswer = false;
              if (isSubmitted) {
                if (q.type === 'choice' || q.type === 'fill' || q.type === 'scenario') {
                  isCorrectAnswer = userAnswer === q.answer;
                } else if (q.type === 'boolean') {
                  isCorrectAnswer = String(userAnswer) === String(q.answer);
                } else if (q.type === 'order') {
                  isCorrectAnswer = JSON.stringify(userAnswer) === JSON.stringify(q.answer);
                }
              }

              // Trigger lazy loading of order elements if we missed it
              if (q.type === 'order' && !tempOrderItems[qId]) {
                initOrderItems(q);
              }

              return (
                <div key={qId} id={`exercise-question-block-${idx}`} className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4">
                  <div className="flex items-start gap-2 text-xs font-bold text-slate-800 leading-relaxed">
                    <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg shrink-0">ข้อที่ {idx + 1}</span>
                    <span className="mt-0.5">{q.question}</span>
                  </div>

                  {/* Render Choices based on Question Type */}
                  {q.type === 'choice' && q.options && (
                    <div className="grid grid-cols-1 gap-2 pl-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = userAnswer === opt;
                        let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/50';
                        if (isSubmitted) {
                          if (opt === q.answer) {
                            btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold';
                          } else if (isSelected) {
                            btnStyle = 'bg-red-50 border-red-200 text-red-800';
                          } else {
                            btnStyle = 'bg-white border-slate-100 text-slate-400 opacity-60';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-blue-50 border-blue-400 text-blue-800 font-semibold';
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => !isSubmitted && setUserAnswers((prev) => ({ ...prev, [qId]: opt }))}
                            disabled={isSubmitted}
                            className={`w-full text-left p-3 border-2 rounded-xl text-xs transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {isSubmitted && opt === q.answer && <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />}
                            {isSubmitted && isSelected && opt !== q.answer && <XCircle className="h-4 w-4 text-red-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Render True / False Boolean */}
                  {q.type === 'boolean' && (
                    <div className="grid grid-cols-2 gap-3 pl-2">
                      {['true', 'false'].map((val) => {
                        const labelText = val === 'true' ? 'ถูก (True)' : 'ผิด (False)';
                        const isSelected = String(userAnswer) === val;
                        const isCorrectOption = String(q.answer) === val;

                        let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/50';
                        if (isSubmitted) {
                          if (isCorrectOption) {
                            btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold';
                          } else if (isSelected) {
                            btnStyle = 'bg-red-50 border-red-200 text-red-800';
                          } else {
                            btnStyle = 'bg-white border-slate-100 text-slate-400 opacity-60';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-blue-50 border-blue-400 text-blue-800 font-semibold';
                        }

                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => !isSubmitted && setUserAnswers((prev) => ({ ...prev, [qId]: val }))}
                            disabled={isSubmitted}
                            className={`p-4 border-2 rounded-xl text-xs font-semibold text-center transition-all ${btnStyle}`}
                          >
                            {labelText}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Render Dropdown Fill */}
                  {q.type === 'fill' && q.options && (
                    <div className="pl-2 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600">กรุณาเลือกคำตอบที่ถูกต้องเพื่อเติมในช่องว่าง:</span>
                        <select
                          id={`dropdown-fill-${qId}`}
                          disabled={isSubmitted}
                          value={userAnswer || ''}
                          onChange={(e) => setUserAnswers((prev) => ({ ...prev, [qId]: e.target.value }))}
                          className="px-3 py-1.5 border-2 border-slate-200 rounded-lg text-xs font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">-- เลือกคำตอบ --</option>
                          {q.options.map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Render Scenario Based */}
                  {q.type === 'scenario' && q.options && (
                    <div className="grid grid-cols-1 gap-2 pl-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = userAnswer === opt;
                        let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/50';
                        if (isSubmitted) {
                          if (opt === q.answer) {
                            btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold';
                          } else if (isSelected) {
                            btnStyle = 'bg-red-50 border-red-200 text-red-800';
                          } else {
                            btnStyle = 'bg-white border-slate-100 text-slate-400 opacity-60';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-blue-50 border-blue-400 text-blue-800 font-semibold';
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => !isSubmitted && setUserAnswers((prev) => ({ ...prev, [qId]: opt }))}
                            disabled={isSubmitted}
                            className={`w-full text-left p-3.5 border-2 rounded-xl text-xs transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {isSubmitted && opt === q.answer && <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />}
                            {isSubmitted && isSelected && opt !== q.answer && <XCircle className="h-4 w-4 text-red-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Render Order List (Reordering) */}
                  {q.type === 'order' && (
                    <div className="pl-2 space-y-3">
                      <div className="text-[11px] text-slate-500 mb-1">
                        *ใช้ปุ่มลูกศรขึ้น/ลงในการจัดระเบียบเรียงลำดับลำดับก่อนหลังให้ถูกต้อง
                      </div>
                      <div className="space-y-2 max-w-lg">
                        {(tempOrderItems[qId] || []).map((item, oIdx) => {
                          const orderList = tempOrderItems[qId] || [];
                          return (
                            <div
                              key={oIdx}
                              className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-blue-600 font-mono w-4">{oIdx + 1}.</span>
                                <span>{item}</span>
                              </div>
                              {!isSubmitted && (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveOrderItem(qId, oIdx, 'up')}
                                    disabled={oIdx === 0}
                                    className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 text-slate-500"
                                  >
                                    <ChevronUp className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveOrderItem(qId, oIdx, 'down')}
                                    disabled={oIdx === orderList.length - 1}
                                    className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 text-slate-500"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Submit Button for individual question */}
                  {!isSubmitted ? (
                    <div className="flex flex-col items-end gap-1.5 pt-2">
                      {localErrors[qId] && (
                        <span className="text-[11px] text-red-500 font-bold bg-red-50 py-1 px-3.5 rounded-lg border border-red-100">⚠️ {localErrors[qId]}</span>
                      )}
                      <button
                        type="button"
                        id={`submit-q-btn-${idx}`}
                        onClick={() => handleSubmitSingleAnswer(q)}
                        className="py-1.5 px-4 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                      >
                        ตรวจสอบคำตอบข้อนี้
                      </button>
                    </div>
                  ) : (
                    <div className={`p-3.5 rounded-xl text-xs space-y-1.5 ${isCorrectAnswer ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                      <div className="font-bold flex items-center gap-1.5">
                        {isCorrectAnswer ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            <span>ยอดเยี่ยม! ตอบถูกต้อง</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span>ตอบผิดพลาด! สรุปคำตอบที่ถูกต้องดังนี้:</span>
                          </>
                        )}
                      </div>
                      <p className="text-slate-600 leading-relaxed font-normal">
                        <strong className="text-slate-700">เฉลย:</strong> {q.type === 'order' ? (q.answer as string[]).join(' → ') : String(q.answer === 'true' ? 'ถูก' : q.answer === 'false' ? 'ผิด' : q.answer)}
                      </p>
                      <p className="text-slate-600 leading-relaxed font-normal">
                        <strong className="text-slate-700">คำอธิบาย:</strong> {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Complete Finish Action */}
            {!quizFinished && (
              <div className="flex flex-col items-center gap-2.5 pt-4">
                {localErrors.global && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl max-w-md text-center">
                    ⚠️ {localErrors.global}
                  </div>
                )}
                <button
                  type="button"
                  id="finish-exercise-btn"
                  onClick={handleFinishExercise}
                  className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  ส่งผลคะแนนและจบแบบฝึกหัด
                </button>
              </div>
            )}
          </div>
        )}

        {/* Display Score Summary Results when finished */}
        {quizFinished && (
          <div id="exercise-summary-panel" className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-4">
            <h4 className="text-base font-bold text-slate-800">
              📊 สรุปผลคะแนนแบบฝึกหัดบทที่ {lesson.id === 'lesson1' ? '1' : '2'}
            </h4>
            <div className="flex items-center justify-center gap-3">
              <div className="h-20 w-20 rounded-full border-4 border-natural-accent flex items-center justify-center text-xl font-extrabold text-natural-accent bg-natural-bg">
                {quizScore}/5
              </div>
              <div className="text-left space-y-1">
                <div className={`text-xs font-bold ${quizScore >= 3 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {quizScore >= 3 ? '🎉 คุณสอบผ่านตามเกณฑ์มาตรฐาน!' : '❌ คะแนนน้อยกว่า 60% ไม่ผ่านเกณฑ์'}
                </div>
                <p className="text-[11px] text-slate-500">
                  ต้องได้ 3 เต็ม 5 คะแนนขึ้นไปเพื่อใช้ปลดล็อกบทเรียน/กิจกรรมในขั้นถัดไป
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                id="redo-exercise-btn"
                onClick={handleResetExercise}
                className="py-2 px-4 border border-natural-border hover:bg-natural-sidebar text-natural-primary text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                ทำแบบฝึกหัดใหม่อีกครั้ง
              </button>

              {quizScore >= 3 && progress.status !== 'completed' && (
                <button
                  type="button"
                  id="mark-completed-action-btn"
                  onClick={handleMarkAsCompleted}
                  className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  ทำเครื่องหมายว่าเรียนจบ
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons bottom bar */}
      <div id="lesson-navigation-footer" className="flex items-center justify-between pt-6 border-t border-natural-border">
        <button
          type="button"
          id="prev-lesson-nav-btn"
          onClick={() => onNavigate(prevTab)}
          className="flex items-center gap-1.5 text-xs font-bold text-natural-secondary hover:text-natural-heading transition-all py-2 px-3 hover:bg-natural-sidebar rounded-xl cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          บทเรียนก่อนหน้า
        </button>

        {progress.status === 'completed' ? (
          <button
            type="button"
            id="next-lesson-nav-btn"
            onClick={() => onNavigate(nextTab)}
            className="flex items-center gap-1.5 text-xs font-bold text-natural-primary hover:text-natural-accent transition-all py-2.5 px-4 bg-natural-sidebar hover:bg-natural-border-alt rounded-xl cursor-pointer"
          >
            ศึกษาต่อขั้นถัดไป
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="text-[11px] text-slate-400 font-semibold italic">
            *สอบแบบฝึกหัดให้ผ่านอย่างน้อย 3/5 เพื่อศึกษาต่อบทถัดไป
          </div>
        )}
      </div>
    </div>
  );
}
