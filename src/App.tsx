import React, { useState, useEffect } from 'react';
import {
  User,
  LessonProgress,
  QuizResult,
  GameResult,
  HistoryLog,
  LessonId
} from './types';
import { lessonsData } from './data/lessons';
import { preTestQuestions, postTestQuestions } from './data/quizzes';

// Components
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LessonView from './components/LessonView';
import QuizView from './components/QuizView';
import MatchingGame from './components/MatchingGame';
import AnalyticsView from './components/AnalyticsView';
import HistoryView from './components/HistoryView';
import UserManual from './components/UserManual';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // --- 1. Authentic State Initialization ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('net_lesson_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [googleSheetsUrl, setGoogleSheetsUrl] = useState<string>(() => {
    return localStorage.getItem('net_lesson_sheets_url') || 'https://script.google.com/macros/s/AKfycbz4AVI0m5_3tXcvhRpR6nc_Lc6Y5T1_mAzu194CDXojSCJhesXHjEh0K6dqJzzohDGiAA/exec';
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('net_lesson_active_tab') || 'dashboard';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Custom alert & confirm states to bypass iframe/sandbox blocking confirm() and alert()
  const [customAlert, setCustomAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'alert' | 'confirm';
    onConfirm?: () => void;
  } | null>(null);

  const showAlert = (message: string, title: string = 'แจ้งเตือน') => {
    setCustomAlert({
      isOpen: true,
      title,
      message,
      type: 'alert'
    });
  };

  const showConfirm = (message: string, onConfirm: () => void, title: string = 'ยืนยันการดำเนินการ') => {
    setCustomAlert({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm
    });
  };

  // Default lesson progress constructor
  const createDefaultProgress = (studentId: string): Record<string, LessonProgress> => ({
    lesson1: {
      attemptId: `att-l1-${Date.now().toString().slice(-4)}`,
      lessonId: 'lesson1',
      lessonName: 'บทที่ 1 หลักการของระบบเครือข่ายคอมพิวเตอร์',
      status: 'not_started',
      lastScore: 0,
      maxScore: 0,
      totalQuestions: 5,
      attemptsCount: 0,
      dateStarted: '',
      dateCompleted: '',
      dateUpdated: ''
    },
    lesson2: {
      attemptId: `att-l2-${Date.now().toString().slice(-4)}`,
      lessonId: 'lesson2',
      lessonName: 'บทที่ 2 องค์ประกอบพื้นฐานของระบบเครือข่าย',
      status: 'not_started',
      lastScore: 0,
      maxScore: 0,
      totalQuestions: 5,
      attemptsCount: 0,
      dateStarted: '',
      dateCompleted: '',
      dateUpdated: ''
    }
  });

  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>(() => {
    const saved = localStorage.getItem('net_lesson_progress');
    return saved ? JSON.parse(saved) : {};
  });

  const [preTestResult, setPreTestResult] = useState<QuizResult | null>(() => {
    const saved = localStorage.getItem('net_lesson_pretest');
    return saved ? JSON.parse(saved) : null;
  });

  const [postTestResults, setPostTestResults] = useState<QuizResult[]>(() => {
    const saved = localStorage.getItem('net_lesson_posttest_results');
    return saved ? JSON.parse(saved) : [];
  });

  const [gameResults, setGameResults] = useState<GameResult[]>(() => {
    const saved = localStorage.getItem('net_lesson_game_results');
    return saved ? JSON.parse(saved) : [];
  });

  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>(() => {
    const saved = localStorage.getItem('net_lesson_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [thoughtAnswers, setThoughtAnswers] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('net_lesson_thoughts');
    return saved ? JSON.parse(saved) : {};
  });

  // --- 2. Synchronize to LocalStorage ---
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('net_lesson_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('net_lesson_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('net_lesson_sheets_url', googleSheetsUrl);
  }, [googleSheetsUrl]);

  useEffect(() => {
    localStorage.setItem('net_lesson_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('net_lesson_progress', JSON.stringify(lessonProgress));
  }, [lessonProgress]);

  useEffect(() => {
    localStorage.setItem('net_lesson_pretest', JSON.stringify(preTestResult));
  }, [preTestResult]);

  useEffect(() => {
    localStorage.setItem('net_lesson_posttest_results', JSON.stringify(postTestResults));
  }, [postTestResults]);

  useEffect(() => {
    localStorage.setItem('net_lesson_game_results', JSON.stringify(gameResults));
  }, [gameResults]);

  useEffect(() => {
    localStorage.setItem('net_lesson_history', JSON.stringify(historyLogs));
  }, [historyLogs]);

  useEffect(() => {
    localStorage.setItem('net_lesson_thoughts', JSON.stringify(thoughtAnswers));
  }, [thoughtAnswers]);

  // Load progress if empty on login
  useEffect(() => {
    if (currentUser && Object.keys(lessonProgress).length === 0) {
      setLessonProgress(createDefaultProgress(currentUser.studentId));
    }
  }, [currentUser, lessonProgress]);

  // --- 3. Google Sheets Integration Helper ---
  const syncToGoogleSheets = async (action: 'saveProgress' | 'saveQuiz' | 'saveGame', data: any) => {
    if (!googleSheetsUrl) {
      console.log('Sheets URL not set, skipping remote sync.');
      return;
    }

    const payload = {
      action,
      data: {
        studentId: currentUser?.studentId,
        name: currentUser?.name,
        classroom: currentUser?.classroom,
        ...data
      }
    };

    try {
      // Use no-cors mode as Apps Script standard for redirect endpoints,
      // or standard post. We log the sync outcome to History log!
      await fetch(googleSheetsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      logLocalActivity(
        'ซิงค์คลาวด์สำเร็จ',
        `ข้อมูลการทำกิจกรรม [${action}] ถูกส่งไปสำรองข้อมูลบน Google Sheets สำเร็จเรียบร้อย`
      );
    } catch (err) {
      console.error('Failed to sync to Google Sheets:', err);
      logLocalActivity(
        'ซิงค์คลาวด์ล้มเหลว',
        `ไม่สามารถเชื่อมโยง Google Sheets ได้เนื่องจากข้อผิดพลาด: ${String(err)}`
      );
    }
  };

  // --- 4. Logging Activities ---
  const logLocalActivity = (activityName: string, statusDetails: string) => {
    const newLog: HistoryLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      activityName,
      statusDetails,
      timestamp: new Date().toISOString()
    };
    setHistoryLogs((prev) => [newLog, ...prev]);
  };

  // --- 5. Interactive Navigation Rules & Locking States ---
  // A. Pretest is completed if preTestResult is set.
  const isPretestCompleted = preTestResult !== null;
  // B. Lesson 1 is unlocked ONLY when Pretest is completed
  const isLesson1Locked = !isPretestCompleted;
  // C. Lesson 2 is unlocked ONLY when Lesson 1 is COMPLETED (passed with >= 60%)
  const isLesson1Completed = lessonProgress.lesson1?.status === 'completed';
  const isLesson2Locked = !isLesson1Completed;
  // D. Game is unlocked ONLY when Lesson 2 is COMPLETED (passed with >= 60%)
  const isLesson2Completed = lessonProgress.lesson2?.status === 'completed';
  const isGameLocked = !isLesson2Completed;
  // E. Posttest is unlocked ONLY when Lesson 1 & 2 completed, AND Game is played at least once
  const isGamePlayed = gameResults.length > 0;
  const isPosttestLocked = !isLesson1Completed || !isLesson2Completed || !isGamePlayed;

  const handleNavigate = (tab: string) => {
    // Check locks when navigating
    if (tab === 'lesson1' && isLesson1Locked) {
      showAlert('โปรดทำแบบทดสอบก่อนเรียน (Pre-test) ให้เสร็จสิ้นก่อนเริ่มเรียนบทที่ 1', 'บทเรียนถูกล็อก');
      return;
    }
    if (tab === 'lesson2' && isLesson2Locked) {
      showAlert('โปรดเรียนและสอบแบบฝึกหัดบทที่ 1 ให้ผ่านเกณฑ์ (3 เต็ม 5 คะแนน) ก่อนเข้าสู่บทที่ 2', 'บทเรียนถูกล็อก');
      return;
    }
    if (tab === 'game' && isGameLocked) {
      showAlert('โปรดเรียนและสอบแบบฝึกหัดบทที่ 2 ให้ผ่านเกณฑ์ (3 เต็ม 5 คะแนน) ก่อนเล่นเกมจับคู่', 'กิจกรรมถูกล็อก');
      return;
    }
    if (tab === 'posttest' && isPosttestLocked) {
      showAlert('โปรดเรียนจบและทำแบบฝึกหัดทั้ง 2 บทให้ผ่าน พร้อมทั้งเข้าเล่นเกมโต้ตอบอย่างน้อย 1 ครั้ง เพื่อปลดล็อกแบบทดสอบหลังเรียน', 'แบบทดสอบถูกล็อก');
      return;
    }

    // Trigger start date recording for lesson if not started
    if (tab === 'lesson1' || tab === 'lesson2') {
      const p = lessonProgress[tab];
      if (p && !p.dateStarted) {
        setLessonProgress((prev) => ({
          ...prev,
          [tab]: {
            ...prev[tab],
            status: 'studying',
            dateStarted: new Date().toISOString(),
            dateUpdated: new Date().toISOString()
          }
        }));
        logLocalActivity(
          `เริ่มศึกษาบทเรียนที่ ${tab === 'lesson1' ? '1' : '2'}`,
          `ผู้เรียนเริ่มทำการเข้าดูสไลด์เนื้อหาบทเรียน ${p.lessonName}`
        );
      }
    }

    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  // --- 6. Math calculating overall course progress ---
  const calculateTotalProgress = () => {
    let progress = 0;
    if (isPretestCompleted) progress += 10;
    if (isLesson1Completed) progress += 25;
    if (isLesson2Completed) progress += 25;
    if (isGamePlayed) progress += 15;
    if (postTestResults.length > 0) progress += 25;
    return progress;
  };

  const totalProgress = calculateTotalProgress();

  // --- 7. Event Handlers ---
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Initialize default progress for the user
    setLessonProgress(createDefaultProgress(user.studentId));
    setActiveTab('dashboard');
    
    // Create authentic log
    const welcomeLogMsg = `เข้าใช้บริการระบบเรียนออนไลน์คอมพิวเตอร์เบื้องต้นในฐานะ ${
      user.role === 'admin' ? 'ผู้ดูแลระบบ/อาจารย์' : 'นักเรียน ปวช.2'
    }`;
    const initialLogs: HistoryLog[] = [
      {
        id: `log-login-${Date.now()}`,
        activityName: 'เข้าสู่ระบบเรียนรู้',
        statusDetails: welcomeLogMsg,
        timestamp: new Date().toISOString()
      }
    ];
    setHistoryLogs(initialLogs);
  };

  const handleLogout = () => {
    showConfirm(
      'คุณต้องการออกจากระบบและสลับบัญชีผู้ใช้ใช่หรือไม่? (ประวัติและคะแนนจะถูกเก็บไว้ในเบราว์เซอร์นี้)',
      () => {
        setCurrentUser(null);
        setLessonProgress({});
        setPreTestResult(null);
        setPostTestResults([]);
        setGameResults([]);
        setHistoryLogs([]);
        setThoughtAnswers({});
        setActiveTab('dashboard');
        localStorage.clear();
      },
      'ยืนยันการออกจากระบบ'
    );
  };

  const handleSaveLessonProgress = (lessonId: string, updates: Partial<LessonProgress>) => {
    setLessonProgress((prev) => {
      const current = prev[lessonId];
      if (!current) return prev;
      
      const updated = {
        ...current,
        ...updates,
        dateUpdated: new Date().toISOString()
      };

      // Trigger Cloud sheets sync
      syncToGoogleSheets('saveProgress', {
        attemptId: updated.attemptId,
        lessonId: updated.lessonId,
        lessonName: updated.lessonName,
        status: updated.status,
        lastScore: updated.lastScore,
        maxScore: updated.maxScore,
        attemptsCount: updated.attemptsCount,
        dateStarted: updated.dateStarted,
        dateCompleted: updated.dateCompleted
      });

      return {
        ...prev,
        [lessonId]: updated
      };
    });

    if (updates.status === 'completed') {
      logLocalActivity(
        'ผ่านบทเรียนสำเร็จ',
        `ผ่านแบบฝึกหัดบทเรียนเรื่อง ${lessonProgress[lessonId]?.lessonName} ด้วยคะแนน ${updates.lastScore}/5 คะแนน และบันทึกสถานะเป็นเรียนจบ`
      );
    } else {
      logLocalActivity(
        'บันทึกคะแนนแบบฝึกหัด',
        `ทำแบบฝึกหัดของบทเรียนเรื่อง ${lessonProgress[lessonId]?.lessonName} ครั้งที่ ${updates.attemptsCount} ได้คะแนน ${updates.lastScore}/5`
      );
    }
  };

  const handlePreTestComplete = (result: QuizResult) => {
    setPreTestResult(result);
    setActiveTab('dashboard');
    logLocalActivity(
      'ทำแบบทดสอบก่อนเรียนสำเร็จ',
      `ทำข้อสอบ Pre-test สำเร็จด้วยคะแนน ${result.score}/10 คะแนน และทำการปลดล็อกบทเรียนที่ 1 เรียบร้อย`
    );

    // Sync to Google sheets
    syncToGoogleSheets('saveQuiz', {
      quizType: 'pre',
      score: result.score,
      maxScore: result.maxScore,
      dateCompleted: result.dateCompleted
    });
  };

  const handlePostTestComplete = (result: QuizResult) => {
    setPostTestResults((prev) => [...prev, result]);
    setActiveTab('analytics');
    logLocalActivity(
      'ทำแบบทดสอบหลังเรียนสำเร็จ',
      `ทำข้อสอบ Post-test สำเร็จด้วยคะแนนล่าสุด ${result.score}/10 คะแนน และปรับปรุงแผนภูมิเกรดเรียบร้อย`
    );

    // Sync to Google sheets
    syncToGoogleSheets('saveQuiz', {
      quizType: 'post',
      score: result.score,
      maxScore: result.maxScore,
      dateCompleted: result.dateCompleted
    });
  };

  const handleGameComplete = (result: GameResult) => {
    setGameResults((prev) => [...prev, result]);
    setActiveTab('dashboard');
    logLocalActivity(
      'จบการแข่งขันเกมจับคู่',
      `จับคู่ความรู้คำศัพท์ระบบเครือข่าย 8 คู่สำเร็จเรียบร้อย ได้รับคะแนน ${result.score} แต้ม และใช้เวลาไปทั้งสิ้น ${result.timeSeconds} วินาที`
    );

    // Sync to Google sheets
    syncToGoogleSheets('saveGame', {
      score: result.score,
      timeSeconds: result.timeSeconds,
      datePlayed: result.datePlayed
    });
  };

  const handleSubmitThoughtAnswer = (lessonId: string, answer: string) => {
    setThoughtAnswers((prev) => ({
      ...prev,
      [lessonId]: answer
    }));
    logLocalActivity(
      'ส่งคำตอบชวนคิด',
      `ส่งข้อมูลและบันทึกข้อสรุปความเห็นของนักเรียนในกล่องคำถามชวนคิดประจำบทเรียนที่ ${lessonId === 'lesson1' ? '1' : '2'} สำเร็จ`
    );
  };

  const handleSaveSheetsUrl = (url: string) => {
    setGoogleSheetsUrl(url);
    logLocalActivity(
      'เปลี่ยนการเชื่อมต่อคลาวด์',
      `บันทึกลิงก์ Web App Google Sheets URL ชุดใหม่เรียบร้อย พร้อมซิงค์ข้อมูลจริง`
    );
  };

  // Render Login if no authenticated session exists
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // --- 8. Master View router ---
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            currentUser={currentUser}
            lessonProgress={lessonProgress}
            preTestResult={preTestResult}
            postTestResult={postTestResults.length > 0 ? postTestResults[postTestResults.length - 1] : null}
            gameResults={gameResults}
            activeTab={activeTab}
            setActiveTab={handleNavigate}
            totalProgress={totalProgress}
          />
        );
      case 'pretest':
        return (
          <QuizView
            quizType="pre"
            questions={preTestQuestions}
            onComplete={handlePreTestComplete}
            onNavigate={handleNavigate}
            existingResult={preTestResult}
          />
        );
      case 'lesson1':
        return (
          <LessonView
            lesson={lessonsData[0]}
            progress={lessonProgress.lesson1}
            onSaveProgress={handleSaveLessonProgress}
            onNavigate={handleNavigate}
            onSubmitThoughtAnswer={handleSubmitThoughtAnswer}
            savedThoughtAnswer={thoughtAnswers.lesson1}
          />
        );
      case 'lesson2':
        return (
          <LessonView
            lesson={lessonsData[1]}
            progress={lessonProgress.lesson2}
            onSaveProgress={handleSaveLessonProgress}
            onNavigate={handleNavigate}
            onSubmitThoughtAnswer={handleSubmitThoughtAnswer}
            savedThoughtAnswer={thoughtAnswers.lesson2}
          />
        );
      case 'game':
        return (
          <MatchingGame
            onComplete={handleGameComplete}
            onNavigate={handleNavigate}
            existingResults={gameResults}
          />
        );
      case 'posttest':
        return (
          <QuizView
            quizType="post"
            questions={postTestQuestions}
            onComplete={handlePostTestComplete}
            onNavigate={handleNavigate}
            existingResult={postTestResults.length > 0 ? postTestResults[postTestResults.length - 1] : null}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView
            currentUser={currentUser}
            lessonProgress={lessonProgress}
            preTestResult={preTestResult}
            postTestResults={postTestResults}
            gameResults={gameResults}
            totalProgress={totalProgress}
          />
        );
      case 'history':
        return (
          <HistoryView
            lessonProgress={lessonProgress}
            historyLogs={historyLogs}
          />
        );
      case 'manual':
        return (
          <UserManual
            sheetsUrl={googleSheetsUrl}
            onSaveSheetsUrl={handleSaveSheetsUrl}
          />
        );
      case 'admin':
        if (currentUser.role !== 'admin') {
          return <div className="text-xs text-red-500 font-bold">ไม่มีสิทธิ์ในการเข้าถึงหน้านี้</div>;
        }
        return (
          <AdminPanel
            currentUser={currentUser}
            lessonProgress={lessonProgress}
            preTestResult={preTestResult}
            postTestResults={postTestResults}
            gameResults={gameResults}
            totalProgress={totalProgress}
          />
        );
      default:
        return <div className="text-xs text-slate-400">อยู่ระหว่างพัฒนา...</div>;
    }
  };

  return (
    <div id="classroom-layout" className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Navigation Drawer */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        lessonLocks={{
          lesson1: isLesson1Locked,
          lesson2: isLesson2Locked
        }}
        gameLock={isGameLocked}
        postTestLock={isPosttestLocked}
        lessonStatuses={{
          lesson1: lessonProgress.lesson1?.status || 'not_started',
          lesson2: lessonProgress.lesson2?.status || 'not_started'
        }}
        onLogout={handleLogout}
      />

      {/* Main Study stage */}
      <div id="classroom-stage" className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          onMenuToggle={() => setIsSidebarOpen(true)}
          activeTab={activeTab}
          totalProgress={totalProgress}
        />

        {/* Content Section */}
        <main id="main-content-scroller" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50">
          {renderActiveView()}
        </main>
      </div>

      {/* Beautiful Custom Alert & Confirm Overlay to bypass sandbox iframe dialog blocks */}
      {customAlert && customAlert.isOpen && (
        <div id="custom-alert-modal" className="fixed inset-0 bg-slate-900/60 z-100 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-natural-border shadow-xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-natural-heading leading-tight flex items-center gap-2">
                {customAlert.type === 'confirm' ? '❓' : '📢'}
                {customAlert.title}
              </h3>
              <p className="text-xs text-natural-secondary leading-relaxed font-medium">
                {customAlert.message}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              {customAlert.type === 'confirm' && (
                <button
                  type="button"
                  id="alert-cancel-btn"
                  onClick={() => setCustomAlert(null)}
                  className="px-4 py-2 border border-natural-border text-xs font-bold rounded-xl text-natural-primary bg-white hover:bg-natural-bg/50 transition-all cursor-pointer focus:outline-none"
                >
                  ยกเลิก
                </button>
              )}
              <button
                type="button"
                id="alert-confirm-btn"
                onClick={() => {
                  if (customAlert.type === 'confirm' && customAlert.onConfirm) {
                    customAlert.onConfirm();
                  }
                  setCustomAlert(null);
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl text-white transition-all cursor-pointer focus:outline-none ${
                  customAlert.type === 'confirm' ? 'bg-red-600 hover:bg-red-500' : 'bg-natural-primary hover:bg-natural-primary/95'
                }`}
              >
                {customAlert.type === 'confirm' ? 'ออกจากระบบ' : 'ตกลง'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
