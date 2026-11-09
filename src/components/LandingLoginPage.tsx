import React, { useState, useEffect } from 'react';
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
  ArrowLeft,
  Layers
} from 'lucide-react';
import { authStorage } from '../services/authStorage';
import { StudentUser } from '../types/mechatronics';
import { YEMENI_UNIVERSITIES } from '../data/curriculumData';

interface LandingLoginPageProps {
  onSuccessLogin: (user: StudentUser) => void;
  onLogoClick20: () => void;
  onGuestAccess: () => void;
  onStartTrial?: () => void;
}

export const LandingLoginPage: React.FC<LandingLoginPageProps> = ({
  onSuccessLogin,
  onLogoClick20,
  onGuestAccess,
  onStartTrial
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'activate'>('login');
  const [logoClicks, setLogoClicks] = useState<number>(0);
  const [trialStatus, setTrialStatus] = useState(() => authStorage.getTrialStatus());

  useEffect(() => {
    const timer = setInterval(() => {
      setTrialStatus(authStorage.getTrialStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="min-h-screen bg-[#040915] bg-blueprint-grid text-slate-100 flex flex-col justify-between selection:bg-[#0088ff] selection:text-white relative overflow-hidden font-sans">
      
      {/* Glow Ambient Lights matching the electric cyan and royal navy badge */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#0088ff]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[450px] h-[450px] bg-[#00d2ff]/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-[450px] h-[450px] bg-[#f59e0b]/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Header Logo Bar */}
      <header className="pt-5 px-4 max-w-7xl mx-auto w-full flex items-center justify-between z-10 border-b border-[#00d2ff]/15 pb-4 bg-[#0a1329]/60 backdrop-blur-md rounded-b-2xl">
        <div 
          onClick={handleLogoTap}
          className="flex items-center gap-3 cursor-pointer select-none group"
          title="المعلم الإفتراضي لهندسة الميكاترونكس"
        >
          <div className="relative">
            <img 
              src="/logo.png" 
              alt="شعار المعلم الإفتراضي لهندسة الميكاترونكس" 
              className="w-13 h-13 rounded-2xl shadow-xl shadow-[#0088ff]/30 border-2 border-[#00d2ff]/40 object-contain bg-[#040915]/60 group-hover:scale-105 group-hover:border-[#f59e0b] transition-all duration-300"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-[#f59e0b] border-2 border-[#040915] flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-[#040915]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 drop-shadow">
                <span>المعلم الإفتراضي</span>
                <span className="text-[#f59e0b]">لهندسة الميكاترونكس</span>
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/30 shadow-sm">
                جامعات اليمن
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-wide">
              Virtual Mechatronics Engineering Laboratory • Yemen Universities
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct WhatsApp Contact Button */}
          <a
            href="https://wa.me/967785500075"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] rounded-xl text-xs font-bold transition shadow-sm group"
            title="تواصل مباشر عبر الواتساب: 785500075"
          >
            <WhatsAppIcon className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform shrink-0" />
            <span className="hidden md:inline">واتساب:</span>
            <span className="font-mono font-bold tracking-wider" dir="ltr">785500075</span>
          </a>

          <button
            onClick={() => {
              authStorage.startTrial();
              if (onStartTrial) onStartTrial();
              else onGuestAccess();
            }}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-[#f59e0b] via-[#fbbf24] to-[#f59e0b] hover:from-[#d97706] hover:to-[#f59e0b] text-[#040915] rounded-xl text-xs font-black shadow-lg shadow-[#f59e0b]/25 transition active:scale-95 border border-[#fbbf24]/50"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#040915] animate-pulse" />
            <span>🚀 تجربة مجانية (24 ساعة)</span>
          </button>

          <button
            onClick={onGuestAccess}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-[#0a1329] hover:bg-[#0f1d3d] text-[#00d2ff] border border-[#00d2ff]/30 rounded-xl text-xs font-bold transition hover:border-[#00d2ff]"
          >
            <Eye className="w-3.5 h-3.5 text-[#00d2ff]" />
            <span>استكشاف كزائر</span>
          </button>
        </div>
      </header>

      {/* Main Gateway Presentation */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 my-auto">
        
        {/* Left Side: Visual Brand Presentation inspired by the Badge */}
        <div className="lg:col-span-6 space-y-6 text-right">
          {/* Official Badge Card Hero */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 sm:p-5 bg-gradient-to-br from-[#0a1838] via-[#060e22] to-[#0d214a] border-2 border-[#00d2ff]/40 rounded-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#0088ff]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#f59e0b]/20 rounded-full blur-2xl pointer-events-none" />
            
            {/* Glowing Badge Avatar */}
            <div className="relative shrink-0">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#00d2ff] via-[#0088ff] to-[#f59e0b] rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse" />
              <img 
                src="/logo.png" 
                alt="شعار المعلم الإفتراضي لهندسة الميكاترونكس" 
                className="relative w-28 h-28 sm:w-36 sm:h-36 object-contain rounded-2xl drop-shadow-[0_10px_25px_rgba(0,210,255,0.4)] transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Badge Headings */}
            <div className="space-y-2 text-center sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#fbbf24] text-[11px] font-black shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>الشعار والهوية الرسمية المعتمدة</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                المعلم الإفتراضي <br />
                <span className="text-[#00d2ff]">لهندسة الميكاترونكس</span>
              </h2>
              <div className="text-xs font-black text-[#fbbf24] bg-[#040915]/80 px-3 py-1 rounded-xl border border-[#00d2ff]/30 inline-block">
                منصة المحاكاة الأولى لمهندسي الميكاترونكس في اليمن
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-block px-3.5 py-1.5 bg-[#f59e0b]/20 border border-[#f59e0b]/40 rounded-xl text-[#fbbf24] text-xs sm:text-sm font-black shadow-sm">
              🎓 مختبر محاكاة هندسي شامل متكامل في جيبك
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              صُمم خصيصاً لطلاب ومهندسي الميكاترونكس بالجامعات اليمنية (صنعاء، عدن، تعز، ذمار، العلوم والتكنولوجيا، إب، حضرموت) لتجربة محاكاة الدوائر الإلكترونية الواقعية، أنظمة التحكم PID، الذراع الروبوتي 3D، النيوماتيك، والـ PLC بكل دقة واحترافية.
            </p>
          </div>

          {/* Technology Badges Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-2.5 bg-[#0a1329]/90 border border-[#00d2ff]/25 hover:border-[#00d2ff] rounded-xl flex items-center gap-2.5 transition group">
              <Zap className="w-5 h-5 text-[#00d2ff] shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-bold text-white">دوائر واقعية</div>
                <div className="text-[10px] text-slate-400">Realistic SPICE Lab</div>
              </div>
            </div>

            <div className="p-2.5 bg-[#0a1329]/90 border border-[#00d2ff]/25 hover:border-[#00d2ff] rounded-xl flex items-center gap-2.5 transition group">
              <Bot className="w-5 h-5 text-[#f59e0b] shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-bold text-white">ذراع روبوتي 3D</div>
                <div className="text-[10px] text-slate-400">Robotics Manipulator</div>
              </div>
            </div>

            <div className="p-2.5 bg-[#0a1329]/90 border border-[#00d2ff]/25 hover:border-[#00d2ff] rounded-xl flex items-center gap-2.5 transition group">
              <Activity className="w-5 h-5 text-[#00d2ff] shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-bold text-white">تحكم وموالفة PID</div>
                <div className="text-[10px] text-slate-400">Control Systems</div>
              </div>
            </div>

            <div className="p-2.5 bg-[#0a1329]/90 border border-[#00d2ff]/25 hover:border-[#00d2ff] rounded-xl flex items-center gap-2.5 transition group">
              <Cpu className="w-5 h-5 text-[#f59e0b] shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-bold text-white">PLC & سلمي</div>
                <div className="text-[10px] text-slate-400">Ladder Logic Sim</div>
              </div>
            </div>

            <div className="p-2.5 bg-[#0a1329]/90 border border-[#00d2ff]/25 hover:border-[#00d2ff] rounded-xl flex items-center gap-2.5 transition group">
              <Layers className="w-5 h-5 text-[#00d2ff] shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-bold text-white">أنظمة كهرونيوماتيك</div>
                <div className="text-[10px] text-slate-400">Pneumatics Sim</div>
              </div>
            </div>

            <div className="p-2.5 bg-[#0a1329]/90 border border-[#f59e0b]/35 hover:border-[#f59e0b] rounded-xl flex items-center gap-2.5 transition group">
              <GraduationCap className="w-5 h-5 text-[#f59e0b] shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-bold text-white">منهاج الجامعات</div>
                <div className="text-[10px] text-[#f59e0b]">سنة 1 إلى 5</div>
              </div>
            </div>
          </div>

          {/* Official WhatsApp & Contact Banner */}
          <div className="p-4 bg-gradient-to-r from-[#0a1838] via-[#0b241b] to-[#0a1838] border-2 border-[#25D366]/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl relative overflow-hidden group hover:border-[#25D366] transition-all">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] shrink-0 shadow-lg shadow-[#25D366]/20 group-hover:scale-105 transition-transform">
                <WhatsAppIcon className="w-7 h-7 text-[#25D366]" />
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                  <span>طلب كود التفعيل والاشتراك والدعم الفني</span>
                  <span className="bg-[#25D366] text-[#040915] text-[9px] px-1.5 py-0.2 rounded-full font-black">واتساب متاح</span>
                </div>
                <div className="text-sm font-black text-[#25D366] font-mono tracking-wider flex items-center gap-2 mt-0.5" dir="ltr">
                  <span>+967 785500075</span>
                </div>
              </div>
            </div>

            <a
              href="https://wa.me/967785500075"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-[#040915] font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/30 transition active:scale-95 shrink-0"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#040915]" />
              <span>مراسلة واتساب الآن</span>
            </a>
          </div>
        </div>

        {/* Right Side: Auth Card with Official Badge Visuals */}
        <div className="lg:col-span-6">
          <div className="engineering-card rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl border border-[#00d2ff]/30 shadow-2xl">
            
            {/* Ambient Corner Decors */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0088ff]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#f59e0b]/10 rounded-full blur-2xl pointer-events-none" />

            {/* 24-Hour Free Trial Banner */}
            <div className={`p-3.5 rounded-2xl mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg relative overflow-hidden border ${
              trialStatus.isExpired
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                : 'bg-gradient-to-r from-[#0a1a38] via-[#0e2554] to-[#0a1a38] border-[#00d2ff]/40'
            }`}>
              <div className={`absolute top-0 left-0 w-1.5 h-full ${trialStatus.isExpired ? 'bg-rose-500' : 'bg-[#f59e0b]'}`} />
              <div className="space-y-0.5 text-right w-full sm:w-auto">
                <div className="text-xs font-black flex items-center gap-1.5 text-white">
                  <Sparkles className={`w-4 h-4 ${trialStatus.isExpired ? 'text-rose-400' : 'text-[#f59e0b] animate-bounce'}`} />
                  <span>
                    {trialStatus.isExpired
                      ? 'انتهت فترة الدخول المجاني (24 ساعة)'
                      : trialStatus.isStarted
                      ? 'الدخول المجاني نشط (متبقي من الـ 24 ساعة)'
                      : 'دخول مجاني تجريبي لمدة 24 ساعة كاملة!'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  {trialStatus.isExpired
                    ? 'انتهت الـ 24 ساعة. يتطلب إدخال كود التفعيل والاشتراك للمتابعة.'
                    : trialStatus.isStarted
                    ? `متبقي: ${formatSecondsToHMS(trialStatus.remainingSeconds)}${trialStatus.expiresAtFormatted ? ` • ينتهي في: ${trialStatus.expiresAtFormatted}` : ''}`
                    : '24 ساعة كاملة تبدأ من لحظة بدء استخدامك للمختبر الافتراضي'}
                </p>
              </div>

              {trialStatus.isExpired ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('activate')}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#040915] font-black text-xs rounded-xl shadow-md transition active:scale-95 shrink-0"
                >
                  تفعيل كود الحساب
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    authStorage.startTrial();
                    if (onStartTrial) onStartTrial();
                    else onGuestAccess();
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] hover:from-[#d97706] hover:to-[#f59e0b] text-[#040915] font-black text-xs rounded-xl transition shrink-0 shadow-md active:scale-95 flex items-center justify-center gap-1.5 border border-[#fbbf24]/40"
                >
                  <span>{trialStatus.isStarted ? 'متابعة المعمل 🚀' : 'بدء تجربة الـ 24 ساعة 🚀'}</span>
                </button>
              )}
            </div>

            {/* Official Brand Badge in Card */}
            <div className="flex flex-col items-center justify-center mb-5 text-center">
              <div className="relative group mb-2">
                <img 
                  src="/logo.png" 
                  alt="شعار المعلم الإفتراضي" 
                  className="w-24 h-24 rounded-2xl shadow-2xl shadow-[#0088ff]/40 border-2 border-[#00d2ff]/50 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute -bottom-1 -right-1 bg-[#f59e0b] text-[#040915] rounded-full p-1 shadow-md">
                  <CheckCircle2 className="w-4 h-4 font-black" />
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#f59e0b] tracking-wide">
                بوابة الدخول الرسمية لمهندسي الميكاترونكس
              </span>
            </div>

            {/* Switch Tabs */}
            <div className="flex border border-[#00d2ff]/25 rounded-2xl bg-[#070e1e] p-1.5 mb-5 shadow-inner">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-[#0088ff] to-[#0055ea] text-white shadow-lg shadow-[#0088ff]/30 border border-[#00d2ff]/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-[#00d2ff]" />
                <span>تسجيل الدخول</span>
              </button>

              <button
                onClick={() => setActiveTab('activate')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition ${
                  activeTab === 'activate'
                    ? 'bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-[#040915] font-black shadow-lg shadow-[#f59e0b]/25 border border-[#fbbf24]/50'
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
                    <Phone className="w-3.5 h-3.5 text-[#00d2ff]" />
                    <span>رقم الهاتف:</span>
                  </label>
                  <input
                    type="text"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="مثال: 771234567"
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 bg-[#070e1e] border border-[#00d2ff]/25 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-[#00d2ff] focus:ring-1 focus:ring-[#00d2ff] transition"
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
                    className="w-full px-3.5 py-2.5 bg-[#070e1e] border border-[#00d2ff]/25 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-[#00d2ff] focus:ring-1 focus:ring-[#00d2ff] transition"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingLogin}
                  className="w-full py-3 bg-gradient-to-r from-[#0088ff] via-[#0055ea] to-[#0088ff] hover:from-[#0077ee] hover:to-[#0044cc] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#0088ff]/30 border border-[#00d2ff]/40 transition active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmittingLogin ? (
                    <span>جاري تسجيل الدخول...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 text-[#00d2ff]" />
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
                    <User className="w-3.5 h-3.5 text-[#00d2ff]" />
                    <span>اسم الطالب الثلاثي:</span>
                  </label>
                  <input
                    type="text"
                    value={actName}
                    onChange={(e) => setActName(e.target.value)}
                    placeholder="المهندس محمد أحمد علي"
                    className="w-full px-3 py-2 bg-[#070e1e] border border-[#00d2ff]/25 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-[#00d2ff] focus:ring-1 focus:ring-[#00d2ff] transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
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
                      className="w-full px-3 py-2 bg-[#070e1e] border border-[#00d2ff]/25 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-[#00d2ff] focus:ring-1 focus:ring-[#00d2ff] transition"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#00d2ff]" />
                      <span>كلمة السر:</span>
                    </label>
                    <input
                      type="password"
                      value={actPassword}
                      onChange={(e) => setActPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-[#070e1e] border border-[#00d2ff]/25 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-[#00d2ff] focus:ring-1 focus:ring-[#00d2ff] transition"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#f59e0b]" />
                    <span>الجامعة:</span>
                  </label>
                  <select
                    value={actUniv}
                    onChange={(e) => setActUniv(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070e1e] border border-[#00d2ff]/25 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-[#00d2ff] transition cursor-pointer"
                  >
                    {YEMENI_UNIVERSITIES.map((u) => (
                      <option key={u.id} value={u.nameAr}>
                        {u.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-bold text-[#f59e0b] flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#f59e0b]" />
                    <span>كود التفعيل الخاص بك (Activation Code):</span>
                  </label>
                  <input
                    type="text"
                    value={actCode}
                    onChange={(e) => setActCode(e.target.value)}
                    placeholder="RQ-XXXX-lab"
                    dir="ltr"
                    className="w-full px-3 py-2.5 bg-[#070e1e] border border-[#f59e0b]/50 rounded-xl text-amber-200 font-mono text-xs focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] tracking-wider transition"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAct}
                  className="w-full py-3 bg-gradient-to-r from-[#f59e0b] via-[#fbbf24] to-[#f59e0b] hover:from-[#d97706] hover:to-[#f59e0b] text-[#040915] font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#f59e0b]/30 border border-[#fbbf24]/50 transition active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmittingAct ? (
                    <span>جاري التفعيل...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#040915]" />
                      <span>تفعيل الحساب والدخول إلى المعمل</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick WhatsApp Assistance Box */}
            <div className="mt-4 p-3 bg-gradient-to-r from-[#071c14] to-[#0a241b] border border-[#25D366]/35 rounded-2xl flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] shrink-0">
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">للحصول على كود التفعيل والدعم الفني:</span>
                  <span className="text-xs font-bold text-[#25D366] font-mono" dir="ltr">785500075</span>
                </div>
              </div>
              <a
                href="https://wa.me/967785500075"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-[#040915] font-black rounded-xl text-[11px] flex items-center gap-1.5 transition active:scale-95 shrink-0 shadow-sm"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#040915]" />
                <span>واتساب</span>
              </a>
            </div>

            {/* Guest Access Alternative */}
            <div className="mt-3 pt-3 border-t border-[#00d2ff]/15 text-center">
              <button
                onClick={onGuestAccess}
                className="text-xs text-slate-400 hover:text-[#00d2ff] font-medium flex items-center justify-center gap-1.5 mx-auto transition"
              >
                <span>دخول المعاينة السريعة كزائر</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

      </main>

      {/* Floating WhatsApp Contact Quick Action Button */}
      <a
        href="https://wa.me/967785500075"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-[#25D366] hover:bg-[#20ba59] text-[#040915] rounded-full shadow-2xl shadow-[#25D366]/40 transition-all hover:scale-105 active:scale-95 group font-sans border-2 border-white/30"
        title="تواصل مباشر عبر الواتساب: 785500075"
      >
        <div className="relative">
          <WhatsAppIcon className="w-6 h-6 text-[#040915]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
        </div>
        <div className="hidden sm:flex flex-col text-right leading-tight">
          <span className="text-[10px] font-bold text-[#040915]/90">تواصل عبر واتساب</span>
          <span className="text-xs font-black font-mono tracking-wider text-[#040915]" dir="ltr">785500075</span>
        </div>
      </a>

      {/* Footer */}
      <footer className="py-4 px-4 text-center text-[11px] text-slate-400 border-t border-slate-900 z-10 bg-[#060c1d]/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>المعلم الإفتراضي لهندسة الميكاترونكس • جميع الحقوق محفوظة لجامعات اليمن</span>
          <div className="flex items-center gap-1.5 text-slate-300 font-mono">
            <span>التواصل والواتساب:</span>
            <a 
              href="https://wa.me/967785500075" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#25D366] font-bold hover:underline flex items-center gap-1"
              dir="ltr"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
              <span>785500075</span>
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M12.031 2C6.505 2 2.016 6.49 2.016 12.016c0 1.93.55 3.73 1.503 5.257L2 22l4.89-1.488c1.472.827 3.167 1.294 4.965 1.294 5.526 0 10.016-4.49 10.016-10.016C21.87 6.49 17.38 2 12.031 2zm0 18.23c-1.578 0-3.083-.432-4.385-1.183l-.314-.182-3.25.99.932-3.14-.2-.33a8.17 8.17 0 0 1-1.25-4.37c0-4.52 3.676-8.196 8.196-8.196 4.52 0 8.196 3.676 8.196 8.196 0 4.52-3.676 8.196-8.196 8.196zm4.493-6.136c-.247-.124-1.46-.72-1.687-.803-.227-.082-.392-.124-.557.124-.165.247-.639.803-.783.967-.144.165-.289.186-.536.062-.247-.124-1.042-.384-1.986-1.226-.733-.654-1.228-1.463-1.372-1.71-.144-.247-.015-.38.109-.503.111-.111.247-.289.37-.433.124-.144.165-.247.247-.412.082-.165.041-.309-.02-.433-.062-.124-.557-1.34-.763-1.835-.2-.483-.404-.418-.557-.426-.144-.008-.309-.01-.474-.01-.165 0-.433.062-.66.309-.227.247-.866.845-.866 2.062 0 1.216.886 2.392 1.01 2.557.124.165 1.743 2.66 4.223 3.732.59.255 1.05.408 1.41.522.593.188 1.133.161 1.56.097.476-.071 1.46-.597 1.666-1.175.206-.577.206-1.072.144-1.175-.062-.103-.227-.165-.474-.289z" />
    </svg>
  );
}

function formatSecondsToHMS(totalSec: number): string {
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours > 0) return `${hours} ساعة و ${minutes} دقيقة`;
  if (minutes > 0) return `${minutes} دقيقة و ${seconds} ثانية`;
  return `${seconds} ثانية`;
}
