import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Initialize Google GenAI if key is present
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// AI Mechatronics Lab Assistant endpoint
app.post('/api/ai-lab-assistant', async (req: Request, res: Response) => {
  try {
    const { prompt, currentExperiment, labState, academicYear, university } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!ai) {
      // Provide an intelligent context-aware local response if API key is not yet configured
      return res.json({
        response: `[ملاحظة: يعمل المساعد بالوضع المعملي الداخلي]
أهلاً بك زميلي مهندس الميكاترونكس في ${university || 'الجامعات اليمنية'}!
بخصوص استفسارك: "${prompt}"

في تجربة ${currentExperiment?.title || 'المعمل الحالي'}:
1. تأكد دائماً من مطابقة القطبية في مصادر التغذية لتجنب تلف عناصر أشباه الموصلات.
2. عند التعامل مع المشغلات (المحركات والسيرفو)، استخدم ديود حماية Flyback Diode لتفريغ التيارات العكسية المحتثة.
3. راجع قيم المقاومات وجهد الإشارة عبر راسم الإشارة (Oscilloscope) للتأكد من عدم وجود تشويش.
يمكنك تفعيل مفتاح GEMINI_API_KEY للحصول على تحليل ذكي فوري مخصص.`
      });
    }

    const systemInstruction = `أنت البروفيسور والمشرف المعملي الذكي لقسم هندسة الميكاترونكس في الجامعات اليمنية (مثل جامعة صنعاء، عدن، تعز، ذمار، العلوم والتكنولوجيا، إب، وحضرموت).
مهمتك:
1. تقديم إرشادات معملية دقيقة، واقعية، وعلمية لطلاب الميكاترونكس من السنة الأولى حتى الخامسة.
2. مراعاة التحديات العملية والهندسية في اليمن (مثل توفير بدائل للقطع النادرة، ترشيد استهلاك الطاقة، تصميم أنظمة الطاقة الشمسية والمضخات، وتصحيح أخطاء التوصيل).
3. شرح القوانين الرياضية والفيزيائية ذات الصلة بدقة واحترافية (قوانين كيرشوف، دوائر المضخمات، تحكم PID، كينماتيكا الروبوتات، والـ PLC).
4. الرد بلغة عربية هندسية واضحة مع إيراد المصطلحات التقنية المعتمدة بالإنجليزية (مثل PWM, Flyback Diode, Kinematics, Step Response, Ladder Logic).
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
    res.json({ response: reply });
  } catch (error: any) {
    console.error('Error generating AI advice:', error);
    res.status(500).json({
      error: 'حدث خطأ أثناء معالجة استفسار المساعد الذكي.',
      details: error?.message || String(error)
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mechatronics Virtual Lab server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
