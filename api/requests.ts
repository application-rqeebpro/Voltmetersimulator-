import { getPool, initDatabase } from './db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const pool = getPool();
  if (!pool) {
    return res.status(200).json({
      dbConnected: false,
      message: 'قاعدة البيانات غير متصلة (DATABASE_URL غير معرف حالياً في بيئة التشغيل)'
    });
  }

  await initDatabase();

  if (req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT 
          id, phone, name, university, academic_year AS "academicYear", 
          is_academy_subscriber AS "isAcademySubscriber", status, device_info AS "deviceInfo",
          notes, created_at AS "createdAt", updated_at AS "updatedAt"
        FROM access_requests
        ORDER BY created_at DESC
        LIMIT 200;
      `);

      return res.status(200).json({
        dbConnected: true,
        requests: result.rows
      });
    } catch (error: any) {
      console.error('Error fetching access requests:', error);
      return res.status(500).json({
        dbConnected: true,
        error: error?.message || String(error)
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        phone,
        name,
        university,
        academicYear,
        isAcademySubscriber,
        deviceInfo,
        notes
      } = req.body || {};

      const cleanPhone = String(phone || '').trim();
      const cleanName = String(name || '').trim();
      const cleanUniv = String(university || 'جامعة صنعاء').trim();

      if (!cleanPhone || cleanPhone.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'يرجى إدخال رقم هاتف صالح'
        });
      }

      const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Insert or update access request
      await pool.query(`
        INSERT INTO access_requests (
          id, phone, name, university, academic_year, is_academy_subscriber, status, device_info, notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          university = EXCLUDED.university,
          academic_year = EXCLUDED.academic_year,
          is_academy_subscriber = EXCLUDED.is_academy_subscriber,
          status = 'pending',
          device_info = EXCLUDED.device_info,
          updated_at = NOW();
      `, [
        id,
        cleanPhone,
        cleanName || `طالب (${cleanPhone.slice(-4)})`,
        cleanUniv,
        academicYear || 1,
        Boolean(isAcademySubscriber),
        deviceInfo || 'الهاتف',
        notes || null
      ]);

      return res.status(200).json({
        success: true,
        dbConnected: true,
        requestId: id,
        message: 'تم حفظ طلب الاشتراك بنجاح في قاعدة بيانات Neon المشتركة وإرساله للوحة المالك.'
      });
    } catch (error: any) {
      console.error('Error creating access request:', error);
      return res.status(500).json({
        success: false,
        error: error?.message || String(error)
      });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
