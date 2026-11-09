import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, KeyRound, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { authStorage } from '../services/authStorage';
import { StudentUser } from '../types/mechatronics';

interface OwnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (ownerUser: StudentUser) => void;
}

export const OwnerAuthModal: React.FC<OwnerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!email.trim() || !pin.trim() || !password.trim()) {
      setFeedback({ success: false, msg: 'يرجى إدخال جميع البيانات المطلوبة: البريد الإلكتروني، رمز PIN، وكلمة السر' });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = authStorage.loginOwnerWith3Factors(email, pin, password);
      if (res.success && res.user) {
        setFeedback({ success: true, msg: res.message });
        setTimeout(() => {
          onSuccess(res.user!);
          onClose();
        }, 500);
      } else {
        setFeedback({ success: false, msg: res.message });
      }
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#040915]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0a1329] border-2 border-[#f59e0b]/40 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative text-slate-100 ring-1 ring-[#00d2ff]/30 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a1838] via-[#060e22] to-[#0d214a] p-5 border-b border-[#00d2ff]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0e2554] border border-[#f59e0b]/40 flex items-center justify-center p-1 shadow-md shrink-0">
              <img src="/logo.png" alt="شعار المالك" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">تسجيل دخول المالك والمدير</h3>
              <p className="text-[11px] text-[#fbbf24]">التحقق الثلاثي للوصول للوحة تحكم المالك</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#060c1d] hover:bg-[#0e2554] text-slate-400 hover:text-white flex items-center justify-center transition border border-[#00d2ff]/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {feedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
                feedback.success
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              {feedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{feedback.msg}</span>
            </div>
          )}

          {/* 1. Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#00d2ff]" />
              <span>1. البريد الإلكتروني للمالك:</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@engaseel.online"
              dir="ltr"
              className="w-full px-3.5 py-2.5 bg-[#060c1d] border border-[#00d2ff]/30 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition"
              required
            />
          </div>

          {/* 2. PIN Code Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#fbbf24]" />
              <span>2. رمز PIN السري:</span>
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              maxLength={10}
              dir="ltr"
              className="w-full px-3.5 py-2.5 bg-[#060c1d] border border-[#00d2ff]/30 rounded-xl text-[#fbbf24] text-xs tracking-widest focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition font-mono"
              required
            />
          </div>

          {/* 3. Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#00d2ff]" />
              <span>3. كلمة السر الكبرى للمالك:</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-[#060c1d] border border-[#00d2ff]/30 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#b45309] text-[#040915] font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#f59e0b]/25 transition active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>جاري التحقق من هوية المالك...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>دخول لوحة تحكم المالك</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
