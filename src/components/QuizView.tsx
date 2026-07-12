import React, { useState, useEffect, useRef } from 'react';
import { QuizQuestion, QuizResult } from '../types';
import {
  Timer,
  AlertTriangle,
  Award,
  ChevronRight,
  RotateCcw,
  BookOpen,
  CheckCircle,
  XCircle,
  Play
} from 'lucide-react';

interface QuizViewProps {
  quizType: 'pre' | 'post';
  questions: QuizQuestion[];
  onComplete: (result: QuizResult) => void;
  onNavigate: (targetTab: string) => void;
  existingResult: QuizResult | null;
}

export default function QuizView({
  quizType,
  questions,
  onComplete,
  onNavigate,
  existingResult
}: QuizViewProps) {
  // Master states
  const [quizStarted, setQuizStarted] = useState(false);
  const [randomizedQuestions, setRandomizedQuestions] = useState<QuizQuestion[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<string[][]>([]); // randomized choices mapping
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Scoring state
  const [selectedOptIdx, setSelectedOptIdx] = useState<number | null>(null);
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [resultsTracker, setResultsTracker] = useState<{ questionId: string; selectedIndex: number; isCorrect: boolean }[]>([]);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(20);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and randomize questions on start
  const handleStartQuiz = () => {
    // 1. Shuffle questions
    const qList = [...questions];
    for (let i = qList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [qList[i], qList[j]] = [qList[j], qList[i]];
    }

    // 2. Map shuffled options and store their correct index translation
    const optionsMap: string[][] = [];
    qList.forEach((q) => {
      const opts = [...q.options];
      // Shuffle options
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
      optionsMap.push(opts);
    });

    setRandomizedQuestions(qList);
    setShuffledOptions(optionsMap);
    setCurrentIdx(0);
    setSelectedOptIdx(null);
    setQuestionSubmitted(false);
    setCorrectAnswersCount(0);
    setResultsTracker([]);
    setTimeLeft(20);
    setQuizStarted(true);
  };

  // Timer Tick implementation
  useEffect(() => {
    if (!quizStarted || questionSubmitted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Start countdown
    setTimeLeft(20);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired! Handle automatic submit with no answer selected (-1)
          clearInterval(timerRef.current!);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizStarted, currentIdx, questionSubmitted]);

  const handleTimeExpired = () => {
    // Mark as wrong
    setSelectedOptIdx(-1);
    setQuestionSubmitted(true);

    const currentQ = randomizedQuestions[currentIdx];
    setResultsTracker((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        selectedIndex: -1,
        isCorrect: false
      }
    ]);
  };

  const handleSelectOption = (oIdx: number) => {
    if (questionSubmitted) return;
    setSelectedOptIdx(oIdx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOptIdx === null) {
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    const currentQ = randomizedQuestions[currentIdx];
    const currentOpts = shuffledOptions[currentIdx];
    const selectedText = currentOpts[selectedOptIdx];

    // Find the original correct text of the question
    const originalCorrectText = currentQ.options[currentQ.answerIndex];
    const isCorrect = selectedText === originalCorrectText;

    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
    }

    setResultsTracker((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        selectedIndex: selectedOptIdx,
        isCorrect: isCorrect
      }
    ]);

    setQuestionSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentIdx < randomizedQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOptIdx(null);
      setQuestionSubmitted(false);
    } else {
      // Quiz Complete! Submit results
      const finalResult: QuizResult = {
        quizType: quizType,
        score: correctAnswersCount,
        maxScore: randomizedQuestions.length,
        dateCompleted: new Date().toISOString(),
        answers: resultsTracker
      };
      onComplete(finalResult);
      setQuizStarted(false);
    }
  };

  const currentQ = randomizedQuestions[currentIdx];
  const currentOpts = shuffledOptions[currentIdx];
  const hasFinished = resultsTracker.length === randomizedQuestions.length && questionSubmitted;

  return (
    <div id={`${quizType}-test-container`} className="max-w-2xl mx-auto pb-16">
      {/* Intro Landing Frame (if not started) */}
      {!quizStarted && (
        <div className="bg-white p-8 rounded-2xl border border-natural-border shadow-sm text-center space-y-6">
          <div className="mx-auto h-16 w-16 bg-natural-sidebar text-natural-accent rounded-2xl flex items-center justify-center border border-natural-border shadow-xs">
            <Award className="h-9 w-9" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-natural-heading">
              แบบทดสอบ{quizType === 'pre' ? 'ก่อนเรียน' : 'หลังเรียน'} วิชาเครือข่ายคอมพิวเตอร์
            </h3>
            <p className="text-xs text-natural-secondary max-w-md mx-auto leading-relaxed">
              แบบทดสอบนี้มีทั้งหมด 10 ข้อ เป็นข้อเลือกตอบ 4 ตัวเลือก โดยวัดระดับความรู้ความเข้าใจจากเนื้อหาบทเรียนทั้ง 2 บท
            </p>
          </div>

          <div className="bg-natural-sidebar p-4 rounded-xl text-left text-xs text-natural-primary space-y-2 border border-natural-border max-w-md mx-auto font-sans">
            <h4 className="font-bold text-natural-heading flex items-center gap-1.5">
              ⚠️ ข้อกำหนดและกติกาการสอบ
            </h4>
            <p>• มีเวลาจำกัดเพียง <strong>20 วินาทีต่อ 1 ข้อคำถาม</strong></p>
            <p>• หากหมดเวลาจะถือว่าตอบผิดในข้อนั้นทันที</p>
            <p>• ลำดับของคำถามและตัวเลือกจะถูก<strong>สุ่มโดยอัตโนมัติ</strong></p>
            {quizType === 'pre' ? (
              <p className="text-natural-primary font-bold">• สอบก่อนเรียนเพื่อประเมินความรู้เดิม (ไม่ต้องเคร่งเครียดกับคะแนน)</p>
            ) : (
              <p className="text-natural-accent font-bold">• สอบหลังเรียนเพื่อวัดความก้าวหน้าจากการศึกษา 2 บทเรียน</p>
            )}
          </div>

          {existingResult && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-100">
              ✓ คุณเคยทำแบบทดสอบนี้แล้ว คะแนนที่ได้รับล่าสุดคือ: {existingResult.score}/10 คะแนน
            </div>
          )}

          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              id={`start-${quizType}-btn`}
              onClick={handleStartQuiz}
              className="py-3 px-8 bg-natural-accent hover:bg-natural-accent-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="h-4 w-4 shrink-0 fill-current" />
              เริ่มต้นทำแบบทดสอบ
            </button>
          </div>
        </div>
      )}

      {/* Active Question Panel */}
      {quizStarted && currentQ && (
        <div id="active-quiz-panel" className="bg-white p-6 sm:p-8 rounded-2xl border border-natural-border shadow-sm space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between gap-4 border-b border-natural-sidebar/50 pb-3 text-xs">
            <div className="font-bold text-natural-secondary">
              คำถามข้อที่ {currentIdx + 1} จาก {randomizedQuestions.length}
            </div>
            {/* Visual timer countdown */}
            <div className={`flex items-center gap-1.5 py-1 px-3.5 rounded-full font-bold font-mono transition-all ${
              timeLeft <= 5 ? 'bg-red-50 text-red-600 animate-pulse border border-red-100' : 'bg-natural-sidebar text-natural-primary border border-natural-border-alt'
            }`}>
              <Timer className="h-4 w-4 shrink-0" />
              <span>{timeLeft} วินาที</span>
            </div>
          </div>

          {/* Progress bar visual loader */}
          <div className="w-full h-1.5 bg-natural-sidebar rounded-full overflow-hidden">
            <div
              className="h-full bg-natural-accent transition-all duration-300"
              style={{ width: `${((currentIdx) / randomizedQuestions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <h4 id="quiz-question-text" className="text-xs sm:text-sm font-bold text-natural-heading leading-relaxed font-sans">
            {currentQ.question}
          </h4>

          {/* Choices Grid */}
          <div id="quiz-choices-grid" className="grid grid-cols-1 gap-2.5 pt-2">
            {currentOpts.map((opt, oIdx) => {
              const isSelected = selectedOptIdx === oIdx;
              const originalCorrectText = currentQ.options[currentQ.answerIndex];
              const isCorrectText = opt === originalCorrectText;

              let btnStyle = 'bg-white border-natural-border text-natural-primary hover:bg-natural-sidebar';

              if (questionSubmitted) {
                if (isCorrectText) {
                  // highlight correct green
                  btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold';
                } else if (isSelected) {
                  // highlight chosen wrong red
                  btnStyle = 'bg-red-50 border-red-300 text-red-800';
                } else {
                  // dim remaining options
                  btnStyle = 'bg-white border-natural-border-alt text-slate-300 opacity-60';
                }
              } else if (isSelected) {
                btnStyle = 'bg-natural-sidebar border-natural-accent text-natural-primary font-bold shadow-xs';
              }

              return (
                <button
                  key={oIdx}
                  type="button"
                  id={`choice-btn-${oIdx}`}
                  onClick={() => handleSelectOption(oIdx)}
                  disabled={questionSubmitted}
                  className={`w-full text-left p-3.5 border-2 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {questionSubmitted && isCorrectText && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                  {questionSubmitted && isSelected && !isCorrectText && <XCircle className="h-4 w-4 text-red-500" />}
                </button>
              );
            })}
          </div>

          {/* Submit Action or Out-of-time Banner */}
          {!questionSubmitted ? (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                id="submit-quiz-answer-btn"
                onClick={handleSubmitAnswer}
                disabled={selectedOptIdx === null}
                className="py-2 px-6 bg-natural-primary hover:bg-natural-primary-hover disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                ยืนยันคำตอบ
              </button>
            </div>
          ) : (
            <div id="quiz-explanation-panel" className="space-y-4 pt-4 border-t border-natural-border">
              {/* Feedback Alert */}
              {selectedOptIdx === -1 ? (
                <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl flex items-center gap-1.5 font-bold border border-red-100">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span>หมดเวลา! คุณไม่ได้ตอบคำถามในข้อนี้ภายในเวลาที่กำหนด</span>
                </div>
              ) : (
                <div className={`p-3 text-xs rounded-xl flex items-center gap-1.5 font-bold border ${
                  shuffledOptions[currentIdx][selectedOptIdx] === currentQ.options[currentQ.answerIndex]
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                    : 'bg-red-50 text-red-800 border-red-100'
                }`}>
                  {shuffledOptions[currentIdx][selectedOptIdx] === currentQ.options[currentQ.answerIndex] ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span>ยอดเยี่ยม! คำตอบของคุณถูกต้อง</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-400" />
                      <span>เสียใจด้วย! คำตอบของคุณไม่ถูกต้อง</span>
                    </>
                  )}
                </div>
              )}

              {/* Explanatory text block */}
              <div className="p-4 bg-natural-sidebar rounded-xl border border-natural-border text-xs space-y-1.5">
                <p className="text-natural-primary">
                  <strong className="font-bold text-natural-heading">เฉลย:</strong> {currentQ.options[currentQ.answerIndex]}
                </p>
                <p className="text-natural-secondary leading-relaxed">
                  <strong className="font-bold text-natural-heading">คำอธิบาย:</strong> {currentQ.explanation}
                </p>
              </div>

              {/* Next navigation trigger */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  id="next-quiz-q-btn"
                  onClick={handleNextQuestion}
                  className="py-2.5 px-5 bg-natural-accent hover:bg-natural-accent-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>{currentIdx < randomizedQuestions.length - 1 ? 'คำถามถัดไป' : 'ส่งผลคะแนนสอบ'}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
