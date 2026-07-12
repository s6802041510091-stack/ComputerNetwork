import React from 'react';
import { User, LessonProgress, QuizResult, GameResult } from '../types';
import {
  Trophy,
  Award,
  Zap,
  BookOpen,
  Gamepad2,
  Bookmark,
  CheckCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface AnalyticsViewProps {
  currentUser: User;
  lessonProgress: Record<string, LessonProgress>;
  preTestResult: QuizResult | null;
  postTestResults: QuizResult[];
  gameResults: GameResult[];
  totalProgress: number;
}

export default function AnalyticsView({
  currentUser,
  lessonProgress,
  preTestResult,
  postTestResults,
  gameResults,
  totalProgress
}: AnalyticsViewProps) {
  // 1. Calculate stats values
  const preScore = preTestResult ? preTestResult.score : 0;
  
  const latestPostResult = postTestResults.length > 0 
    ? postTestResults[postTestResults.length - 1] 
    : null;
  const latestPostScore = latestPostResult ? latestPostResult.score : 0;

  const maxPostScore = postTestResults.length > 0
    ? Math.max(...postTestResults.map(r => r.score))
    : 0;

  // Improvement = Latest Post-test score - Pre-test score
  const progressionScore = latestPostResult ? (latestPostScore - preScore) : 0;

  // Percentage of Post-test
  const postTestPercent = (maxPostScore / 10) * 100;

  // Quality Level grading based on Max Post-test
  const getQualityLevel = (score: number) => {
    if (!latestPostResult) return 'อยู่ระหว่างการประเมิน';
    if (score >= 9) return 'ดีเยี่ยม (Excellent) 🌟';
    if (score >= 7) return 'ดีมาก (Very Good) ✨';
    if (score >= 6) return 'ผ่านเกณฑ์มาตรฐาน (Passed) ✓';
    return 'ปรับปรุงเร่งด่วน (Improvement Needed) ⚠️';
  };

  const qualityLevel = getQualityLevel(maxPostScore);

  // Lesson Exercise scores
  const l1Score = lessonProgress.lesson1 ? lessonProgress.lesson1.maxScore : 0;
  const l2Score = lessonProgress.lesson2 ? lessonProgress.lesson2.maxScore : 0;

  // Game Scores
  const maxGameScore = gameResults.length > 0
    ? Math.max(...gameResults.map(g => g.score))
    : 0;

  // Completed lessons count (status === 'completed')
  const completedLessonsCount = Object.values(lessonProgress).filter(
    (l) => l.status === 'completed'
  ).length;

  const getCourseStatusText = (progress: number) => {
    if (progress === 100) return 'ผ่านการอบรมหลักสูตรเรียบร้อยแล้ว! 🎉';
    if (progress >= 80) return 'ความสำเร็จระดับก้าวหน้าสูงสุด 🚀';
    if (progress >= 50) return 'ผ่านระดับปานกลาง มีพัฒนาการที่ยอดเยี่ยม 📈';
    if (progress > 0) return 'กำลังอยู่ระหว่างการเรียนรู้ 📚';
    return 'ยังไม่ได้เริ่มต้นเรียนรู้วิชาการเครือข่าย 🔍';
  };

  // Data for visual SVG Chart
  const chartData = [
    { label: 'ก่อนเรียน', score: preScore, max: 10, color: '#F27D26' }, // Natural Accent
    { label: 'หลังเรียน (สูงสุด)', score: maxPostScore, max: 10, color: '#5A5A40' }, // Natural Primary
    { label: 'แบบฝึกหัด 1', score: l1Score, max: 5, color: '#8A8A70' }, // Natural Secondary
    { label: 'แบบฝึกหัด 2', score: l2Score, max: 5, color: '#A8A890' } // Natural Border-alt
  ];

  return (
    <div id="analytics-view-container" className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Learning Status Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-natural-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] text-natural-accent font-bold uppercase tracking-wider">สถานะความก้าวหน้าการเรียนรวม</span>
          <h2 id="overall-progress-text" className="text-xl font-bold text-natural-heading">
            {getCourseStatusText(totalProgress)}
          </h2>
          <p className="text-xs text-natural-secondary font-medium">
            เรียนรู้บทเรียนสำเร็จ {completedLessonsCount} จากทั้งหมด 2 บท | ความก้าวหน้าโดยรวม {totalProgress}%
          </p>
        </div>
        <div className="relative shrink-0 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full border-8 border-natural-sidebar flex items-center justify-center font-extrabold text-lg text-natural-primary">
            {totalProgress}%
          </div>
          <svg className="absolute top-0 left-0 h-24 w-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#F27D26"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - totalProgress / 100)}`}
              className="transition-all duration-700"
            />
          </svg>
        </div>
      </div>

      {/* Grid: 6 stats KPI cards */}
      <div id="analytics-kpi-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Card 1: Pre-Test */}
        <div className="bg-white p-5 rounded-xl border border-natural-border shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] text-natural-secondary font-bold uppercase">คะแนนก่อนเรียน</span>
            <strong id="kpi-pre-score" className="text-lg font-bold text-natural-heading">{preTestResult ? `${preScore}/10` : 'ยังไม่ได้ทำ'}</strong>
          </div>
        </div>

        {/* Card 2: Post-Test Latest */}
        <div className="bg-white p-5 rounded-xl border border-natural-border shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-natural-sidebar text-natural-accent border border-natural-border flex items-center justify-center shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] text-natural-secondary font-bold uppercase">หลังเรียนล่าสุด / สูงสุด</span>
            <strong id="kpi-post-score" className="text-lg font-bold text-natural-heading">
              {latestPostResult ? `${latestPostScore}/10` : 'ยังไม่ได้ทำ'}
              {maxPostScore > latestPostScore && <span className="text-xs text-natural-accent ml-1">({maxPostScore})</span>}
            </strong>
          </div>
        </div>

        {/* Card 3: Progression Difference */}
        <div className="bg-white p-5 rounded-xl border border-natural-border shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] text-natural-secondary font-bold uppercase">คะแนนพัฒนาการ</span>
            <strong id="kpi-progression-score" className={`text-lg font-bold ${progressionScore > 0 ? 'text-emerald-600' : progressionScore < 0 ? 'text-red-500' : 'text-natural-primary'}`}>
              {latestPostResult ? (progressionScore > 0 ? `+${progressionScore}` : progressionScore) : 'รอดำเนินการ'}
            </strong>
          </div>
        </div>

        {/* Card 4: Exercises Progress */}
        <div className="bg-white p-5 rounded-xl border border-natural-border shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-natural-sidebar text-natural-primary border border-natural-border flex items-center justify-center shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] text-natural-secondary font-bold uppercase">แบบฝึกหัดบทที่ 1 / 2</span>
            <strong id="kpi-exercises-score" className="text-xs sm:text-sm font-bold text-natural-heading leading-tight block">
              บทที่ 1: {lessonProgress.lesson1?.attemptsCount > 0 ? `${l1Score}/5` : 'ยังไม่ทำ'} <br/>
              บทที่ 2: {lessonProgress.lesson2?.attemptsCount > 0 ? `${l2Score}/5` : 'ยังไม่ทำ'}
            </strong>
          </div>
        </div>

        {/* Card 5: Interactive Game Score */}
        <div className="bg-white p-5 rounded-xl border border-natural-border shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Gamepad2 className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] text-natural-secondary font-bold uppercase">คะแนนเกมจับคู่สูงสุด</span>
            <strong id="kpi-game-score" className="text-lg font-bold text-natural-heading">
              {maxGameScore > 0 ? `${maxGameScore} คะแนน` : 'ยังไม่ได้เล่น'}
            </strong>
          </div>
        </div>

        {/* Card 6: Quality Level */}
        <div className="bg-white p-5 rounded-xl border border-natural-border shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] text-natural-secondary font-bold uppercase">ระดับคุณภาพ</span>
            <strong id="kpi-quality-level" className="text-xs font-bold text-natural-heading block leading-tight mt-0.5">
              {qualityLevel}
            </strong>
          </div>
        </div>
      </div>

      {/* Course progression details and quality levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Beautiful Custom responsive SVG Bar Chart */}
        <div id="analytics-chart-panel" className="bg-white p-6 sm:p-8 rounded-2xl border border-natural-border shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-natural-secondary uppercase tracking-wider flex items-center gap-2">
            📊 แผนภูมิวิเคราะห์ผลคะแนนสอบและแบบฝึกหัด
          </h3>

          <div className="relative pt-4">
            {/* Draw a highly responsive bar chart directly using inline SVG to guarantee React 19 compatibility */}
            <svg viewBox="0 0 400 240" className="w-full h-auto">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="380" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="100" x2="380" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="180" x2="380" y2="180" stroke="#cbd5e1" strokeWidth="1.5" /> {/* baseline */}

              {/* Grid Y Axis scale labels */}
              <text x="30" y="24" textAnchor="end" className="text-[10px] fill-slate-400 font-mono font-bold">100%</text>
              <text x="30" y="104" textAnchor="end" className="text-[10px] fill-slate-400 font-mono font-bold">50%</text>
              <text x="30" y="184" textAnchor="end" className="text-[10px] fill-slate-400 font-mono font-bold">0%</text>

              {/* Draw bars */}
              {chartData.map((bar, bIdx) => {
                const percentage = bar.score / bar.max;
                const barHeight = percentage * 160; // scale factor
                const xPos = 60 + bIdx * 80;
                const yPos = 180 - barHeight;

                return (
                  <g key={bIdx} className="group cursor-pointer">
                    {/* Tooltip background hover area */}
                    <rect x={xPos - 15} y="15" width="60" height="165" fill="transparent" />
                    
                    {/* Visual Bar */}
                    <rect
                      x={xPos}
                      y={yPos}
                      width="30"
                      height={Math.max(barHeight, 4)} // show tiny sliver if 0
                      fill={bar.color}
                      rx="4"
                    />

                    {/* Value label above bar */}
                    <text
                      x={xPos + 15}
                      y={yPos - 6}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-slate-700"
                    >
                      {bar.score}/{bar.max}
                    </text>

                    {/* Label below bar */}
                    <text
                      x={xPos + 15}
                      y={198}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-slate-500"
                    >
                      {bar.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Quality level analysis */}
        <div id="analytics-assessment-panel" className="bg-white p-6 sm:p-8 rounded-2xl border border-natural-border shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-natural-secondary uppercase tracking-wider flex items-center gap-2">
            🏆 เกณฑ์การประเมินระดับคุณภาพ (Quality Assessments)
          </h3>

          <div className="space-y-3">
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${maxPostScore >= 9 ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold' : 'bg-natural-sidebar border-natural-border text-slate-400 opacity-60'}`}>
              <span className="shrink-0">🌟</span>
              <div>
                <span className="block font-bold">ระดับดีเยี่ยม (9 - 10 คะแนน)</span>
                <p className="text-[11px] leading-relaxed font-normal mt-0.5">นักเรียนมีความจำ ความเข้าใจ สามารถสังเคราะห์ประยุกต์ใช้ความรู้ระบบเครือข่ายได้อย่างดีเลิศ</p>
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${maxPostScore >= 7 && maxPostScore < 9 ? 'bg-blue-50 border-blue-200 text-blue-900 font-bold' : 'bg-natural-sidebar border-natural-border text-slate-400 opacity-60'}`}>
              <span className="shrink-0">✨</span>
              <div>
                <span className="block font-bold">ระดับดีมาก (7 - 8 คะแนน)</span>
                <p className="text-[11px] leading-relaxed font-normal mt-0.5">นักเรียนมีความเข้าใจในองค์ประกอบ อุปกรณ์ ข้อจำกัด และหน้าที่หลักของโปรโตคอลได้อย่างดี</p>
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${maxPostScore >= 6 && maxPostScore < 7 ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-natural-sidebar border-natural-border text-slate-400 opacity-60'}`}>
              <span className="shrink-0">✓</span>
              <div>
                <span className="block font-bold">ระดับผ่านเกณฑ์มาตรฐาน (6 คะแนน)</span>
                <p className="text-[11px] leading-relaxed font-normal mt-0.5">นักเรียนผ่านเกณฑ์ความรู้พื้นฐานในการจำแนกผู้รับ-ผู้ส่ง สื่อกลาง และบริการสำคัญบนระบบเครือข่าย</p>
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${latestPostResult && maxPostScore < 6 ? 'bg-red-50 border-red-200 text-red-900 font-bold' : 'bg-natural-sidebar border-natural-border text-slate-400 opacity-60'}`}>
              <span className="shrink-0">⚠️</span>
              <div>
                <span className="block font-bold">ระดับปรับปรุงเร่งด่วน (น้อยกว่า 6 คะแนน)</span>
                <p className="text-[11px] leading-relaxed font-normal mt-0.5">นักเรียนต้องการการทบทวนตำรา สื่อการเรียนรู้วิดีโอ และทำแบบทดสอบแบบฝึกหัดใหม่อีกครั้งเพื่อเสริมทักษะ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
