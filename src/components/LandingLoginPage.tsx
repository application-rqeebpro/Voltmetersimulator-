import React, { useState } from 'react';
import { 
  LogIn, 
  KeyRound, 
  Phone, 
  User, 
  Lock, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Zap, 
  Bot, 
  Activity, 
  Sparkles,
  ShieldCheck,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { authStorage } from '../services/authStorage';
import { StudentUser } from '../types/mechatronics';
import { YEMENI_UNIVERSITIES } from '../data/curriculumData';

interface LandingLoginPageProps {
  onSuccessLogin: (user: StudentUser) => void;
  onLogoClick20: () => void;
  onGuestAccess: () => void;
}

export const LandingLoginPage: React.FC<LandingLoginPageProps> = ({
  onSuccessLogin,
  onLogoClick20,
  onGuestAccess
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'activate'>('login');
  const [logoClicks, setLogoClicks] = useState<number>(0);

  // Sign In Form State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Activate Form State
  const [actName, setActName] = useState('');
  const [actPhone, setActPhone] = useState('');
  const [actPassword, setActPassword] = useState('');
  const [actCode, setActCode] = useState('');
  const [actUniv, setActUniv] = useState('جامعة صنعاء');
  const [isSubmittingAct, setIsSubmittingAct] = useState(false);
  const [actFeedback, setActFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  const handleLogoTap = () => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (next >= 20) {
      setLogoClicks(0);
      onLogoClick20();
    }
  };

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
          onSuccessLogin(res.user!);
        }, 500);
      } else {
        setLoginFeedback({ success: false, msg: res.message || 'بيانات الدخول غير صحيحة' });
      }
    } catch {
      setLoginFeedback({ success: false, msg: 'حدث خطأ في الاتصال بالنظام' });
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleActivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActFeedback(null);

    if (!actName.trim() || !actPhone.trim() || !actPassword.trim() || !actCode.trim()) {
      setActFeedback({ success: false, msg: 'يرجى ملء جميع البيانات وإدخال كود التفعيل' });
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
          onSuccessLogin(res.user!);
        }, 600);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-purple-600 selection:text-white relative overflow-hidden font-sans">
      
      {/* Glow Ambient Lights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Logo */}
      <header className="pt-6 px-4 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <div 
          onClick={handleLogoTap}
          className="flex items-center gap-3 cursor-pointer select-none group"
          title="المعمل الافتراضي لمهندسي الميكاترونكس"
        >
          <img 
            src="/logo.png" 
            alt="شعار المعمل الافتراضي" 
            className="w-11 h-11 rounded-2xl shadow-xl shadow-purple-900/40 border border-purple-500/30 object-cover group-hover:scale-105 transition-transform"
            onError={(e) => {
              // Fallback to CPU icon if image fails
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
              المعمل الافتراضي لمهندسي الميكاترونكس
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                جامعات اليمن
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Mechatronics Virtual Engineering Laboratory
            </p>
          </div>
        </div>

        <button
          onClick={onGuestAccess}
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span>استكشاف كزائر</span>
        </button>
      </header>

      {/* Main Gateway Card */}
      <main className="max-w-5xl mx-auto px-4 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 my-auto">
        
        {/* Left Side: Branding Features */}
        <div className="lg:col-span-6 space-y-6 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>منصة المحاكاة الأولى لمهندسي الميكاترونكس في اليمن</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            مختبر محاكاة هندسي شامل متكامل في جيبك
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            صُمم خصيصاً لطلاب مهندسي الميكاترونكس بالجامعات اليمنية (صنعاء، عدن، تعز، ذمار، UST، إب، حضرموت) لتجربة محاكاة الدوائر الإلكترونية، التحكم PID، الذراع الروبوتي، النيوماتيك، والـ PLC بكل احترافية.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">محاكي الدوائر SPICE</div>
                <div className="text-[10px] text-slate-400">Circuit Wizard Engine</div>
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center gap-2.5">
              <Bot className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">تحكم وروبوتات 3D</div>
                <div className="text-[10px] text-slate-400">Robotics & PID Control</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden backdrop-blur-md">
            
            {/* Logo Image Banner inside card */}
            <div className="flex items-center justify-center mb-5">
              <div className="relative group">
                <img 
                  src="/logo.png" 
                  alt="شعار المعمل" 
                  className="w-20 h-20 rounded-2xl shadow-2xl shadow-purple-900/50 border-2 border-purple-500/40 object-cover"
                />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-1 shadow-md">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Switch Tabs */}
            <div className="flex border border-slate-800 rounded-xl bg-slate-950/60 p-1 mb-5">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
                  activeTab === 'login'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>تسجيل الدخول</span>
              </button>

              <button
                onClick={() => setActiveTab('activate')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
                  activeTab === 'activate'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>تفعيل كود الحساب</span>
              </button>
            </div>

            {/* Tab 1: Sign In */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                    <Phone className="w-3.5 h-3.5 text-purple-400" />
                    <span>رقم الهاتف:</span>
                  </label>
                  <input
                    type="text"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="مثال: 771234567"
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    <span>كلمة السر الخاصة بك:</span>
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingLogin}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmittingLogin ? (
                    <span>جاري تسجيل الدخول...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>تسجيل الدخول وبدء المعمل</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Tab 2: Activate Account Code */}
            {activeTab === 'activate' && (
              <form onSubmit={handleActivateSubmit} className="space-y-3.5">
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
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>اسم الطالب الثلاثي:</span>
                  </label>
                  <input
                    type="text"
                    value={actName}
                    onChange={(e) => setActName(e.target.value)}
                    placeholder="المهندس محمد أحمد علي"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>رقم الهاتف:</span>
                    </label>
                    <input
                      type="text"
                      value={actPhone}
                      onChange={(e) => setActPhone(e.target.value)}
                      placeholder="771234567"
                      dir="ltr"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>كلمة السر:</span>
                    </label>
                    <input
                      type="password"
                      value={actPassword}
                      onChange={(e) => setActPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                    <span>الجامعة:</span>
                  </label>
                  <select
                    value={actUniv}
                    onChange={(e) => setActUniv(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 transition"
                  >
                    {YEMENI_UNIVERSITIES.map((u) => (
                      <option key={u.id} value={u.nameAr}>
                        {u.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>كود التفعيل الخاص بك (Activation Code):</span>
                  </label>
                  <input
                    type="text"
                    value={actCode}
                    onChange={(e) => setActCode(e.target.value)}
                    placeholder="RQ-XXXX-lab"
                    dir="ltr"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-amber-500/50 rounded-xl text-amber-200 font-mono text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 tracking-wider transition"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAct}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmittingAct ? (
                    <span>جاري التفعيل...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تفعيل الحساب والدخول إلى المعمل</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Guest Access Alternative */}
            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <button
                onClick={onGuestAccess}
                className="text-xs text-slate-400 hover:text-emerald-400 font-medium flex items-center justify-center gap-1.5 mx-auto transition"
              >
                <span>دخول المعاينة السريعة كزائر</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-500 border-t border-slate-900 z-10">
        المعمل الافتراضي المتكامل لمهندسي الميكاترونكس • جميع الحقوق محفوظة لجامعات اليمن
      </footer>

    </div>
  );
};
