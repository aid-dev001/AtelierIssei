import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { artworks } from "../db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type LocationOgData = {
  title: string;
  description: string;
  image: string;
};

const locationsOgData: Record<string, LocationOgData> = {
  "tokyo-shinjuku": {
    title: "東京・新宿",
    description: "大学入学を機に上京し、美術部の友人の影響で初の抽象画",
    image: "/images/tokyo_shinjuku_1.jpg",
  },
  "tokyo-akasaka": {
    title: "東京・赤坂",
    description: "3ヶ月で150枚制作。抽象画に加え女の子の絵を描くようになった新画風への転換期",
    image: "/images/akasaka_1.jpg",
  },
  "tokyo-shibuya": {
    title: "東京・渋谷",
    description: "都市のエネルギーと若者文化の交差点",
    image: "/images/12659.jpg",
  },
  hiroshima: {
    title: "広島",
    description: "中学3年生で描いた油絵から始まったアートへの道",
    image: "/images/S__9044006.jpg",
  },
  fukuyama: {
    title: "福山",
    description: "福山こころの病院での愛と癒しをテーマにした作品展示",
    image: "/images/13456_0.jpg",
  },
  london: {
    title: "ロンドン",
    description: "展覧会出展により英国王立美術家協会の名誉会員に招待",
    image: "/images/スクリーンショット 2025-05-25 23.21.59.png",
  },
  paris: {
    title: "パリ第一回",
    description: "単独の個展では初めての個展。芸術の本場パリで大絶賛を受けた記念すべき展示",
    image: "/images/paris_1.jpg",
  },
  nice: {
    title: "ニース",
    description: "地中海の光と色彩が融合する南仏の宝石",
    image: "/images/スクリーンショット 2025-05-25 19.23.37.png",
  },
  "abu-dhabi": {
    title: "アブダビ",
    description: "海外初出品で『ひょこあに』シリーズが来場者アンケート1位",
    image: "/images/abu_dhabi_1.jpg",
  },
  "tokyo-ikebukuro": {
    title: "東京・池袋",
    description: "ビジネスに打ち込んだ後、仕事仲間の勧めで絵画制作を再開",
    image: "/images/LINE_ALBUM_20241124_250525_65.jpg",
  },
  "tokyo-okubo": {
    title: "東京・大久保",
    description: "新大久保のギャラリーで動物シリーズを展示、絵本化企画も",
    image: "/images/tokyo_okubo_1.jpg",
  },
  normandy: {
    title: "フランス・ノルマンディー",
    description: "歴史と自然が織りなす風景からのインスピレーション",
    image: "/images/montmartre_1.jpg",
  },
  "atis-mons": {
    title: "アティスモンス",
    description: "フランス郊外の静かな村での集中的な創作期間",
    image: "/attached_assets/1928320.png",
  },
  "tokyo-higashi-shinjuku": {
    title: "東京・東新宿",
    description: "都市の夜景に映えるポップアートの展示",
    image: "/attached_assets/LINE_ALBUM_20241124_250525_234.jpg",
  },
  "atis-mons-church": {
    title: "フランス・アティスモンス教会",
    description: "歴史的な教会を舞台にした特別展示会",
    image: "/images/1731420256.jpg",
  },
  "saint-hilaire-andre": {
    title: "フランス・ティレーヌアンドレシス教会",
    description: "中世の面影を残す村での滞在制作",
    image: "/images/1731420256.jpg",
  },
  bourges: {
    title: "ブールジュ",
    description: "ゴシック建築に囲まれた創作体験",
    image: "/images/13463.jpg",
  },
  "paris-2025": {
    title: "フランス・パリ",
    description: "パリ19区ギャラリーMでの個展とノルマンディーでの撮影紀行",
    image: "/exhibitions/france-2025/01.jpg",
  },
  "paris-second": {
    title: "パリ第二回",
    description: "二度目のパリ展示",
    image: "/images/paris_second_1.jpg",
  },
  "france-savigny": {
    title: "フランス・サヴィニー",
    description: "サヴィニー城での展示",
    image: "/images/france_savigny_1.jpg",
  },
  "spain-casamila": {
    title: "スペイン・カサミラ",
    description: "バルセロナでの芸術体験",
    image: "/images/spain_casamila_1.jpg",
  },
  "france-chambord": {
    title: "フランス・シャンボール城",
    description: "ルネサンス建築の傑作での展示",
    image: "/images/france_chambord_1.jpg",
  },
  montmartre: {
    title: "モンマルトル",
    description: "芸術家の街での創作",
    image: "/images/montmartre_1.jpg",
  },
  "tokyo-shinjuku-2024": {
    title: "東京・新宿 2024",
    description: "新宿での新たな展示",
    image: "/images/tokyo_shinjuku_2024_1.jpg",
  },
  chaumont: {
    title: "ショーモン城",
    description: "ロワール渓谷の城での展示",
    image: "/images/chaumont_1.jpg",
  },
  monaco: {
    title: "モナコ",
    description: "モナコでの特別展示",
    image: "/images/monaco_1.jpg",
  },
};

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

