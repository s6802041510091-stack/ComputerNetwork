import React, { useState } from 'react';
import { User } from '../types';
import { Network, UserCheck, Shield, HelpCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [classroom, setClassroom] = useState('ปวช.2/1');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'student') {
      if (!studentId.trim()) {
        setError('โปรดกรอกรหัสนักเรียน');
        return;
      }
      if (!name.trim()) {
        setError('โปรดกรอกชื่อ-นามสกุล');
        return;
      }
      onLogin({
        studentId: studentId.trim(),
        name: name.trim(),
        classroom,
        role: 'student'
      });
    } else {
      // Admin role login (can just use a default code or password, or let teachers log in easily for grading)
      if (!name.trim()) {
        setError('โปรดกรอกชื่อ-นามสกุลผู้ดูแลระบบ');
        return;
      }
      onLogin({
        studentId: 'ADMIN-' + Date.now().toString().slice(-4),
        name: name.trim(),
        classroom: 'ผู้ดูแลระบบ',
        role: 'admin'
      });
    }
  };

  return (
    <div id="login-container" className="min-h-screen flex items-center justify-center bg-natural-bg px-4 py-12 sm:px-6 lg:px-8">
      <div id="login-card" className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-natural-border transition-all">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-natural-sidebar text-natural-accent rounded-2xl flex items-center justify-center mb-4 border border-natural-border shadow-xs">
            <Network className="h-9 w-9" />
          </div>
          <h2 className="text-2xl font-bold font-sans tracking-tight text-natural-heading">
            ระบบบทเรียนออนไลน์
          </h2>
          <p className="mt-2 text-sm text-natural-secondary font-sans">
            วิชาเครือข่ายคอมพิวเตอร์เบื้องต้น (ปวช. 2)
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div id="role-selector" className="grid grid-cols-2 gap-2 p-1 bg-natural-sidebar rounded-xl border border-natural-border-alt">
          <button
            type="button"
            id="role-btn-student"
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              role === 'student'
                ? 'bg-white text-natural-primary shadow-xs'
                : 'text-natural-secondary hover:text-natural-heading'
            }`}
            onClick={() => {
              setRole('student');
              setError('');
            }}
          >
            <UserCheck className="h-4 w-4" />
            นักเรียน ปวช.2
          </button>
          <button
            type="button"
            id="role-btn-admin"
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              role === 'admin'
                ? 'bg-white text-natural-accent shadow-xs'
                : 'text-natural-secondary hover:text-natural-heading'
            }`}
            onClick={() => {
              setRole('admin');
              setError('');
            }}
          >
            <Shield className="h-4 w-4" />
            ผู้ดูแลระบบ / อาจารย์
          </button>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div id="login-error" className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 font-semibold">
              ⚠️ {error}
            </div>
          )}

          {role === 'student' ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="student-id" className="block text-xs font-semibold text-natural-primary mb-1">
                  รหัสนักเรียน (เช่น 6802xxxx)
                </label>
                <input
                  id="student-id"
                  name="studentId"
                  type="text"
                  required
                  placeholder="ป้อนรหัสนักเรียน 10 หลัก"
                  className="w-full px-4 py-2.5 border border-natural-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-natural-primary bg-natural-bg/50 focus:bg-white transition-all text-natural-heading"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="student-name" className="block text-xs font-semibold text-natural-primary mb-1">
                  ชื่อ-นามสกุล (ภาษาไทย)
                </label>
                <input
                  id="student-name"
                  name="name"
                  type="text"
                  required
                  placeholder="เด็กหญิง/เด็กชาย/นาย/นางสาว สุขใจ"
                  className="w-full px-4 py-2.5 border border-natural-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-natural-primary bg-natural-bg/50 focus:bg-white transition-all text-natural-heading"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="student-classroom" className="block text-xs font-semibold text-natural-primary mb-1">
                  ชั้นเรียน / ห้องเรียน
                </label>
                <select
                  id="student-classroom"
                  name="classroom"
                  className="w-full px-4 py-2.5 border border-natural-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-natural-primary bg-natural-bg/50 focus:bg-white transition-all text-natural-heading"
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                >
                  <option value="ปวช.2/1">ปวช.2/1 (กลุ่มเทคโนโลยีสารสนเทศ)</option>
                  <option value="ปวช.2/2">ปวช.2/2 (กลุ่มคอมพิวเตอร์ธุรกิจ)</option>
                  <option value="ปวช.2/3">ปวช.2/3 (กลุ่มอิเล็กทรอนิกส์)</option>
                  <option value="ปวช.2/4">ปวช.2/4 (กลุ่มไฟฟ้ากำลัง)</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="admin-name" className="block text-xs font-semibold text-natural-primary mb-1">
                  ชื่อ-นามสกุล อาจารย์ผู้ใช้ระบบ
                </label>
                <input
                  id="admin-name"
                  name="name"
                  type="text"
                  required
                  placeholder="อาจารย์สมชาย ใจดี"
                  className="w-full px-4 py-2.5 border border-natural-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-natural-primary bg-natural-bg/50 focus:bg-white transition-all text-natural-heading"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="p-3 bg-natural-bg text-natural-primary text-xs rounded-xl border border-natural-border flex items-start gap-2">
                <HelpCircle className="h-4 w-4 mt-0.5 shrink-0 text-natural-accent" />
                <span>
                  บัญชีผู้ดูแลระบบ / อาจารย์สามารถดูข้อมูลคะแนนและอัตราความสำเร็จของห้องเรียนทั้งหมด สถิติ และรายละเอียดนักเรียนได้อย่างละเอียด
                </span>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              id="login-submit-btn"
              className={`w-full py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white transition-all hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${
                role === 'student'
                  ? 'bg-natural-primary hover:bg-natural-primary/95 focus:ring-natural-primary'
                  : 'bg-natural-accent hover:bg-natural-accent-hover focus:ring-natural-accent'
              }`}
            >
              {role === 'student' ? 'เข้าสู่ระบบเริ่มเรียนรู้' : 'เข้าสู่ระบบจัดการและตรวจเกรด'}
            </button>
          </div>
        </form>

        <div id="login-footer" className="text-center pt-2">
          <p className="text-[10px] text-slate-400 font-mono">
            ระบบจัดเก็บประวัติอัตโนมัติบน LocalStorage และคลาวด์ชีต
          </p>
        </div>
      </div>
    </div>
  );
}
