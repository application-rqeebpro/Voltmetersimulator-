import React, { useState } from 'react';
import { Smartphone, X, Share2, PlusSquare, CheckCircle2, Globe, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'badge';
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'secondary',
  compact = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // If already running in standalone mode on mobile home screen, do not show button
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>مثبّت كتطبيق</span>
      </div>
    );
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  const buttonClasses =
    variant === 'primary'
      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-950/50'
      : variant === 'badge'
      ? 'bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30'
      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/60 hover:border-purple-500/50';

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition select-none ${buttonClasses} ${className}`}
        title="تثبيت المعمل كتطبيق مستقل على هاتفك المحمول"
      >
        <Smartphone className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
        <span>{compact ? 'تثبيت' : 'تثبيت في الهاتف'}</span>
      </button>

      {/* Mobile Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-slate-100 font-sans">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
            {/* Close button */}
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  تثبيت معمل الميكاترونكس على الهاتف
                </h3>
                <p className="text-xs text-slate-400">
                  يعمل كتطبيق كامل بدون شريط المتصفح ومع حفظ البيانات محلياً
                </p>
              </div>
            </div>

            {isIOS ? (
              /* iOS Safari Instructions */
              <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs">
                <div className="font-bold text-amber-400 flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  <span>خطوات التثبيت على أجهزة iPhone / iPad (Safari):</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed">
                  <li>
                    اضغط على زر <strong className="text-white">المشاركة (Share)</strong> في شريط متصفح سفاري بالأسفل.
                  </li>
                  <li>
                    مرر لأسفل واختر <strong className="text-white">إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-purple-400" />.
                  </li>
                  <li>
                    اضغط على <strong className="text-white">إضافة (Add)</strong> في أعلى الزاوية.
                  </li>
                  <li>
                    سيظهر تطبيق المعمل مباشرة على شاشة هاتفك مع أيقونة الميكاترونكس الرسمية!
                  </li>
                </ol>
              </div>
            ) : (
              /* Android Chrome / Edge Instructions */
              <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs">
                <div className="font-bold text-purple-400 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>خطوات التثبيت على أجهزة أندرويد (Android / Chrome):</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed">
                  <li>
                    إذا ظهرت رسالة التثبيت التلقائية في أسفل الشاشة، اضغط <strong className="text-white">تثبيت (Install)</strong>.
                  </li>
                  <li>
                    أو اضغط على زر القائمة <strong className="text-white">(الثلاث نقاط ⋮)</strong> في متصفح كروم.
                  </li>
                  <li>
                    اختر <strong className="text-white">تثبيت التطبيق (Install App)</strong> أو <strong className="text-white">الإضافة إلى الشاشة الرئيسية</strong>.
                  </li>
                  <li>
                    سيتم تثبيت المعمل كتطبيق مستقل يفتح بضغطة واحدة من الشاشة الرئيسية.
                  </li>
                </ol>
              </div>
            )}

            {/* Quick Action Button */}
            {isInstallable && (
              <button
                onClick={async () => {
                  await install();
                  setShowGuideModal(false);
                }}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs transition shadow-lg shadow-purple-950 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>بدء التثبيت الآن</span>
              </button>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              تم، حسناً
            </button>
          </div>
        </div>
      )}
    </>
  );
};