function extractLocationId(url: string): string | null {
  const match = url.match(/^\/exhibition\/location\/([a-zA-Z0-9-]+)(?:\?.*)?$/);
  return match ? match[1] : null;
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
    
    // Build image URL, adding .jpg extension if missing for social media compatibility
    let rawImageUrl = artwork.imageUrl?.startsWith('http') 
      ? artwork.imageUrl 
      : `${baseUrl}${artwork.imageUrl}`;
    const hasExtension = /\.(jpg|jpeg|png|gif|webp)$/i.test(rawImageUrl);
    const imageUrl = hasExtension ? rawImageUrl : `${rawImageUrl}.jpg`;
    
    const pageUrl = `${baseUrl}/artwork/${artworkId}`;

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

    // Replace og:image and add secure_url + type, remove fixed dimensions
    const imageExtension = imageUrl.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    const imageTagsWithExtras = `<meta property="og:image" content="${imageUrl}" />\n    <meta property="og:image:secure_url" content="${imageUrl}" />\n    <meta property="og:image:type" content="${imageExtension}" />`;
    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:image" content="[^"]*" \/>/,
      imageTagsWithExtras
    );

    // Remove fixed dimensions so Facebook auto-detects actual image size
    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:image:width" content="[^"]*" \/>\n\s*/,
      ''
    );

    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:image:height" content="[^"]*" \/>\n\s*/,
      ''
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

    // Ensure twitter:card is set to summary_large_image for artwork pages
    modifiedHtml = modifiedHtml.replace(
      /<meta name="twitter:card" content="[^"]*" \/>/,
      `<meta name="twitter:card" content="summary_large_image" />`
    );

    return modifiedHtml;
  } catch (error) {
    console.error('Error injecting artwork OG tags:', error);
    return html;
  }
}

function injectLocationOgTags(html: string, locationId: string, baseUrl: string): string {
  try {
    const location = locationsOgData[locationId];

    if (!location) {
      return html;
    }

    const title = escapeHtml(`ATELIER ISSEI - ${location.title}`);
    const description = escapeHtml(location.description || 'アーティストisseiの展示会・個展の記録。');
    
    // Build image URL with proper encoding for Japanese characters
    const encodedImagePath = location.image.split('/').map((segment, index) => 
      index === 0 ? segment : encodeURIComponent(segment)
    ).join('/');
    let rawImageUrl = location.image.startsWith('http') 
      ? location.image 
      : `${baseUrl}${encodedImagePath}`;
    const hasExtension = /\.(jpg|jpeg|png|gif|webp)$/i.test(rawImageUrl);
    const imageUrl = hasExtension ? rawImageUrl : `${rawImageUrl}.jpg`;
    
    const pageUrl = `${baseUrl}/exhibition/location/${locationId}`;

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

    // Replace og:image and add secure_url + type
    const imageExtension = imageUrl.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    const imageTagsWithExtras = `<meta property="og:image" content="${imageUrl}" />\n    <meta property="og:image:secure_url" content="${imageUrl}" />\n    <meta property="og:image:type" content="${imageExtension}" />`;
    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:image" content="[^"]*" \/>/,
      imageTagsWithExtras
    );

    // Remove fixed dimensions so social media auto-detects actual image size
    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:image:width" content="[^"]*" \/>\n\s*/,
      ''
    );

    modifiedHtml = modifiedHtml.replace(
      /<meta property="og:image:height" content="[^"]*" \/>\n\s*/,
      ''
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
      `<meta name="twitter:image:alt" content="${escapeHtml(location.title || 'ATELIER ISSEI - 展示会')}" />`
    );

    modifiedHtml = modifiedHtml.replace(
      /<meta name="twitter:card" content="[^"]*" \/>/,
      `<meta name="twitter:card" content="summary_large_image" />`
    );

    return modifiedHtml;
  } catch (error) {
    console.error('Error injecting location OG tags:', error);
    return html;
  }
}

export function createOgMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const url = req.path;
    const userAgent = req.headers['user-agent'] || '';
    
    const artworkId = extractArtworkId(url);
    const locationId = extractLocationId(url);
    
    if (!artworkId && !locationId) {
      return next();
    }

    const isBot = isSocialMediaBot(userAgent);
    
    if (!isBot) {
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
      
      let modifiedHtml: string;
      if (artworkId) {
        modifiedHtml = await injectArtworkOgTags(html, artworkId, baseUrl);
      } else if (locationId) {
        modifiedHtml = injectLocationOgTags(html, locationId, baseUrl);
      } else {
        modifiedHtml = html;
      }
      
      res.status(200).set({ 'Content-Type': 'text/html' }).end(modifiedHtml);
    } catch (error) {
      console.error('OG middleware error:', error);
      next();
    }
  };
}
