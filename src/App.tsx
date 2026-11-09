import React, { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  EXPERIMENTS_CATALOG, 
  YEMENI_UNIVERSITIES 
} from './data/curriculumData';
import { 
  AcademicYear, 
  Experiment, 
  OscilloscopeState, 
  MultimeterState, 
  PowerSupplyState,
  UniversityInfo 
} from './types/mechatronics';

import { Oscilloscope } from './components/Oscilloscope';
import { DigitalMultimeter } from './components/DigitalMultimeter';
import { DCPowerSupply } from './components/DCPowerSupply';
import { InteractiveBreadboard } from './components/InteractiveBreadboard';
import { PIDControlLab } from './components/PIDControlLab';
import { RoboticArmLab } from './components/RoboticArmLab';
import { PLCLadderLab } from './components/PLCLadderLab';
import { PneumaticsLab } from './components/PneumaticsLab';
import { ArduinoSimulator } from './components/ArduinoSimulator';
import { ScienceCalculators } from './components/ScienceCalculators';
import { AILabAdvisorModal } from './components/AILabAdvisorModal';
import { LabReportModal } from './components/LabReportModal';
import { VoltmeterSimulator } from './components/VoltmeterSimulator';
import { CircuitWizardLab } from './components/CircuitWizardLab';

import { OwnerAdminModal } from './components/OwnerAdminModal';
import { StudentAuthModal } from './components/StudentAuthModal';
import { OwnerAuthModal } from './components/OwnerAuthModal';
import { LandingLoginPage, WhatsAppIcon } from './components/LandingLoginPage';
import { PWAInstallButton } from './components/PWAInstallButton';
import { authStorage } from './services/authStorage';

