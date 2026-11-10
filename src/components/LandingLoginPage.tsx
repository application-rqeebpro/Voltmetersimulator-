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
  Eye,
  ArrowLeft,
  Layers,
  MessageCircle,
  Clock
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
  const [logoSrc, setLogoSrc] = useState<string>('/logo.png');

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
    <div className="min-h-screen bg-[#040915] bg-blueprint-grid text-slate-100 flex flex-col justify-between selection:bg-[#0088ff] selection:text-white relative overflow-x-hidden font-sans">
      
      {/* Glow Ambient Lights */}
      <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-[#0088ff]/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 left-5 w-[400px] h-[400px] bg-[#00d2ff]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-[#f59e0b]/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Header - Precision Responsive Layout (Zero Mobile Overflow) */}
      <header className="sticky top-0 z-30 w-full bg-[#0a1329]/90 backdrop-blur-md border-b border-[#00d2ff]/20 shadow-lg px-3 sm:px-6 py-2.5 sm:py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Brand & Logo Section */}
          <div 
            onClick={handleLogoTap}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group min-w-0"
            title="المعلم الإفتراضي لهندسة الميكاترونكس - انقر 20 مرة للوحة المالك"
          >
            <div className="relative shrink-0">
              <img 
                src={logoSrc} 
                alt="شعار المعلم الإفتراضي لهندسة الميكاترونكس" 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shadow-lg shadow-[#0088ff]/30 border border-[#00d2ff]/40 object-contain bg-[#040915]/80 group-hover:scale-105 group-hover:border-[#f59e0b] transition-all"
                onError={() => {
                  if (logoSrc !== '/app_logo.png') setLogoSrc('/app_logo.png');
                }}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#f59e0b] border-2 border-[#040915] flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-[#040915]" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-xs sm:text-base font-black tracking-tight text-white flex items-center gap-1 truncate">
                  <span>المعلم الإفتراضي</span>
                  <span className="text-[#f59e0b]">لهندسة الميكاترونكس</span>
                </h1>
                <span className="hidden xs:inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/30 shrink-0">
                  جامعات اليمن
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wide hidden sm:block truncate">
                Virtual Mechatronics Engineering Laboratory • Yemen
              </p>
            </div>
          </div>

          {/* Right Action Chips (Responsive & Compact on Mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* WhatsApp Direct Header Link */}
            <a
              href="https://wa.me/967785500075"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] rounded-xl text-[11px] sm:text-xs font-bold transition shadow-sm group whitespace-nowrap"
              title="تواصل مباشر عبر الواتساب: 785500075"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#25D366] group-hover:scale-110 transition-transform shrink-0" />
              <span className="hidden md:inline">واتساب:</span>
              <span className="font-mono font-bold" dir="ltr">785500075</span>
            </a>

            {/* Free Trial Button (Never overflows!) */}
            <button
              onClick={() => {
                authStorage.startTrial();
                if (onStartTrial) onStartTrial();
                else onGuestAccess();
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#f59e0b] via-[#fbbf24] to-[#f59e0b] hover:from-[#d97706] hover:to-[#f59e0b] text-[#040915] rounded-xl text-[11px] sm:text-xs font-black shadow-lg shadow-[#f59e0b]/25 transition active:scale-95 border border-[#fbbf24]/50 whitespace-nowrap"
            >
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#040915] shrink-0" />
              <span className="sm:hidden">تجربة 24h 🚀</span>
              <span className="hidden sm:inline">🚀 تجربة مجانية (24 ساعة)</span>
            </button>

            {/* Guest Access Button (Desktop) */}
            <button
              onClick={onGuestAccess}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#0a1329] hover:bg-[#0f1d3d] text-[#00d2ff] border border-[#00d2ff]/30 rounded-xl text-xs font-bold transition hover:border-[#00d2ff] whitespace-nowrap"
            >
              <Eye className="w-3.5 h-3.5 text-[#00d2ff]" />
              <span>استكشاف</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 w-full z-10 pb-32 sm:pb-16">
        
        {/* ======================================================== */}
        {/* MOBILE VIEW (< lg): Streamlined Clean Flow               */}
        {/* 1. Official Emblem Badge                                 */}
        {/* 2. Login & Activation Card (Directly accessible!)        */}
        {/* 3. Mechatronics Labs Showcase                            */}
        {/* 4. WhatsApp Support Banner                               */}
        {/* ======================================================== */}
        <div className="lg:hidden space-y-5">
          
          {/* Mobile Hero Header */}
          <div className="flex flex-col items-center text-center p-4 bg-gradient-to-b from-[#0a1838]/90 via-[#060e22]/90 to-[#0a1838]/90 border border-[#00d2ff]/30 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0088ff]/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#f59e0b]/15 rounded-full blur-2xl pointer-events-none" />

            {/* Glowing Emblem Image */}
            <div className="relative mb-3">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#00d2ff] via-[#0088ff] to-[#f59e0b] rounded-full blur-md opacity-80 animate-pulse" />
              <img 
                src={logoSrc} 
                alt="شعار المعلم الإفتراضي لهندسة الميكاترونكس" 
                className="relative w-28 h-28 object-contain rounded-2xl drop-shadow-[0_8px_20px_rgba(0,210,255,0.4)]"
                onError={() => {
                  if (logoSrc !== '/app_logo.png') setLogoSrc('/app_logo.png');
                }}
              />
            </div>

            <div className="space-y-1.5 max-w-md">
              <h2 className="text-lg font-black text-white leading-tight">
                المعلم الإفتراضي <span className="text-[#f59e0b]">لهندسة الميكاترونكس</span>
              </h2>
              <p className="text-xs text-[#00d2ff] font-bold">
                منصة المحاكاة الأولى لمهندسي الميكاترونكس في اليمن
              </p>
              <p className="text-[11px] text-slate-300 font-medium leading-relaxed pt-1">
                مختبر محاكاة هندسي شامل متكامل في جيبك لطلاب جامعات اليمن (صنعاء، عدن، تعز، ذمار، العلوم والتكنولوجيا، إب، حضرموت).
              </p>
            </div>
          </div>

          {/* Auth Card (Rendered immediately on mobile so users don't have to scroll!) */}
          <AuthCard
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            trialStatus={trialStatus}
            onStartTrial={onStartTrial}
            onGuestAccess={onGuestAccess}
            loginPhone={loginPhone}
            setLoginPhone={setLoginPhone}
            loginPassword={loginPassword}
            setLoginPassword={setLoginPassword}
            handleLoginSubmit={handleLoginSubmit}
            isSubmittingLogin={isSubmittingLogin}
            loginFeedback={loginFeedback}
            actName={actName}
            setActName={setActName}
            actPhone={actPhone}
            setActPhone={setActPhone}
            actPassword={actPassword}
            setActPassword={setActPassword}
            actCode={actCode}
            setActCode={setActCode}
            actUniv={actUniv}
            setActUniv={setActUniv}
            handleActivateSubmit={handleActivateSubmit}
            isSubmittingAct={isSubmittingAct}
            actFeedback={actFeedback}
          />

          {/* Mobile Mechatronics Laboratories Matrix */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#00d2ff]" />
                <span>المختبرات والأنظمة الهندسية المعتمدة:</span>
              </span>
              <span className="text-[10px] text-[#f59e0b] font-bold">سنة 1 إلى 5</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <FeatureMiniCard icon={<Zap className="w-4 h-4 text-[#00d2ff]" />} title="دوائر واقعية" sub="Realistic SPICE Lab" />
              <FeatureMiniCard icon={<Bot className="w-4 h-4 text-[#f59e0b]" />} title="ذراع روبوتي 3D" sub="Robotics Manipulator" />
              <FeatureMiniCard icon={<Activity className="w-4 h-4 text-[#00d2ff]" />} title="تحكم وموالفة PID" sub="Control Systems" />
              <FeatureMiniCard icon={<Cpu className="w-4 h-4 text-[#f59e0b]" />} title="PLC & سلمي" sub="Ladder Logic Sim" />
              <FeatureMiniCard icon={<Layers className="w-4 h-4 text-[#00d2ff]" />} title="أنظمة كهرونيوماتيك" sub="Pneumatics Sim" />
              <FeatureMiniCard icon={<GraduationCap className="w-4 h-4 text-[#f59e0b]" />} title="منهاج الجامعات" sub="Yemeni Universities" />
            </div>
          </div>

          {/* Mobile WhatsApp Direct Banner */}
          <WhatsAppContactBanner />

        </div>

        {/* ======================================================== */}
        {/* DESKTOP VIEW (lg+): Two Column Grid                      */}
        {/* Left: Official Brand, Features, WhatsApp Contact         */}
        {/* Right: Auth Card (Trial, Login, Activation)              */}
        {/* ======================================================== */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Brand Hero & Presentation */}
          <div className="lg:col-span-6 space-y-6 text-right">
            
            {/* Official Badge Card */}
            <div className="flex items-center gap-5 p-5 bg-gradient-to-br from-[#0a1838] via-[#060e22] to-[#0d214a] border-2 border-[#00d2ff]/40 rounded-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-44 h-44 bg-[#0088ff]/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#f59e0b]/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative shrink-0">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#00d2ff] via-[#0088ff] to-[#f59e0b] rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse" />
                <img 
                  src={logoSrc} 
                  alt="شعار المعلم الإفتراضي لهندسة الميكاترونكس" 
                  className="relative w-32 h-32 object-contain rounded-2xl drop-shadow-[0_10px_25px_rgba(0,210,255,0.4)] transition-transform duration-300 group-hover:scale-105"
                  onError={() => {
                    if (logoSrc !== '/app_logo.png') setLogoSrc('/app_logo.png');
                  }}
                />
              </div>

              <div className="space-y-2 text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#fbbf24] text-[11px] font-black">
                  <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
                  <span>الشعار والهوية الرسمية المعتمدة</span>
                </div>
                <h2 className="text-2xl font-black text-white leading-tight">
                  المعلم الإفتراضي <br />
                  <span className="text-[#00d2ff]">لهندسة الميكاترونكس</span>
                </h2>
                <div className="text-xs font-black text-[#fbbf24] bg-[#040915]/80 px-3 py-1 rounded-xl border border-[#00d2ff]/30 inline-block">
                  منصة المحاكاة الأولى لمهندسي الميكاترونكس في اليمن
                </div>
              </div>
            </div>

            {/* Description & University Scope */}
            <div className="space-y-2">
              <div className="inline-block px-3.5 py-1.5 bg-[#f59e0b]/20 border border-[#f59e0b]/40 rounded-xl text-[#fbbf24] text-sm font-black shadow-sm">
                🎓 مختبر محاكاة هندسي شامل متكامل في جيبك
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                صُمم خصيصاً لطلاب ومهندسي الميكاترونكس بالجامعات اليمنية (صنعاء، عدن، تعز، ذمار، العلوم والتكنولوجيا، إب، حضرموت) لتجربة محاكاة الدوائر الإلكترونية الواقعية، أنظمة التحكم PID، الذراع الروبوتي 3D، النيوماتيك، والـ PLC بكل دقة واحترافية.
              </p>
            </div>

            {/* Mechatronics Matrix (6 Cards) */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <FeatureCard icon={<Zap className="w-5 h-5 text-[#00d2ff]" />} title="دوائر واقعية" sub="Realistic SPICE Lab" />
              <FeatureCard icon={<Bot className="w-5 h-5 text-[#f59e0b]" />} title="ذراع روبوتي 3D" sub="Robotics Manipulator" />
              <FeatureCard icon={<Activity className="w-5 h-5 text-[#00d2ff]" />} title="تحكم وموالفة PID" sub="Control Systems" />
              <FeatureCard icon={<Cpu className="w-5 h-5 text-[#f59e0b]" />} title="PLC & سلمي" sub="Ladder Logic Sim" />
              <FeatureCard icon={<Layers className="w-5 h-5 text-[#00d2ff]" />} title="أنظمة كهرونيوماتيك" sub="Pneumatics Sim" />
              <FeatureCard icon={<GraduationCap className="w-5 h-5 text-[#f59e0b]" />} title="منهاج الجامعات" sub="سنة 1 إلى 5" />
            </div>

            {/* Desktop WhatsApp Contact Banner */}
            <WhatsAppContactBanner />

          </div>

          {/* Right Column: Auth Card */}
          <div className="lg:col-span-6">
            <AuthCard
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              trialStatus={trialStatus}
              onStartTrial={onStartTrial}
              onGuestAccess={onGuestAccess}
              loginPhone={loginPhone}
              setLoginPhone={setLoginPhone}
              loginPassword={loginPassword}
              setLoginPassword={setLoginPassword}
              handleLoginSubmit={handleLoginSubmit}
              isSubmittingLogin={isSubmittingLogin}
              loginFeedback={loginFeedback}
              actName={actName}
              setActName={setActName}
              actPhone={actPhone}
              setActPhone={setActPhone}
              actPassword={actPassword}
              setActPassword={setActPassword}
              actCode={actCode}
              setActCode={setActCode}
              actUniv={actUniv}
              setActUniv={setActUniv}
              handleActivateSubmit={handleActivateSubmit}
              isSubmittingAct={isSubmittingAct}
              actFeedback={actFeedback}
            />
          </div>

        </div>

      </main>

      {/* Floating WhatsApp Quick Action Button */}
      <a
        href="https://wa.me/967785500075"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 flex items-center gap-2 px-3.5 py-3 sm:px-4 sm:py-3 bg-[#25D366] hover:bg-[#20ba59] text-[#040915] rounded-full shadow-2xl shadow-[#25D366]/50 transition-all hover:scale-105 active:scale-95 group font-sans border-2 border-white/40"
        title="تواصل مباشر عبر الواتساب: 785500075"
      >
        <div className="relative flex items-center justify-center">
          <WhatsAppIcon className="w-6 h-6 text-[#040915]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
        </div>
        <div className="hidden sm:flex flex-col text-right leading-tight">
          <span className="text-[10px] font-bold text-[#040915]/90">واتساب مباشر</span>
          <span className="text-xs font-black font-mono tracking-wider text-[#040915]" dir="ltr">785500075</span>
        </div>
      </a>

      {/* Footer */}
      <footer className="py-4 px-4 text-center text-xs text-slate-400 border-t border-slate-900 z-10 bg-[#060c1d]/80">
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

// ========================================================
// Reusable Auth Card Component
// ========================================================
interface AuthCardProps {
  activeTab: 'login' | 'activate';
  setActiveTab: (tab: 'login' | 'activate') => void;
  trialStatus: { isStarted: boolean; isExpired: boolean; remainingSeconds: number; expiresAtFormatted?: string };
  onStartTrial?: () => void;
  onGuestAccess: () => void;
  loginPhone: string;
  setLoginPhone: (v: string) => void;
  loginPassword: string;
  setLoginPassword: (v: string) => void;
  handleLoginSubmit: (e: React.FormEvent) => void;
  isSubmittingLogin: boolean;
  loginFeedback: { success: boolean; msg: string } | null;
  actName: string;
  setActName: (v: string) => void;
  actPhone: string;
  setActPhone: (v: string) => void;
  actPassword: string;
  setActPassword: (v: string) => void;
  actCode: string;
  setActCode: (v: string) => void;
  actUniv: string;
  setActUniv: (v: string) => void;
  handleActivateSubmit: (e: React.FormEvent) => void;
  isSubmittingAct: boolean;
  actFeedback: { success: boolean; msg: string } | null;
}

const AuthCard: React.FC<AuthCardProps> = ({
  activeTab,
  setActiveTab,
  trialStatus,
  onStartTrial,
  onGuestAccess,
  loginPhone,
  setLoginPhone,
  loginPassword,
  setLoginPassword,
  handleLoginSubmit,
  isSubmittingLogin,
  loginFeedback,
  actName,
  setActName,
  actPhone,
  setActPhone,
  actPassword,
  setActPassword,
  actCode,
  setActCode,
  actUniv,
  setActUniv,
  handleActivateSubmit,
  isSubmittingAct,
  actFeedback
}) => {
  return (
    <div className="engineering-card rounded-3xl p-4 sm:p-6 relative overflow-hidden backdrop-blur-xl border border-[#00d2ff]/30 shadow-2xl">
      
      {/* Ambient Decors */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#0088ff]/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#f59e0b]/10 rounded-full blur-2xl pointer-events-none" />

      {/* 24-Hour Free Trial Banner */}
      <div className={`p-3 sm:p-3.5 rounded-2xl mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg relative overflow-hidden border ${
        trialStatus.isExpired
          ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
          : 'bg-gradient-to-r from-[#0a1a38] via-[#0e2554] to-[#0a1a38] border-[#00d2ff]/40'
      }`}>
        <div className={`absolute top-0 left-0 w-1.5 h-full ${trialStatus.isExpired ? 'bg-rose-500' : 'bg-[#f59e0b]'}`} />
        
        <div className="space-y-0.5 text-right w-full sm:w-auto">
          <div className="text-xs font-black flex items-center gap-1.5 text-white">
            <Clock className={`w-4 h-4 ${trialStatus.isExpired ? 'text-rose-400' : 'text-[#f59e0b]'}`} />
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

      {/* Switch Tabs (Login vs Activate) */}
      <div className="flex border border-[#00d2ff]/25 rounded-2xl bg-[#070e1e] p-1.5 mb-4 shadow-inner">
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
        <form onSubmit={handleLoginSubmit} className="space-y-3.5">
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

          <div className="space-y-1">
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

          <div className="space-y-1">
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
        <form onSubmit={handleActivateSubmit} className="space-y-3">
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

          <div className="grid grid-cols-2 gap-2">
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
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] shrink-0">
            <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
          </div>
          <div className="text-right min-w-0">
            <span className="text-[10px] text-slate-400 block truncate">للحصول على كود التفعيل والدعم الفني:</span>
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
  );
};

// ========================================================
// Reusable Components
// ========================================================
function FeatureCard({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="p-2.5 bg-[#0a1329]/90 border border-[#00d2ff]/25 hover:border-[#00d2ff] rounded-xl flex items-center gap-2.5 transition group">
      <div className="shrink-0 group-hover:scale-110 transition-transform">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs font-bold text-white truncate">{title}</div>
        <div className="text-[10px] text-slate-400 truncate">{sub}</div>
      </div>
    </div>
  );
}

function FeatureMiniCard({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="p-2 bg-[#0a1329]/80 border border-[#00d2ff]/20 rounded-xl flex items-center gap-2">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-[11px] font-bold text-white truncate">{title}</div>
        <div className="text-[9px] text-slate-400 truncate">{sub}</div>
      </div>
    </div>
  );
}

function WhatsAppContactBanner() {
  return (
    <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#0a1838] via-[#0b241b] to-[#0a1838] border-2 border-[#25D366]/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl relative overflow-hidden group hover:border-[#25D366] transition-all">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] shrink-0 shadow-lg shadow-[#25D366]/20 group-hover:scale-105 transition-transform">
          <WhatsAppIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#25D366]" />
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
            <span>طلب كود التفعيل والاشتراك والدعم الفني</span>
            <span className="bg-[#25D366] text-[#040915] text-[9px] px-1.5 py-0.2 rounded-full font-black">واتساب متاح</span>
          </div>
          <div className="text-xs sm:text-sm font-black text-[#25D366] font-mono tracking-wider flex items-center gap-2 mt-0.5" dir="ltr">
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
  );
}

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
