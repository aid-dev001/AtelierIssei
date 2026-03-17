import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Download, X } from "lucide-react";
import ScrollToTopLink from "@/components/ScrollToTopLink";
import OrderModal from "@/components/OrderModal";
import { injectDpi300 } from "@/lib/pngDpi";

function ImageModal({ src, transparentSrc, onClose }: { src: string; transparentSrc?: string; onClose: () => void }) {
  const dl = (href: string, name: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    a.click();
  };
  return (
    <div className="fixed inset-0 bg-black/85 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt="拡大プレビュー" className="w-full rounded-2xl shadow-2xl" />
        <div className="absolute top-3 right-3 flex gap-2">
          {transparentSrc && (
            <button onClick={() => dl(transparentSrc, "issei-print.png")} className="bg-white/90 hover:bg-white rounded-full px-3 py-2 shadow transition-colors flex items-center gap-1.5" title="透過PNG（プリント部分のみ）">
              <Download className="w-4 h-4 text-black" />
              <span className="text-xs text-black font-medium">透過</span>
            </button>
          )}
          <button onClick={() => dl(src, "issei-design.png")} className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow transition-colors" title="ダウンロード">
            <Download className="w-5 h-5 text-black" />
          </button>
          <button onClick={onClose} className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow transition-colors" title="閉じる">
            <X className="w-5 h-5 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}

type ArtworkItem = { id: number; title: string; imageUrl: string; description?: string };

const PHRASES: { ja: string; en: string; fr: string }[] = [
  {
    ja: "色が語る言葉に、耳を傾けてください。",
    en: "Listen to the language that colors speak.",
    fr: "Écoutez le langage que parlent les couleurs.",
  },
  {
    ja: "一筆ごとに、世界が新しくなる。",
    en: "With every brushstroke, the world is renewed.",
    fr: "À chaque coup de pinceau, le monde se renouvelle.",
  },
  {
    ja: "自然の中に、私は無限の絵の具を見つける。",
    en: "In nature, I find an infinite palette.",
    fr: "Dans la nature, je trouve une palette infinie.",
  },
  {
    ja: "アートは言葉を超え、心に直接届く。",
    en: "Art transcends words and reaches the heart.",
    fr: "L'art transcende les mots et touche le cœur.",
  },
  {
    ja: "感じることが、すべての表現の始まりだ。",
    en: "To feel is the beginning of all expression.",
    fr: "Ressentir est le début de toute expression.",
  },
  {
    ja: "一枚の絵に、一つの宇宙が宿る。",
    en: "In one painting, an entire universe dwells.",
    fr: "Dans un tableau, tout un univers réside.",
  },
  {
    ja: "美しさとは、見る者の内側にある。",
    en: "Beauty resides within the one who sees.",
    fr: "La beauté réside en celui qui regarde.",
  },
  {
    ja: "色と形が出会う場所に、物語が生まれる。",
    en: "Where color and form meet, stories are born.",
    fr: "Là où couleur et forme se rencontrent, naissent des histoires.",
  },
];

const PAGE_SIZE = 12;

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const LABEL_EN = "ISSEI – Wearable Abstraction";
const LABEL_FR = "ISSEI – L'abstraction à porter";

function drawLabelOnCtx(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  labelImg: HTMLImageElement | null,
  labelVisible: boolean,
  labelLang: "en" | "fr",
  labelOffset: { x: number; y: number },
  color: "white" | "black"
) {
  if (!labelVisible) return;
  const defaultX = canvasW * 0.73;
  const defaultY = canvasH * 0.57;
  const lx = defaultX + labelOffset.x;
  const ly = defaultY + labelOffset.y;
  if (labelLang === "en" && labelImg) {
    const scale = canvasW / 1600;
    const lw = 368 * 0.6 * scale;
    const lh = 64 * 0.6 * scale;
    if (color === "black") ctx.filter = "invert(1)";
    ctx.drawImage(labelImg, lx - lw, ly - lh * 0.75, lw, lh);
    ctx.filter = "none";
  } else {
    const text = labelLang === "fr" ? LABEL_FR : LABEL_EN;
    ctx.save();
    ctx.fillStyle = color === "black" ? "#ffffff" : "#000000";
    ctx.font = `400 ${Math.round(canvasW * 0.010)}px 'Helvetica Neue', Helvetica, Arial, sans-serif`;
    ctx.textAlign = "right";
    (ctx as any).letterSpacing = `${Math.round(canvasW * 0.001)}px`;
    ctx.fillText(text, lx, ly);
    ctx.restore();
  }
}

function getClientXY(e: React.MouseEvent | React.TouchEvent) {
  if ("touches" in e) {
    return { x: e.touches[0]?.clientX ?? 0, y: e.touches[0]?.clientY ?? 0 };
  }
  return { x: e.clientX, y: e.clientY };
}

export default function Product2() {
  const { data: artworks = [] } = useQuery<ArtworkItem[]>({
    queryKey: ["/api/artworks"],
    queryFn: async () => (await fetch("/api/artworks")).json(),
  });

  const [selectedArtId, setSelectedArtId] = useState<number | null>(() => {
    const v = localStorage.getItem("p2_artId"); return v ? Number(v) : null;
  });
  const [artImg, setArtImg] = useState<HTMLImageElement | null>(null);

  const [frontShirtImg, setFrontShirtImg] = useState<HTMLImageElement | null>(null);
  const [backShirtImg, setBackShirtImg] = useState<HTMLImageElement | null>(null);
  const [frontBlackShirtImg, setFrontBlackShirtImg] = useState<HTMLImageElement | null>(null);
  const [backBlackShirtImg, setBackBlackShirtImg] = useState<HTMLImageElement | null>(null);
  const [tshirtColor, setTshirtColor] = useState<"white" | "black">("white");

  const [lang, setLang] = useState<"ja" | "en" | "fr">("en");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [customText, setCustomText] = useState("");
  const [combinedPhrases, setCombinedPhrases] = useState<{ ja: string; en: string; fr: string }[]>(
    () => [...PHRASES].sort(() => Math.random() - 0.5)
  );

  const [frontPos, setFrontPos] = useState({ x: 0.5, y: 0.32 });
  const [lineWidth, setLineWidth] = useState(130);
  const [artVertOffset, setArtVertOffset] = useState(0.5);

  const [backPos, setBackPos] = useState({ x: 0.5, y: 0.38 });
  const [designScale, setDesignScale] = useState(1.0);
  const [cropScale, setCropScale] = useState(1.0);
  const [artOffset, setArtOffset] = useState({ x: 0, y: 0 });
  const [backMode, setBackMode] = useState<"shirt" | "art">("shirt");
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [modalTransparentImg, setModalTransparentImg] = useState<string | null>(null);
  const [labelVisible, setLabelVisible] = useState(true);
  const [labelLang, setLabelLang] = useState<"en" | "fr">("en");
  const [labelImg, setLabelImg] = useState<HTMLImageElement | null>(null);
  const [labelOffset, setLabelOffset] = useState({ x: 0, y: 0 });

  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const FRONT_CW = 1043;
  const FRONT_CH = 1024;
  const BACK_CW = 976;
  const BACK_CH = 1079;
  const BACK_SQUARE_BASE = 300;
  const LINE_H = 3;

  const frontRef = useRef<HTMLCanvasElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fillSectionRef = useRef<HTMLDivElement>(null);

  const frontDragging = useRef(false);
  const frontDragScreen = useRef({ x: 0, y: 0 });
  const frontDragStartPos = useRef({ x: 0, y: 0 });
  const frontDidMove = useRef(false);

  const backDragging = useRef(false);
  const backDragScreen = useRef({ x: 0, y: 0 });
  const backDidMove = useRef(false);
  const backDragStartPos = useRef({ x: 0, y: 0 });
  const backDragStartOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    loadImg("/product/tshirt2-front.jpg").then(setFrontShirtImg);
    loadImg("/product/tshirt2-back.jpg").then(setBackShirtImg);
    loadImg("/product/tshirt2-black-front.jpg").then(setFrontBlackShirtImg);
    loadImg("/product/tshirt2-black-back.jpg").then(setBackBlackShirtImg);
    loadImg("/product/label-text.png").then(setLabelImg).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedArtId) return;
    const art = artworks.find((a) => a.id === selectedArtId);
    if (!art) return;
    let cancelled = false;
    loadImg(art.imageUrl).then((img) => { if (!cancelled) setArtImg(img); });
    return () => { cancelled = true; };
  }, [selectedArtId, artworks]);
  useEffect(() => {
    if (selectedArtId != null) localStorage.setItem("p2_artId", String(selectedArtId));
    else localStorage.removeItem("p2_artId");
  }, [selectedArtId]);

  useEffect(() => {
    let cancelled = false;
    const buildPool = async () => {
      setCustomText("");
      const selectedArt = artworks.find((a) => a.id === selectedArtId);

      // 1〜4: 絵の説明文からランダムに最大4文
      const artJa: string[] = selectedArt?.description
        ? selectedArt.description
            .split(/[。\n]/)
            .map((s) => s.trim())
            .filter((s) => s.length > 5)
            .sort(() => Math.random() - 0.5)
            .slice(0, 4)
            .map((s) => s + "。")
        : [];

      // 5〜8: サイト全体からランダムに4句（既存の英仏訳をそのまま使用）
      const sitePhrases = [...PHRASES].sort(() => Math.random() - 0.5).slice(0, 4);

      // 絵の説明文を翻訳（1〜4のみ）
      let artPhrases: { ja: string; en: string; fr: string }[] = artJa.map((s) => ({ ja: s, en: s, fr: s }));
      if (artJa.length > 0) {
        try {
          const translated = await Promise.all(
            artJa.map(async (s) => {
              const [enRes, frRes] = await Promise.all([
                fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(s)}&langpair=ja|en`),
                fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(s)}&langpair=ja|fr`),
              ]);
              const enData = await enRes.json();
              const frData = await frRes.json();
              return {
                ja: s,
                en: enData.responseData?.translatedText ?? s,
                fr: frData.responseData?.translatedText ?? s,
              };
            })
          );
          artPhrases = translated;
        } catch (_) {}
      }

      // 結合（順番を保持：絵1〜4 → サイト5〜8）
      const pool = [...artPhrases, ...sitePhrases];

      if (cancelled) return;
      setCombinedPhrases(pool);
      setPhraseIdx(0);
      setCustomText(pool[0]?.en ?? "");
    };
    buildPool();
    return () => { cancelled = true; };
  }, [selectedArtId, artworks]);

  useEffect(() => {
    setCustomText(combinedPhrases[phraseIdx]?.[lang] ?? "");
  }, [phraseIdx, lang, combinedPhrases]);

  const renderFront = useCallback(() => {
    const canvas = frontRef.current;
    const shirtImg = tshirtColor === "black" ? frontBlackShirtImg : frontShirtImg;
    if (!canvas || !shirtImg) return;
    canvas.width = FRONT_CW;
    canvas.height = FRONT_CH;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, FRONT_CW, FRONT_CH);
    ctx.drawImage(shirtImg, 0, 0, FRONT_CW, FRONT_CH);
    if (!artImg) return;

    const cx = FRONT_CW / 2;
    const ty = frontPos.y * FRONT_CH;
    const lx = cx - lineWidth / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(lx, ty, lineWidth, LINE_H);
    ctx.clip();
    const scale = lineWidth / artImg.width;
    const dh = artImg.height * scale;
    const dy = ty + (LINE_H - dh) * artVertOffset;
    ctx.globalCompositeOperation = tshirtColor === "black" ? "screen" : "multiply";
    ctx.drawImage(artImg, lx, dy, lineWidth, dh);
    ctx.restore();

    const text = customText;
    if (text) {
      ctx.save();
      ctx.globalCompositeOperation = tshirtColor === "black" ? "screen" : "multiply";
      ctx.font = "400 15px 'Helvetica Neue', Arial, sans-serif";
      ctx.fillStyle = tshirtColor === "black" ? "#e0e0e0" : "#2a2a2a";
      ctx.textAlign = "left";
      const textX = cx - 170;
      const maxW = 370;
      const lines = wrapText(ctx, text, maxW);
      lines.forEach((line, i) => {
        ctx.fillText(line, textX, ty + LINE_H + 40 + i * 17);
      });
      ctx.restore();
    }
  }, [frontShirtImg, frontBlackShirtImg, artImg, frontPos, lineWidth, artVertOffset, customText, tshirtColor]);

  const renderBack = useCallback(() => {
    const canvas = backRef.current;
    const shirtImg = tshirtColor === "black" ? backBlackShirtImg : backShirtImg;
    if (!canvas || !shirtImg) return;
    canvas.width = BACK_CW;
    canvas.height = BACK_CH;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, BACK_CW, BACK_CH);
    ctx.drawImage(shirtImg, 0, 0, BACK_CW, BACK_CH);
    if (!artImg) return;

    const sq = BACK_SQUARE_BASE * designScale;
    const sx = backPos.x * BACK_CW - sq / 2;
    const sy = backPos.y * BACK_CH - sq / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(sx, sy, sq, sq);
    ctx.clip();
    const scale = Math.max(sq / artImg.width, sq / artImg.height) * cropScale;
    const dw = artImg.width * scale;
    const dh = artImg.height * scale;
    const dx = sx + (sq - dw) / 2 + artOffset.x;
    const dy = sy + (sq - dh) / 2 + artOffset.y;
    ctx.globalCompositeOperation = tshirtColor === "black" ? "screen" : "multiply";
    ctx.drawImage(artImg, dx, dy, dw, dh);
    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
    drawLabelOnCtx(ctx, BACK_CW, BACK_CH, labelImg, labelVisible, labelLang, labelOffset, tshirtColor);
  }, [backShirtImg, backBlackShirtImg, artImg, backPos, designScale, cropScale, artOffset, tshirtColor, labelImg, labelVisible, labelLang, labelOffset]);

  const getFrontTransparentPng = useCallback((): string | null => {
    if (!artImg) return null;
    const PS = 3;
    const W = FRONT_CW * PS;
    const H = FRONT_CH * PS;
    const off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    const ctx = off.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    const cx = W / 2;
    const lw = lineWidth * PS;
    const lh = LINE_H * PS;
    const ty = frontPos.y * H;
    const lx = cx - lw / 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(lx, ty, lw, lh);
    ctx.clip();
    const scale = lw / artImg.width;
    const dh = artImg.height * scale;
    const dy = ty + (lh - dh) * artVertOffset;
    ctx.drawImage(artImg, lx, dy, lw, dh);
    ctx.restore();
    const text = customText;
    if (text) {
      ctx.save();
      ctx.font = `400 ${15 * PS}px 'Helvetica Neue', Arial, sans-serif`;
      ctx.fillStyle = "#2a2a2a";
      ctx.textAlign = "left";
      const textX = cx - 170 * PS;
      const maxW = 370 * PS;
      const lines = wrapText(ctx, text, maxW);
      lines.forEach((line, i) => {
        ctx.fillText(line, textX, ty + lh + 40 * PS + i * 17 * PS);
      });
      ctx.restore();
    }
    return injectDpi300(off.toDataURL("image/png"));
  }, [artImg, frontPos, lineWidth, artVertOffset, customText, FRONT_CW, FRONT_CH, LINE_H]);

  const getBackTransparentPng = useCallback((): string | null => {
    if (!artImg) return null;
    const PS = 3;
    const W = BACK_CW * PS;
    const H = BACK_CH * PS;
    const off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    const ctx = off.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    const sq = BACK_SQUARE_BASE * designScale * PS;
    const sx = backPos.x * W - sq / 2;
    const sy = backPos.y * H - sq / 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(sx, sy, sq, sq);
    ctx.clip();
    const scale = Math.max(sq / artImg.width, sq / artImg.height) * cropScale;
    const dw = artImg.width * scale;
    const dh = artImg.height * scale;
    const dx = sx + (sq - dw) / 2 + artOffset.x * PS;
    const dy = sy + (sq - dh) / 2 + artOffset.y * PS;
    ctx.drawImage(artImg, dx, dy, dw, dh);
    ctx.restore();
    drawLabelOnCtx(ctx, W, H, labelImg, labelVisible, labelLang, labelOffset, tshirtColor);
    return injectDpi300(off.toDataURL("image/png"));
  }, [artImg, backPos, designScale, cropScale, artOffset, BACK_CW, BACK_CH, BACK_SQUARE_BASE, labelImg, labelVisible, labelLang, labelOffset, tshirtColor]);

  useEffect(() => { renderFront(); }, [renderFront]);
  useEffect(() => { renderBack(); }, [renderBack]);

  useEffect(() => {
    if (artImg) {
      setTimeout(() => {
        const el = previewRef.current;
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: "smooth" });
      }, 200);
    }
  }, [artImg]);

  useEffect(() => {
    if (!selectedArtId || artImg) return;
    if (window.innerWidth >= 768) return;
    setTimeout(() => {
      const el = fillSectionRef.current;
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    }, 200);
  }, [selectedArtId]);

  const visibleArtworks = artworks.slice(0, page * PAGE_SIZE);
  const hasMore = visibleArtworks.length < artworks.length;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setPage((p) => p + 1);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore]);

  const CLICK_THRESHOLD = 6;

  const onFrontDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    frontDragging.current = true;
    frontDidMove.current = false;
    frontDragScreen.current = getClientXY(e);
    frontDragStartPos.current = { ...frontPos };
  };
  const onFrontMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!frontDragging.current || !frontRef.current) return;
    const { x, y } = getClientXY(e);
    const mx = Math.abs(x - frontDragScreen.current.x);
    const my = Math.abs(y - frontDragScreen.current.y);
    if (mx > CLICK_THRESHOLD || my > CLICK_THRESHOLD) frontDidMove.current = true;
    const rect = frontRef.current.getBoundingClientRect();
    const dx = (x - frontDragScreen.current.x) / rect.width;
    const dy = (y - frontDragScreen.current.y) / rect.height;
    setFrontPos({
      x: Math.max(0.1, Math.min(0.9, frontDragStartPos.current.x + dx)),
      y: Math.max(0.05, Math.min(0.85, frontDragStartPos.current.y + dy)),
    });
  };
  const onFrontUp = () => {
    if (frontDragging.current && !frontDidMove.current) {
      setModalImg(frontRef.current?.toDataURL("image/png") ?? null);
      setModalTransparentImg(getFrontTransparentPng());
    }
    frontDragging.current = false;
  };

  const onBackDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    backDragging.current = true;
    backDidMove.current = false;
    backDragScreen.current = getClientXY(e);
    if (backMode === "shirt") {
      backDragStartPos.current = { ...backPos };
    } else {
      backDragStartOffset.current = { ...artOffset };
    }
  };
  const onBackMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!backDragging.current || !backRef.current) return;
    const { x, y } = getClientXY(e);
    const mx = Math.abs(x - backDragScreen.current.x);
    const my = Math.abs(y - backDragScreen.current.y);
    if (mx > CLICK_THRESHOLD || my > CLICK_THRESHOLD) backDidMove.current = true;
    const rect = backRef.current.getBoundingClientRect();
    const dx = (x - backDragScreen.current.x) / rect.width;
    const dy = (y - backDragScreen.current.y) / rect.height;
    if (backMode === "shirt") {
      setBackPos({
        x: Math.max(0.1, Math.min(0.9, backDragStartPos.current.x + dx)),
        y: Math.max(0.1, Math.min(0.9, backDragStartPos.current.y + dy)),
      });
    } else {
      const sq = BACK_SQUARE_BASE * designScale;
      setArtOffset({
        x: backDragStartOffset.current.x + dx * sq,
        y: backDragStartOffset.current.y + dy * sq,
      });
    }
  };
  const onBackUp = () => {
    if (backDragging.current && !backDidMove.current) {
      setModalImg(backRef.current?.toDataURL("image/png") ?? null);
      setModalTransparentImg(getBackTransparentPng());
    }
    backDragging.current = false;
  };

  const selectedArtItem = selectedArtId != null ? artworks.find((a) => a.id === selectedArtId) ?? null : null;
  const [orderOpen, setOrderOpen] = useState(false);
  const artDetailUrl = selectedArtItem ? `${window.location.origin}/artwork/${selectedArtId}` : null;

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 tracking-wider text-center">PRODUCTS</h1>
        <p className="text-center text-xs tracking-[0.2em] uppercase text-black mb-8">Art you can wear</p>

        <div className="text-center mb-10 space-y-2">
          <p className="text-sm leading-relaxed tracking-wide text-black font-medium">
            アートを身につける、自身で創るというプロダクト。
          </p>
          <p className="text-sm leading-relaxed tracking-wide text-black font-medium">
            これはアートと対話するという、先進的な試みです。
          </p>
        </div>

        <div className="flex justify-center gap-8 mb-10 border-b border-gray-200 pb-4">
          <ScrollToTopLink href="/product" className="text-sm tracking-widest text-gray-400 hover:text-black transition-colors">
            PRODUCT 1
          </ScrollToTopLink>
          <span className="text-sm tracking-widest text-black border-b-2 border-black pb-1">
            PRODUCT 2
          </span>
          <ScrollToTopLink href="/product3" className="text-sm tracking-widest text-gray-400 hover:text-black transition-colors">
            PRODUCT 3
          </ScrollToTopLink>
        </div>

        <div className="max-w-xl mx-auto mb-12 text-center space-y-4">
          <p className="text-sm leading-relaxed tracking-wide text-black">
            絵を選び、言葉を選ぶ。
          </p>
          <p className="text-sm leading-relaxed tracking-wide text-black">
            ISSEIの作品からひとつを選ぶと、絵のストロークがラインとなり、<br className="hidden md:block" />
            詩のような言葉とともにTシャツへと纏います。
          </p>
        </div>

        <div ref={fillSectionRef} className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">1</span>
            <span className="font-semibold text-sm tracking-wider">絵を選ぶ</span>
            <span className="text-xs text-black">ISSEIの作品から選択</span>
          </div>
          {artworks.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center border rounded-xl">作品がありません</p>
          ) : (
            <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pr-1">
                {visibleArtworks.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedArtId(a.id)}
                    className={`rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                      selectedArtId === a.id ? "border-black shadow-md" : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover bg-gray-50" loading="lazy" />
                  </button>
                ))}
              </div>
              {hasMore && <div ref={sentinelRef} className="h-4" />}
            </div>
          )}
        </div>

        {artImg && (
          <>
            <div ref={previewRef} className="mt-16 pt-8 mb-6 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-black mb-1">表面 FRONT</p>
                <p className="text-xs text-black">ドラッグ: 位置移動 / クリック: 拡大</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-black">カラー</span>
                <button
                  onClick={() => setTshirtColor("white")}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    tshirtColor === "white" ? "bg-black text-white border-black" : "bg-white text-gray-500 border-gray-300 hover:border-gray-500"
                  }`}
                >白</button>
                <button
                  onClick={() => setTshirtColor("black")}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    tshirtColor === "black" ? "bg-black text-white border-black" : "bg-white text-gray-500 border-gray-300 hover:border-gray-500"
                  }`}
                >黒</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div>
                <div className="relative">
                  <div
                    className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-gray-50"
                    style={{ width: "100%", aspectRatio: `${FRONT_CW} / ${FRONT_CH}` }}
                  >
                    <canvas
                      ref={frontRef}
                      style={{ width: "100%", height: "100%", display: "block", cursor: "grab", touchAction: "none" }}
                      onMouseDown={onFrontDown}
                      onMouseMove={onFrontMove}
                      onMouseUp={onFrontUp}
                      onMouseLeave={onFrontUp}
                      onTouchStart={onFrontDown}
                      onTouchMove={onFrontMove}
                      onTouchEnd={onFrontUp}
                    />
                  </div>
                  <button
                    onClick={() => { setModalImg(frontRef.current?.toDataURL("image/png") ?? null); setModalTransparentImg(getFrontTransparentPng()); }}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-2 shadow transition-colors"
                    title="拡大・ダウンロード"
                  >
                    <Download className="w-4 h-4 text-black" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-black whitespace-nowrap">線の長さ</span>
                  <input
                    type="range" min={80} max={340} step={10} value={lineWidth}
                    onChange={(e) => setLineWidth(Number(e.target.value))}
                    className="flex-1 accent-black"
                  />
                  <span className="text-xs text-gray-400 w-8">{lineWidth}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-black whitespace-nowrap">線に使う絵の上下位置</span>
                  <input
                    type="range" min={0} max={1} step={0.01} value={artVertOffset}
                    onChange={(e) => setArtVertOffset(Number(e.target.value))}
                    className="flex-1 accent-black"
                  />
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">2</span>
                    <span className="font-semibold text-sm tracking-wider">言葉を選ぶ・編集する</span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    {(["ja", "en", "fr"] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setLang(l)}
                        className={`px-3 py-1 text-xs rounded-full border transition-all ${
                          lang === l ? "bg-black text-white border-black" : "bg-white text-black border-gray-300 hover:border-black"
                        }`}
                      >
                        {l === "ja" ? "日本語" : l === "en" ? "EN" : "FR"}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {combinedPhrases.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhraseIdx(i)}
                        className={`w-7 h-7 text-xs rounded-full border transition-all ${
                          phraseIdx === i ? "bg-black text-white border-black" : "bg-white text-black border-gray-300 hover:border-black"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm leading-relaxed resize-none focus:outline-none focus:border-black"
                    rows={3}
                    placeholder="テキストを編集できます"
                  />
                </div>

                <button
                  onClick={() => { setFrontPos({ x: 0.5, y: 0.32 }); setLineWidth(130); setArtVertOffset(0.5); }}
                  className="flex items-center gap-1.5 text-sm text-black hover:text-gray-600 transition-colors w-fit"
                >
                  <RefreshCw className="w-4 h-4" />
                  位置リセット
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold tracking-widest uppercase text-black mb-1">裏面 BACK</p>
              <p className="text-xs text-black mb-3">
                {backMode === "shirt" ? "ドラッグ: 絵の位置移動 / クリック: 拡大" : "ドラッグ: 絵の表示範囲 / クリック: 拡大"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div>
                <div className="relative">
                  <div
                    className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-gray-50"
                    style={{ width: "100%", aspectRatio: `${BACK_CW} / ${BACK_CH}` }}
                  >
                    <canvas
                      ref={backRef}
                      style={{ width: "100%", height: "100%", display: "block", cursor: "grab", touchAction: "none" }}
                      onMouseDown={onBackDown}
                      onMouseMove={onBackMove}
                      onMouseUp={onBackUp}
                      onMouseLeave={onBackUp}
                      onTouchStart={onBackDown}
                      onTouchMove={onBackMove}
                      onTouchEnd={onBackUp}
                    />
                  </div>
                  <button
                    onClick={() => { setModalImg(backRef.current?.toDataURL("image/png") ?? null); setModalTransparentImg(getBackTransparentPng()); }}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-2 shadow transition-colors"
                    title="拡大・ダウンロード"
                  >
                    <Download className="w-4 h-4 text-black" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-black tracking-wider">ロゴ</span>
                  <button
                    onClick={() => setLabelVisible((v) => !v)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${labelVisible ? "bg-black text-white border-black" : "bg-white text-black border-gray-300 hover:border-gray-500"}`}
                  >
                    {labelVisible ? "ON" : "OFF"}
                  </button>
                  {labelVisible && (
                    <>
                      <div className="flex rounded-full border border-gray-300 overflow-hidden text-xs">
                        <button onClick={() => setLabelLang("en")} className={`px-3 py-1 transition-colors ${labelLang === "en" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}`}>EN</button>
                        <button onClick={() => setLabelLang("fr")} className={`px-3 py-1 transition-colors ${labelLang === "fr" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}`}>FR</button>
                      </div>
                      <div className="flex items-center gap-3 ml-1">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-black w-5">←→</span>
                            <input type="range" min={-400} max={150} value={labelOffset.x}
                              onChange={(e) => setLabelOffset((p) => ({ ...p, x: Number(e.target.value) }))}
                              className="w-24 accent-black" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-black w-5">↑↓</span>
                            <input type="range" min={-200} max={200} value={labelOffset.y}
                              onChange={(e) => setLabelOffset((p) => ({ ...p, y: Number(e.target.value) }))}
                              className="w-24 accent-black" />
                          </div>
                        </div>
                        <button
                          onClick={() => setLabelOffset({ x: 0, y: 0 })}
                          className="flex items-center gap-1.5 text-xs text-black hover:text-gray-600 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          reset
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center gap-4">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setBackMode("shirt")}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      backMode === "shirt" ? "bg-black text-white border-black" : "bg-white text-black border-gray-300 hover:border-black"
                    }`}
                  >
                    シャツ位置を動かす
                  </button>
                  <button
                    onClick={() => setBackMode("art")}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      backMode === "art" ? "bg-black text-white border-black" : "bg-white text-black border-gray-300 hover:border-black"
                    }`}
                  >
                    絵の範囲を動かす
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-black whitespace-nowrap">プリントサイズ</span>
                  <input
                    type="range" min={50} max={200} step={5} value={Math.round(designScale * 100)}
                    onChange={(e) => setDesignScale(Number(e.target.value) / 100)}
                    className="w-28 accent-black"
                  />
                  <span className="text-xs text-black w-8">{Math.round(designScale * 100)}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-black whitespace-nowrap">絵のズーム</span>
                  <input
                    type="range" min={50} max={300} step={5} value={Math.round(cropScale * 100)}
                    onChange={(e) => setCropScale(Number(e.target.value) / 100)}
                    className="w-28 accent-black"
                  />
                  <span className="text-xs text-black w-8">{Math.round(cropScale * 100)}%</span>
                </div>

                <button
                  onClick={() => { setBackPos({ x: 0.5, y: 0.38 }); setArtOffset({ x: 0, y: 0 }); setDesignScale(1); setCropScale(1); }}
                  className="flex items-center gap-1.5 text-sm text-black hover:text-gray-600 transition-colors w-fit"
                >
                  <RefreshCw className="w-4 h-4" />
                  リセット
                </button>
              </div>
            </div>

          {selectedArtId != null && (
            <div className="mt-16 flex justify-center">
              <button
                onClick={() => setOrderOpen(true)}
                className="px-14 py-4 border border-black text-black bg-white text-sm tracking-[0.5em] font-light hover:bg-black hover:text-white transition-all duration-500"
              >
                注文する
              </button>
            </div>
          )}

          {artDetailUrl && selectedArtItem && (
            <a
              href={artDetailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-32 mb-12 group flex flex-col sm:flex-row overflow-hidden rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="w-full h-72 sm:h-auto sm:w-52 md:w-72 flex-shrink-0">
                <img src={selectedArtItem.imageUrl} alt={selectedArtItem.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between px-7 py-7 sm:px-10 sm:py-9">
                <div>
                  <p className="text-xs tracking-[0.35em] uppercase text-black mb-3">使用した作品</p>
                  <p className="text-lg sm:text-2xl font-light tracking-widest text-black mb-4 leading-snug">{selectedArtItem.title}</p>
                  {selectedArtItem.description && (
                    <p className="text-xs text-black leading-relaxed tracking-wide line-clamp-3">{selectedArtItem.description}</p>
                  )}
                </div>
                <p className="text-[10px] text-black tracking-[0.2em] mt-6">作品を見る →</p>
              </div>
              <div className="flex-shrink-0 flex flex-col items-center justify-center gap-2 px-6 py-6 sm:px-8 border-t sm:border-t-0 sm:border-l border-gray-200">
                <div className="bg-gray-50 rounded p-1.5">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(artDetailUrl)}`}
                    alt="QR"
                    className="w-16 h-16 sm:w-20 sm:h-20"
                  />
                </div>
              </div>
            </a>
          )}
          </>
        )}
      </div>
      {modalImg && <ImageModal src={modalImg} transparentSrc={modalTransparentImg ?? undefined} onClose={() => { setModalImg(null); setModalTransparentImg(null); }} />}
      {orderOpen && (
        <OrderModal
          imageDataUrl={frontRef.current?.toDataURL("image/png") ?? ""}
          imageDataUrl2={backRef.current?.toDataURL("image/png") ?? null}
          transparentDataUrl={getFrontTransparentPng()}
          transparentDataUrl2={getBackTransparentPng()}
          productName="PRODUCT 2"
          artworkTitle={selectedArtItem?.title}
          onClose={() => setOrderOpen(false)}
        />
      )}
    </div>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const ch of text.split("")) {
    const test = current + ch;
    if (ctx.measureText(test).width > maxWidth && current.length > 0) {
      lines.push(current);
      current = ch;
    } else {
      current = test;
    }
    if (ch === "\n") { lines.push(current.replace(/\n$/, "")); current = ""; }
  }
  if (current) lines.push(current);
  return lines;
}
