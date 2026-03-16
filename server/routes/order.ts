import { Router } from 'express';
import nodemailer from 'nodemailer';

const router = Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'isseiart2026@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

router.post('/order', async (req, res) => {
  try {
    const { name, email, address, size, comment, product, artworkTitle, imageData, imageData2 } = req.body;

    if (!name || !email || !imageData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const attachments: { filename: string; content: Buffer; contentType: string }[] = [];

    const imgBuffer = Buffer.from(imageData.split(',')[1], 'base64');
    attachments.push({ filename: 'tshirt-front.png', content: imgBuffer, contentType: 'image/png' });

    if (imageData2) {
      const imgBuffer2 = Buffer.from(imageData2.split(',')[1], 'base64');
      attachments.push({ filename: 'tshirt-back.png', content: imgBuffer2, contentType: 'image/png' });
    }

    const body = `
Tシャツ注文が届きました。

お名前: ${name}
メールアドレス: ${email}
住所: ${address || '未入力'}
プロダクト: ${product}
使用した作品: ${artworkTitle || '未選択'}
サイズ: ${size}
コメント: ${comment || 'なし'}

デザイン画像を添付しています。
    `.trim();

    await transporter.sendMail({
      from: 'isseiart2026@gmail.com',
      to: ['isseiart2026@gmail.com', 'chatnoir710@gmail.com'],
      subject: `[ATELIER ISSEI] Tシャツ注文: ${name}様`,
      text: body,
      replyTo: email,
      attachments
    });

    res.status(200).json({ message: '注文を受け付けました' });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
