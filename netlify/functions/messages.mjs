import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req, res) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'غير مصرح' });
    }

    switch (req.method) {
      case 'GET':
        // جلب الرسائل
        const messages = []; // TODO: استبدل باستعلام قاعدة البيانات الفعلي
        return res.status(200).json({ messages });

      case 'POST':
        // إرسال رسالة جديدة
        const { content, recipientId } = req.body;
        if (!content || !recipientId) {
          return res.status(400).json({ error: 'المحتوى ومعرف المستلم مطلوبان' });
        }
        // TODO: أضف منطق حفظ الرسالة هنا
        return res.status(201).json({ message: 'تم إرسال الرسالة بنجاح' });

      default:
        return res.status(405).json({ error: 'طريقة غير مسموح بها' });
    }
  } catch (error) {
    console.error('خطأ في messages:', error);
    return res.status(500).json({ error: 'خطأ في الخادم الداخلي' });
  }
}
