import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  UserCheck, 
  UserX, 
  PlusCircle, 
  Phone, 
  Search, 
  BookOpen, 
  Cpu, 
  Check, 
  AlertCircle, 
  Layers, 
  Users, 
  GraduationCap,
  Sparkles,
  ExternalLink,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  FileCheck,
  RefreshCw,
  Smartphone,
  Globe,
  Lock
} from 'lucide-react';
import { StudentUser, Experiment, AcademicYear, LabCategory } from '../types/mechatronics';
import { authStorage, DEFAULT_OWNER_PASSWORD, MASTER_OWNER_PASSWORDS } from '../services/authStorage';

interface OwnerAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLessonAdded?: (lesson: Experiment) => void;
}

export const OwnerAdminModal: React.FC<OwnerAdminModalProps> = ({
  isOpen,
  onClose,
  onLessonAdded,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'activate' | 'add_lesson' | 'security'>('users');
  const [usersList, setUsersList] = useState<StudentUser[]>([]);
  const [phoneToActivate, setPhoneToActivate] = useState<string>('');
  const [activationFeedback, setActivationFeedback] = useState<{ success: boolean; msg: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Password management state
  const [currentOwnerPassword, setCurrentOwnerPassword] = useState<string>(DEFAULT_OWNER_PASSWORD);
  const [newOwnerPasswordInput, setNewOwnerPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ success: boolean; msg: string } | null>(null);
  const [copiedPass, setCopiedPass] = useState<boolean>(false);

  // New Lesson form state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newTitleEn, setNewTitleEn] = useState<string>('');
  const [newYear, setNewYear] = useState<AcademicYear>(3);
  const [newCategory, setNewCategory] = useState<LabCategory>('robotics');
  const [newDifficulty, setNewDifficulty] = useState<'مبتدئ' | 'متوسط' | 'متقدم'>('متوسط');
  const [newTheory, setNewTheory] = useState<string>('');
  const [newComponents, setNewComponents] = useState<string>('أردوينو Uno، محرك سيرفو، لوحة تجارب');
  const [newSteps, setNewSteps] = useState<string>('1. قم بتوصيل التغذية\n2. ركب الإشارة بالمنفذ الرقمي\n3. اختبر الحركة بالمعمل');
  const [lessonFeedback, setLessonFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUsersList(authStorage.getUsers());
      setCurrentOwnerPassword(authStorage.getOwnerPassword());
      setActivationFeedback(null);
      setLessonFeedback(null);
      setPasswordFeedback(null);
      setCopiedPass(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleActivateByPhone = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneToActivate.trim()) return;

    const res = authStorage.activateUserByPhone(phoneToActivate);
    setActivationFeedback({ success: res.success, msg: res.message });
    if (res.success) {
      setUsersList(authStorage.getUsers());
      setPhoneToActivate('');
    }
  };

  const handleToggleActivation = (userId: string) => {
    const res = authStorage.toggleUserActivation(userId);
    if (res.success) {
      setUsersList(authStorage.getUsers());
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    const res = authStorage.setOwnerPassword(newOwnerPasswordInput);
    setPasswordFeedback({ success: res.success, msg: res.message });
    if (res.success) {
      setCurrentOwnerPassword(authStorage.getOwnerPassword());
      setNewOwnerPasswordInput('');
    }
  };

  const handleResetPassword = () => {
    const res = authStorage.resetOwnerPassword();
    setCurrentOwnerPassword(res.password);
    setPasswordFeedback({ success: true, msg: `تمت استعادة كلمة المرور الافتراضية بنجاح: (${res.password})` });
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(currentOwnerPassword);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2500);
  };

  const handleExportBackup = () => {
    const jsonStr = authStorage.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mechatronics_lab_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddNewLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTheory.trim()) {
      setLessonFeedback('يرجى كتابة عنوان التجربة وشرحها النظري');
      return;
    }

    const newExperiment: Experiment = {
      id: `custom_exp_${Date.now()}`,
      title: newTitle.trim(),
      titleEn: newTitleEn.trim() || 'Custom Mechatronics Lesson',
      year: newYear,
      category: newCategory,
      levelBadge: `السنة ${newYear} - درس مضاف من الإدارة`,
      difficulty: newDifficulty,
      mode: newCategory === 'control' ? 'pid' : newCategory === 'robotics' ? 'robotics' : newCategory === 'plc' ? 'plc' : newCategory === 'pneumatics' ? 'pneumatics' : 'circuit',
      objectives: ['دراسة وتطبيق الدرس المضاف من قبل إدارة المعمل', 'التحقق العملي من المعطيات الهندسية'],
      theory: newTheory.trim(),
      equations: [
        { name: 'معادلة الدرس', formula: 'V = I \\times R', explanation: 'قانون ميكاتروني' }
      ],
      componentsNeeded: newComponents.split('،').map(c => c.trim()).filter(Boolean),
      steps: newSteps.split('\n').filter(Boolean),
      expectedResults: 'تطبيق عملي ناجح ومطابقة النتائج النظرية.'
    };

    authStorage.saveCustomLesson(newExperiment);
    if (onLessonAdded) onLessonAdded(newExperiment);

    setLessonFeedback(`تم إضافة تجربة "${newTitle}" بنجاح إلى المعمل!`);
    setNewTitle('');
    setNewTitleEn('');
    setNewTheory('');
  };

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone.includes(searchQuery) ||
    u.university.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUsers = usersList.length;
  const activatedUsers = usersList.filter(u => u.isActivated).length;
  const pendingUsers = usersList.filter(u => !u.isActivated).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-950/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white">
                  لوحة تحكم وإدارة المالك (Owner Administration Portal)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  صلاحيات الإدارة الكاملة
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                أكاديمية الميكاترونكس اليمنية • هاتف المالك: 785502919
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-slate-950/70 border-b border-slate-800 text-xs text-center font-mono">
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-sans block text-[10px]">إجمالي المسجلين</span>
            <span className="text-base font-black text-white">{totalUsers}</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-xl border border-emerald-900/40">
            <span className="text-emerald-400 font-sans block text-[10px]">المشتركون المفعلون</span>
            <span className="text-base font-black text-emerald-400">{activatedUsers}</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-xl border border-amber-900/40">
            <span className="text-amber-400 font-sans block text-[10px]">بانتظار التفعيل</span>
            <span className="text-base font-black text-amber-400">{pendingUsers}</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-xl border border-purple-900/40">
            <span className="text-purple-400 font-sans block text-[10px]">كلمة سر المالك</span>
            <span className="text-xs font-black text-purple-300 truncate font-mono">
              {showPassword ? currentOwnerPassword : '•••••••'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-slate-800 bg-slate-950 px-4 text-xs">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-3.5 font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-amber-500 text-amber-400 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>إدارة الطلاب والمشتركين ({totalUsers})</span>
          </button>

          <button
            onClick={() => setActiveTab('activate')}
            className={`py-3 px-3.5 font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'activate'
                ? 'border-amber-500 text-amber-400 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>تفعيل المشترك بالرقم</span>
          </button>

          <button
            onClick={() => setActiveTab('add_lesson')}
            className={`py-3 px-3.5 font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'add_lesson'
                ? 'border-amber-500 text-amber-400 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة درس وأدوات للمعمل</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-3.5 font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-purple-500 text-purple-400 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>كلمة سر المالك والأمان</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* TAB 1: USERS LIST & ACTIVATION TOGGLE */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="البحث بالاسم أو رقم الهاتف أو الجامعة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              {/* Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-bold">
                    <tr>
                      <th className="p-3">الطالب</th>
                      <th className="p-3">رقم الهاتف</th>
                      <th className="p-3">الجامعة</th>
                      <th className="p-3 text-center">السنة الدراسية</th>
                      <th className="p-3 text-center">أكاديمية الميكاترونكس</th>
                      <th className="p-3 text-center">حالة التفعيل</th>
                      <th className="p-3 text-center">إجراء المالك</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-500">
                          لا يوجد طلاب يطابقون البحث
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-900/50 transition">
                          <td className="p-3 font-semibold text-white">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-[10px]">
                                {u.name.charAt(0)}
                              </span>
                              <span>{u.name}</span>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-slate-300">{u.phone}</td>
                          <td className="p-3 text-slate-400">{u.university}</td>
                          <td className="p-3 text-center">
                            <select
                              value={u.academicYear || 1}
                              onChange={(e) => {
                                const newYr = Number(e.target.value) as AcademicYear;
                                authStorage.updateUserAcademicYear(u.id, newYr);
                                setUsersList(authStorage.getUsers());
                              }}
                              className="bg-slate-900 border border-slate-700 hover:border-purple-500 rounded-lg px-2 py-1 text-[11px] font-bold text-purple-300 focus:outline-none cursor-pointer"
                              title="تعديل السنة الدراسية للطالب"
                            >
                              <option value={1}>السنة الأولى</option>
                              <option value={2}>السنة الثانية</option>
                              <option value={3}>السنة الثالثة</option>
                              <option value={4}>السنة الرابعة</option>
                              <option value={5}>السنة الخامسة</option>
                            </select>
                          </td>
                          <td className="p-3 text-center">
                            {u.isAcademySubscriber ? (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                                <Check className="w-3 h-3" /> مشترك بالمنصة
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                                غير مشترك
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {u.isActivated ? (
                              <span className="inline-block text-[10px] bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">
                                مفعّل ومصرّح
                              </span>
                            ) : (
                              <span className="inline-block text-[10px] bg-amber-600/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                                معلق (بحاجة لتفعيل)
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleToggleActivation(u.id)}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 mx-auto ${
                                u.isActivated
                                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                              }`}
                            >
                              {u.isActivated ? (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>إلغاء التفعيل</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>تفعيل الآن</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVATE DIRECTLY BY PHONE */}
          {activeTab === 'activate' && (
            <div className="max-w-xl mx-auto space-y-5 bg-slate-950/60 p-6 rounded-3xl border border-slate-800">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
                  <Phone className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-base">تفعيل حساب الطالب من خلال رقم الهاتف</h4>
                <p className="text-xs text-slate-400">
                  عند وصول طلب اشتراك من الطالب إلى هاتفك (785502919)، أدخل رقمه هنا ليتم منحه الصلاحية فوراً
                </p>
              </div>

              <form onSubmit={handleActivateByPhone} className="space-y-3">
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneToActivate}
                    onChange={(e) => setPhoneToActivate(e.target.value)}
                    placeholder="مثال: 771234567 أو 734567890"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-3 text-white text-center font-mono text-base tracking-wider focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-bold transition shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>تفعيل المشترك ومنحه الدخول للمعمل</span>
                </button>
              </form>

              {activationFeedback && (
                <div
                  className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                    activationFeedback.success
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {activationFeedback.success ? (
                    <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{activationFeedback.msg}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADD NEW MECHATRONICS LESSON / MATERIALS */}
          {activeTab === 'add_lesson' && (
            <form onSubmit={handleAddNewLesson} className="space-y-4 max-w-2xl mx-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">عنوان الدرس (بالعربية):</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: تحكم سرعة محرك السيرفو مع PID"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">العنوان بالإنجليزي (Title in English):</label>
                  <input
                    type="text"
                    value={newTitleEn}
                    onChange={(e) => setNewTitleEn(e.target.value)}
                    placeholder="e.g. Servo Speed Control with PID"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">السنة الدراسية:</label>
                  <select
                    value={newYear}
                    onChange={(e) => setNewYear(parseInt(e.target.value) as AcademicYear)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={1}>السنة الأولى (التأسيس والدوائر)</option>
                    <option value={2}>السنة الثانية (الإلكترونيات والقياسات)</option>
                    <option value={3}>السنة الثالثة (الميكروكنترولر والمشغلات)</option>
                    <option value={4}>السنة الرابعة (التحكم والنيوماتيك)</option>
                    <option value={5}>السنة الخامسة (الروبوتات وتخرج)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">تصنيف المادة والمعمل:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as LabCategory)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="circuits">دوائر كهربائية (Circuits)</option>
                    <option value="electronics">إلكترونيات تماثلية وقدرة</option>
                    <option value="embedded">أنظمة مدمجة وميكروكنترولر</option>
                    <option value="control">أنظمة التحكم الآلي و PID</option>
                    <option value="robotics">روبوتات وميكانيزمات</option>
                    <option value="pneumatics">نيوماتيك وهيدروليك</option>
                    <option value="plc">تحكم صناعي و PLC</option>
                    <option value="graduation">مشاريع تخرج خاصة باليمن</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">الأدوات والمكونات المطلوبة للتجربة:</label>
                <input
                  type="text"
                  value={newComponents}
                  onChange={(e) => setNewComponents(e.target.value)}
                  placeholder="مفصولة بفواصل، مثل: أردوينو، مقاومة 10k، حساس ألتراسونيك"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">الشرح النظري والقوانين الهندسية:</label>
                <textarea
                  value={newTheory}
                  onChange={(e) => setNewTheory(e.target.value)}
                  rows={3}
                  placeholder="اكتب النظرية العلمية والمعادلات الرياضية للدرس..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">خطوات التنفيذ المعملي (كل خطوة في سطر):</label>
                <textarea
                  value={newSteps}
                  onChange={(e) => setNewSteps(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                />
              </div>

              {lessonFeedback && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{lessonFeedback}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition shadow-lg shadow-amber-950/40 flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>حفظ ونشر الدرس الجديد في المعمل</span>
              </button>
            </form>
          )}

          {/* TAB 4: OWNER PASSWORD & SECURITY SETTINGS */}
          {activeTab === 'security' && (
            <div className="max-w-2xl mx-auto space-y-5 text-xs">
              {/* Current Active Password Card */}
              <div className="bg-slate-950/80 p-5 rounded-3xl border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">كلمة سر المالك الحالية النشطة</h4>
                      <p className="text-[11px] text-slate-400">تُستخدم هذه الكلمة لتسجيل دخول المالك عبر أيقونة الدرع في شاشة الدخول</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                    نشطة حالياً
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 p-3 rounded-2xl border border-slate-800">
                  <div className="flex-1 font-mono text-base font-black text-amber-400 tracking-wider">
                    {showPassword ? currentOwnerPassword : '••••••••••••'}
                  </div>

                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title={showPassword ? 'إخفاء' : 'إظهار كلمة السر'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleCopyPassword}
                    className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 transition"
                    title="نسخ كلمة السر"
                  >
                    {copiedPass ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedPass ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
              </div>

              {/* Change Password Form */}
              <form onSubmit={handleUpdatePassword} className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-white">تغيير وتعيين كلمة سر جديدة للمالك</h4>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">أدخل كلمة السر الجديدة:</label>
                  <input
                    type="text"
                    value={newOwnerPasswordInput}
                    onChange={(e) => setNewOwnerPasswordInput(e.target.value)}
                    placeholder="اكتب كلمة السر الجديدة التي ترغب بها..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                {passwordFeedback && (
                  <div
                    className={`p-3 rounded-xl flex items-center gap-2 ${
                      passwordFeedback.success
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {passwordFeedback.success ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{passwordFeedback.msg}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition shadow-lg shadow-purple-950 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>حفظ كلمة السر الجديدة</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition flex items-center gap-1.5"
                    title="استعادة الافتراضية (785502919)"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>استعادة الافتراضية</span>
                  </button>
                </div>
              </form>

              {/* Master Recovery Passwords Info */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2 text-slate-300 leading-relaxed">
                <div className="font-bold text-amber-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>مفاتيح الأمان وكلمات السر الرئيسية للمالك (Master Recovery Keys):</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  بالإضافة لأي كلمة سر مخصصة تقوم بإنشائها، تبقى الكلمات التالية تعمل دائماً لضمان عدم إغلاق حساب المالك أبداً:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] text-center">
                  <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-amber-300 font-bold">
                    785502919
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-purple-300">
                    mechatronics2026
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-indigo-300">
                    admin785502919
                  </div>
                </div>
              </div>

              {/* Data Backup & Export */}
              <div className="flex justify-between items-center bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h5 className="font-bold text-white text-xs">تصدير وحفظ نسخة احتياطية من بيانات المعمل</h5>
                  <p className="text-[10px] text-slate-400">حفظ ملف JSON يحتوي جميع الطلاب المسجلين والدروس المضافة</p>
                </div>
                <button
                  onClick={handleExportBackup}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition"
                >
                  <FileCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>تصدير JSON</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
