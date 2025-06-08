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
        // جلب فيديوهات التدريب
        const videos = await sql`
          SELECT v.*, u.name as trainer_name,
                 (SELECT COUNT(*) FROM video_views WHERE video_id = v.id) as views_count
          FROM training_videos v
          LEFT JOIN users u ON v.trainer_id = u.id
          ORDER BY v.created_at DESC
        `;
        return res.status(200).json({ videos });

      case 'POST':
        // التحقق من صلاحيات المدرب
        const trainerCheck = await sql`
          SELECT role FROM users WHERE id = ${userId}
        `;

        if (!trainerCheck || trainerCheck.length === 0 || trainerCheck[0].role !== 'trainer') {
          return res.status(403).json({ error: 'غير مصرح لك بإضافة فيديوهات' });
        }

        // إضافة فيديو جديد
        const { title, description, videoUrl, category } = req.body;
        if (!title || !videoUrl) {
          return res.status(400).json({ error: 'العنوان ورابط الفيديو مطلوبان' });
        }

        const newVideo = await sql`
          INSERT INTO training_videos (trainer_id, title, description, video_url, category)
          VALUES (${userId}, ${title}, ${description}, ${videoUrl}, ${category})
          RETURNING *
        `;
        return res.status(201).json({ video: newVideo[0] });

      case 'PUT':
        // التحقق من صلاحيات المدرب
        const updateTrainerCheck = await sql`
          SELECT role FROM users WHERE id = ${userId}
        `;

        if (!updateTrainerCheck || updateTrainerCheck.length === 0 || updateTrainerCheck[0].role !== 'trainer') {
          return res.status(403).json({ error: 'غير مصرح لك بتحديث الفيديوهات' });
        }

        // تحديث فيديو
        const { videoId, newTitle, newDescription, newCategory } = req.body;
        if (!videoId) {
          return res.status(400).json({ error: 'معرف الفيديو مطلوب' });
        }

        const updatedVideo = await sql`
          UPDATE training_videos
          SET title = ${newTitle},
              description = ${newDescription},
              category = ${newCategory},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${videoId} AND trainer_id = ${userId}
          RETURNING *
        `;

        if (!updatedVideo || updatedVideo.length === 0) {
          return res.status(404).json({ error: 'الفيديو غير موجود أو غير مصرح بتعديله' });
        }

        return res.status(200).json({ video: updatedVideo[0] });

      case 'DELETE':
        // التحقق من صلاحيات المدرب
        const deleteTrainerCheck = await sql`
          SELECT role FROM users WHERE id = ${userId}
        `;

        if (!deleteTrainerCheck || deleteTrainerCheck.length === 0 || deleteTrainerCheck[0].role !== 'trainer') {
          return res.status(403).json({ error: 'غير مصرح لك بحذف الفيديوهات' });
        }

        // حذف فيديو
        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'معرف الفيديو مطلوب' });
        }

        const deletedVideo = await sql`
          DELETE FROM training_videos
          WHERE id = ${id} AND trainer_id = ${userId}
          RETURNING *
        `;

        if (!deletedVideo || deletedVideo.length === 0) {
          return res.status(404).json({ error: 'الفيديو غير موجود أو غير مصرح بحذفه' });
        }

        return res.status(200).json({ message: 'تم حذف الفيديو بنجاح' });

      default:
        return res.status(405).json({ error: 'طريقة غير مسموح بها' });
    }
  } catch (error) {
    console.error('خطأ في training-videos:', error);
    return res.status(500).json({ error: 'خطأ في الخادم الداخلي' });
  }
}
