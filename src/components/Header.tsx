import React from 'react';
import { User } from '../types';
import { Menu, Award, Trophy, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onMenuToggle: () => void;
  activeTab: string;
  totalProgress: number; // calculated overall progress %
}

export default function Header({
  currentUser,
  onMenuToggle,
  activeTab,
  totalProgress
}: HeaderProps) {
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'แดชบอร์ดหลัก';
      case 'pretest':
        return 'แบบทดสอบก่อนเรียน (Pre-test)';
      case 'lesson1':
        return 'บทที่ 1: หลักการของระบบเครือข่ายคอมพิวเตอร์';
      case 'lesson2':
        return 'บทที่ 2: องค์ประกอบพื้นฐานของระบบเครือข่าย';
      case 'game':
        return 'กิจกรรม: เกมจับคู่คำศัพท์เครือข่าย';
      case 'posttest':
        return 'แบบทดสอบหลังเรียน (Post-test)';
      case 'analytics':
        return 'รายงานคะแนนและพัฒนาการเรียนรู้';
      case 'history':
        return 'ประวัติกิจกรรมการเรียนรู้';
      case 'manual':
        return 'คู่มือผู้ใช้และการตั้งค่า';
      case 'admin':
        return 'ระบบจัดการสำหรับอาจารย์ (Admin Dashboard)';
      default:
        return 'ห้องเรียนออนไลน์';
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent === 100) return 'bg-emerald-600';
    if (percent > 40) return 'bg-natural-accent';
    return 'bg-natural-primary';
  };

  return (
    <header
      id="header"
      className="h-16 border-b border-natural-border bg-white sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-xs"
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          type="button"
          id="mobile-menu-toggle"
          onClick={onMenuToggle}
          className="lg:hidden p-2 hover:bg-natural-sidebar rounded-xl text-natural-primary border border-natural-border transition-all focus:outline-none cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 id="header-tab-title" className="text-sm sm:text-base font-bold text-natural-heading tracking-tight font-sans">
          {getTabTitle(activeTab)}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Course Progress Mini Widget */}
        <div id="course-progress-widget" className="hidden sm:flex flex-col items-end gap-1 min-w-[120px]">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-natural-secondary">
            {totalProgress === 100 ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600">เรียนจบหลักสูตร!</span>
              </>
            ) : (
              <>
                <Trophy className="h-3.5 w-3.5 text-natural-accent" />
                <span>ความคืบหน้ารวม {totalProgress}%</span>
              </>
            )}
          </div>
          <div className="w-28 h-2 bg-natural-sidebar rounded-full overflow-hidden border border-natural-border">
            <div
              id="header-progress-bar-fill"
              className={`h-full transition-all duration-500 ${getProgressColor(totalProgress)}`}
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {/* User profile identifier */}
        <div id="user-classroom-badge" className="py-1 px-3 bg-natural-sidebar text-natural-primary rounded-full text-xs font-bold border border-natural-border shrink-0">
          {currentUser.classroom}
        </div>
      </div>
    </header>
  );
}
