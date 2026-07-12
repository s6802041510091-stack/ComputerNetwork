import React, { useState } from 'react';
import { User, LessonProgress, QuizResult, GameResult } from '../types';
import {
  Users,
  Award,
  Zap,
  BookOpen,
  Gamepad2,
  Trophy,
  Filter,
  CheckCircle,
  Play,
  XCircle,
  Plus
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: User;
  lessonProgress: Record<string, LessonProgress>;
  preTestResult: QuizResult | null;
  postTestResults: QuizResult[];
  gameResults: GameResult[];
  totalProgress: number;
}

interface StudentRecord {
  id: string;
  name: string;
  classroom: string;
  preTestScore: number;
  postTestScore: number | null;
  l1Score: number;
  l1Status: 'completed' | 'studying' | 'not_started';
  l2Score: number;
  l2Status: 'completed' | 'studying' | 'not_started';
  gameScore: number;
}

// Seed highly realistic classmates for Voc. Cert. Year 2 (ปวช.2/1)
const mockClassmates: StudentRecord[] = [
  { id: '6802041510001', name: 'นายกิตติพงษ์ รักสงบ', classroom: 'ปวช.2/1', preTestScore: 4, postTestScore: 8, l1Score: 4, l1Status: 'completed', l2Score: 3, l2Status: 'completed', gameScore: 80 },
  { id: '6802041510002', name: 'นางสาวจารุวรรณ ใฝ่เรียน', classroom: 'ปวช.2/1', preTestScore: 5, postTestScore: 9, l1Score: 5, l1Status: 'completed', l2Score: 4, l2Status: 'completed', gameScore: 90 },
  { id: '6802041510003', name: 'นายชลทิศ แสงสว่าง', classroom: 'ปวช.2/1', preTestScore: 3, postTestScore: 7, l1Score: 3, l1Status: 'completed', l2Score: 3, l2Status: 'completed', gameScore: 70 },
  { id: '6802041510004', name: 'นางสาวณิชาภัทร เก่งกล้า', classroom: 'ปวช.2/1', preTestScore: 6, postTestScore: 10, l1Score: 5, l1Status: 'completed', l2Score: 5, l2Status: 'completed', gameScore: 100 },
  { id: '6802041510005', name: 'นายธนพล มุ่งมั่น', classroom: 'ปวช.2/1', preTestScore: 2, postTestScore: 6, l1Score: 3, l1Status: 'completed', l2Score: 2, l2Status: 'studying', gameScore: 40 },
  { id: '6802041510006', name: 'นางสาวปนัดดา มีรอยยิ้ม', classroom: 'ปวช.2/1', preTestScore: 5, postTestScore: null, l1Score: 4, l1Status: 'completed', l2Score: 1, l2Status: 'studying', gameScore: 0 },
  { id: '6802041510007', name: 'นายพีรพงษ์ มั่นคง', classroom: 'ปวช.2/1', preTestScore: 3, postTestScore: 6, l1Score: 3, l1Status: 'completed', l2Score: 3, l2Status: 'completed', gameScore: 60 },
  { id: '6802041510008', name: 'นางสาวรุ่งนภา พัฒนา', classroom: 'ปวช.2/1', preTestScore: 6, postTestScore: 8, l1Score: 4, l1Status: 'completed', l2Score: 4, l2Status: 'completed', gameScore: 80 },
  { id: '6802041510009', name: 'นายศราวุธ แสวงหา', classroom: 'ปวช.2/1', preTestScore: 4, postTestScore: null, l1Score: 2, l1Status: 'studying', l2Score: 0, l2Status: 'not_started', gameScore: 0 },
  { id: '6802041510010', name: 'นางสาวอนันตญา เพียรพยายาม', classroom: 'ปวช.2/1', preTestScore: 3, postTestScore: 7, l1Score: 3, l1Status: 'completed', l2Score: 3, l2Status: 'completed', gameScore: 70 }
];

