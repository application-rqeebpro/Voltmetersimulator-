import type { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, currentExperiment, labState, academicYear, university } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!ai) {
      return res.status(200).json({
        response: `[ملاحظة: يعمل المساعد بالوضع المعملي الداخلي]
أهلاً بك زميلي مهندس الميكاترونكس في ${university || 'الجامعات اليمنية'}!
بخصوص استفسارك: "${prompt}"

في تجربة ${currentExperiment?.title || 'المعمل الحالي'}:
1. تأكد دائماً من مطابقة القطبية في مصادر التغذية لتجنب تلف عناصر أشباه الموصلات.
2. عند التعامل مع المشغلات (المحركات والسيرفو)، استخدم ديود حماية Flyback Diode لتفريغ التيارات العكسية المحتثة.
3. راجع قيم المقاومات وجهد الإشارة عبر راسم الإشارة (Oscilloscope) للتأكد من عدم وجود تشويش.
يمكنك تفعيل مفتاح GEMINI_API_KEY في إعدادات البيئة للحصول على تحليل ذكي فوري مخصص.`
      });
    }

    const systemInstruction = `أنت البروفيسور والمشرف المعملي الذكي لقسم هندسة الميكاترونكس في الجامعات اليمنية (مثل جامعة صنعاء، عدن، تعز، ذمار، العلوم والتكنولوجيا، إب، وحضرموت).
مهمتك:
1. تقديم إرشادات معملية دقيقة، واقعية، وعلمية لطلاب الميكاترونكس من السنة الأولى حتى الخامسة.
2. مراعاة التحديات العملية والهندسية في اليمن (مثل توفير بدائل للقطع النادرة، ترشيد استهلاك الطاقة، وتصحيح أخطاء التوصيل).
3. شرح القوانين الرياضية والفيزيائية ذات الصلة بدقة واحترافية.
سياق الطالب الحالي:
- الجامعة: ${university || 'الجامعات اليمنية'}
- السنة الدراسية: ${academicYear || 'جميع السنوات'}
- التجربة النشطة: ${currentExperiment ? JSON.stringify(currentExperiment) : 'المختبر الحر'}`;

    const modelResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nسؤال المهندس:\n${prompt}` }]
        }
      ]
    });

    const reply = modelResponse.text || 'عذراً، لم أستطع توليد إجابة في الوقت الحالي.';
    return res.status(200).json({ response: reply });
  } catch (error: any) {
    console.error('Error generating AI advice:', error);
    return res.status(500).json({
      error: 'حدث خطأ أثناء معالجة استفسار المساعد الذكي.',
      details: error?.message || String(error)
    });
  }
}
