import { Router } from 'express';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import os from 'os';
import path from 'path';

const execAsync = promisify(exec);
const router = Router();

async function pngBase64ToCmykTiff(base64: string): Promise<Buffer> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath = path.join(os.tmpdir(), `issei-in-${id}.png`);
  const outputPath = path.join(os.tmpdir(), `issei-cmyk-${id}.tif`);
  try {
    fs.writeFileSync(inputPath, Buffer.from(base64, 'base64'));
    // Pre-compensate CMYK pink→salmon shift: B += 0.20*R pushes pinks/reds toward magenta,
    // reducing Yellow component in CMYK output and avoiding orange/salmon cast
    await execAsync(`magick "${inputPath}" -colorspace sRGB -color-matrix "1 0 0  0 1 0  0.20 0 1" -modulate 100,200,100 -colorspace CMYK -compress lzw "${outputPath}"`);
    return fs.readFileSync(outputPath);
  } finally {
    try { fs.unlinkSync(inputPath); } catch {}
    try { fs.unlinkSync(outputPath); } catch {}
  }
}

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
      const b64 = transparentData.split(',')[1];
      attachments.push({ filename: 'tshirt-front-transparent.png', content: Buffer.from(b64, 'base64'), contentType: 'image/png' });
      try {
        const cmykBuf = await pngBase64ToCmykTiff(b64);
        attachments.push({ filename: 'tshirt-front-cmyk.tif', content: cmykBuf, contentType: 'image/tiff' });
      } catch (e) {
        console.error('CMYK front convert error:', e);
      }
    }

    if (transparentData2) {
      const b64 = transparentData2.split(',')[1];
      attachments.push({ filename: 'tshirt-back-transparent.png', content: Buffer.from(b64, 'base64'), contentType: 'image/png' });
      try {
        const cmykBuf2 = await pngBase64ToCmykTiff(b64);
        attachments.push({ filename: 'tshirt-back-cmyk.tif', content: cmykBuf2, contentType: 'image/tiff' });
      } catch (e) {
        console.error('CMYK back convert error:', e);
      }
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

router.post('/cmyk-preview', async (req, res) => {
  const { imageData } = req.body as { imageData?: string };
  if (!imageData) return res.status(400).json({ error: 'No image data' });

  const inputPath = path.join(os.tmpdir(), `issei-prev-in-${Date.now()}.png`);
  const outputPath = path.join(os.tmpdir(), `issei-prev-out-${Date.now()}.png`);

  try {
    const base64 = imageData.split(',')[1] ?? imageData;
    fs.writeFileSync(inputPath, Buffer.from(base64, 'base64'));
    // Same conversion as the download CMYK TIFF, but output sRGB PNG for browser display
    await execAsync(`magick "${inputPath}" -colorspace sRGB -color-matrix "1 0 0  0 1 0  0.20 0 1" -modulate 100,200,100 -colorspace CMYK -colorspace sRGB "${outputPath}"`);
    const pngBuf = fs.readFileSync(outputPath);
    res.set('Content-Type', 'image/png');
    res.send(pngBuf);
  } catch (err) {
    console.error('CMYK preview error:', err);
    res.status(500).json({ error: 'CMYK preview failed' });
  } finally {
    try { fs.unlinkSync(inputPath); } catch {}
    try { fs.unlinkSync(outputPath); } catch {}
  }
});

router.post('/convert-cmyk', async (req, res) => {
  const { imageData } = req.body as { imageData?: string };
  if (!imageData) return res.status(400).json({ error: 'No image data' });

  const inputPath = path.join(os.tmpdir(), `issei-in-${Date.now()}.png`);
  const outputPath = path.join(os.tmpdir(), `issei-cmyk-${Date.now()}.tif`);

  try {
    const base64 = imageData.split(',')[1] ?? imageData;
    fs.writeFileSync(inputPath, Buffer.from(base64, 'base64'));
    // Pre-compensate CMYK pink→salmon shift (same as pngBase64ToCmykTiff helper above)
    await execAsync(`magick "${inputPath}" -colorspace sRGB -color-matrix "1 0 0  0 1 0  0.20 0 1" -modulate 100,200,100 -colorspace CMYK -compress lzw "${outputPath}"`);
    const tifBuf = fs.readFileSync(outputPath);
    res.set('Content-Type', 'image/tiff');
    res.set('Content-Disposition', 'attachment; filename="issei-print-cmyk.tif"');
    res.send(tifBuf);
  } catch (err) {
    console.error('CMYK convert error:', err);
    res.status(500).json({ error: 'CMYK conversion failed' });
  } finally {
    try { fs.unlinkSync(inputPath); } catch {}
    try { fs.unlinkSync(outputPath); } catch {}
  }
});

export default router;
