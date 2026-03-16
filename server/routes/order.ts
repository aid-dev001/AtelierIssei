import { Router } from 'express';
import nodemailer from 'nodemailer';

const router = Router();

router.post('/order', async (req, res) => {
  try {
    const pass = (process.env.GMAIL_APP_PASSWORD ?? '').replace(/\s/g, '');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: 'isseiart2026@gmail.com', pass }
    });
    const { name, email, address, size, comment, product, artworkTitle, imageData, imageData2, transparentData, transparentData2 } = req.body;

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

    if (transparentData) {
      const tBuf = Buffer.from(transparentData.split(',')[1], 'base64');
      attachments.push({ filename: 'tshirt-front-transparent.png', content: tBuf, contentType: 'image/png' });
    }

    if (transparentData2) {
      const tBuf2 = Buffer.from(transparentData2.split(',')[1], 'base64');
      attachments.push({ filename: 'tshirt-back-transparent.png', content: tBuf2, contentType: 'image/png' });
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

    await transporter.sendMail({
      from: 'isseiart2026@gmail.com',
      to: email,
      subject: `[ATELIER ISSEI] ご注文を受け付けました`,
      text: `${name} 様\n\nご注文ありがとうございます。\n以下の内容で受け付けました。\n\nプロダクト: ${product}\n使用した作品: ${artworkTitle || '未選択'}\nサイズ: ${size}\n住所: ${address || '未入力'}\nコメント: ${comment || 'なし'}\n\n追ってご連絡いたします。\n\nATELIER ISSEI`,
      replyTo: 'isseiart2026@gmail.com'
    });

    res.status(200).json({ message: '注文を受け付けました' });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
