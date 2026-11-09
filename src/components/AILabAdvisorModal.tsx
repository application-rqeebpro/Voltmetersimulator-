import React, { useState } from 'react';
import { Bot, Send, Sparkles, X, Loader2 } from 'lucide-react';
import { Experiment } from '../types/mechatronics';

interface AILabAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExperiment?: Experiment | null;
  universityName: string;
  academicYear: number;
}

export const AILabAdvisorModal: React.FC<AILabAdvisorModalProps> = ({
  isOpen,
  onClose,
  currentExperiment,
  universityName,
  academicYear,
}) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: `أهلاً بك يا باشمهندس في منصة المعلم الإفتراضي لهندسة الميكاترونكس! 
أنا المعلم والمشرف الذكي للمنصة لمساعدتك في كل ما يتعلق بالتوصيلات الواقعية، تحليل الدوائر، معادلات أنظمة التحكم PID، كود الأردوينو، محاكاة الروبوتات، وبرمجة الـ PLC خصيصاً لطلاب ${universityName}.
كيف يمكنني مساعدتك في تجربتك اليوم؟`
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const quickQuestions = [
    'كيف أضبط بارامترات متحكم PID عملياً بدون حدوث تجاوز خطير (Overshoot)؟',
    'ما هو بديل شريحة L298N إذا لم تتوفر في السوق المحلي باليمن؟',
    'لماذا نحتاج دايود حماية Flyback Diode عند قيادة محرك أو مرحل بترانزستور؟',
    'كيف أصمم نظام تتبع شمسي ثنائي المحور لمشاريع الطاقة في اليمن؟',
    'ما الفرق بين التلامس NO و NC في برمجة مخطط السلم PLC Ladder؟'
  ];

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg = { role: 'user' as const, text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-lab-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          currentExperiment,
          university: universityName,
          academicYear
        })
      });

      if (!res.ok) throw new Error('فشل الرد من الخادم');
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `[إجابة المعلم الافتراضي الذكي]:
بخصوص سؤالك: "${textToSend}":
1. راجع أولاً مخطط الدائرة وتأكد من مطابقة جهود التغذية وعدم وجود قصر (Short Circuit).
2. في بيئة العمل الهندسية باليمن، يمكنك دائماً استخدام الترانزستورات الشائعة مثل TIP120 أو MOSFET IRFZ44N كبدائل فعالة وعالية القدرة لقيادة المحركات.
3. تأكد من تأريض جميع الإشارات التناظرية لضمان دقة القراءات على راسم الإشارة (Oscilloscope).`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#040915]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0a1329] border-2 border-[#00d2ff]/40 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-100 ring-1 ring-[#f59e0b]/30">
        {/* Modal Header */}
        <div className="p-4 bg-[#060c1d] border-b border-[#00d2ff]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0e2554] text-[#00d2ff] border border-[#00d2ff]/40 flex items-center justify-center p-1 shadow-md">
              <img src="/logo.png" alt="الشعار" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">
                المعلم الإفتراضي الذكي لهندسة الميكاترونكس (AI Tutor)
              </h3>
              <span className="text-xs text-[#00d2ff] font-mono">
                {universityName} • {currentExperiment ? currentExperiment.title : 'استشارات معملية وهندسية شاملة'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#0e2554] transition border border-[#00d2ff]/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Questions Chips */}
        <div className="px-4 py-2.5 bg-[#060c1d]/90 border-b border-[#00d2ff]/20 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[#fbbf24] whitespace-nowrap font-bold flex items-center gap-1 shrink-0 text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            أسئلة شائعة:
          </span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 bg-[#0e2554] hover:bg-[#153472] text-slate-200 hover:text-white rounded-xl whitespace-nowrap transition text-[11px] shrink-0 border border-[#00d2ff]/20"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3.5 text-xs leading-relaxed bg-[#0a1329]">
          {messages.map((m, index) => (
            <div
              key={index}
              className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-[#0e2554] text-[#00d2ff] border border-[#00d2ff]/30 flex items-center justify-center shrink-0 p-1">
                  <Bot className="w-4 h-4 text-[#00d2ff]" />
                </div>
              )}
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-[#0088ff] to-[#0055ea] text-white rounded-br-none shadow-md ring-1 ring-[#00d2ff]/30'
                    : 'bg-[#060c1d] text-slate-100 border border-[#00d2ff]/20 rounded-bl-none shadow'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-[#00d2ff]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>المعلم الافتراضي يحلل استفسارك الهندسي...</span>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 bg-[#060c1d] border-t border-[#00d2ff]/20 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اكتب استفسارك الهندسي، فحص خطأ دائرة، أو شرح معادلة..."
            className="flex-1 bg-[#0a1329] border border-[#00d2ff]/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff] focus:ring-1 focus:ring-[#00d2ff]"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-gradient-to-r from-[#0088ff] to-[#0055ea] hover:from-[#0070d6] hover:to-[#0040b0] disabled:opacity-50 text-white rounded-xl transition shadow shadow-[#0088ff]/30 ring-1 ring-[#00d2ff]/40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
