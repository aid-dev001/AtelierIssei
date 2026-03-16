import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, X, RefreshCw, Trash2, Eye, EyeOff } from "lucide-react";
import ScrollToTopLink from "@/components/ScrollToTopLink";

function cropTextFromShirt(
  shirtImg: HTMLImageElement,
  canvasW: number,
  canvasH: number,
  shirtColor: "white" | "black"
): { canvas: HTMLCanvasElement; x: number; y: number } {
  const TX1 = 0.50, TX2 = 0.92;
  const TY1 = 0.612, TY2 = 0.648;
  const sw = shirtImg.naturalWidth, sh = shirtImg.naturalHeight;
  const cropX = Math.round(sw * TX1), cropY = Math.round(sh * TY1);
  const cropW = Math.round(sw * (TX2 - TX1)), cropH = Math.round(sh * (TY2 - TY1));
  const temp = document.createElement("canvas");
  temp.width = cropW; temp.height = cropH;
  const tc = temp.getContext("2d")!;
  tc.drawImage(shirtImg, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  const id = tc.getImageData(0, 0, cropW, cropH);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
    d[i + 3] = shirtColor === "white"
      ? Math.max(0, Math.min(255, Math.round((200 - lum) * 5)))
      : Math.max(0, Math.min(255, Math.round((lum - 50) * 5)));
  }
  tc.putImageData(id, 0, 0);
  const scale = canvasW / sw;
  const out = document.createElement("canvas");
  out.width = Math.round(cropW * scale); out.height = Math.round(cropH * scale);
  out.getContext("2d")!.drawImage(temp, 0, 0, out.width, out.height);
  return { canvas: out, x: TX1 * canvasW, y: TY1 * canvasH };
}

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

// コンポーネント外で定義してリマウントを防ぐ
function SliderRow({
  label, value, min, max, step, onChange, fmt,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; fmt?: (v: number) => string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-black whitespace-nowrap w-10">{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-black"
      />
      <span className="text-xs text-gray-400 w-12 text-right">{fmt ? fmt(value) : value}</span>
    </div>
  );
}

type ArtworkItem = { id: number; title: string; imageUrl: string };

type ShapeItem = {
  id: string;
  type: "rect" | "triangle" | "circle";
  cx: number;
  cy: number;
  w: number;
  h: number;
  rotation: number;
};

const CW = 800;
const CH = 900;
const PAGE_SIZE = 12;
const CLICK_THRESHOLD = 6;
const SHIRT_L = 0.12;
const SHIRT_R = 0.88;
const SHIRT_T = 0.06;
const SHIRT_B = 0.95;

function clampShapeToShirt(s: ShapeItem): ShapeItem {
  const w = Math.min(s.w, SHIRT_R - SHIRT_L);
  const h = Math.min(s.h, SHIRT_B - SHIRT_T);
  const cx = Math.max(SHIRT_L + w / 2, Math.min(SHIRT_R - w / 2, s.cx));
  const cy = Math.max(SHIRT_T + h / 2, Math.min(SHIRT_B - h / 2, s.cy));
  return { ...s, w, h, cx, cy };
}

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

function drawShapeOnCtx(ctx: CanvasRenderingContext2D, shape: ShapeItem, mode: "fill" | "stroke") {
  const pw = shape.w * CW;
  const ph = shape.h * CH;
  ctx.save();
  ctx.translate(shape.cx * CW, shape.cy * CH);
  ctx.rotate((shape.rotation * Math.PI) / 180);
  ctx.beginPath();
  if (shape.type === "rect") {
    ctx.rect(-pw / 2, -ph / 2, pw, ph);
  } else if (shape.type === "circle") {
    ctx.arc(0, 0, Math.min(pw, ph) / 2, 0, Math.PI * 2);
  } else {
    ctx.moveTo(0, -ph / 2);
    ctx.lineTo(pw / 2, ph / 2);
    ctx.lineTo(-pw / 2, ph / 2);
    ctx.closePath();
  }
  if (mode === "fill") {
    ctx.fillStyle = "black";
    ctx.fill();
  } else {
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
  }
  ctx.restore();
}

function buildMask(shapes: ShapeItem[], mode: "and" | "or"): HTMLCanvasElement {
  const mask = document.createElement("canvas");
  mask.width = CW;
  mask.height = CH;
  const ctx = mask.getContext("2d")!;

  if (mode === "or") {
    // 全形の合計 (union)
    shapes.forEach((s) => drawShapeOnCtx(ctx, s, "fill"));
  } else {
    // 全形の交差 (intersection)
    // まず全体を塗りつぶし、形ごとに destination-in で絞る
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CW, CH);
    shapes.forEach((s) => {
      const tmp = document.createElement("canvas");
      tmp.width = CW;
      tmp.height = CH;
      const tmpCtx = tmp.getContext("2d")!;
      drawShapeOnCtx(tmpCtx, s, "fill");
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(tmp, 0, 0);
    });
  }
  return mask;
}

