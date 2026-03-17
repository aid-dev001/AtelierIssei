import { Router } from 'express';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';

const router = Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(key, { apiVersion: '2026-02-25.clover' });
}

router.get('/stripe-config', (_req, res) => {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) return res.status(500).json({ error: 'Stripe not configured' });
  res.json({ publishableKey });
});

router.post('/create-payment-intent', async (req, res) => {
  try {
    const stripe = getStripe();
    const { name, email, product } = req.body;
    const intent = await stripe.paymentIntents.create({
      amount: 55000,
      currency: 'jpy',
      metadata: { name: name ?? '', email: email ?? '', product: product ?? '' },
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (error) {
    console.error('PaymentIntent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

router.post('/order', async (req, res) => {
  try {
    const { name, email, address, size, comment, product, artworkTitle, imageData, imageData2, transparentData, transparentData2, paymentIntentId } = req.body;

    if (!name || !email || !imageData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify payment succeeded
    if (paymentIntentId) {
      try {
        const stripe = getStripe();
        const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (intent.status !== 'succeeded') {
          return res.status(402).json({ error: '支払いが完了していません' });
        }
      } catch {
        return res.status(402).json({ error: '支払いの確認に失敗しました' });
      }
    } else {
      return res.status(402).json({ error: '支払いが必要です' });
    }

    const pass = (process.env.GMAIL_APP_PASSWORD ?? '').replace(/\s/g, '');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: 'isseiart2026@gmail.com', pass }
    });

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
決済ID: ${paymentIntentId}

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
      text: `${name} 様\n\nご注文ありがとうございます。\n以下の内容で受け付けました。\n\nプロダクト: ${product}\n使用した作品: ${artworkTitle || '未選択'}\nサイズ: ${size}\n住所: ${address || '未入力'}\nコメント: ${comment || 'なし'}\n\n追って担当者よりご連絡させて頂きます。\n\nATELIER ISSEI`,
      replyTo: 'isseiart2026@gmail.com'
    });

    res.status(200).json({ message: '注文を受け付けました' });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
