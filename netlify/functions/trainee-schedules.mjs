import { getAuth } from '@clerk/nextjs/server';
import sql from './utils/db.mjs';

export default async function handler(req, res) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'غير مصرح' });
    }

    switch (req.method) {
      case 'GET':
        // جلب جداول المتدربين
        const schedules = await sql`
          SELECT s.*, u.name as trainer_name
          FROM schedules s
          LEFT JOIN users u ON s.trainer_id = u.id
          WHERE s.trainee_id = ${userId}
          ORDER BY s.date, s.time
        `;
        return res.status(200).json({ schedules });

      case 'POST':
        // إضافة جدول جديد
        const { date, time, activity, notes } = req.body;
        if (!date || !time || !activity) {
          return res.status(400).json({ error: 'التاريخ والوقت والنشاط مطلوبة' });
        }

        const newSchedule = await sql`
          INSERT INTO schedules (trainee_id, date, time, activity, notes)
          VALUES (${userId}, ${date}, ${time}, ${activity}, ${notes})
          RETURNING *
        `;
        return res.status(201).json({ schedule: newSchedule[0] });

      case 'PUT':
        // تحديث جدول
        const { scheduleId, newDate, newTime, newActivity, newNotes } = req.body;
        if (!scheduleId) {
          return res.status(400).json({ error: 'معرف الجدول مطلوب' });
        }

        const updatedSchedule = await sql`
          UPDATE schedules
          SET date = ${newDate},
              time = ${newTime},
              activity = ${newActivity},
              notes = ${newNotes},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${scheduleId} AND trainee_id = ${userId}
          RETURNING *
        `;

        if (!updatedSchedule || updatedSchedule.length === 0) {
          return res.status(404).json({ error: 'الجدول غير موجود أو غير مصرح بتعديله' });
        }

        return res.status(200).json({ schedule: updatedSchedule[0] });

      case 'DELETE':
        // حذف جدول
        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'معرف الجدول مطلوب' });
        }

        const deletedSchedule = await sql`
          DELETE FROM schedules
          WHERE id = ${id} AND trainee_id = ${userId}
          RETURNING *
        `;

        if (!deletedSchedule || deletedSchedule.length === 0) {
          return res.status(404).json({ error: 'الجدول غير موجود أو غير مصرح بحذفه' });
        }

        return res.status(200).json({ message: 'تم حذف الجدول بنجاح' });

      default:
        return res.status(405).json({ error: 'طريقة غير مسموح بها' });
    }
  } catch (error) {
    console.error('خطأ في trainee-schedules:', error);
    return res.status(500).json({ error: 'خطأ في الخادم الداخلي' });
  }
}
