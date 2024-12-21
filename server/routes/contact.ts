import { Router } from 'express';
import nodemailer from 'nodemailer';
import { insertContactSchema, contacts } from '../../db/schema';
import { db } from '../../db';

const router = Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'isseiart2018@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD // Gmailのアプリパスワードを使用
  }
});

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

    // データベースに保存
    await db.insert(contacts).values({
      name,
      email,
      message
    });

    // メール送信
    const mailOptions = {
      from: email,
      to: 'isseiart2018@gmail.com',
      subject: `[ATELIER ISSEI] お問い合わせ: ${name}様より`,
      text: `
お名前: ${name}
メールアドレス: ${email}

お問い合わせ内容:
${message}
      `,
      replyTo: email
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'お問い合わせを受け付けました' });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
