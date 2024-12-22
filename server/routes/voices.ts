import { Router } from 'express';
import { db } from '../../db';
import { voices, insertVoiceSchema } from '../../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// 全てのVoicesを取得
router.get('/voices', async (_req, res) => {
  try {
    const allVoices = await db.query.voices.findMany({
      orderBy: (voices, { desc }) => [desc(voices.createdAt)],
    });
    res.json(allVoices);
  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).json({ error: 'Failed to fetch voices' });
  }
});

// 新しいVoiceを登録
router.post('/voices', async (req, res) => {
  try {
    const result = insertVoiceSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: result.error.issues
      });
    }

    const voice = await db.insert(voices).values(result.data).returning();
    res.status(201).json(voice[0]);
  } catch (error) {
    console.error('Error creating voice:', error);
    res.status(500).json({ error: 'Failed to create voice' });
  }
});

// 特定のVoiceを削除
router.delete('/voices/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(voices).where(eq(voices.id, id));
    res.status(200).json({ message: 'Voice deleted successfully' });
  } catch (error) {
    console.error('Error deleting voice:', error);
    res.status(500).json({ error: 'Failed to delete voice' });
  }
});

export default router;
