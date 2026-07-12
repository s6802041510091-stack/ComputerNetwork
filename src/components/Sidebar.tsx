import React from 'react';
import { User, LessonId } from '../types';
import {
  Home,
  ClipboardList,
  BookOpen,
  Network,
  Gamepad2,
  Award,
  TrendingUp,
  History,
  HelpCircle,
  LogOut,
  Shield,
  Menu,
  X,
  Lock,
  CheckCircle2,
  PlayCircle
} from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  lessonLocks: Record<LessonId, boolean>;
  gameLock: boolean;
  postTestLock: boolean;
  lessonStatuses: Record<LessonId, 'not_started' | 'studying' | 'completed'>;
  onLogout: () => void;
}

export default function Sidebar({
  currentUser,
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  lessonLocks,
  gameLock,
  postTestLock,
  lessonStatuses,
  onLogout
}: SidebarProps) {
  const isStudent = currentUser.role === 'student';

  const menuItems = [
    { id: 'dashboard', label: 'หน้าหลัก', icon: Home, section: 'general' },
    { id: 'pretest', label: 'แบบทดสอบก่อนเรียน', icon: ClipboardList, section: 'general' },
    
    // Group: เนื้อหาความรู้
    { id: 'lesson1', label: 'บทที่ 1 หลักการของระบบเครือข่าย', icon: BookOpen, section: 'lessons', locked: lessonLocks.lesson1, lessonId: 'lesson1' as LessonId },
    { id: 'lesson2', label: 'บทที่ 2 องค์ประกอบพื้นฐานเครือข่าย', icon: Network, section: 'lessons', locked: lessonLocks.lesson2, lessonId: 'lesson2' as LessonId },
    
    // Group: กิจกรรมระหว่างเรียน
    { id: 'game', label: 'เกมโต้ตอบจับคู่คำศัพท์', icon: Gamepad2, section: 'activities', locked: gameLock },
    
    // Remaining Items
    { id: 'posttest', label: 'แบบทดสอบหลังเรียน', icon: Award, section: 'evaluation', locked: postTestLock },
    { id: 'analytics', label: 'คะแนนและพัฒนาการ', icon: TrendingUp, section: 'evaluation' },
    { id: 'history', label: 'ประวัติการเรียน', icon: History, section: 'evaluation' },
    { id: 'manual', label: 'คู่มือการใช้งาน', icon: HelpCircle, section: 'evaluation' },
  ];

  const handleItemClick = (tabId: string, locked?: boolean) => {
    if (locked) return;
    setActiveTab(tabId);
    setIsOpen(false);
  };

  const getStatusIcon = (status?: string) => {
    if (status === 'completed') return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
    if (status === 'studying') return <PlayCircle className="h-4 w-4 text-amber-500 shrink-0" />;
    return null;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          id="mobile-backdrop"
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        id="sidebar"
        className={`fixed inset-y-0 left-0 bg-natural-sidebar w-72 border-r border-natural-border z-50 flex flex-col transition-transform duration-300 transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header brand */}
        <div className="h-16 border-b border-natural-border flex items-center justify-between px-6 bg-natural-sidebar">
          <div className="flex items-center gap-2.5">
            <Network className="h-6 w-6 text-natural-accent shrink-0" />
            <span className="font-bold text-sm text-natural-heading tracking-tight leading-tight">
              Network Lesson App
            </span>
          </div>
          <button
            type="button"
            id="close-sidebar-btn"
            className="lg:hidden p-1.5 hover:bg-natural-border/50 rounded-lg text-natural-primary"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User profile section */}
        <div className="p-4 border-b border-natural-border bg-natural-bg/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-natural-primary text-white flex items-center justify-center font-bold text-sm border border-natural-border shadow-xs">
              {currentUser.name.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</h4>
              <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">
                {currentUser.classroom} • {currentUser.role === 'admin' ? 'อาจารย์' : 'นักเรียน'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation lists */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Section 1: General & Pretest */}
          <div className="space-y-1">
            {menuItems
              .filter((item) => item.section === 'general')
              .map((item) => (
                <button
                  key={item.id}
                  id={`menu-item-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === item.id
                      ? 'bg-white shadow-xs text-natural-heading font-bold border-l-4 border-natural-accent pl-2'
                      : 'text-natural-primary hover:bg-natural-bg/50 hover:text-natural-heading'
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${activeTab === item.id ? 'text-natural-accent' : 'text-natural-secondary'}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              ))}
          </div>

          {/* Section 2: เนื้อหาความรู้ (Header) */}
          <div className="space-y-1">
            <h5 className="px-3 text-[10px] font-bold text-natural-secondary uppercase tracking-wider mb-2">
              เนื้อหาความรู้
            </h5>
            {menuItems
              .filter((item) => item.section === 'lessons')
              .map((item) => {
                const isLocked = item.locked;
                return (
                  <button
                    key={item.id}
                    id={`menu-item-${item.id}`}
                    onClick={() => handleItemClick(item.id, isLocked)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isLocked
                        ? 'text-natural-secondary/40 cursor-not-allowed'
                        : activeTab === item.id
                        ? 'bg-white shadow-xs text-natural-heading font-bold border-l-4 border-natural-accent pl-2'
                        : 'text-natural-primary hover:bg-natural-bg/50 hover:text-natural-heading'
                    }`}
                  >
                    <item.icon className={`h-4 w-4 shrink-0 ${isLocked ? 'text-natural-secondary/30' : activeTab === item.id ? 'text-natural-accent' : 'text-natural-secondary'}`} />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {isLocked ? (
                      <Lock className="h-3.5 w-3.5 text-natural-secondary/40 shrink-0" />
                    ) : (
                      item.lessonId && getStatusIcon(lessonStatuses[item.lessonId])
                    )}
                  </button>
                );
              })}
          </div>

          {/* Section 3: กิจกรรมระหว่างเรียน (Header) */}
          <div className="space-y-1">
            <h5 className="px-3 text-[10px] font-bold text-natural-secondary uppercase tracking-wider mb-2">
              กิจกรรมระหว่างเรียน
            </h5>
            {menuItems
              .filter((item) => item.section === 'activities')
              .map((item) => {
                const isLocked = item.locked;
                return (
                  <button
                    key={item.id}
                    id={`menu-item-${item.id}`}
                    onClick={() => handleItemClick(item.id, isLocked)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isLocked
                        ? 'text-natural-secondary/40 cursor-not-allowed'
                        : activeTab === item.id
                        ? 'bg-white shadow-xs text-natural-heading font-bold border-l-4 border-natural-accent pl-2'
                        : 'text-natural-primary hover:bg-natural-bg/50 hover:text-natural-heading'
                    }`}
                  >
                    <item.icon className={`h-4 w-4 shrink-0 ${isLocked ? 'text-natural-secondary/30' : activeTab === item.id ? 'text-natural-accent' : 'text-natural-secondary'}`} />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {isLocked && <Lock className="h-3.5 w-3.5 text-natural-secondary/40 shrink-0" />}
                  </button>
                );
              })}
          </div>

          {/* Section 4: แบบทดสอบหลังเรียน, คะแนน, ประวัติ */}
          <div className="space-y-1">
            <h5 className="px-3 text-[10px] font-bold text-natural-secondary uppercase tracking-wider mb-2">
              การประเมิน & ข้อมูลเรียน
            </h5>
            {menuItems
              .filter((item) => item.section === 'evaluation')
              .map((item) => {
                const isLocked = item.locked;
                return (
                  <button
                    key={item.id}
                    id={`menu-item-${item.id}`}
                    onClick={() => handleItemClick(item.id, isLocked)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isLocked
                        ? 'text-natural-secondary/40 cursor-not-allowed'
                        : activeTab === item.id
                        ? 'bg-white shadow-xs text-natural-heading font-bold border-l-4 border-natural-accent pl-2'
                        : 'text-natural-primary hover:bg-natural-bg/50 hover:text-natural-heading'
                    }`}
                  >
                    <item.icon className={`h-4 w-4 shrink-0 ${isLocked ? 'text-natural-secondary/30' : activeTab === item.id ? 'text-natural-accent' : 'text-natural-secondary'}`} />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {isLocked && <Lock className="h-3.5 w-3.5 text-natural-secondary/40 shrink-0" />}
                  </button>
                );
              })}

            {/* Conditional admin view */}
            {currentUser.role === 'admin' && (
              <button
                id="menu-item-admin"
                onClick={() => handleItemClick('admin')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all mt-4 ${
                  activeTab === 'admin'
                    ? 'bg-white shadow-xs text-natural-accent font-bold border-l-4 border-natural-accent pl-2'
                    : 'text-natural-accent hover:bg-natural-bg/50'
                }`}
              >
                <Shield className="h-4 w-4 shrink-0 text-natural-accent" />
                <span className="flex-1 text-left">หน้าผู้ดูแลระบบ</span>
              </button>
            )}
          </div>
        </nav>

        {/* Footer logout button */}
        <div className="p-4 border-t border-natural-border bg-natural-sidebar">
          <button
            type="button"
            id="logout-btn"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-red-600 border border-red-200 hover:bg-red-500/10 hover:border-red-400 transition-all shadow-xs"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            ออกจากระบบ
          </button>
        </div>
      </aside>
    </>
  );
}
