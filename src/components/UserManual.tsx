import React, { useState } from 'react';
import { HelpCircle, FileSpreadsheet, ArrowRight, Settings, CheckCircle2 } from 'lucide-react';

interface UserManualProps {
  sheetsUrl: string;
  onSaveSheetsUrl: (url: string) => void;
}

export default function UserManual({
  sheetsUrl,
  onSaveSheetsUrl
}: UserManualProps) {
  const [urlInput, setUrlInput] = useState(sheetsUrl);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSheetsUrl(urlInput.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const codeGsSnippet = `/**
 * Google Apps Script (Code.gs)
 * คัดลอกโค้ดชุดนี้ไปวางใน Google Apps Script Editor แล้วกด Deploy เป็น Web App
 * เพื่อทำการเชื่อมต่อแอปพลิเคชันออนไลน์เข้ากับ Google Sheets เพื่อบันทึกคะแนนจริง!
 */

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var data = payload.data;
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. บันทึกความก้าวหน้าและการทำแบบฝึกหัดรายบทเรียน
    if (action === "saveProgress") {
      var sheet = ss.getSheetByName("LessonProgress") || ss.insertSheet("LessonProgress");
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          "Timestamp", "Student ID", "Name", "Classroom", 
          "Attempt ID", "Lesson ID", "Lesson Name", 
          "Status", "Last Score", "Max Score", "Attempts Count", 
          "Date Started", "Date Completed"
        ]);
      }
      sheet.appendRow([
        new Date().toISOString(),
        data.studentId,
        data.name,
        data.classroom,
        data.attemptId,
        data.lessonId,
        data.lessonName,
        data.status,
        data.lastScore,
        data.maxScore,
        data.attemptsCount,
        data.dateStarted,
        data.dateCompleted
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Lesson Progress recorded successfully!" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. บันทึกผลคะแนนแบบทดสอบ (ก่อนเรียน/หลังเรียน)
    if (action === "saveQuiz") {
      var sheet = ss.getSheetByName("QuizResults") || ss.insertSheet("QuizResults");
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          "Timestamp", "Student ID", "Name", "Classroom", 
          "Quiz Type", "Score", "Max Score", "Date Completed"
        ]);
      }
      sheet.appendRow([
        new Date().toISOString(),
        data.studentId,
        data.name,
        data.classroom,
        data.quizType,
        data.score,
        data.maxScore,
        data.dateCompleted
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Quiz result recorded successfully!" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. บันทึกผลคะแนนของเกมจับคู่คำศัพท์
    if (action === "saveGame") {
      var sheet = ss.getSheetByName("GameResults") || ss.insertSheet("GameResults");
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          "Timestamp", "Student ID", "Name", "Classroom", 
          "Score", "Time Seconds", "Date Played"
        ]);
      }
      sheet.appendRow([
        new Date().toISOString(),
        data.studentId,
        data.name,
        data.classroom,
        data.score,
        data.timeSeconds,
        data.datePlayed
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Game result recorded successfully!" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Unknown action parameter" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  return (
    <div id="user-manual-container" className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Configuration Web App Google Sheets URL */}
      <div id="config-panel-card" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Settings className="text-slate-500 h-5 w-5" />
          การตั้งค่าสิทธิเชื่อมต่อคลาวด์คลังข้อมูล Google Sheets
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed font-sans font-normal">
          เมื่อกรอกลิงก์ Web App URL ระบบจะทำการส่งข้อมูลคะแนนการเข้าห้องเรียน สอบกลางภาค และคะแนนเกมขึ้นสู่ Google Sheets ของโรงเรียนโดยอัตโนมัติ เพื่อให้อาจารย์รวบรวมทำเกรดใน Excel ได้แบบเรียลไทม์
        </p>

        <form onSubmit={handleSaveUrl} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <input
              type="text"
              id="sheet-url-input"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full px-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all text-slate-800"
            />
            <button
              type="submit"
              id="save-sheets-url-btn"
              className="w-full sm:w-auto py-2.5 px-6 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
            >
              บันทึกตั้งค่า
            </button>
          </div>
          {savedSuccess && (
            <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              ✓ บันทึกที่อยู่เชื่อมต่อคลาวด์เรียบร้อย!
            </div>
          )}
        </form>
      </div>

      {/* Step by Step Guide */}
      <div id="guide-panel-card" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="text-blue-500 h-5 w-5" />
          คู่มือและลำดับขั้นตอนการศึกษาบทเรียนออนไลน์ ปวช.2
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-700 block">1. ทดสอบก่อนเรียน</span>
            <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
              ทำแบบทดสอบก่อนเรียนเพื่อประเมินความรู้เบื้องต้น โดยจะใช้ประเมินร่วมกับคะแนนหลังเรียนเพื่อคำนวณ "คะแนนพัฒนาการ"
            </p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-700 block">2. เรียนรู้และทำโจทย์</span>
            <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
              ศึกษาเนื้อหา 2 บทเรียนและทำแบบฝึกหัดท้ายบทให้ได้คะแนน 3 เต็ม 5 คะแนนขึ้นไปเพื่อปลดล็อกบทเรียนและกิจกรรมในขั้นถัดไป
            </p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-700 block">3. เล่นเกมและหลังเรียน</span>
            <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
              เล่นเกมจับคู่คำศัพท์ให้เสร็จสิ้น 1 รอบ เพื่อปลดล็อกแบบทดสอบหลังเรียน 10 ข้อ วัดผลสำเร็จหลักสูตรเครือข่าย ปวช.2
            </p>
          </div>
        </div>
      </div>

      {/* Google Apps Script deploy manual */}
      <div id="script-deploy-panel" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <FileSpreadsheet className="text-emerald-500 h-5 w-5" />
          คู่มือการใช้งานและโค้ด Google Apps Script สำหรับผู้ดูแลระบบ
        </h3>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed font-sans">
          <p>
            เพื่อความสมบูรณ์แบบในการเก็บเกรดนักเรียน อาจารย์สามารถตั้งค่าส่งคะแนนเข้ากูเกิลชีตได้ด้วยวิธีการง่าย ๆ ดังนี้:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-[11px]">
            <li>สร้างไฟล์ Google Sheets ชนิดว่างเปล่าใหม่ใน Google Drive ของคุณ</li>
            <li>กดปุ่มเมนู <strong>ส่วนขยาย (Extensions)</strong> &gt; <strong>Apps Script</strong></li>
            <li>ลบโค้ดเริ่มต้นออก แล้วนำโค้ดด้านล่างนี้ไปคัดลอกวางทับลงไป</li>
            <li>กดปุ่มรูปแผ่นดิสก์เพื่อ<strong>บันทึกโครงการ</strong></li>
            <li>กดปุ่มสีฟ้า <strong>ทำให้ใช้งานได้ (Deploy)</strong> &gt; <strong>การจัดการทำให้ใช้งานได้ใหม่... (New deployment)</strong></li>
            <li>เลือกประเภทเป็น <strong>เว็บแอป (Web app)</strong></li>
            <li>กำหนดค่า: <br/>
              - เรียกใช้ในฐานะ (Execute as): <strong>ฉัน (อีเมลของคุณ)</strong> <br/>
              - ผู้มีสิทธิ์เข้าถึง (Who has access): <strong>ทุกคน (Anyone)</strong>
            </li>
            <li>กดปุ่ม <strong>ทำให้ใช้งานได้ (Deploy)</strong> แล้วทำการให้สิทธิ์การบันทึกเอกสาร จากนั้นคัดลอก <strong>URL เว็บแอป</strong> ที่ได้มาแปะในช่องตั้งค่าด้านบน!</li>
          </ol>
        </div>

        {/* Code Snippet block */}
        <div className="relative pt-2">
          <div className="flex items-center justify-between bg-slate-800 text-slate-300 px-4 py-2 rounded-t-xl text-[10px] font-mono font-semibold">
            <span>Code.gs</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(codeGsSnippet);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-xs text-white hover:underline focus:outline-none cursor-pointer"
            >
              {copied ? 'คัดลอกสำเร็จแล้ว! ✓' : 'คัดลอกโค้ด'}
            </button>
          </div>
          <pre className="p-4 bg-slate-900 text-slate-200 rounded-b-xl text-[10px] sm:text-xs overflow-x-auto font-mono max-h-64 leading-relaxed whitespace-pre select-all">
            {codeGsSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
