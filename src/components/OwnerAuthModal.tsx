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
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative text-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-purple-950/60 p-5 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-amber-300">تسجيل دخول المالك والمدير</h3>
              <p className="text-xs text-slate-400">التحقق الثلاثي للوصول للوحدة السرية للمالك</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
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
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>1. البريد الإلكتروني للمالك:</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@engaseel.online"
              dir="ltr"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              required
            />
          </div>

          {/* 2. PIN Code Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>2. رمز PIN السري:</span>
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              maxLength={10}
              dir="ltr"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-200 text-xs tracking-widest focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-mono"
              required
            />
          </div>

          {/* 3. Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>3. كلمة السر الكبرى للمالك:</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition active:scale-[0.99] disabled:opacity-50"
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
