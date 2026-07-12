import React from 'react';
import { User, LessonProgress, QuizResult, GameResult } from '../types';
import {
  Network,
  BookOpen,
  ClipboardList,
  Gamepad2,
  Award,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronRight,
  Play
} from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  lessonProgress: Record<string, LessonProgress>;
  preTestResult: QuizResult | null;
  postTestResult: QuizResult | null;
  gameResults: GameResult[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  totalProgress: number;
}

export default function Dashboard({
  currentUser,
  lessonProgress,
  preTestResult,
  postTestResult,
  gameResults,
  setActiveTab,
  totalProgress
}: DashboardProps) {
  const l1Completed = lessonProgress.lesson1?.status === 'completed';
  const l2Completed = lessonProgress.lesson2?.status === 'completed';
  const gamePlayed = gameResults.length > 0;
  const postTestCompleted = !!postTestResult;

  // Let's list the 10 sequential steps in our custom learning path
  const learningSteps = [
    { id: 'step-login', label: 'เข้าสู่ระบบเรียนรู้ออนไลน์', status: true, desc: 'ลงทะเบียนตัวตนเรียบร้อย', actionLabel: 'เสร็จสมบูรณ์' },
    { id: 'step-pretest', label: 'ทำแบบทดสอบก่อนเรียน (Pre-test)', status: !!preTestResult, tab: 'pretest', desc: 'ทำแบบทดสอบเพื่อวัดความรู้ตั้งต้น', actionLabel: 'ไปทำแบบทดสอบ' },
    { id: 'step-l1', label: 'เรียนบทที่ 1: หลักการของระบบเครือข่าย', status: l1Completed, tab: 'lesson1', desc: 'ศึกษาบทเรียนและทำแบบฝึกหัดให้ได้ 3/5 คะแนนขึ้นไป', actionLabel: 'เข้าศึกษาบทเรียน', disabled: !preTestResult },
    { id: 'step-l1-ex', label: 'ผ่านแบบฝึกหัดบทที่ 1', status: l1Completed, tab: 'lesson1', desc: 'วัดเกณฑ์ความเข้าใจขั้นพื้นฐานบทเรียนที่ 1', actionLabel: 'ทำแบบฝึกหัด', disabled: !preTestResult },
    { id: 'step-l2', label: 'เรียนบทที่ 2: องค์ประกอบพื้นฐานระบบเครือข่าย', status: l2Completed, tab: 'lesson2', desc: 'ศึกษาอุปกรณ์ ฮาร์ดแวร์ ซอฟต์แวร์ และบริการต่าง ๆ', actionLabel: 'เข้าศึกษาบทเรียน', disabled: !l1Completed },
    { id: 'step-l2-ex', label: 'ผ่านแบบฝึกหัดบทที่ 2', status: l2Completed, tab: 'lesson2', desc: 'วัดเกณฑ์ความเข้าใจองค์ประกอบระบบเครือข่าย', actionLabel: 'ทำแบบฝึกหัด', disabled: !l1Completed },
    { id: 'step-game', label: 'เล่นเกมโต้ตอบจับคู่คำศัพท์เครือข่าย', status: gamePlayed, tab: 'game', desc: 'จับคู่คำศัพท์และนิยามองค์ประกอบทั้ง 14 รายการ', actionLabel: 'ไปเล่นเกม', disabled: !l2Completed },
    { id: 'step-posttest', label: 'ทำแบบทดสอบหลังเรียน (Post-test)', status: postTestCompleted, tab: 'posttest', desc: 'วัดผลสำเร็จจากการเรียนรู้ด้วยข้อสอบ 10 ข้อ', actionLabel: 'ไปสอบหลังเรียน', disabled: !gamePlayed || !l2Completed },
    { id: 'step-analytics', label: 'ตรวจผลพัฒนาการเรียนและสถิติ', status: postTestCompleted, tab: 'analytics', desc: 'ตรวจสอบผลพัฒนาการเรียนรู้และดาวน์โหลดประวัติ', actionLabel: 'ดูพัฒนาการ' },
    { id: 'step-certificate', label: 'เรียนจบหลักสูตรและผ่านเกณฑ์สากล', status: totalProgress === 100, desc: 'ขอแสดงความยินดีในการเรียนรู้เครือข่ายคอมพิวเตอร์!', actionLabel: 'ฉลองความสำเร็จ' }
  ];

  return (
    <div id="student-dashboard" className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 id="dashboard-welcome-heading" className="text-lg sm:text-xl font-bold text-slate-800 font-sans tracking-tight">
            ยินดีต้อนรับคุณ, <span className="text-natural-accent">{currentUser.name}</span> 👋
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed font-sans max-w-lg">
            ยินดีต้อนรับสู่แอปพลิเคชันบทเรียนเครือข่ายคอมพิวเตอร์เบื้องต้นที่ถูกปรับปรุงเนื้อหาเป็น 2 บทเรียนกระชับเข้มข้น เพื่อความสำเร็จทางวิชาการและอาชีพของนักเรียน ปวช.2
          </p>
        </div>

        {/* Action button based on progress */}
        <div className="shrink-0 w-full md:w-auto">
          {!preTestResult ? (
            <button
              type="button"
              id="dashboard-action-btn-pretest"
              onClick={() => setActiveTab('pretest')}
              className="w-full md:w-auto py-2.5 px-6 bg-natural-accent hover:bg-natural-accent-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              ทำแบบทดสอบก่อนเรียน
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : !l1Completed ? (
            <button
              type="button"
              id="dashboard-action-btn-l1"
              onClick={() => setActiveTab('lesson1')}
              className="w-full md:w-auto py-2.5 px-6 bg-natural-accent hover:bg-natural-accent-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              ศึกษาบทเรียนบทที่ 1
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : !l2Completed ? (
            <button
              type="button"
              id="dashboard-action-btn-l2"
              onClick={() => setActiveTab('lesson2')}
              className="w-full md:w-auto py-2.5 px-6 bg-natural-accent hover:bg-natural-accent-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              ศึกษาบทเรียนบทที่ 2
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : !gamePlayed ? (
            <button
              type="button"
              id="dashboard-action-btn-game"
              onClick={() => setActiveTab('game')}
              className="w-full md:w-auto py-2.5 px-6 bg-natural-accent hover:bg-natural-accent-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              เล่นเกมทบทวนความรู้
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : !postTestCompleted ? (
            <button
              type="button"
              id="dashboard-action-btn-posttest"
              onClick={() => setActiveTab('posttest')}
              className="w-full md:w-auto py-2.5 px-6 bg-natural-accent hover:bg-natural-accent-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              ทำแบบทดสอบหลังเรียน
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              id="dashboard-action-btn-analytics"
              onClick={() => setActiveTab('analytics')}
              className="w-full md:w-auto py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              ดูสถิติและพัฒนาการของคุณ
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress metrics and stats rows */}
      <div id="dashboard-quick-stats" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">สอบก่อนเรียน</span>
          <strong className="block text-lg font-bold text-slate-800 mt-1">
            {preTestResult ? `${preTestResult.score}/10` : 'ยังไม่ได้สอบ'}
          </strong>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">แบบฝึกหัดบทที่ 1</span>
          <strong className="block text-lg font-bold text-slate-800 mt-1">
            {lessonProgress.lesson1?.attemptsCount > 0 ? `${lessonProgress.lesson1.maxScore}/5` : 'ยังไม่ได้ทำ'}
          </strong>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">แบบฝึกหัดบทที่ 2</span>
          <strong className="block text-lg font-bold text-slate-800 mt-1">
            {lessonProgress.lesson2?.attemptsCount > 0 ? `${lessonProgress.lesson2.maxScore}/5` : 'ยังไม่ได้ทำ'}
          </strong>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">สอบหลังเรียนล่าสุด</span>
          <strong className="block text-lg font-bold text-natural-accent mt-1">
            {postTestResult ? `${postTestResult.score}/10` : 'ยังไม่ได้สอบ'}
          </strong>
        </div>
      </div>

      {/* Course Map / 10 sequential steps sequence layout */}
      <div id="learning-path-panel" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-slate-800 font-sans tracking-tight border-b border-slate-100 pb-3 flex items-center gap-2">
          🗺️ เส้นทางการศึกษาเรียนรู้ 10 ลำดับขั้นตอน (Course Checklist)
        </h3>

        <div id="dashboard-steps-list" className="divide-y divide-slate-100">
          {learningSteps.map((step, idx) => {
            const isCompleted = step.status;
            const isDisabled = step.disabled;

            return (
              <div
                key={step.id}
                id={`learning-step-row-${idx}`}
                className={`py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  isDisabled ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex gap-3 items-start min-w-0 flex-1">
                  {isCompleted ? (
                    <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  ) : isDisabled ? (
                    <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-blue-200">
                      {idx + 1}
                    </div>
                  )}

                  <div className="min-w-0">
                    <span className={`text-xs font-bold block ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                      {step.label}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                      {step.desc}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  {isCompleted ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 py-1 px-2.5 rounded-lg border border-emerald-100">
                      เสร็จสมบูรณ์
                    </span>
                  ) : isDisabled ? (
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 py-1 px-2.5 rounded-lg border border-slate-200">
                      ยังไม่ปลดล็อก
                    </span>
                  ) : step.tab ? (
                    <button
                      type="button"
                      id={`navigate-step-btn-${step.id}`}
                      onClick={() => step.tab && setActiveTab(step.tab)}
                      className="py-1 px-3 text-[10px] font-bold text-blue-700 border border-blue-200 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{step.actionLabel}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-500">
                      รอดำเนินการ
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