import { 
  Cpu, 
  Activity, 
  Bot, 
  FileText, 
  HelpCircle, 
  Wind, 
  Calculator, 
  Sliders, 
  Layers, 
  CheckCircle2, 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  Zap, 
  Play, 
  RotateCcw,
  Gauge,
  Compass,
  ArrowRight,
  ShieldCheck,
  User,
  LogIn,
  LogOut,
  KeyRound,
  Menu,
  X,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export default function App() {
  // Mobile Navigation Drawer Toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  // Selected University & Academic Year
  const [selectedUniv, setSelectedUniv] = useState<UniversityInfo>(YEMENI_UNIVERSITIES[0]);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | 'all'>('all');

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'curriculum' | 'circuit_wizard' | 'workbench' | 'voltmeter' | 'pid' | 'robotics' | 'plc' | 'pneumatics' | 'arduino' | 'calculators'
  >('circuit_wizard');

  // Currently Selected Experiment
  const [currentExp, setCurrentExp] = useState<Experiment>(EXPERIMENTS_CATALOG[0]);

  // Floating / Docked Lab Instruments
  const [showOscilloscope, setShowOscilloscope] = useState<boolean>(false);
  const [showMultimeter, setShowMultimeter] = useState<boolean>(false);
  const [showPowerSupply, setShowPowerSupply] = useState<boolean>(false);

  // Modals
  const [showAIAdvisor, setShowAIAdvisor] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Instruments Live States
  const [scopeState, setScopeState] = useState<OscilloscopeState>({
    enabled: true,
    timePerDiv: 5,
    voltsPerDivCH1: 2,
    voltsPerDivCH2: 2,
    yPosCH1: 0,
    yPosCH2: 0,
    ch1Enabled: true,
    ch2Enabled: true,
    run: true,
    frequencyCH1: 50,
    vppCH1: 5.0,
    frequencyCH2: 100,
    vppCH2: 2.5,
    waveCH1: 'sine',
    waveCH2: 'square'
  });

  const [dmmState, setDmmState] = useState<MultimeterState>({
    enabled: true,
    mode: 'V_DC',
    value: 5.0,
    unit: 'V',
    probeRedConnectedTo: null,
    probeBlackConnectedTo: null,
    beep: false
  });

  const [powerState, setPowerState] = useState<PowerSupplyState>({
    enabled: true,
    setVoltage: 5.0,
    setCurrentLimit: 2.0,
    measuredVoltage: 5.0,
    measuredCurrent: 0.025
  });

  const handleProbeMeasurement = useCallback((v: number, i: number, _r: number) => {
    setPowerState(prev => {
      if (Math.abs(prev.measuredCurrent - i) < 0.0001 && Math.abs(prev.measuredVoltage - v) < 0.0001) {
        return prev;
      }
      return { ...prev, measuredVoltage: v, measuredCurrent: i };
    });
  }, []);

  const [currentUser, setCurrentUser] = useState(() => authStorage.getCurrentUser());
  const [isGuestPreview, setIsGuestPreview] = useState<boolean>(false);
  const [showStudentAuthModal, setShowStudentAuthModal] = useState<boolean>(false);
  const [showOwnerAuthModal, setShowOwnerAuthModal] = useState<boolean>(false);
  const [showOwnerModal, setShowOwnerModal] = useState<boolean>(false);
  const [logoClickCount, setLogoClickCount] = useState<number>(0);

  const [trialStatus, setTrialStatus] = useState(() => authStorage.getTrialStatus());

  // Active 24-hour trial usage interval timer (User requirement: exit immediately when expired)
  React.useEffect(() => {
    if (!currentUser && (isGuestPreview || trialStatus.isStarted)) {
      const timer = setInterval(() => {
        const updated = authStorage.recordTrialUsage(1);
        setTrialStatus(updated);
        // User rule: "وبعد انتهاء الوقت يقوم بالخروج مباشرة ويتم الدخول بكود تفعيل واشتراك"
        if (updated.isExpired) {
          setIsGuestPreview(false); // Force immediate exit out of the lab
          setShowStudentAuthModal(true); // Direct activation & subscription modal
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentUser, isGuestPreview, trialStatus.isStarted]);

  const [customLessons, setCustomLessons] = useState<Experiment[]>(() => authStorage.getCustomLessons());

  // Handle logo 20-clicks trigger to reveal secret owner login
  const handleLogoClick = () => {
    const nextCount = logoClickCount + 1;
    setLogoClickCount(nextCount);
    if (nextCount >= 20) {
      setLogoClickCount(0);
      setShowOwnerAuthModal(true);
    }
  };

  // Merge custom lessons added by owner with default catalog
  const allCatalog = [...customLessons, ...EXPERIMENTS_CATALOG];
  const filteredExperiments = selectedYear === 'all' 
    ? allCatalog 
    : allCatalog.filter(e => e.year === selectedYear);

  const handleSelectExperiment = (exp: Experiment) => {
    setCurrentExp(exp);
    // Switch to corresponding interactive lab mode
    if (exp.mode === 'pid') setActiveTab('pid');
    else if (exp.mode === 'robotics') setActiveTab('robotics');
    else if (exp.mode === 'plc') setActiveTab('plc');
    else if (exp.mode === 'pneumatics') setActiveTab('pneumatics');
    else if (exp.mode === 'arduino') setActiveTab('arduino');
    else setActiveTab('circuit_wizard');
  };

  const handleCompleteExperiment = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Render Landing / Login Gateway Screen before entering the Virtual Lab if not logged in
  if (!currentUser && !isGuestPreview) {
    return (
      <>
        <LandingLoginPage
          onSuccessLogin={(user) => {
            setCurrentUser(user);
          }}
          onLogoClick20={() => {
            setShowOwnerAuthModal(true);
          }}
          onGuestAccess={() => {
            const st = authStorage.getTrialStatus();
            if (st.isExpired) {
              setShowStudentAuthModal(true);
            } else {
              if (!st.isStarted) authStorage.startTrial();
              setIsGuestPreview(true);
            }
          }}
          onStartTrial={() => {
            const st = authStorage.startTrial();
            setTrialStatus(st);
            if (st.isExpired) {
              setShowStudentAuthModal(true);
            } else {
              setIsGuestPreview(true);
            }
          }}
        />

        {/* Secret Owner 3-Factor Auth Modal */}
        <OwnerAuthModal
          isOpen={showOwnerAuthModal}
          onClose={() => setShowOwnerAuthModal(false)}
          onSuccess={(ownerUser) => {
            setCurrentUser(ownerUser);
            setShowOwnerModal(true);
          }}
        />

        {/* Owner Administration Modal */}
        <OwnerAdminModal
          isOpen={showOwnerModal}
          onClose={() => setShowOwnerModal(false)}
          onLessonAdded={(lesson) => {
            setCustomLessons(prev => [lesson, ...prev]);
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#040915] bg-blueprint-grid text-slate-100 flex flex-col font-sans selection:bg-[#0088ff] selection:text-white">
      {/* Top Engineering University Brand Bar */}
      <header className="bg-[#0a1329]/95 border-b border-[#00d2ff]/20 sticky top-0 z-40 backdrop-blur-md pt-safe shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
          {/* Logo & Platform Title */}
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer select-none group"
            title="المعلم الإفتراضي لهندسة الميكاترونكس"
          >
            <div className="relative shrink-0">
              <img 
                src="/logo.png" 
                alt="شعار المعلم الإفتراضي" 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-[#00d2ff]/40 object-contain shadow-lg shadow-[#0088ff]/30 group-hover:scale-105 group-hover:border-[#f59e0b] transition-all bg-[#040915]/60"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#f59e0b] border-2 border-[#0a1329] flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-[#040915]" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-xs sm:text-base font-black tracking-tight text-white truncate flex items-center gap-1.5">
                  <span>المعلم الإفتراضي</span>
                  <span className="text-[#f59e0b]">لهندسة الميكاترونكس</span>
                </h1>
                <span className="px-2 py-0.2 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/30 shrink-0">
                  جامعات اليمن
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate hidden sm:block font-mono">
                Virtual Mechatronics Engineering Laboratory • Yemen Edition
              </p>
            </div>
          </div>

          {/* Lab Access Status & Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Free Trial Badge Status (if trial active & not signed in as full user) */}
            {!currentUser && trialStatus.isStarted && (
              <div 
                onClick={() => {
                  if (trialStatus.isExpired) setShowStudentAuthModal(true);
                }}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border cursor-pointer transition ${
                  trialStatus.isExpired 
                    ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 hover:bg-rose-900' 
                    : 'bg-[#f59e0b]/15 border-[#f59e0b]/40 text-[#f59e0b] hover:bg-[#f59e0b]/25 shadow-sm'
                }`}
                title={trialStatus.isExpired ? 'انتهت فترة الدخول المجاني (24 ساعة)' : `ينتهي الدخول المجاني في: ${trialStatus.expiresAtFormatted || ''}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#f59e0b] animate-pulse shrink-0" />
                <span className="truncate">
                  {trialStatus.isExpired 
                    ? '⚠️ انتهت التجربة (24 ساعة)' 
                    : `⏱️ متبقي تجريبي 24س: ${formatSecondsToHM(trialStatus.remainingSeconds)}`}
                </span>
              </div>
            )}

            {/* User Account / Login Status */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-[#0e2554] border border-[#00d2ff]/30 px-3 py-1 rounded-xl text-xs shadow-sm">
                <User className="w-3.5 h-3.5 text-[#00d2ff] shrink-0" />
                <span className="font-bold text-slate-100 max-w-[110px] truncate">{currentUser.name}</span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#f59e0b]/20 text-[#f59e0b] rounded-md border border-[#f59e0b]/30">مُفعّل</span>
                <button
                  onClick={() => {
                    authStorage.setCurrentUser(null);
                    setCurrentUser(null);
                  }}
                  className="mr-1 p-1 hover:bg-[#162852] text-slate-400 hover:text-rose-400 rounded-lg transition"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowStudentAuthModal(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-[#0088ff] to-[#0055ea] hover:from-[#0077ee] hover:to-[#0044cc] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#0088ff]/30 border border-[#00d2ff]/40 transition active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 text-[#00d2ff]" />
                <span>تسجيل الدخول / تفعيل كود</span>
              </button>
            )}

            {/* Quick WhatsApp Support Link */}
            <a
              href="https://wa.me/967785500075"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] rounded-xl text-xs font-bold transition shadow-sm"
              title="تواصل مباشر عبر الواتساب: 785500075"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
              <span className="font-mono text-[11px]" dir="ltr">785500075</span>
            </a>

            {/* Desktop Actions Bar (visible on lg screens and up) */}
            <div className="hidden lg:flex items-center gap-1.5">
              {/* PWA Mobile Install Button */}
              <PWAInstallButton variant="primary" />

              {/* University Dropdown */}
              <div className="flex items-center gap-1.5 bg-[#070e1e] border border-[#00d2ff]/25 rounded-xl px-2.5 py-1.5 text-xs">
                <GraduationCap className="w-3.5 h-3.5 text-[#f59e0b]" />
                <select
                  value={selectedUniv.id}
                  onChange={(e) => {
                    const u = YEMENI_UNIVERSITIES.find(x => x.id === e.target.value);
                    if (u) setSelectedUniv(u);
                  }}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer max-w-[125px] truncate"
                >
                  {YEMENI_UNIVERSITIES.map(u => (
                    <option key={u.id} value={u.id} className="bg-[#0a1329] text-white">
                      {u.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              {/* AI Advisor Button */}
              <button
                onClick={() => setShowAIAdvisor(true)}
                className="px-2.5 py-1.5 bg-gradient-to-r from-[#0088ff] to-[#00d2ff] hover:from-[#0077ee] hover:to-[#00bbee] text-[#040915] rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-lg shadow-[#0088ff]/25"
              >
                <Bot className="w-3.5 h-3.5 animate-pulse text-[#040915]" />
                <span>المشرف (AI)</span>
              </button>

              {/* Official Lab Report Button */}
              <button
                onClick={() => setShowReportModal(true)}
                className="px-2.5 py-1.5 bg-[#f59e0b]/15 hover:bg-[#f59e0b]/25 text-[#f59e0b] border border-[#f59e0b]/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>تقرير (PDF)</span>
              </button>
            </div>

            {/* Mobile / Tablet Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#070e1e] hover:bg-[#0f1d3d] text-[#00d2ff] border border-[#00d2ff]/30 transition flex items-center justify-center"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-[#f59e0b]" /> : <Menu className="w-4 h-4 text-[#00d2ff]" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Drawer (when open on screens < lg) */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0a1329]/98 border-t border-[#00d2ff]/20 p-4 space-y-3 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* University Selector for Mobile */}
              <div className="col-span-2 bg-[#070e1e] border border-[#00d2ff]/20 rounded-xl p-2.5 flex items-center justify-between">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#f59e0b]" />
                  الجامعة:
                </span>
                <select
                  value={selectedUniv.id}
                  onChange={(e) => {
                    const u = YEMENI_UNIVERSITIES.find(x => x.id === e.target.value);
                    if (u) setSelectedUniv(u);
                  }}
                  className="bg-[#040915] text-white font-semibold rounded-lg px-2 py-1 text-xs border border-slate-800 focus:outline-none"
                >
                  {YEMENI_UNIVERSITIES.map(u => (
                    <option key={u.id} value={u.id} className="bg-[#0a1329] text-white">
                      {u.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              {/* AI Advisor Button */}
              <button
                onClick={() => {
                  setShowAIAdvisor(true);
                  setMobileMenuOpen(false);
                }}
                className="py-2.5 px-3 bg-gradient-to-r from-[#0088ff] to-[#00d2ff] text-[#040915] rounded-xl font-black flex items-center justify-center gap-1.5 transition shadow"
              >
                <Bot className="w-4 h-4 text-[#040915]" />
                <span>المشرف المعملي AI</span>
              </button>

              {/* Lab Report Button */}
              <button
                onClick={() => {
                  setShowReportModal(true);
                  setMobileMenuOpen(false);
                }}
                className="py-2.5 px-3 bg-[#f59e0b]/20 hover:bg-[#f59e0b]/30 text-[#f59e0b] border border-[#f59e0b]/40 rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
              >
                <FileText className="w-4 h-4" />
                <span>تقرير المعمل PDF</span>
              </button>

              {/* PWA Button */}
              <div className="col-span-2 pt-1">
                <PWAInstallButton variant="primary" />
              </div>
            </div>
          </div>
        )}

        {/* Academic Years (Shown for Curriculum) & Quick Instruments Bar */}
        {(activeTab === 'curriculum' || showOscilloscope || showMultimeter || showPowerSupply) && (
          <div className="border-t border-[#00d2ff]/20 bg-[#060c1d]/90 px-2 sm:px-4 backdrop-blur-md">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between py-1.5 gap-2 text-xs">
              {/* Academic Years Filter - Scrollable chips */}
              {activeTab === 'curriculum' && (
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-slate-400 font-semibold ml-1 shrink-0 text-[11px]">السنوات الهندسية:</span>
                  <button
                    onClick={() => setSelectedYear('all')}
                    className={`px-2.5 py-1 rounded-lg transition font-medium shrink-0 text-xs ${
                      selectedYear === 'all'
                        ? 'bg-gradient-to-r from-[#0088ff] to-[#0055ea] text-white font-bold ring-1 ring-[#00d2ff] shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-[#0a1329]'
                    }`}
                  >
                    الكل
                  </button>
                  {([1, 2, 3, 4, 5] as const).map(yr => (
                    <button
                      key={yr}
                      onClick={() => setSelectedYear(yr)}
                      className={`px-2 py-1 rounded-lg transition font-medium whitespace-nowrap shrink-0 text-xs ${
                        selectedYear === yr
                          ? 'bg-gradient-to-r from-[#0088ff] to-[#0055ea] text-white font-bold ring-1 ring-[#00d2ff] shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-[#0a1329]'
                      }`}
                    >
                      {yr === 1 && 'س1 تأسيس كهربائي'}
                      {yr === 2 && 'س2 دوائر وإلكترونيات'}
                      {yr === 3 && 'س3 مشغلات وحساسات'}
                      {yr === 4 && 'س4 تحكم كلاسيكي وPLC'}
                      {yr === 5 && 'س5 روبوتات ومشاريع'}
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Floating Instruments Toggle Drawer */}
              <div className="flex items-center gap-1 bg-[#0a1329] p-1 rounded-xl border border-[#00d2ff]/30 text-[11px] overflow-x-auto no-scrollbar shrink-0">
                <span className="text-[#00d2ff] px-1 font-semibold shrink-0 hidden sm:inline">أجهزة القياس:</span>
                <button
                  onClick={() => setShowOscilloscope(!showOscilloscope)}
                  className={`px-2 py-1 rounded-lg transition font-medium shrink-0 ${
                    showOscilloscope ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  الراسم (Scope)
                </button>
                <button
                  onClick={() => setShowMultimeter(!showMultimeter)}
                  className={`px-2 py-1 rounded-lg transition font-medium shrink-0 ${
                    showMultimeter ? 'bg-[#f59e0b] text-[#040915] font-black' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  الملتيميتر (DMM)
                </button>
                <button
                  onClick={() => setShowPowerSupply(!showPowerSupply)}
                  className={`px-2 py-1 rounded-lg transition font-medium shrink-0 ${
                    showPowerSupply ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  مجهز القدرة (DC)
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Lab Mode Tabs Navigation - Responsive Touch Scrollable Bar */}
      <div className="bg-[#070e1e]/90 border-b border-[#00d2ff]/20 px-2 sm:px-4 sticky top-[82px] sm:top-[90px] z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 text-xs">
          <button
            onClick={() => setActiveTab('circuit_wizard')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap font-bold ${
              activeTab === 'circuit_wizard'
                ? 'bg-gradient-to-r from-[#0088ff] to-[#0055ea] text-white shadow-lg shadow-[#0088ff]/30 ring-1 ring-[#00d2ff]'
                : 'text-[#00d2ff] hover:text-white hover:bg-[#0e2554]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#f59e0b]" />
            <span>🔬 المختبر الواقعي (Realistic Lab)</span>
            <span className="bg-[#f59e0b] text-[#040915] text-[9px] px-1.5 py-0.5 rounded-full font-black">شامل</span>
          </button>

          <button
            onClick={() => setActiveTab('curriculum')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap font-bold ${
              activeTab === 'curriculum'
                ? 'bg-gradient-to-r from-[#0088ff] to-[#0055ea] text-white shadow-md ring-1 ring-[#00d2ff]'
                : 'text-slate-300 hover:text-white hover:bg-[#0a1329]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#f59e0b]" />
            <span>فهرس التجارب المنهجية (Curriculum Catalog)</span>
          </button>

          <button
            onClick={() => setActiveTab('workbench')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap font-bold ${
              activeTab === 'workbench'
                ? 'bg-gradient-to-r from-[#0088ff] to-[#0055ea] text-white shadow-md ring-1 ring-[#00d2ff]'
                : 'text-slate-300 hover:text-white hover:bg-[#0a1329]'
            }`}
          >
            <Zap className="w-4 h-4 text-[#00d2ff]" />
            <span>لوحة التجارب والمحاكاة الحرة (Breadboard & Circuit)</span>
          </button>

          <button
            onClick={() => setActiveTab('voltmeter')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap font-bold ${
              activeTab === 'voltmeter'
                ? 'bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#040915] shadow-md font-black'
                : 'text-[#f59e0b] hover:text-[#fbbf24] hover:bg-[#0a1329]'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>محاكي الفولتميتر والقياسات (Voltmeter Lab)</span>
          </button>

          <button
            onClick={() => setActiveTab('pid')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap font-bold ${
              activeTab === 'pid'
                ? 'bg-gradient-to-r from-[#0088ff] to-[#0055ea] text-white shadow-md ring-1 ring-[#00d2ff]'
                : 'text-slate-300 hover:text-white hover:bg-[#0a1329]'
            }`}
          >
            <Sliders className="w-4 h-4 text-[#00d2ff]" />
            <span>معمل التحكم وموالفة PID (Control Systems)</span>
          </button>

          <button
            onClick={() => setActiveTab('robotics')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap font-bold ${
              activeTab === 'robotics'
                ? 'bg-gradient-to-r from-[#0088ff] to-[#0055ea] text-white shadow-md ring-1 ring-[#00d2ff]'
                : 'text-slate-300 hover:text-white hover:bg-[#0a1329]'
            }`}
          >
            <Compass className="w-4 h-4 text-[#f59e0b]" />
            <span>الذراع الروبوتي والكينماتيكا (Robotics Manipulator)</span>
          </button>

          <button
            onClick={() => setActiveTab('plc')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap font-bold ${
              activeTab === 'plc'
                ? 'bg-gradient-to-r from-[#0088ff] to-[#0055ea] text-white shadow-md ring-1 ring-[#00d2ff]'
                : 'text-slate-300 hover:text-white hover:bg-[#0a1329]'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#00d2ff]" />
            <span>التحكم الصناعي والـ PLC (Ladder Logic)</span>
          </button>

          <button
            onClick={() => setActiveTab('pneumatics')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap font-bold ${
              activeTab === 'pneumatics'
                ? 'bg-gradient-to-r from-[#0088ff] to-[#0055ea] text-white shadow-md ring-1 ring-[#00d2ff]'
                : 'text-slate-300 hover:text-white hover:bg-[#0a1329]'
            }`}
          >
            <Wind className="w-4 h-4 text-[#00d2ff]" />
            <span>الأنظمة الكهرونيوماتيكية (Electro-Pneumatics)</span>
          </button>

          <button
            onClick={() => setActiveTab('arduino')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap font-bold ${
              activeTab === 'arduino'
                ? 'bg-gradient-to-r from-[#0088ff] to-[#0055ea] text-white shadow-md ring-1 ring-[#00d2ff]'
                : 'text-slate-300 hover:text-white hover:bg-[#0a1329]'
            }`}
          >
            <Code2Icon className="w-4 h-4 text-[#00d2ff]" />
            <span>متحكم الأردوينو (Arduino Uno Lab)</span>
          </button>

          <button
            onClick={() => setActiveTab('calculators')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap font-bold ${
              activeTab === 'calculators'
                ? 'bg-gradient-to-r from-[#0088ff] to-[#0055ea] text-white shadow-md ring-1 ring-[#00d2ff]'
                : 'text-slate-300 hover:text-white hover:bg-[#0a1329]'
            }`}
          >
            <Calculator className="w-4 h-4 text-[#f59e0b]" />
            <span>حاسبات ومعادلات الميكاترونكس (Science Calculations)</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-1.5 sm:p-4 space-y-4 sm:space-y-6">
        {/* Floating/Docked Instruments Drawer if enabled */}
        {(showOscilloscope || showMultimeter || showPowerSupply) && (
          <div className="bg-[#0a1329]/95 border-2 border-[#00d2ff]/40 rounded-3xl p-4 shadow-2xl flex flex-col gap-4 backdrop-blur-md">
            <div className="flex justify-between items-center border-b border-[#00d2ff]/20 pb-2">
              <span className="font-bold text-xs text-[#00d2ff] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#f59e0b]" />
                محطة أجهزة القياس والتغذية المعملية المتصلة (Docked Laboratory Instrumentation)
              </span>
              <button
                onClick={() => {
                  setShowOscilloscope(false);
                  setShowMultimeter(false);
                  setShowPowerSupply(false);
                }}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-[#040915] border border-slate-700 transition"
              >
                إغلاق الأجهزة ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {showPowerSupply && (
                <DCPowerSupply
                  state={powerState}
                  onChange={(s) => setPowerState(prev => ({ ...prev, ...s }))}
                />
              )}

              {showMultimeter && (
                <DigitalMultimeter
                  state={dmmState}
                  onChange={(s) => setDmmState(prev => ({ ...prev, ...s }))}
                  measuredVoltage={powerState.enabled ? powerState.setVoltage : 0}
                  measuredCurrent={powerState.enabled ? powerState.measuredCurrent : 0}
                  measuredResistance={330}
                />
              )}

              {showOscilloscope && (
                <div className="lg:col-span-3">
                  <Oscilloscope
                    state={scopeState}
                    onChange={(s) => setScopeState(prev => ({ ...prev, ...s }))}
                    sourceSignal={{
                      ch1Amp: powerState.enabled ? powerState.setVoltage : 0,
                      ch1Freq: 50,
                      ch2Amp: 2.5,
                      ch2Freq: 100
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 1: Curriculum Experiments Catalog */}
        {activeTab === 'curriculum' && (
          <div className="space-y-6">
            {/* Banner */}
            <div className="bg-gradient-to-r from-[#0a1838] via-[#060e22] to-[#0d214a] border border-[#00d2ff]/30 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="space-y-2 z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/40">
                  <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
                  منهاج هندسة الميكاترونكس المعتمد في كليات الهندسة باليمن
                </div>
                <h2 className="text-xl font-black text-white">
                  معمل التجارب العملية لجميع السنوات الدراسية (السنة 1 إلى 5)
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  صُمم هذا المعمل لتمكين طلاب الميكاترونكس في كليات الهندسة باليمن ({selectedUniv.nameAr} وغيرها) من محاكاة وتطبيق الدروس العلمية والنظرية واقعياً على مدار سنوات الدراسة، من الدوائر التأسيسية حتى الروبوتات والـ PLC ومشاريع الطاقة الشمسية وحلول المياه.
                </p>
              </div>

              <div className="flex flex-col gap-2 z-10 shrink-0">
                <button
                  onClick={() => setShowAIAdvisor(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#0088ff] to-[#0055ea] hover:from-[#0070d6] hover:to-[#0040b0] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-[#0088ff]/30 ring-1 ring-[#00d2ff]/40"
                >
                  <Bot className="w-4 h-4 text-[#f59e0b]" />
                  <span>اسأل المعلم الافتراضي الذكي</span>
                </button>
              </div>
            </div>

            {/* Experiment Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExperiments.map(exp => (
                <div
                  key={exp.id}
                  className="bg-[#0a1329]/90 border border-[#00d2ff]/20 hover:border-[#00d2ff] rounded-2xl p-5 flex flex-col justify-between gap-4 transition shadow-lg hover:shadow-[#00d2ff]/10 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30">
                        {exp.levelBadge}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        مستوى: {exp.difficulty}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-100 group-hover:text-[#00d2ff] transition">
                      {exp.title}
                    </h3>
                    <div className="text-[11px] font-mono text-slate-400">
                      {exp.titleEn}
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {exp.theory}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                      <span>النمط:</span>
                      <span className="text-[#00d2ff] font-bold">{exp.mode.toUpperCase()}</span>
                    </div>

                    <button
                      onClick={() => handleSelectExperiment(exp)}
                      className="px-3.5 py-1.5 bg-[#0e2554] hover:bg-gradient-to-r hover:from-[#0088ff] hover:to-[#0055ea] text-[#00d2ff] hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow border border-[#00d2ff]/30"
                    >
                      <span>دخول وتطبيق المعمل</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Free Workbench & Breadboard */}
        {activeTab === 'workbench' && (
          <div className="space-y-4">
            {/* Active Experiment Header bar if working on a specific experiment */}
            {currentExp && (
              <div className="bg-[#0a1329] border border-[#00d2ff]/30 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[#fbbf24] font-bold text-[11px] block">{currentExp.levelBadge}</span>
                  <h3 className="text-sm font-black text-white">{currentExp.title}</h3>
                  <span className="text-slate-400 font-mono">{currentExp.titleEn}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCompleteExperiment}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-900/40"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تحقيق نتائج التجربة بنجاح</span>
                  </button>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="px-3 py-1.5 bg-gradient-to-r from-[#0088ff] to-[#0055ea] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <FileText className="w-4 h-4" />
                    <span>توليد التقرير المعملي</span>
                  </button>
                </div>
              </div>
            )}

            <InteractiveBreadboard
              supplyVoltage={powerState.setVoltage}
              isSupplyOn={powerState.enabled}
              onProbeMeasurement={handleProbeMeasurement}
            />

            {/* Experiment Step-by-Step Procedure Accordion */}
            {currentExp && (
              <div className="bg-[#0a1329] border border-[#00d2ff]/30 rounded-2xl p-5 space-y-4 text-xs">
                <h4 className="font-bold text-slate-100 text-sm border-r-4 border-[#00d2ff] pr-2">
                  خطوات العمل المعملي والتوصيل القياسي:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentExp.steps.map((st, idx) => (
                    <div key={idx} className="bg-[#060c1d] p-3 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#0088ff]/30 text-[#00d2ff] font-mono font-bold flex items-center justify-center shrink-0 text-[11px] border border-[#00d2ff]/40">
                        {idx + 1}
                      </span>
                      <p className="text-slate-300 leading-relaxed">{st}</p>
                    </div>
                  ))}
                </div>

                {/* Theoretical Equations */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="font-bold text-[#fbbf24] block mb-2">القوانين الرياضية الحاكمة:</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {currentExp.equations.map((eq, i) => (
                      <div key={i} className="bg-[#060c1d] p-2.5 rounded-xl border border-[#00d2ff]/20 text-center space-y-1">
                        <span className="text-[11px] text-[#00d2ff] font-bold block">{eq.name}</span>
                        <code className="text-xs font-mono text-emerald-400 block bg-[#040915] p-1 rounded border border-slate-800">{eq.formula}</code>
                        <span className="text-[10px] text-slate-400 block">{eq.explanation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Full Circuit Wizard Laboratory */}
        {activeTab === 'circuit_wizard' && <CircuitWizardLab />}

        {/* Tab: Dedicated Voltmeter & Multimeter Laboratory */}
        {activeTab === 'voltmeter' && <VoltmeterSimulator />}

        {/* Tab: PID Control Systems Lab */}
        {activeTab === 'pid' && <PIDControlLab />}

        {/* Tab 4: Robotics Manipulator Lab */}
        {activeTab === 'robotics' && <RoboticArmLab />}

        {/* Tab 5: Industrial PLC Ladder Lab */}
        {activeTab === 'plc' && <PLCLadderLab />}

        {/* Tab 6: Electro-Pneumatics Lab */}
        {activeTab === 'pneumatics' && <PneumaticsLab />}

        {/* Tab 7: Arduino Uno Microcontroller Lab */}
        {activeTab === 'arduino' && <ArduinoSimulator />}

        {/* Tab 8: Science Engineering Calculations Suite */}
        {activeTab === 'calculators' && <ScienceCalculators />}
      </main>

      {/* AI Lab Advisor Modal */}
      <AILabAdvisorModal
        isOpen={showAIAdvisor}
        onClose={() => setShowAIAdvisor(false)}
        currentExperiment={currentExp}
        universityName={selectedUniv.nameAr}
        academicYear={currentExp ? currentExp.year : 1}
      />

      {/* Official Lab Report Modal */}
      {currentExp && (
        <LabReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          experiment={currentExp}
          university={selectedUniv}
        />
      )}

      {/* Student Login & Account Activation Modal */}
      <StudentAuthModal
        isOpen={showStudentAuthModal}
        onClose={() => setShowStudentAuthModal(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Secret Owner 3-Factor Auth Modal (Revealed by 20 clicks on logo) */}
      <OwnerAuthModal
        isOpen={showOwnerAuthModal}
        onClose={() => setShowOwnerAuthModal(false)}
        onSuccess={(ownerUser) => {
          setCurrentUser(ownerUser);
          setShowOwnerModal(true);
        }}
      />

      {/* Owner Administration Modal */}
      <OwnerAdminModal
        isOpen={showOwnerModal}
        onClose={() => setShowOwnerModal(false)}
        onLessonAdded={(lesson) => {
          setCustomLessons(prev => [lesson, ...prev]);
        }}
      />

      {/* Trial Expired Overlay Modal */}
      {!currentUser && trialStatus.isStarted && trialStatus.isExpired && (
        <div className="fixed inset-0 z-50 bg-[#040915]/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0a1329] border-2 border-[#f59e0b]/60 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 text-slate-100 ring-1 ring-[#00d2ff]/30">
            <div className="w-16 h-16 bg-[#f59e0b]/20 border border-[#f59e0b]/40 rounded-2xl flex items-center justify-center mx-auto text-[#fbbf24] shadow-lg shadow-[#f59e0b]/20">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">
                انتهت فترة الدخول المجاني (24 ساعة كاملة)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                انتهت الـ 24 ساعة المحددة للدخول المجاني من بداية استخدامك للمختبر الافتراضي لهندسة الميكاترونكس.
                {trialStatus.expiresAtFormatted && (
                  <span className="block mt-1 text-[#fbbf24] font-semibold">
                    انتهت الصلاحية في: {trialStatus.expiresAtFormatted}
                  </span>
                )}
                للمتابعة والاستمرار في استخدام معامل المنهاج، يتطلب الدخول بكود تفعيل واشتراك.
              </p>
            </div>

            <div className="bg-[#060c1d] p-3.5 rounded-2xl border border-[#00d2ff]/30 text-right text-xs space-y-1.5">
              <div className="font-bold text-[#fbbf24] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00d2ff] shrink-0" />
                <span>كيفية الاستمرار والتفعيل الفوري؟</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                يرجى التواصل مع إدارة المنصة للحصول على كود التفعيل عبر الواتساب/الهاتف: <strong className="text-[#00d2ff] text-xs font-mono font-bold">785500075</strong>
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => setShowStudentAuthModal(true)}
                className="w-full py-3 bg-gradient-to-r from-[#0088ff] to-[#0055ea] hover:from-[#0070d6] hover:to-[#0040b0] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#0088ff]/30 transition active:scale-95 flex items-center justify-center gap-2 ring-1 ring-[#00d2ff]"
              >
                <KeyRound className="w-4 h-4 text-[#fbbf24]" />
                <span>إدخال كود التفعيل والاشتراك الآن</span>
              </button>

              <button
                onClick={() => {
                  setIsGuestPreview(false);
                }}
                className="w-full py-2 bg-[#0e2554] hover:bg-[#153472] text-slate-300 hover:text-white font-medium text-xs rounded-xl transition border border-[#00d2ff]/20"
              >
                الخروج لصفحة الدخول الرئيسية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#0a1329] border-t border-[#00d2ff]/20 mt-12 py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 justify-center">
            <img src="/logo.png" alt="الشعار" className="w-6 h-6 object-contain" />
            <span className="text-slate-300 font-semibold">
              المعلم الإفتراضي لهندسة الميكاترونكس • منصة المحاكاة الأولى لمهندسي الميكاترونكس في اليمن
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-mono text-xs justify-center">
            <span>التواصل وواتساب التفعيل:</span>
            <a
              href="https://wa.me/967785500075"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] font-bold hover:underline flex items-center gap-1.5 bg-[#061814] px-2.5 py-1 rounded-lg border border-[#25D366]/30"
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
}

function formatSecondsToHM(totalSec: number): string {
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours > 0) {
    return `${hours} ساعة و ${minutes} دقيقة`;
  }
  if (minutes > 0) {
    return `${minutes} دقيقة و ${seconds} ثانية`;
  }
  return `${seconds} ثانية`;
}

function Code2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