export default function AdminPanel({
  currentUser,
  lessonProgress,
  preTestResult,
  postTestResults,
  gameResults,
  totalProgress
}: AdminPanelProps) {
  const [filterClass, setFilterClass] = useState('ทั้งหมด');

  // Convert the current user session data into a Student Record to display live inside the grading board
  const l1P = lessonProgress.lesson1;
  const l2P = lessonProgress.lesson2;
  const maxPostScore = postTestResults.length > 0 ? Math.max(...postTestResults.map(r => r.score)) : null;
  const gameMaxScore = gameResults.length > 0 ? Math.max(...gameResults.map(r => r.score)) : 0;

  const currentUserRecord: StudentRecord = {
    id: currentUser.studentId.startsWith('ADMIN-') ? 'ADMIN-USER' : currentUser.studentId,
    name: currentUser.name + ' (ตัวคุณ)',
    classroom: currentUser.classroom === 'ผู้ดูแลระบบ' ? 'ปวช.2/1' : currentUser.classroom,
    preTestScore: preTestResult ? preTestResult.score : 0,
    postTestScore: maxPostScore,
    l1Score: l1P ? l1P.maxScore : 0,
    l1Status: l1P ? l1P.status : 'not_started',
    l2Score: l2P ? l2P.maxScore : 0,
    l2Status: l2P ? l2P.status : 'not_started',
    gameScore: gameMaxScore
  };

  // Combine classmates with current user for statistics representation
  const allStudents = [...mockClassmates];
  if (!currentUser.studentId.startsWith('ADMIN-')) {
    allStudents.push(currentUserRecord);
  }

  // Filter students
  const filteredStudents = filterClass === 'ทั้งหมด' 
    ? allStudents 
    : allStudents.filter(s => s.classroom === filterClass);

  // 1. Calculations: Pass rates
  const totalStudentsCount = filteredStudents.length;
  const passedL1Count = filteredStudents.filter(s => s.l1Status === 'completed').length;
  const passedL2Count = filteredStudents.filter(s => s.l2Status === 'completed').length;

  // 2. Averages
  const avgL1Score = filteredStudents.reduce((acc, s) => acc + s.l1Score, 0) / totalStudentsCount;
  const avgL2Score = filteredStudents.reduce((acc, s) => acc + s.l2Score, 0) / totalStudentsCount;

  const completedBothCount = filteredStudents.filter(s => s.l1Status === 'completed' && s.l2Status === 'completed').length;
  const completionRate = (completedBothCount / totalStudentsCount) * 100;

  const avgPreScore = filteredStudents.reduce((acc, s) => acc + s.preTestScore, 0) / totalStudentsCount;
  
  const studentsWithPost = filteredStudents.filter(s => s.postTestScore !== null);
  const avgPostScore = studentsWithPost.length > 0 
    ? studentsWithPost.reduce((acc, s) => acc + (s.postTestScore || 0), 0) / studentsWithPost.length
    : 0;

  // Improvement difference
  const avgProgression = studentsWithPost.length > 0
    ? studentsWithPost.reduce((acc, s) => acc + ((s.postTestScore || 0) - s.preTestScore), 0) / studentsWithPost.length
    : 0;

  const avgGameScore = filteredStudents.reduce((acc, s) => acc + s.gameScore, 0) / totalStudentsCount;

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />;
      case 'studying':
        return <Play className="h-4 w-4 text-amber-500 shrink-0 animate-pulse" />;
      default:
        return <XCircle className="h-4 w-4 text-slate-300 shrink-0" />;
    }
  };

  return (
    <div id="admin-grading-dashboard" className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Filtering Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">กรองรายชื่อกลุ่มนักเรียน:</span>
          <select
            id="admin-class-filter"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="border border-slate-200 rounded-lg py-1 px-3 text-xs bg-slate-50 text-slate-800 focus:outline-none"
          >
            <option value="ทั้งหมด">ทั้งหมด (รวมกลุ่ม)</option>
            <option value="ปวช.2/1">ปวช.2/1 (เทคโนโลยีสารสนเทศ)</option>
            <option value="ปวช.2/2">ปวช.2/2 (คอมพิวเตอร์ธุรกิจ)</option>
          </select>
        </div>
        <div className="text-xs font-bold text-slate-500">
          นักเรียนลงทะเบียนเรียนแล้ว: {totalStudentsCount} คน
        </div>
      </div>

      {/* Aggregated statistics cards row */}
      <div id="admin-summary-metrics" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="block text-[10px] text-slate-400 font-bold uppercase">ผ่านบทที่ 1 / 2</span>
          <strong id="admin-pass-lessons-count" className="block text-base font-bold text-slate-800 mt-1">
            บทที่ 1: {passedL1Count} คน | บทที่ 2: {passedL2Count} คน
          </strong>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="block text-[10px] text-slate-400 font-bold uppercase">เฉลยแบบฝึกหัด 1 / 2</span>
          <strong id="admin-avg-exercises-score" className="block text-base font-bold text-slate-800 mt-1">
            บทที่ 1: {avgL1Score.toFixed(1)}/5 | บทที่ 2: {avgL2Score.toFixed(1)}/5
          </strong>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="block text-[10px] text-slate-400 font-bold uppercase">เรียนจบทั้งคู่ / อัตรา</span>
          <strong id="admin-completion-rate" className="block text-base font-bold text-emerald-600 mt-1">
            {completedBothCount} คน ({completionRate.toFixed(0)}%)
          </strong>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="block text-[10px] text-slate-400 font-bold uppercase">พัฒนาการ / เกมเฉลี่ย</span>
          <strong id="admin-avg-game-progression" className="block text-base font-bold text-indigo-600 mt-1">
            พัฒนาการ: +{avgProgression.toFixed(1)} | เกม: {avgGameScore.toFixed(0)}
          </strong>
        </div>
      </div>

      {/* Aggregate Test metrics */}
      <div id="admin-test-metrics" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="h-10 w-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase">ก่อนเรียนเฉลี่ย</span>
            <strong id="admin-avg-pre-score" className="text-base font-bold text-slate-800">{avgPreScore.toFixed(1)}/10</strong>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase">หลังเรียนเฉลี่ย</span>
            <strong id="admin-avg-post-score" className="text-base font-bold text-indigo-700">{avgPostScore.toFixed(1)}/10</strong>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase">พัฒนาการบวกเพิ่มเฉลี่ย</span>
            <strong id="admin-avg-progression-diff" className="text-base font-bold text-emerald-600">+{avgProgression.toFixed(1)} คะแนน</strong>
          </div>
        </div>
      </div>

      {/* Detailed Student Roster Grid */}
      <div id="admin-student-roster" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Users className="text-slate-500 h-5 w-5" />
          บัญชีสรุปคะแนนประวัติผู้เรียนรายบุคคล (Classroom Gradebook Roster)
        </h3>

        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                <th className="p-3">รหัสประจำตัว</th>
                <th className="p-3">ชื่อ-นามสกุล</th>
                <th className="p-3 text-center">บทที่ 1</th>
                <th className="p-3 text-center">บทที่ 2</th>
                <th className="p-3 text-center">ก่อนเรียน</th>
                <th className="p-3 text-center">หลังเรียน</th>
                <th className="p-3 text-center">เกมจับคู่</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                const isCurrentUser = student.id === currentUserRecord.id;

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-50/50 ${isCurrentUser ? 'bg-blue-50/40 font-semibold' : ''}`}
                  >
                    <td className="p-3 font-mono text-slate-500">{student.id}</td>
                    <td className="p-3 text-slate-800">
                      {student.name}
                      {isCurrentUser && <span className="text-[9px] text-blue-600 bg-blue-100 py-0.5 px-1.5 rounded ml-1.5 font-bold">คุณ</span>}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {renderStatusIcon(student.l1Status)}
                        <span className="font-mono text-slate-600">({student.l1Score}/5)</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {renderStatusIcon(student.l2Status)}
                        <span className="font-mono text-slate-600">({student.l2Score}/5)</span>
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold font-mono text-slate-700">
                      {student.preTestScore}
                    </td>
                    <td className="p-3 text-center font-bold font-mono text-indigo-700">
                      {student.postTestScore !== null ? student.postTestScore : '-'}
                    </td>
                    <td className="p-3 text-center font-bold font-mono text-slate-700">
                      {student.gameScore > 0 ? student.gameScore : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
