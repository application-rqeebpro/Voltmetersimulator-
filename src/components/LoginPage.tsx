import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Phone, 
  User, 
  GraduationCap, 
  ExternalLink, 
  MessageCircle, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Sparkles,
  ArrowRight,
  LogIn,
  UserPlus,
  HelpCircle,
  Eye,
  EyeOff,
  Database,
  Loader2
} from 'lucide-react';
import { authStorage, NeonDbStatus } from '../services/authStorage';
import { StudentUser, AcademicYear } from '../types/mechatronics';
import { PWAInstallButton } from './PWAInstallButton';

interface LoginPageProps {
  onLoginSuccess: (user: StudentUser) => void;
  onOpenOwnerModal: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onOpenOwnerModal,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [neonStatus, setNeonStatus] = useState<NeonDbStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    authStorage.checkDatabaseStatus()
      .then((status) => setNeonStatus(status))
      .catch(() => {});
  }, []);

  // Login form
  const [loginPhone, setLoginPhone] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Registration form
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regAcademicYear, setRegAcademicYear] = useState<AcademicYear>(1);
  const [regUniversity, setRegUniversity] = useState<string>('جامعة العلوم والتكنولوجيا');
  const [otherUniversityName, setOtherUniversityName] = useState<string>('');
  const [isAcademySubscriber, setIsAcademySubscriber] = useState<boolean | null>(null);
  const [regError, setRegError] = useState<string | null>(null);

  // Unactivated User Notice Modal
  const [pendingActivationUser, setPendingActivationUser] = useState<StudentUser | null>(null);

  // Owner Secret Gateway Prompt Modal
  const [showOwnerSecretPrompt, setShowOwnerSecretPrompt] = useState<boolean>(false);
  const [ownerPasswordInput, setOwnerPasswordInput] = useState<string>('');
  const [showOwnerPassInput, setShowOwnerPassInput] = useState<boolean>(false);
  const [ownerPassError, setOwnerPassError] = useState<string | null>(null);

  // Handle Student Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginPhone.trim() || !loginPassword.trim()) {
      setLoginError('يرجى إدخال رقم الهاتف وكلمة السر');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authStorage.loginUserAsync(loginPhone, loginPassword);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else if (res.notActivated && res.user) {
        setPendingActivationUser(res.user);
      } else {
        setLoginError(res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Student Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regPhone.trim() || !regPassword.trim()) {
      setRegError('يرجى ملء جميع الحقول: الاسم، رقم الهاتف، وكلمة السر');
      return;
    }

    if (isAcademySubscriber === null) {
      setRegError('يرجى الإجابة عما إذا كنت مشتركاً في منصة أكاديمية الميكاترونكس اليمنية');
      return;
    }

    const selectedUnivName = regUniversity === 'جامعة اخرى' ? (otherUniversityName.trim() || 'جامعة أخرى') : regUniversity;

    setIsSubmitting(true);
    try {
      const res = await authStorage.registerUserAsync({
        name: regName,
        phone: regPhone,
        password: regPassword,
        university: selectedUnivName,
        academicYear: regAcademicYear,
        isAcademySubscriber: isAcademySubscriber
      });

      if (res.success && res.user) {
        setPendingActivationUser(res.user);
      } else {
        setRegError(res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Owner Secret Gateway Login
  const handleOwnerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOwnerPassError(null);

    const res = authStorage.loginOwner(ownerPasswordInput);
    if (res.success && res.user) {
      setShowOwnerSecretPrompt(false);
      setOwnerPasswordInput('');
      onLoginSuccess(res.user);
      onOpenOwnerModal();
    } else {
      setOwnerPassError('كلمة المرور غير صحيحة');
    }
  };

  // WhatsApp link generator to Owner (785502919)
  const getOwnerWhatsAppLink = (user?: StudentUser | null) => {
    const name = user ? user.name : regName || 'طالب ميكاترونكس';
    const univ = user ? user.university : regUniversity;
    const phone = user ? user.phone : regPhone;
    const yr = user ? user.academicYear || 1 : regAcademicYear;
    const yrName = yr === 1 ? 'الأولى' : yr === 2 ? 'الثانية' : yr === 3 ? 'الثالثة' : yr === 4 ? 'الرابعة' : 'الخامسة';
    const text = encodeURIComponent(
      `السلام عليكم ورحمة الله، أنا الطالب المهندس: ${name}\nالجامعة: ${univ}\nالسنة الدراسية: السنة ${yrName}\nرقم الهاتف المسجل: ${phone}\nأرغب بتفعيل حسابي للاستفادة من المعمل الافتراضي الخاص بالسنة ${yrName}.`
    );
    return `https://wa.me/967785502919?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none">
      {/* Background Tech Mesh Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner with PWA Install and Owner Secret Gateway Button */}
      <div className="w-full max-w-md flex justify-between items-center mb-4 z-10 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-300">أكاديمية الميكاترونكس</span>
        </div>

        <div className="flex items-center gap-2">
          {/* PWA Mobile Install Button */}
          <PWAInstallButton compact={true} variant="secondary" />

          {/* OWNER SECRET ICON & GATEWAY (Strict password protected, no hint) */}
          <button
            onClick={() => {
              setOwnerPasswordInput('');
              setOwnerPassError(null);
              setShowOwnerPassInput(false);
              setShowOwnerSecretPrompt(true);
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-500/40 text-slate-400 hover:text-amber-400 transition shadow-lg flex items-center gap-1.5 text-xs font-bold"
            title="بوابة المالك والتحكم بالإدارة"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">أيقونة المالك</span>
          </button>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl z-10 space-y-5">
        {/* Title & Branding */}
        <div className="text-center space-y-1.5 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-purple-900/40 text-white">
            <Cpu className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-white tracking-tight">
            المعمل الافتراضي لمهندسي الميكاترونكس
          </h2>
          <p className="text-xs text-slate-400">
            لا يمكن استخدام المختبر وأدوات المحاكاة إلا بعد تسجيل الدخول
          </p>
        </div>

        {/* Mode Selector Tabs (Login / Register) */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => {
              setMode('login');
              setLoginError(null);
            }}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>تسجيل الدخول</span>
          </button>

          <button
            onClick={() => {
              setMode('register');
              setRegError(null);
            }}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>إنشاء حساب جديد</span>
          </button>
        </div>

        {/* 1. STUDENT LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-medium">رقم الهاتف:</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                <input
                  type="tel"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="مثال: 771234567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2.5 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">كلمة السر:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="أدخل كلمة السر الخاصة بك"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-10 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>دخول إلى المعمل الافتراضي</span>
            </button>
          </form>
        )}

        {/* 2. STUDENT REGISTRATION FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-medium">اسم الطالب رباعي:</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="أدخل اسمك الكامل"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">رقم الهاتف (الواتساب):</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="مثال: 771234567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">كلمة السر:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="اختر كلمة سر لحسابك"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-10 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* University Selection */}
            <div>
              <label className="text-slate-300 block mb-1 font-medium">اختيار اسم الجامعة:</label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                <select
                  value={regUniversity}
                  onChange={(e) => setRegUniversity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="جامعة العلوم والتكنولوجيا">جامعة العلوم والتكنولوجيا</option>
                  <option value="جامعة صنعاء">جامعة صنعاء</option>
                  <option value="الجامعة الاماراتيه الدوليه">الجامعة الاماراتيه الدوليه</option>
                  <option value="جامعة الرشيد">جامعة الرشيد</option>
                  <option value="جامعة اخرى">جامعة اخرى</option>
                </select>
              </div>

              {regUniversity === 'جامعة اخرى' && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={otherUniversityName}
                    onChange={(e) => setOtherUniversityName(e.target.value)}
                    placeholder="اكتب اسم جامعتك هنا..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              )}
            </div>

            {/* Academic Year Selection */}
            <div>
              <label className="text-slate-300 block mb-1 font-medium">
                اختيار السنة الدراسية (المعمل المخصص لسنتك):
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { year: 1, label: 'الأولى' },
                  { year: 2, label: 'الثانية' },
                  { year: 3, label: 'الثالثة' },
                  { year: 4, label: 'الرابعة' },
                  { year: 5, label: 'الخامسة' },
                ].map((y) => (
                  <button
                    key={y.year}
                    type="button"
                    onClick={() => setRegAcademicYear(y.year as AcademicYear)}
                    className={`py-2 px-1 rounded-xl text-center font-bold text-xs transition border ${
                      regAcademicYear === y.year
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-950/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <span className="block text-[10px] text-slate-400">سنة</span>
                    <span className="text-xs font-black">{y.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-1.5 px-2.5 py-1.5 bg-purple-950/30 border border-purple-900/40 rounded-xl text-[10px] text-purple-300">
                {regAcademicYear === 1 && '🔹 السنة الأولى: معمل الدوائر الكهربائية، قانون أوم، كيرشوف، وتوصيل الأسلاك والمنافذ.'}
                {regAcademicYear === 2 && '🔹 السنة الثانية: معمل الإلكترونيات، الترانزستور، والمضخمات العملياتية والمنطق الرقمي.'}
                {regAcademicYear === 3 && '🔹 السنة الثالثة: معمل الميكروكنترولر، الأردوينو، النيوماتيك، والحساسات والمشغلات.'}
                {regAcademicYear === 4 && '🔹 السنة الرابعة: معمل أنظمة التحكم PID، الذراع الروبوتي، وبرمجة PLC Ladder الصناعية.'}
                {regAcademicYear === 5 && '🔹 السنة الخامسة: معمل الأتمتة المتقدمة، مشاريع التخرج، ومحاكاة الأنظمة المتكاملة.'}
              </div>
            </div>

            {/* Academy Subscription Question */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <label className="font-bold text-slate-200 block text-[11px]">
                هل أنت مشترك في منصة أكاديمية الميكاترونكس اليمنية؟
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsAcademySubscriber(true)}
                  className={`py-2 px-3 rounded-xl border font-bold transition flex items-center justify-center gap-1.5 ${
                    isAcademySubscriber === true
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>نعم أنا مشترك</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAcademySubscriber(false)}
                  className={`py-2 px-3 rounded-xl border font-bold transition flex items-center justify-center gap-1.5 ${
                    isAcademySubscriber === false
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                      : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span>لا لست مشتركاً</span>
                </button>
              </div>

              {/* Notice if 'NO': MUST SUBSCRIBE at engaseel.online */}
              {isAcademySubscriber === false && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2 text-amber-300 text-[11px] animate-fadeIn">
                  <div className="flex items-start gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <span>تنبيه: يلزم الاشتراك أولاً في المنصة لاستخدام المعمل</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    يمكنك الآن الاشتراك في المنصة عبر الرابط الرسمي أدناه، ثم إرسال طلب التفعيل إلى المالك:
                  </p>
                  <a
                    href="https://engaseel.online"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs shadow transition"
                  >
                    <span>الدخول للاشتراك عبر engaseel.online</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{regError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>إتمام إنشاء الحساب وإرسال الطلب</span>
            </button>
          </form>
        )}

        {/* Direct Contact to Owner Line */}
        <div className="text-center pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
          <span>لطلب تفعيل الاشتراك أو الاستفسار تواصل مع المالك مباشرة: </span>
          <a
            href="tel:785502919"
            className="text-amber-400 font-mono font-bold hover:underline"
          >
            785502919
          </a>
        </div>
      </div>

      {/* MODAL: PENDING ACTIVATION NOTICE (FOR STUDENT) */}
      {pendingActivationUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl w-full max-w-md p-6 shadow-2xl text-slate-100 space-y-5 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-black text-lg text-white">
                تم تسجيل بياناتك بنجاح!
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                أهلاً بك يا باشمهندس <strong>{pendingActivationUser.name}</strong> ({pendingActivationUser.university} - السنة {pendingActivationUser.academicYear === 1 ? 'الأولى' : pendingActivationUser.academicYear === 2 ? 'الثانية' : pendingActivationUser.academicYear === 3 ? 'الثالثة' : pendingActivationUser.academicYear === 4 ? 'الرابعة' : 'الخامسة'}). 
                حسابك الآن بانتظار تفعيل المالك لتتمكن من تشغيل المحاكاة واستخدام معمل سنتك الدراسية.
              </p>
            </div>

            {/* Quick Action Buttons to activate via Owner */}
            <div className="space-y-2.5 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
              <span className="font-bold text-slate-300 block text-[11px]">
                خطوات تفعيل حسابك فورياً:
              </span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                أرسل طلب الاشتراك والتفعيل إلى المالك مباشرة عبر الرقم <strong>785502919</strong>:
              </p>

              {/* WhatsApp Button */}
              <a
                href={getOwnerWhatsAppLink(pendingActivationUser)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/40"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال طلب التفعيل إلى المالك عبر واتساب</span>
              </a>

              {/* Platform Link */}
              <a
                href="https://engaseel.online"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 transition text-[11px]"
              >
                <span>رابط المنصة: engaseel.online</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <button
              onClick={() => {
                setPendingActivationUser(null);
                setMode('login');
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition"
            >
              العودة لشاشة تسجيل الدخول
            </button>
          </div>
        </div>
      )}

      {/* MODAL: OWNER SECRET GATEWAY PROMPT (NO HINTS) */}
      {showOwnerSecretPrompt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">دخول المالك والتحكم في الإدارة</h3>
              </div>
              <button
                onClick={() => setShowOwnerSecretPrompt(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              هذه البوابة مخصصة لمالك المنصة فقط لإدارة المشتركين وتفعيلهم وإضافة المواد والمعامل.
            </p>

            <form onSubmit={handleOwnerLoginSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">أدخل كلمة سر المالك:</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-amber-400 absolute right-3 top-3 pointer-events-none" />
                  <input
                    type={showOwnerPassInput ? "text" : "password"}
                    value={ownerPasswordInput}
                    onChange={(e) => setOwnerPasswordInput(e.target.value)}
                    placeholder="كلمة السر الخاصة بالمالك..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-10 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono tracking-wider"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOwnerPassInput(!showOwnerPassInput)}
                    className="absolute left-3 top-2.5 text-slate-500 hover:text-white transition"
                    title={showOwnerPassInput ? "إخفاء" : "إظهار كلمة السر"}
                  >
                    {showOwnerPassInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {ownerPassError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {ownerPassError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition shadow-lg shadow-amber-950/40 flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>تحقق ودخول للوحة الإدارة</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
