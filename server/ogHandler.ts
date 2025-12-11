import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { artworks } from "../db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

function getBaseUrl(req: Request): string {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'atelier-issei.com';
  return `${protocol}://${host}`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isSocialMediaBot(userAgent: string): boolean {
  const botPatterns = [
    'facebookexternalhit',
    'Facebot',
    'Twitterbot',
    'LinkedInBot',
    'Pinterest',
    'Slackbot',
    'TelegramBot',
    'WhatsApp',
    'Line',
    'Discordbot',
    'Googlebot',
    'bingbot',
    'Applebot',
  ];
  return botPatterns.some(pattern => userAgent.toLowerCase().includes(pattern.toLowerCase()));
}

function extractArtworkId(url: string): number | null {
  const match = url.match(/^\/artwork\/(\d+)(?:\?.*)?$/);
  return match ? parseInt(match[1], 10) : null;
}

async function injectArtworkOgTags(html: string, artworkId: number, baseUrl: string): Promise<string> {
  try {
    const artwork = await db.query.artworks.findFirst({
      where: eq(artworks.id, artworkId),
    });

    if (!artwork) {
      return html;
    }

    const title = escapeHtml(`ATELIER ISSEI - ${artwork.title}`);
    const description = escapeHtml(artwork.description?.substring(0, 150) || 'アーティストisseiが創造する、温かみのある色彩と大胆な構図で見る人の心に寄り添う作品。');
    const imageUrl = artwork.imageUrl?.startsWith('http') 
      ? artwork.imageUrl 
      : `${baseUrl}${artwork.imageUrl}`;
    const pageUrl = `${baseUrl}/artworks/${artworkId}`;

    let modifiedHtml = html;

    modifiedHtml = modifiedHtml.replace(
      /<title>.*?<\/title>/,
      `<title>${title}</title>`
    );

    modifiedHtml = modifiedHtml.replace(
      /<meta name="description" content="[^"]*" \/>/,
      `<meta name="description" content="${description}" />`
    );

    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:title" content="[^"]*" \/>/,
      `<meta property="og:title" content="${title}" />`
    );

    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:description" content="[^"]*" \/>/,
      `<meta property="og:description" content="${description}" />`
    );

    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:type" content="[^"]*" \/>/,
      `<meta property="og:type" content="article" />`
    );

    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:image" content="[^"]*" \/>/,
      `<meta property="og:image" content="${imageUrl}" />`
    );

    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:url" content="[^"]*" \/>/,
      `<meta property="og:url" content="${pageUrl}" />`
    );

    modifiedHtml = modifiedHtml.replace(
      /<meta name="twitter:title" content="[^"]*" \/>/,
      `<meta name="twitter:title" content="${title}" />`
    );

    modifiedHtml = modifiedHtml.replace(
      /<meta name="twitter:description" content="[^"]*" \/>/,
      `<meta name="twitter:description" content="${description}" />`
    );

    modifiedHtml = modifiedHtml.replace(
      /<meta name="twitter:image" content="[^"]*" \/>/,
      `<meta name="twitter:image" content="${imageUrl}" />`
    );

    modifiedHtml = modifiedHtml.replace(
      /<meta name="twitter:image:alt" content="[^"]*" \/>/,
      `<meta name="twitter:image:alt" content="${escapeHtml(artwork.title || 'ATELIER ISSEI - アート作品')}" />`
    );

    return modifiedHtml;
  } catch (error) {
    console.error('Error injecting artwork OG tags:', error);
    return html;
  }
}

export function createOgMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const url = req.path;
    const userAgent = req.headers['user-agent'] || '';
    
    const artworkId = extractArtworkId(url);
    
    if (!artworkId || !isSocialMediaBot(userAgent)) {
      return next();
    }

    try {
      const baseUrl = getBaseUrl(req);
      
      let htmlPath: string;
      if (process.env.NODE_ENV === 'production') {
        htmlPath = path.resolve(__dirname, 'public', 'index.html');
      } else {
        htmlPath = path.resolve(__dirname, '..', 'client', 'index.html');
      }

      const html = await fs.promises.readFile(htmlPath, 'utf-8');
      const modifiedHtml = await injectArtworkOgTags(html, artworkId, baseUrl);
      
      res.status(200).set({ 'Content-Type': 'text/html' }).end(modifiedHtml);
    } catch (error) {
      console.error('OG middleware error:', error);
      next();
    }
  };
}
