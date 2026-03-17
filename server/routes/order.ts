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

const ICC_JAPAN = path.resolve('public/icc/JapanColor2001Coated.icc');
const TIFICC = '/nix/store/bhkrx8pzqy12v6jmil17lkl8zgcyck0l-lcms2-2.16-bin/bin/tificc';
const MAGICK = '/nix/store/5vmw6hyi0q1mk7dj0zhda515vscryr4a-imagemagick-7.1.2-7/bin/magick';

async function pngToJapanColorTiff(inputPng: string, outputTif: string): Promise<void> {
  const id = path.basename(inputPng, '.png');
  const rgbTif = path.join(os.tmpdir(), `issei-rgb-${id}.tif`);
  try {
    // Step 1: PNG → 8-bit sRGB TIFF (flatten alpha onto white, force TrueColor)
    await execAsync(`"${MAGICK}" "${inputPng}" -background white -flatten -type TrueColor -depth 8 -compress lzw "${rgbTif}"`);
    // Step 2: tificc: sRGB → Japan Color 2001 Coated CMYK
    // -t0 = Perceptual intent: proportionally maps full sRGB gamut → avoids over-inking vivid colours
    // -b  = Black Point Compensation: better shadow detail
    await execAsync(`"${TIFICC}" -i"*sRGB" -o"${ICC_JAPAN}" -t0 -b "${rgbTif}" "${outputTif}"`);
    // Step 3: Embed ICC + reduce K (black ink) by 30% → brighter, more vivid result
    await execAsync(`"${MAGICK}" "${outputTif}" -profile "${ICC_JAPAN}" -channel Black -evaluate multiply 0.70 +channel -compress lzw "${outputTif}"`);
  } finally {
    try { fs.unlinkSync(rgbTif); } catch {}
  }
}

async function pngBase64ToCmykTiff(base64: string): Promise<Buffer> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath  = path.join(os.tmpdir(), `issei-in-${id}.png`);
  const cmykPath   = path.join(os.tmpdir(), `issei-cmyk-${id}.tif`);
  const alphaPath  = path.join(os.tmpdir(), `issei-alpha-${id}.png`);
  const outputPath = path.join(os.tmpdir(), `issei-out-${id}.tif`);
  try {
    fs.writeFileSync(inputPath, Buffer.from(base64, 'base64'));
    await execAsync(`"${MAGICK}" "${inputPath}" -alpha extract "${alphaPath}"`);
    await pngToJapanColorTiff(inputPath, cmykPath);
    await execAsync(`"${MAGICK}" "${cmykPath}" -alpha on "${alphaPath}" -compose CopyOpacity -composite -compress lzw "${outputPath}"`);
    return fs.readFileSync(outputPath);
  } finally {
    for (const p of [inputPath, cmykPath, alphaPath, outputPath]) try { fs.unlinkSync(p); } catch {}
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
  // Receives the raw design canvas (no shirt background).
  // Returns the same design with CMYK-converted colors, alpha preserved.
  const { imageData } = req.body as { imageData?: string };
  if (!imageData) return res.status(400).json({ error: 'No image data' });

  const ts = Date.now();
  const inputPath    = path.join(os.tmpdir(), `issei-prev-in-${ts}.png`);
  const alphaPath    = path.join(os.tmpdir(), `issei-prev-alpha-${ts}.png`);
  const cmykTiffPath = path.join(os.tmpdir(), `issei-prev-cmyk-${ts}.tif`);
  const rgbTifPath   = path.join(os.tmpdir(), `issei-prev-rgb-${ts}.tif`);
  const rgbPath      = path.join(os.tmpdir(), `issei-prev-rgb-${ts}.png`);
  const outputPath   = path.join(os.tmpdir(), `issei-prev-out-${ts}.png`);

  try {
    fs.writeFileSync(inputPath, Buffer.from(imageData.split(',')[1] ?? imageData, 'base64'));
    // 1. Extract original alpha mask
    await execAsync(`"${MAGICK}" "${inputPath}" -alpha extract "${alphaPath}"`);
    // 2. tificc: sRGB → Japan Color 2001 Coated CMYK
    await pngToJapanColorTiff(inputPath, cmykTiffPath);
    // 3. tificc: CMYK → sRGB roundtrip via ICC (perceptual, matches forward pass)
    await execAsync(`"${TIFICC}" -i"${ICC_JAPAN}" -o"*sRGB" -t0 -b "${cmykTiffPath}" "${rgbTifPath}"`);
    await execAsync(`"${MAGICK}" "${rgbTifPath}" "${rgbPath}"`);
    // 4. Re-apply original alpha so transparent areas stay transparent
    await execAsync(`"${MAGICK}" "${rgbPath}" "${alphaPath}" -compose CopyOpacity -composite "${outputPath}"`);

    res.set('Content-Type', 'image/png');
    res.send(fs.readFileSync(outputPath));
  } catch (err) {
    console.error('CMYK preview error:', err);
    res.status(500).json({ error: 'CMYK preview failed' });
  } finally {
    for (const p of [inputPath, alphaPath, cmykTiffPath, rgbTifPath, rgbPath, outputPath]) try { fs.unlinkSync(p); } catch {}
  }
});

router.post('/convert-cmyk', async (req, res) => {
  const { imageData } = req.body as { imageData?: string };
  if (!imageData) return res.status(400).json({ error: 'No image data' });

  const ts = Date.now();
  const inputPath  = path.join(os.tmpdir(), `issei-in-${ts}.png`);
  const cmykPath   = path.join(os.tmpdir(), `issei-cmyk-${ts}.tif`);
  const alphaPath  = path.join(os.tmpdir(), `issei-alpha-${ts}.png`);
  const outputPath = path.join(os.tmpdir(), `issei-out-${ts}.tif`);

  try {
    const base64 = imageData.split(',')[1] ?? imageData;
    fs.writeFileSync(inputPath, Buffer.from(base64, 'base64'));
    // 1. Extract original alpha mask
    await execAsync(`"${MAGICK}" "${inputPath}" -alpha extract "${alphaPath}"`);
    // 2. tificc: sRGB → Japan Color 2001 Coated CMYK (flattens to white internally for tificc)
    await pngToJapanColorTiff(inputPath, cmykPath);
    // 3. Re-apply original alpha to CMYK TIFF (transparent areas = no ink)
    await execAsync(`"${MAGICK}" "${cmykPath}" -alpha on "${alphaPath}" -compose CopyOpacity -composite -compress lzw "${outputPath}"`);
    const tifBuf = fs.readFileSync(outputPath);
    res.set('Content-Type', 'image/tiff');
    res.set('Content-Disposition', 'attachment; filename="issei-print-cmyk.tif"');
    res.send(tifBuf);
  } catch (err) {
    console.error('CMYK convert error:', err);
    res.status(500).json({ error: 'CMYK conversion failed' });
  } finally {
    for (const p of [inputPath, cmykPath, alphaPath, outputPath]) try { fs.unlinkSync(p); } catch {}
  }
});

export default router;
