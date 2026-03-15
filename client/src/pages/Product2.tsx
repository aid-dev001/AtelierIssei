import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import ScrollToTopLink from "@/components/ScrollToTopLink";

type ArtworkItem = { id: number; title: string; imageUrl: string };

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

  const [selectedArtId, setSelectedArtId] = useState<number | null>(null);
  const [artImg, setArtImg] = useState<HTMLImageElement | null>(null);

  const [frontShirtImg, setFrontShirtImg] = useState<HTMLImageElement | null>(null);
  const [backShirtImg, setBackShirtImg] = useState<HTMLImageElement | null>(null);
  const [frontBlackShirtImg, setFrontBlackShirtImg] = useState<HTMLImageElement | null>(null);
  const [backBlackShirtImg, setBackBlackShirtImg] = useState<HTMLImageElement | null>(null);
  const [tshirtColor, setTshirtColor] = useState<"white" | "black">("white");

  const [lang, setLang] = useState<"ja" | "en" | "fr">("ja");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [customText, setCustomText] = useState(PHRASES[0].ja);

  const [frontPos, setFrontPos] = useState({ x: 0.5, y: 0.42 });
  const [lineWidth, setLineWidth] = useState(320);

  const [backPos, setBackPos] = useState({ x: 0.5, y: 0.38 });
  const [designScale, setDesignScale] = useState(1.0);
  const [cropScale, setCropScale] = useState(1.0);
  const [artOffset, setArtOffset] = useState({ x: 0, y: 0 });
  const [backMode, setBackMode] = useState<"shirt" | "art">("shirt");

  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const FRONT_CW = 1043;
  const FRONT_CH = 1024;
  const BACK_CW = 976;
  const BACK_CH = 1079;
  const BACK_SQUARE_BASE = 300;
  const LINE_H = 7;

  const frontRef = useRef<HTMLCanvasElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fillSectionRef = useRef<HTMLDivElement>(null);

  const frontDragging = useRef(false);
  const frontDragScreen = useRef({ x: 0, y: 0 });
  const frontDragStartPos = useRef({ x: 0, y: 0 });

  const backDragging = useRef(false);
  const backDragScreen = useRef({ x: 0, y: 0 });
  const backDragStartPos = useRef({ x: 0, y: 0 });
  const backDragStartOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    loadImg("/product/tshirt2-front.jpg").then(setFrontShirtImg);
    loadImg("/product/tshirt2-back.jpg").then(setBackShirtImg);
    loadImg("/product/tshirt2-black-front.jpg").then(setFrontBlackShirtImg);
    loadImg("/product/tshirt2-black-back.jpg").then(setBackBlackShirtImg);
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
    if (selectedArtId) {
      const idx = Math.floor(Math.random() * PHRASES.length);
      setPhraseIdx(idx);
      setCustomText(PHRASES[idx][lang]);
    }
  }, [selectedArtId]);

  useEffect(() => {
    setCustomText(PHRASES[phraseIdx][lang]);
  }, [phraseIdx, lang]);

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

    const cx = frontPos.x * FRONT_CW;
    const ty = frontPos.y * FRONT_CH;
    const lx = cx - lineWidth / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(lx, ty, lineWidth, LINE_H);
    ctx.clip();
    const scale = lineWidth / artImg.width;
    const dh = artImg.height * scale;
    const dy = ty + (LINE_H - dh) / 2;
    ctx.globalCompositeOperation = tshirtColor === "black" ? "screen" : "multiply";
    ctx.drawImage(artImg, lx, dy, lineWidth, dh);
    ctx.restore();

    const text = customText;
    if (text) {
      ctx.save();
      ctx.globalCompositeOperation = tshirtColor === "black" ? "screen" : "multiply";
      ctx.font = "bold 18px 'Helvetica Neue', Arial, sans-serif";
      ctx.fillStyle = tshirtColor === "black" ? "#ffffff" : "#1a1a1a";
      ctx.textAlign = "left";
      const maxW = lineWidth * 1.6;
      const lines = wrapText(ctx, text, maxW);
      lines.forEach((line, i) => {
        ctx.fillText(line, lx, ty + LINE_H + 26 + i * 26);
      });
      ctx.restore();
    }
  }, [frontShirtImg, frontBlackShirtImg, artImg, frontPos, lineWidth, customText, tshirtColor]);

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
  }, [backShirtImg, backBlackShirtImg, artImg, backPos, designScale, cropScale, artOffset, tshirtColor]);

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

  const onFrontDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    frontDragging.current = true;
    frontDragScreen.current = getClientXY(e);
    frontDragStartPos.current = { ...frontPos };
  };
  const onFrontMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!frontDragging.current || !frontRef.current) return;
    const { x, y } = getClientXY(e);
    const rect = frontRef.current.getBoundingClientRect();
    const dx = (x - frontDragScreen.current.x) / rect.width;
    const dy = (y - frontDragScreen.current.y) / rect.height;
    setFrontPos({
      x: Math.max(0.1, Math.min(0.9, frontDragStartPos.current.x + dx)),
      y: Math.max(0.05, Math.min(0.85, frontDragStartPos.current.y + dy)),
    });
  };
  const onFrontUp = () => { frontDragging.current = false; };

  const onBackDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    backDragging.current = true;
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
  const onBackUp = () => { backDragging.current = false; };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 tracking-wider text-center">PRODUCT</h1>
        <p className="text-center text-xs tracking-[0.2em] uppercase text-black mb-6">Art you can wear</p>

        <div className="flex justify-center gap-8 mb-10 border-b border-gray-200 pb-4">
          <ScrollToTopLink href="/product" className="text-sm tracking-widest text-gray-400 hover:text-black transition-colors">
            PRODUCT 1
          </ScrollToTopLink>
          <span className="text-sm tracking-widest text-black border-b-2 border-black pb-1">
            PRODUCT 2
          </span>
        </div>

        <div className="max-w-xl mx-auto mb-14 text-center space-y-4">
          <p className="text-sm leading-relaxed tracking-wide text-black">
            絵を選び、言葉を選ぶ。
          </p>
          <p className="text-sm leading-relaxed tracking-wide text-black">
            ISSEIの作品からひとつを選ぶと、絵のストロークが横線となり、<br className="hidden md:block" />
            詩のような言葉とともにTシャツへと転写されます。
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-10">
          <span className="text-xs tracking-wider text-black">Tシャツカラー</span>
          <button
            onClick={() => setTshirtColor("white")}
            className={`w-8 h-8 rounded-full border-2 bg-white transition-all ${tshirtColor === "white" ? "border-black shadow-md scale-110" : "border-gray-300"}`}
          />
          <button
            onClick={() => setTshirtColor("black")}
            className={`w-8 h-8 rounded-full border-2 bg-black transition-all ${tshirtColor === "black" ? "border-gray-400 shadow-md scale-110" : "border-gray-600"}`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          <div ref={fillSectionRef} className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">1</span>
              <span className="font-semibold text-sm tracking-wider">絵を選ぶ</span>
              <span className="text-xs text-black">ISSEIの作品から選択</span>
            </div>
            {artworks.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center border rounded-xl">作品がありません</p>
            ) : (
              <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
                <div className="grid grid-cols-3 gap-2 pr-1">
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

          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">2</span>
              <span className="font-semibold text-sm tracking-wider">言葉を選ぶ・編集する</span>
            </div>

            <div className="flex gap-2 mb-4">
              {(["ja", "en", "fr"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1 text-xs rounded-full border transition-all ${
                    lang === l ? "bg-black text-white border-black" : "bg-white text-black border-gray-300 hover:border-black"
                  }`}
                >
                  {l === "ja" ? "日本語" : l === "en" ? "English" : "Français"}
                </button>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap mb-4">
              {PHRASES.map((_, i) => (
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
              className="border border-gray-300 rounded-xl p-3 text-sm leading-relaxed resize-none focus:outline-none focus:border-black"
              rows={3}
              placeholder="テキストを編集できます"
            />

            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-black whitespace-nowrap">横線の幅</span>
              <input
                type="range" min={100} max={600} step={10} value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="w-28 accent-black"
              />
              <span className="text-xs text-black w-10">{lineWidth}px</span>
            </div>
          </div>
        </div>

        {artImg && (
          <>
            <div ref={previewRef} className="mt-16 pt-8 mb-6">
              <p className="text-xs font-semibold tracking-widest uppercase text-black mb-1">表面 FRONT</p>
              <p className="text-xs text-black mb-3">ドラッグで横線＋テキストの位置を移動できます</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div>
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
              </div>

              <div className="flex flex-col justify-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-black whitespace-nowrap">横線の幅</span>
                  <input
                    type="range" min={100} max={600} step={10} value={lineWidth}
                    onChange={(e) => setLineWidth(Number(e.target.value))}
                    className="w-28 accent-black"
                  />
                  <span className="text-xs text-black w-10">{lineWidth}px</span>
                </div>
                <button
                  onClick={() => setFrontPos({ x: 0.5, y: 0.42 })}
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
                {backMode === "shirt" ? "ドラッグで絵の位置を移動できます" : "ドラッグで絵の表示範囲を移動できます"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div>
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
          </>
        )}
      </div>
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
