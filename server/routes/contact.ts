import { Router } from 'express';
import nodemailer from 'nodemailer';
import { insertContactSchema, contacts } from '../../db/schema';
import { db } from '../../db';

const router = Router();

router.post('/contact', async (req, res) => {
  try {
    const result = insertContactSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: result.error.issues
      });
    }

    const { name, email, message } = result.data;

    await db.insert(contacts).values({ name, email, message });

    const pass = (process.env.GMAIL_APP_PASSWORD ?? '').replace(/\s/g, '');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: 'isseiart2026@gmail.com', pass }
    });

    await transporter.sendMail({
      from: 'isseiart2026@gmail.com',
      to: ['isseiart2026@gmail.com', 'chatnoir710@gmail.com'],
      subject: `[ATELIER ISSEI] お問い合わせ: ${name}様より`,
      text: `お名前: ${name}\nメールアドレス: ${email}\n\nお問い合わせ内容:\n${message}`,
      replyTo: email
    });

    res.status(200).json({ message: 'お問い合わせを受け付けました' });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
