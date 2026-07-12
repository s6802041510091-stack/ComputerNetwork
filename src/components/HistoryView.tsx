import React from 'react';
import { LessonProgress, HistoryLog } from '../types';
import {
  History,
  Calendar,
  CheckCircle,
  Play,
  Clock,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface HistoryViewProps {
  lessonProgress: Record<string, LessonProgress>;
  historyLogs: HistoryLog[];
}

export default function HistoryView({
  lessonProgress,
  historyLogs
}: HistoryViewProps) {
  
  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="py-1 px-3 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100 flex items-center gap-1 shrink-0">
            <CheckCircle className="h-3 w-3" />
            เรียนจบแล้ว
          </span>
        );
      case 'studying':
        return (
          <span className="py-1 px-3 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-100 flex items-center gap-1 shrink-0">
            <Play className="h-3 w-3 animate-pulse" />
            กำลังเรียน
          </span>
        );
      default:
        return (
          <span className="py-1 px-3 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-full border border-slate-200 shrink-0">
            ยังไม่ได้เรียน
          </span>
        );
    }
  };

  return (
    <div id="history-view-container" className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Lesson Progress Ledger Card */}
      <div id="lessons-history-ledger" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="text-blue-500 h-5 w-5" />
          สรุปประวัติความสำเร็จความก้าวหน้าทั้ง 2 บทเรียน
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(lessonProgress).map((progress) => (
            <div
              key={progress.lessonId}
              id={`progress-summary-card-${progress.lessonId}`}
              className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">
                    {progress.lessonName}
                  </h4>
                  <span className="block text-[10px] text-slate-400 font-mono">ID: {progress.lessonId}</span>
                </div>
                {getStatusBadge(progress.status)}
              </div>

              {/* Progress Detail stats */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 border-t border-slate-200/50 pt-3 text-[11px] text-slate-500">
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">ทำแบบฝึกหัดแล้ว</span>
                  <span className="font-semibold text-slate-700">{progress.attemptsCount} ครั้ง</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">คะแนนสูงสุด</span>
                  <span className="font-semibold text-slate-700">{progress.attemptsCount > 0 ? `${progress.maxScore}/${progress.totalQuestions}` : '-'}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">เริ่มศึกษาครั้งแรก</span>
                  <span className="font-semibold text-slate-600 truncate block">{formatDate(progress.dateStarted)}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">เรียนจบสำเร็จเมื่อ</span>
                  <span className="font-semibold text-slate-600 truncate block">{progress.status === 'completed' ? formatDate(progress.dateCompleted) : '-'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Log Chronological Ledger */}
      <div id="activity-logs-timeline" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <History className="text-indigo-500 h-5 w-5" />
          บันทึกกิจกรรมเรียลไทม์ (Activity Ledger Logs)
        </h3>

        {historyLogs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 font-medium">
            ยังไม่มีบันทึกประวัติการกระทำกิจกรรมในระบบนี้
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 pl-4 sm:pl-6 space-y-6 max-h-[400px] overflow-y-auto pr-2">
            {historyLogs.map((log) => (
              <div key={log.id} className="relative group space-y-1">
                {/* Visual bullet on timeline */}
                <div className="absolute -left-[21px] sm:-left-[29px] top-1 h-3.5 w-3.5 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center shrink-0" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-x-4 gap-y-1 text-xs">
                  <span className="font-bold text-slate-800 font-sans">
                    {log.activityName}
                  </span>
                  
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 shrink-0">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(log.timestamp)}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                  {log.statusDetails}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
