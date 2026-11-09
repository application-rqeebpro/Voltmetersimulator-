import React, { useState } from 'react';
import { FileText, Printer, X } from 'lucide-react';
import { Experiment, UniversityInfo } from '../types/mechatronics';

interface LabReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  experiment: Experiment;
  university: UniversityInfo;
}

export const LabReportModal: React.FC<LabReportModalProps> = ({
  isOpen,
  onClose,
  experiment,
  university,
}) => {
  const [studentName, setStudentName] = useState<string>('مهندس ميكاترونكس');
  const [studentId, setStudentId] = useState<string>('2024-MTR-108');
  const [labGroup, setLabGroup] = useState<string>('المجموعة A - معمل 2');
  const [notes, setNotes] = useState<string>('تم تنفيذ التجربة العملية بنجاح ومطابقة النتائج المقاسة مع المنحنى النظري بنسبة خطأ أقل من 2%.');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#040915]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0a1329] border-2 border-[#00d2ff]/40 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-100 ring-1 ring-[#f59e0b]/30">
        {/* Header */}
        <div className="p-4 bg-[#060c1d] border-b border-[#00d2ff]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0e2554] text-[#00d2ff] rounded-xl border border-[#00d2ff]/40 shadow-md">
              <FileText className="w-5 h-5 text-[#fbbf24]" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">
                تقرير التجربة المعملية الرسمية (Engineering Lab Report)
              </h3>
              <span className="text-xs text-[#00d2ff] font-mono">
                {university.nameAr} • {university.departmentAr}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-gradient-to-r from-[#0088ff] to-[#0055ea] hover:from-[#0070d6] hover:to-[#0040b0] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow shadow-[#0088ff]/30 ring-1 ring-[#00d2ff]/40"
            >
              <Printer className="w-4 h-4 text-[#fbbf24]" />
              <span>طباعة / حفظ كـ PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#0e2554] transition border border-[#00d2ff]/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Printable Document */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs bg-[#060c1d] text-slate-200 print:bg-white print:text-black">
          {/* Official University Header */}
          <div className="text-center border-b-2 border-[#00d2ff]/20 pb-4 space-y-1">
            <div className="flex justify-between items-center text-[11px] text-slate-400 print:text-gray-600">
              <span>الجمهورية اليمنية</span>
              <span className="font-bold text-[#fbbf24] print:text-blue-900">المعلم الإفتراضي لهندسة الميكاترونكس</span>
              <span>قسم هندسة الميكاترونكس</span>
            </div>
            <h2 className="text-lg font-black text-[#00d2ff] print:text-blue-900">{university.nameAr}</h2>
            <h4 className="text-xs font-semibold text-slate-300 print:text-gray-700">{university.departmentAr}</h4>
            <div className="inline-block bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30 px-3.5 py-1 rounded-full text-xs font-bold mt-2">
              تقرير معملي: {experiment.title} ({experiment.titleEn})
            </div>
          </div>

          {/* Student Info Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#0a1329] p-3.5 rounded-2xl border border-[#00d2ff]/20 print:border-gray-300">
            <div>
              <span className="text-slate-400 block mb-1">اسم الطالب:</span>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-[#060c1d] border border-[#00d2ff]/30 rounded-xl px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">الرقم الأكاديمي (ID):</span>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-[#060c1d] border border-[#00d2ff]/30 rounded-xl px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">المجموعة المعملية:</span>
              <input
                type="text"
                value={labGroup}
                onChange={(e) => setLabGroup(e.target.value)}
                className="w-full bg-[#060c1d] border border-[#00d2ff]/30 rounded-xl px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          {/* Objectives */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-100 text-xs border-r-4 border-[#00d2ff] pr-2">
              1. أهداف التجربة (Objectives):
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pr-2">
              {experiment.objectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>

          {/* Scientific Equations */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-100 text-xs border-r-4 border-[#00d2ff] pr-2">
              2. القوانين والمعادلات النظرية (Governing Equations):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {experiment.equations.map((eq, i) => (
                <div key={i} className="bg-[#0a1329] p-2.5 rounded-xl border border-[#00d2ff]/20 space-y-1">
                  <div className="font-bold text-[#00d2ff]">{eq.name}</div>
                  <div className="font-mono text-emerald-400 bg-[#060c1d] p-1.5 rounded text-center border border-slate-800">{eq.formula}</div>
                  <div className="text-[10px] text-slate-400">{eq.explanation}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Measured Data Table */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-100 text-xs border-r-4 border-[#00d2ff] pr-2">
              3. جدول القراءات والنتائج المعملية (Experimental Measurements):
            </h4>
            <table className="w-full text-center font-mono border border-[#00d2ff]/20 rounded-xl overflow-hidden">
              <thead className="bg-[#0a1329] text-[#00d2ff]">
                <tr>
                  <th className="p-2 border border-slate-800">رقم المحاولة</th>
                  <th className="p-2 border border-slate-800">الجهد المسلط (V)</th>
                  <th className="p-2 border border-slate-800">التيار المقاس (mA)</th>
                  <th className="p-2 border border-slate-800">القيمة المحسوبة</th>
                  <th className="p-2 border border-slate-800">نسبة الخطأ %</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr>
                  <td className="p-1.5 border border-slate-800">1</td>
                  <td className="p-1.5 border border-slate-800">2.0 V</td>
                  <td className="p-1.5 border border-slate-800">6.06 mA</td>
                  <td className="p-1.5 border border-slate-800">330 Ω</td>
                  <td className="p-1.5 border border-slate-800 text-emerald-400">0.8%</td>
                </tr>
                <tr>
                  <td className="p-1.5 border border-slate-800">2</td>
                  <td className="p-1.5 border border-slate-800">4.0 V</td>
                  <td className="p-1.5 border border-slate-800">12.12 mA</td>
                  <td className="p-1.5 border border-slate-800">330 Ω</td>
                  <td className="p-1.5 border border-slate-800 text-emerald-400">1.1%</td>
                </tr>
                <tr>
                  <td className="p-1.5 border border-slate-800">3</td>
                  <td className="p-1.5 border border-slate-800">6.0 V</td>
                  <td className="p-1.5 border border-slate-800">18.18 mA</td>
                  <td className="p-1.5 border border-slate-800">330 Ω</td>
                  <td className="p-1.5 border border-slate-800 text-emerald-400">0.9%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Student Discussion & Conclusion */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-100 text-xs border-r-4 border-[#00d2ff] pr-2">
              4. المناقشة والاستنتاج المعملي (Discussion & Conclusion):
            </h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-20 bg-[#0a1329] border border-[#00d2ff]/30 rounded-xl p-2.5 text-xs text-slate-200 resize-none leading-relaxed"
            />
          </div>

          {/* Academic Signature Block */}
          <div className="flex justify-between items-center pt-4 border-t border-[#00d2ff]/20 text-slate-400 text-[11px]">
            <div>
              <div>توقيع الطالب: _______________</div>
              <div>التاريخ: {new Date().toLocaleDateString('ar-YE')}</div>
            </div>
            <div className="text-left">
              <div>ختم وتوقيع مدرس المعمل: _______________</div>
              <div>الدرجة المعملية المستحقة: [ 10 / 10 ]</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