function isHit(shape: ShapeItem, nx: number, ny: number): boolean {
  const dx = nx * CW - shape.cx * CW;
  const dy = ny * CH - shape.cy * CH;
  const rad = -(shape.rotation * Math.PI) / 180;
  const lx = dx * Math.cos(rad) - dy * Math.sin(rad);
  const ly = dx * Math.sin(rad) + dy * Math.cos(rad);
  return Math.abs(lx) <= (shape.w * CW) / 2 + 8 && Math.abs(ly) <= (shape.h * CH) / 2 + 8;
}

export default function Product3() {
  const { data: artworks = [] } = useQuery<ArtworkItem[]>({
    queryKey: ["/api/artworks"],
    queryFn: async () => (await fetch("/api/artworks")).json(),
  });

  const [selectedArtId, setSelectedArtId] = useState<number | null>(null);
  const [artImg, setArtImg] = useState<HTMLImageElement | null>(null);
  const [shirtImg, setShirtImg] = useState<HTMLImageElement | null>(null);
  const [blackShirtImg, setBlackShirtImg] = useState<HTMLImageElement | null>(null);
  const [shirtLoaded, setShirtLoaded] = useState(false);
  const [tshirtColor, setTshirtColor] = useState<"white" | "black">("white");
  const [shapes, setShapes] = useState<ShapeItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [shapeMode, setShapeMode] = useState<"and" | "or">("and");
  const [showOutline, setShowOutline] = useState(true);
  const [artOffsetX, setArtOffsetX] = useState(0);
  const [artOffsetY, setArtOffsetY] = useState(0);
  const [artRotation, setArtRotation] = useState(0);
  const [artScale, setArtScale] = useState(1);
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [modalTransparentImg, setModalTransparentImg] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const artworkSectionRef = useRef<HTMLDivElement>(null);
  const prevShapesEmpty = useRef(true);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragging = useRef(false);
  const didMove = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ cx: 0.5, cy: 0.4 });
  const lastHitId = useRef<string | null>(null);

  useEffect(() => {
    Promise.all([
      loadImg("/product/tshirt-base.jpg"),
      loadImg("/product/tshirt-black-base.jpg"),
    ]).then(([w, b]) => {
      setShirtImg(w);
      setBlackShirtImg(b);
      setShirtLoaded(true);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedArtId) return;
    const art = artworks.find((a) => a.id === selectedArtId);
    if (!art) return;
    loadImg(art.imageUrl).then(setArtImg).catch(() => {});
  }, [selectedArtId, artworks]);

  useEffect(() => {
    const isEmpty = shapes.length === 0;
    if (!isEmpty && prevShapesEmpty.current && window.innerWidth < 1024) {
      setTimeout(() => {
        artworkSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
    prevShapesEmpty.current = isEmpty;
  }, [shapes]);

  useEffect(() => {
    if (!artImg || shapes.length === 0) return;
    if (window.innerWidth >= 1024) return;
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      canvasContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
  }, [artImg, shapes, artOffsetX, artOffsetY, artScale, artRotation]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const shirt = tshirtColor === "black" ? blackShirtImg : shirtImg;
    if (!canvas || !shirt) return;
    const ctx = canvas.getContext("2d")!;

    ctx.clearRect(0, 0, CW, CH);
    ctx.drawImage(shirt, 0, 0, CW, CH);

    if (artImg && shapes.length > 0) {
      const off = document.createElement("canvas");
      off.width = CW;
      off.height = CH;
      const offCtx = off.getContext("2d")!;

      // 絵をカバーモード + 位置・回転・スケール適用
      const ar = artImg.width / artImg.height;
      const cr = CW / CH;
      let dw: number, dh: number;
      if (ar > cr) { dh = CH; dw = dh * ar; }
      else { dw = CW; dh = dw / ar; }

      offCtx.save();
      offCtx.translate(CW / 2 + artOffsetX * CW, CH / 2 + artOffsetY * CH);
      offCtx.rotate((artRotation * Math.PI) / 180);
      offCtx.scale(artScale, artScale);
      offCtx.drawImage(artImg, -dw / 2, -dh / 2, dw, dh);
      offCtx.restore();

      // AND/OR マスクを生成して適用
      const mask = buildMask(shapes, shapeMode);
      offCtx.globalCompositeOperation = "destination-in";
      offCtx.drawImage(mask, 0, 0);

      ctx.drawImage(off, 0, 0);
    }

    // 選択枠
    if (showOutline && selectedId) {
      const sel = shapes.find((s) => s.id === selectedId);
      if (sel) drawShapeOnCtx(ctx, sel, "stroke");
    }
  }, [shirtImg, blackShirtImg, artImg, shapes, shapeMode, selectedId, showOutline, tshirtColor, artOffsetX, artOffsetY, artRotation, artScale]);

  useEffect(() => { render(); }, [render]);

  const getTransparentPng = useCallback((): string | null => {
    if (!artImg || shapes.length === 0) return null;
    const off = document.createElement("canvas");
    off.width = CW;
    off.height = CH;
    const offCtx = off.getContext("2d")!;
    const ar = artImg.width / artImg.height;
    const cr = CW / CH;
    let dw: number, dh: number;
    if (ar > cr) { dh = CH; dw = dh * ar; }
    else { dw = CW; dh = dw / ar; }
    offCtx.save();
    offCtx.translate(CW / 2 + artOffsetX * CW, CH / 2 + artOffsetY * CH);
    offCtx.rotate((artRotation * Math.PI) / 180);
    offCtx.scale(artScale, artScale);
    offCtx.drawImage(artImg, -dw / 2, -dh / 2, dw, dh);
    offCtx.restore();
    const mask = buildMask(shapes, shapeMode);
    offCtx.globalCompositeOperation = "destination-in";
    offCtx.drawImage(mask, 0, 0);
    offCtx.globalCompositeOperation = "source-over";
    const shirtForText = tshirtColor === "black" ? blackShirtImg : shirtImg;
    if (shirtForText) {
      const { canvas: tc, x: tx, y: ty } = cropTextFromShirt(shirtForText, CW, CH, tshirtColor);
      offCtx.drawImage(tc, tx, ty);
    }
    return off.toDataURL("image/png");
  }, [artImg, shapes, shapeMode, artOffsetX, artOffsetY, artRotation, artScale, tshirtColor, shirtImg, blackShirtImg]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        const tag = (document.activeElement as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        setShapes((prev) => prev.filter((s) => s.id !== selectedId));
        setSelectedId(null);
        lastHitId.current = null;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const { x, y } = getClientXY(e);
    const nx = (x - rect.left) / rect.width;
    const ny = (y - rect.top) / rect.height;

    let hit: ShapeItem | null = null;
    for (let i = shapes.length - 1; i >= 0; i--) {
      if (isHit(shapes[i], nx, ny)) { hit = shapes[i]; break; }
    }

    dragging.current = true;
    didMove.current = false;
    dragStart.current = { x, y };

    if (hit) {
      setSelectedId(hit.id);
      dragStartPos.current = { cx: hit.cx, cy: hit.cy };
      lastHitId.current = hit.id;
    } else {
      setSelectedId(null);
      lastHitId.current = null;
    }
  };

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging.current || !lastHitId.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getClientXY(e);
    if (Math.abs(x - dragStart.current.x) > CLICK_THRESHOLD || Math.abs(y - dragStart.current.y) > CLICK_THRESHOLD) {
      didMove.current = true;
    }
    if (!didMove.current) return;
    const rect = canvas.getBoundingClientRect();
    const id = lastHitId.current;
    const ndx = (x - dragStart.current.x) / rect.width;
    const ndy = (y - dragStart.current.y) / rect.height;
    setShapes((prev) =>
      prev.map((s) => s.id !== id ? s : clampShapeToShirt({
        ...s,
        cx: dragStartPos.current.cx + ndx,
        cy: dragStartPos.current.cy + ndy,
      }))
    );
  };

  const onUp = () => {
    if (dragging.current && !didMove.current && lastHitId.current === null) {
      setModalImg(canvasRef.current?.toDataURL("image/png") ?? null);
      setModalTransparentImg(getTransparentPng());
    }
    dragging.current = false;
  };

  const addShape = (type: "rect" | "triangle" | "circle") => {
    const id = `s${Date.now()}`;
    const shape = clampShapeToShirt({ id, type, cx: 0.5, cy: 0.4, w: 0.25, h: type === "circle" ? 0.25 : 0.22, rotation: 0 });
    setShapes((prev) => [...prev, shape]);
    setSelectedId(id);
    lastHitId.current = id;
  };

  const removeShape = (id: string) => {
    setShapes((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) { setSelectedId(null); lastHitId.current = null; }
  };

  const updateSelected = (patch: Partial<ShapeItem>) => {
    setShapes((prev) =>
      prev.map((s) => s.id === selectedId ? clampShapeToShirt({ ...s, ...patch }) : s)
    );
  };

  const selectedShape = shapes.find((s) => s.id === selectedId);
  const totalPages = Math.ceil(artworks.length / PAGE_SIZE);
  const visibleArtworks = artworks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

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
          <ScrollToTopLink href="/product" className="text-sm tracking-widest text-gray-400 hover:text-black transition-colors">PRODUCT 1</ScrollToTopLink>
          <ScrollToTopLink href="/product2" className="text-sm tracking-widest text-gray-400 hover:text-black transition-colors">PRODUCT 2</ScrollToTopLink>
          <span className="text-sm tracking-widest text-black border-b-2 border-black pb-1">PRODUCT 3</span>
        </div>

        <div className="max-w-xl mx-auto mb-12 text-center space-y-4">
          <p className="text-sm leading-relaxed tracking-wide text-black">形を選び、絵を選ぶ。</p>
          <p className="text-sm leading-relaxed tracking-wide text-black">
            ISSEIの作品を四角・丸・三角の窓に映し出す、<br className="hidden md:block" />
            あなただけのTシャツデザインを。
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Canvas */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-xs text-black tracking-wider">FRONT</span>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setShowOutline((v) => !v)}
                  className="p-1.5 rounded-full border border-gray-200 hover:border-black transition-colors"
                  title={showOutline ? "点線を隠す" : "点線を表示"}
                >
                  {showOutline
                    ? <Eye className="w-3.5 h-3.5 text-black" />
                    : <EyeOff className="w-3.5 h-3.5 text-gray-400" />}
                </button>
                {(["white", "black"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setTshirtColor(c)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      tshirtColor === c ? "bg-black text-white border-black" : "bg-white text-black border-gray-300 hover:border-black"
                    }`}
                  >
                    {c === "white" ? "WHITE" : "BLACK"}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-sm bg-gray-50">
              {!shirtLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                  <p className="text-xs text-gray-400 tracking-wider">読み込み中...</p>
                </div>
              )}
              <canvas
                ref={canvasRef}
                width={CW}
                height={CH}
                style={{ width: "100%", aspectRatio: `${CW} / ${CH}` }}
                className="cursor-crosshair touch-none select-none"
                onMouseDown={onDown}
                onMouseMove={onMove}
                onMouseUp={onUp}
                onMouseLeave={onUp}
                onTouchStart={onDown}
                onTouchMove={onMove}
                onTouchEnd={onUp}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">形をドラッグで移動 · 空白クリックで拡大</p>
          </div>

          {/* Controls */}
          <div className="w-full lg:w-80 flex flex-col gap-6">

            {/* ① 形を調整する */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">1</span>
                <span className="font-semibold text-sm tracking-wider">形を調整する</span>
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">形を追加<span className="ml-2 text-gray-400">（何個でも重ねられます）</span></p>
                <div className="flex gap-2">
                  <button onClick={() => addShape("rect")} className="flex-1 py-2 text-xs border border-gray-300 rounded-xl hover:border-black transition-colors">＋ 長方形</button>
                  <button onClick={() => addShape("circle")} className="flex-1 py-2 text-xs border border-gray-300 rounded-xl hover:border-black transition-colors">＋ 丸</button>
                  <button onClick={() => addShape("triangle")} className="flex-1 py-2 text-xs border border-gray-300 rounded-xl hover:border-black transition-colors">＋ 三角</button>
                </div>
              </div>

              {shapes.length > 1 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">複数の形の表示</p>
                  <div className="flex gap-2">
                    {(["and", "or"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setShapeMode(m)}
                        className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${
                          shapeMode === m ? "bg-black text-white border-black" : "bg-white text-black border-gray-300 hover:border-black"
                        }`}
                      >
                        {m === "and" ? "AND（重なり）" : "OR（すべて）"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {shapes.length > 0 && (
                <div className="space-y-1 mb-3">
                  {shapes.map((s, i) => (
                    <div
                      key={s.id}
                      onClick={() => { setSelectedId(s.id); lastHitId.current = s.id; }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        selectedId === s.id ? "bg-black text-white" : "bg-gray-50 hover:bg-gray-100 text-black"
                      }`}
                    >
                      <span className="text-xs">
                        {i + 1}. {s.type === "rect" ? "長方形" : s.type === "circle" ? "丸" : "三角"}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeShape(s.id); }}
                        className={`transition-colors ${selectedId === s.id ? "text-white/60 hover:text-white" : "text-gray-400 hover:text-red-500"}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {shapes.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-3">上のボタンで形を追加してください</p>
              )}

              {selectedShape && (
                <div className="bg-gray-50 rounded-xl p-3 space-y-3">
                  <p className="text-xs text-gray-500">サイズ・回転</p>
                  {selectedShape.type === "circle" ? (
                    <>
                      <SliderRow label="サイズ" value={selectedShape.w} min={0.05} max={0.7} step={0.01}
                        onChange={(v) => {
                          const ratio = selectedShape.w > 0 ? selectedShape.h / selectedShape.w : 1;
                          updateSelected({ w: v, h: v * ratio });
                        }}
                        fmt={(v) => String(Math.round(v * 100))}
                      />
                      <SliderRow
                        label="楕円"
                        value={selectedShape.w > 0 ? selectedShape.h / selectedShape.w : 1}
                        min={0.3} max={3.0} step={0.05}
                        onChange={(v) => updateSelected({ h: selectedShape.w * v })}
                        fmt={(v) => v.toFixed(2)}
                      />
                    </>
                  ) : (
                    <>
                      <SliderRow label="幅" value={selectedShape.w} min={0.05} max={0.7} step={0.01}
                        onChange={(v) => updateSelected({ w: v })} fmt={(v) => String(Math.round(v * 100))}
                      />
                      <SliderRow label="高さ" value={selectedShape.h} min={0.05} max={0.7} step={0.01}
                        onChange={(v) => updateSelected({ h: v })} fmt={(v) => String(Math.round(v * 100))}
                      />
                    </>
                  )}
                  <SliderRow label="回転" value={selectedShape.rotation} min={-180} max={180} step={1}
                    onChange={(v) => updateSelected({ rotation: v })} fmt={(v) => `${v}°`}
                  />
                </div>
              )}

              <button
                onClick={() => {
                  setShapes([]);
                  setSelectedId(null);
                  lastHitId.current = null;
                  setShapeMode("and");
                  setArtOffsetX(0); setArtOffsetY(0); setArtRotation(0); setArtScale(1);
                }}
                className="flex items-center gap-1.5 text-sm text-black hover:text-gray-600 transition-colors w-fit mt-4"
              >
                <RefreshCw className="w-4 h-4" />
                リセット
              </button>
            </div>

            {/* ② 絵を選ぶ */}
            {shirtLoaded && <div ref={artworkSectionRef} className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">2</span>
                <span className="font-semibold text-sm tracking-wider">絵を選ぶ</span>
                <span className="text-xs text-black">ISSEIの作品から選択</span>
              </div>

              {artworks.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center border rounded-xl">作品がありません</p>
              ) : (
                <div className="overflow-y-auto" style={{ maxHeight: "220px" }}>
                  <div className="grid grid-cols-4 gap-2 pr-1">
                    {visibleArtworks.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setSelectedArtId(a.id)}
                        className={`rounded-lg overflow-hidden border-2 transition-all ${
                          selectedArtId === a.id ? "border-black" : "border-transparent hover:border-gray-300"
                        }`}
                      >
                        <img src={a.imageUrl} alt={a.title} className="w-full aspect-square object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-3">
                  <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 text-xs rounded border disabled:opacity-30">‹</button>
                  <span className="text-xs py-1">{page + 1} / {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="px-3 py-1 text-xs rounded border disabled:opacity-30">›</button>
                </div>
              )}

              {artImg && (
                <div className="mt-3 bg-gray-50 rounded-xl p-3 space-y-3">
                  <p className="text-xs text-gray-500">絵の位置・拡縮・回転</p>
                  <SliderRow label="縦" value={artOffsetY} min={-0.5} max={0.5} step={0.01}
                    onChange={setArtOffsetY} fmt={(v) => `${Math.round(v * 100)}`}
                  />
                  <SliderRow label="横" value={artOffsetX} min={-0.5} max={0.5} step={0.01}
                    onChange={setArtOffsetX} fmt={(v) => `${Math.round(v * 100)}`}
                  />
                  <SliderRow label="大きさ" value={artScale} min={0.3} max={3} step={0.05}
                    onChange={setArtScale} fmt={(v) => `${Math.round(v * 100)}%`}
                  />
                  <SliderRow label="回転" value={artRotation} min={-180} max={180} step={1}
                    onChange={setArtRotation} fmt={(v) => `${v}°`}
                  />
                </div>
              )}
            </div>}

          </div>
        </div>
      </div>

      {modalImg && <ImageModal src={modalImg} transparentSrc={modalTransparentImg ?? undefined} onClose={() => { setModalImg(null); setModalTransparentImg(null); }} />}
    </div>
  );
}
