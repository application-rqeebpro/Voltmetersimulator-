import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  KeyRound, 
  Phone, 
  User, 
  Lock, 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X
} from 'lucide-react';
import { authStorage } from '../services/authStorage';
import { StudentUser } from '../types/mechatronics';
import { YEMENI_UNIVERSITIES } from '../data/curriculumData';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: StudentUser) => void;
  initialTab?: 'login' | 'activate';
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTab = 'login'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'activate'>(initialTab);

  useEffect(() => {
    if (isOpen) {
      const trial = authStorage.getTrialStatus();
      if (trial.isExpired) {
        setActiveTab('activate');
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab, isOpen]);

  // Sign In Form State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Activate Account Form State
  const [actName, setActName] = useState('');
  const [actPhone, setActPhone] = useState('');
  const [actPassword, setActPassword] = useState('');
  const [actCode, setActCode] = useState('');
  const [actUniv, setActUniv] = useState('جامعة صنعاء');
  const [isSubmittingAct, setIsSubmittingAct] = useState(false);
  const [actFeedback, setActFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginFeedback(null);

    if (!loginPhone.trim() || !loginPassword.trim()) {
      setLoginFeedback({ success: false, msg: 'يرجى كتابة رقم الهاتف وكلمة السر' });
      return;
    }

    setIsSubmittingLogin(true);
    try {
      const res = await authStorage.loginUserAsync(loginPhone, loginPassword);
      if (res.success && res.user) {
        setLoginFeedback({ success: true, msg: res.message || 'تم تسجيل الدخول بنجاح!' });
        setTimeout(() => {
          onSuccess(res.user!);
          onClose();
        }, 600);
      } else {
        setLoginFeedback({ success: false, msg: res.message || 'تعذر تسجيل الدخول' });
      }
    } catch {
      setLoginFeedback({ success: false, msg: 'حدث خطأ أثناء الاتصال بالنظام' });
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleActivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActFeedback(null);

    if (!actName.trim() || !actPhone.trim() || !actPassword.trim() || !actCode.trim()) {
      setActFeedback({ success: false, msg: 'يرجى كتابة جميع البيانات المطلوبة وإدخال كود التفعيل' });
      return;
    }

    setIsSubmittingAct(true);
    try {
      const res = authStorage.activateAndRegisterStudent({
        name: actName,
        phone: actPhone,
        password: actPassword,
        activationCode: actCode,
        university: actUniv
      });

      if (res.success && res.user) {
        setActFeedback({ success: true, msg: res.message });
        setTimeout(() => {
          onSuccess(res.user!);
          onClose();
        }, 800);
      } else {
        setActFeedback({ success: false, msg: res.message });
      }
    } catch (err: any) {
      setActFeedback({ success: false, msg: err.message || 'حدث خطأ أثناء تفعيل الحساب' });
    } finally {
      setIsSubmittingAct(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#040915]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0a1329] border-2 border-[#00d2ff]/40 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative text-slate-100 ring-1 ring-[#00d2ff]/20 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a1838] via-[#060e22] to-[#0d214a] p-5 border-b border-[#00d2ff]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0e2554] border border-[#00d2ff]/40 flex items-center justify-center p-1 shadow-md">
              <img src="/logo.png" alt="الشعار" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">المعلم الإفتراضي لهندسة الميكاترونكس</h3>
              <p className="text-[11px] text-[#00d2ff]">بوابة طلاب مهندسي الميكاترونكس في كليات الهندسة باليمن</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#060c1d] hover:bg-[#0e2554] text-slate-400 hover:text-white flex items-center justify-center transition border border-[#00d2ff]/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs switcher */}
        <div className="flex border-b border-[#00d2ff]/20 bg-[#060c1d] p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-[#0088ff] to-[#0055ea] text-white shadow-md ring-1 ring-[#00d2ff]'
                : 'text-slate-400 hover:text-white hover:bg-[#0a1329]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>تسجيل الدخول</span>
          </button>
          <button
            onClick={() => setActiveTab('activate')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'activate'
                ? 'bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-[#040915] font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-[#0a1329]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>تفعيل كود الحساب</span>
          </button>
        </div>

        {/* Expiration Notice Banner if trial expired */}
        {authStorage.getTrialStatus().isExpired && (
          <div className="bg-rose-950/70 border-b border-rose-500/40 p-2.5 px-4 text-xs flex items-center gap-2 text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              انتهت فترة الدخول المجاني (24 ساعة). يرجى إدخال كود التفعيل والاشتراك للمتابعة.
            </span>
          </div>
        )}

        {/* Tab 1: Sign In */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-5 space-y-4">
            {loginFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
                  loginFeedback.success
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}
              >
                {loginFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{loginFeedback.msg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#00d2ff]" />
                <span>رقم الهاتف المسجل:</span>
              </label>
              <input
                type="text"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                placeholder="مثال: 771234567"
                dir="ltr"
                className="w-full px-3.5 py-2.5 bg-[#060c1d] border border-[#00d2ff]/30 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-[#00d2ff] focus:ring-1 focus:ring-[#00d2ff] transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#00d2ff]" />
                <span>كلمة السر الخاصة بك:</span>
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#060c1d] border border-[#00d2ff]/30 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-[#00d2ff] focus:ring-1 focus:ring-[#00d2ff] transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingLogin}
              className="w-full py-3 bg-gradient-to-r from-[#0088ff] to-[#0055ea] hover:from-[#0070d6] hover:to-[#0040b0] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#0088ff]/30 transition active:scale-[0.99] disabled:opacity-50 ring-1 ring-[#00d2ff]"
            >
              {isSubmittingLogin ? (
                <span>جاري التحقق وتسجيل الدخول...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>دخول إلى المعمل الافتراضي</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center border-t border-[#00d2ff]/20">
              <p className="text-[11px] text-slate-400">
                ليس لديك حساب مفعل؟{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('activate')}
                  className="text-[#fbbf24] font-bold hover:underline"
                >
                  أدخل كود التفعيل هنا
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Tab 2: Activate New Account */}
        {activeTab === 'activate' && (
          <form onSubmit={handleActivateSubmit} className="p-5 space-y-3.5">
            {actFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
                  actFeedback.success
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}
              >
                {actFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{actFeedback.msg}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#00d2ff]" />
                <span>اسم الطالب الثلاثي:</span>
              </label>
              <input
                type="text"
                value={actName}
                onChange={(e) => setActName(e.target.value)}
                placeholder="مثال: المهندس محمد أحمد علي"
                className="w-full px-3 py-2 bg-[#060c1d] border border-[#00d2ff]/30 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-[#00d2ff] focus:ring-1 focus:ring-[#00d2ff] transition"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#00d2ff]" />
                  <span>رقم الهاتف:</span>
                </label>
                <input
                  type="text"
                  value={actPhone}
                  onChange={(e) => setActPhone(e.target.value)}
                  placeholder="771234567"
                  dir="ltr"
                  className="w-full px-3 py-2 bg-[#060c1d] border border-[#00d2ff]/30 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-[#00d2ff] focus:ring-1 focus:ring-[#00d2ff] transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#00d2ff]" />
                  <span>كلمة السر الجديدة:</span>
                </label>
                <input
                  type="password"
                  value={actPassword}
                  onChange={(e) => setActPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#060c1d] border border-[#00d2ff]/30 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-[#00d2ff] focus:ring-1 focus:ring-[#00d2ff] transition"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>الجامعة الهندسية:</span>
              </label>
              <select
                value={actUniv}
                onChange={(e) => setActUniv(e.target.value)}
                className="w-full px-3 py-2 bg-[#060c1d] border border-[#00d2ff]/30 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-[#00d2ff] transition"
              >
                {YEMENI_UNIVERSITIES.map((u) => (
                  <option key={u.id} value={u.nameAr}>
                    {u.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-bold text-[#fbbf24] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>كود التفعيل الخاص بك (Activation Code):</span>
              </label>
              <input
                type="text"
                value={actCode}
                onChange={(e) => setActCode(e.target.value)}
                placeholder="مثال: RQ-XXXX-lab"
                dir="ltr"
                className="w-full px-3 py-2.5 bg-[#060c1d] border border-[#f59e0b]/50 rounded-xl text-[#fbbf24] font-mono text-xs focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] tracking-wider transition"
                required
              />
              <p className="text-[10px] text-slate-400">
                أدخل الكود الممنوح لك من قبل الإدارة لتأكيد التفعيل الفوري.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmittingAct}
              className="w-full py-3 bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#b45309] text-[#040915] font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#f59e0b]/20 transition active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmittingAct ? (
                <span>جاري التفعيل...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تفعيل الحساب والدخول إلى المختبر</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
