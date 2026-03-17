import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Download, X } from "lucide-react";
import ScrollToTopLink from "@/components/ScrollToTopLink";
import OrderModal from "@/components/OrderModal";
import { injectDpi300 } from "@/lib/pngDpi";

type ProductShape = { id: number; title: string; imageUrl: string };
type ArtworkItem = { id: number; title: string; imageUrl: string; description?: string };

const PAGE_SIZE = 12;

function cropTextFromShirt(
  shirtImg: HTMLImageElement,
  canvasW: number,
  canvasH: number,
  shirtColor: "white" | "black"
): { canvas: HTMLCanvasElement; x: number; y: number } {
  const TX1 = 0.44, TX2 = 0.97;
  const TY1 = 0.605, TY2 = 0.655;
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
      ? Math.max(0, Math.min(255, Math.round((150 - lum) * 10)))
      : Math.max(0, Math.min(255, Math.round((lum - 140) * 12)));
  }
  tc.putImageData(id, 0, 0);
  const scale = canvasW / sw;
  const out = document.createElement("canvas");
  out.width = Math.round(cropW * scale); out.height = Math.round(cropH * scale);
  out.getContext("2d")!.drawImage(temp, 0, 0, out.width, out.height);
  return { canvas: out, x: TX1 * canvasW, y: TY1 * canvasH };
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

function buildMask(img: HTMLImageElement, w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  const id = ctx.getImageData(0, 0, w, h);
  const d = id.data;
  const total = w * h;

  // Check if the image already has transparency (PNG with alpha channel)
  let hasTransparency = false;
  for (let i = 3; i < d.length; i += 4) {
    if (d[i] < 128) { hasTransparency = true; break; }
  }

  if (hasTransparency) {
    // Use alpha channel directly: transparent pixels = outside, opaque = inside
    for (let i = 0; i < total; i++) {
      d[i * 4 + 3] = d[i * 4 + 3] < 128 ? 0 : 255;
    }
  } else {
    // Flood-fill from edges: white pixels reachable from outside = background
    const isBackground = (p: number) => {
      const i = p * 4;
      return d[i] >= 220 && d[i + 1] >= 220 && d[i + 2] >= 220;
    };
    const outside = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0, tail = 0;
    const seed = (p: number) => {
      if (!outside[p] && isBackground(p)) { outside[p] = 1; queue[tail++] = p; }
    };
    for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
    for (let y = 1; y < h - 1; y++) { seed(y * w); seed(y * w + w - 1); }
    while (head < tail) {
      const p = queue[head++];
      const px = p % w;
      const py = (p / w) | 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = px + dx; const ny = py + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const n = ny * w + nx;
          if (!outside[n] && isBackground(n)) { outside[n] = 1; queue[tail++] = n; }
        }
      }
    }
    for (let i = 0; i < total; i++) {
      d[i * 4 + 3] = outside[i] ? 0 : 255;
    }
  }

  ctx.putImageData(id, 0, 0);
  return c;
}

const LABEL_TEXT_EN = "ISSEI – Wearable Abstraction";
const LABEL_TEXT_JA = "ISSEI – 着るアブストラクション";

function drawLabelOnCtx(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  labelImg: HTMLImageElement | null,
  labelVisible: boolean,
  labelLang: "en" | "ja",
  labelOffset: { x: number; y: number },
  color: "white" | "black"
) {
  if (!labelVisible) return;
  const defaultX = canvasW * 0.73;
  const defaultY = canvasH * 0.57;
  const lx = defaultX + labelOffset.x;
  const ly = defaultY + labelOffset.y;
  const scale = canvasW / 1600;
  if (labelImg) {
    const lw = 368 * 0.6 * scale;
    const lh = lw * (labelImg.naturalHeight / labelImg.naturalWidth);
    if (color === "black") ctx.filter = "invert(1)";
    ctx.drawImage(labelImg, lx - lw, ly - lh * 0.75, lw, lh);
    ctx.filter = "none";
  } else {
    const text = labelLang === "ja" ? LABEL_TEXT_JA : LABEL_TEXT_EN;
    const fs = Math.round(canvasW * 0.011);
    ctx.save();
    ctx.fillStyle = color === "black" ? "#ffffff" : "#1a1a1a";
    ctx.font = `300 ${fs}px 'Helvetica Neue', Helvetica, Arial, sans-serif`;
    ctx.textAlign = "right";
    ctx.letterSpacing = `${Math.round(canvasW * 0.0008)}px`;
    ctx.fillText(text, lx, ly);
    ctx.restore();
  }
}

function coverShirtText(ctx: CanvasRenderingContext2D, shirtImg: HTMLImageElement, W: number, H: number) {
  const TX1 = 0.44, TX2 = 0.97;
  const TY1 = 0.605, TY2 = 0.655;
  const sampleTY = 0.565;
  const sw = shirtImg.naturalWidth;
  const sh = shirtImg.naturalHeight;
  ctx.drawImage(
    shirtImg,
    Math.round(sw * TX1), Math.round(sh * sampleTY),
    Math.round(sw * (TX2 - TX1)), Math.round(sh * 0.025),
    W * TX1, H * TY1,
    W * (TX2 - TX1), H * (TY2 - TY1)
  );
}

function drawTshirt(
  canvas: HTMLCanvasElement,
  designCanvas: HTMLCanvasElement | null,
  baseImg: HTMLImageElement | null,
  blackImg: HTMLImageElement | null,
  color: "white" | "black",
  designScale: number,
  designPos: { x: number; y: number },
  labelImg: HTMLImageElement | null,
  labelVisible: boolean,
  labelLang: "en" | "ja",
  labelOffset: { x: number; y: number }
) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, W, H);

  const shirt = color === "white" ? baseImg : blackImg;
  if (shirt) {
    ctx.drawImage(shirt, 0, 0, W, H);
    coverShirtText(ctx, shirt, W, H);
  } else {
    ctx.fillStyle = color === "white" ? "#cccccc" : "#1a1a1a";
    ctx.fillRect(0, 0, W, H);
  }

  if (designCanvas && designCanvas.width > 0 && designCanvas.height > 0) {
    const aspect = designCanvas.width / designCanvas.height;
    const maxW = W * 0.38 * designScale;
    const maxH = H * 0.34 * designScale;
    let rw = maxW;
    let rh = rw / aspect;
    if (rh > maxH) { rh = maxH; rw = rh * aspect; }
    const dx = (W - rw) / 2 + designPos.x;
    const dy = H * 0.26 + designPos.y;
    ctx.globalCompositeOperation = color === "white" ? "multiply" : "screen";
    ctx.drawImage(designCanvas, dx, dy, rw, rh);
    ctx.globalCompositeOperation = "source-over";
  }

  drawLabelOnCtx(ctx, W, H, labelImg, labelVisible, labelLang, labelOffset, color);
}

function boostSat(r: number, g: number, b: number, factor: number): [number, number, number] {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === min) return [r, g, b];
  const l = (max + min) / 2;
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const ns = Math.min(1, s * factor);
  const q = l < 0.5 ? l * (1 + ns) : l + ns - l * ns;
  const p = 2 * l - q;
  const h2r = (pp: number, qq: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return pp + (qq - pp) * 6 * t;
    if (t < 1/2) return qq;
    if (t < 2/3) return pp + (qq - pp) * (2/3 - t) * 6;
    return pp;
  };
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h /= 6;
  return [h2r(p, q, h + 1/3), h2r(p, q, h), h2r(p, q, h - 1/3)];
}

async function simulateCmykOnCanvas(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] === 0) continue;
        const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
        const k = 1 - Math.max(r, g, b);
        if (k >= 1) { d[i] = d[i + 1] = d[i + 2] = 0; continue; }
        const c = (1 - r - k) / (1 - k);
        const m = (1 - g - k) / (1 - k);
        const y = (1 - b - k) / (1 - k);
        let ro = (1 - c) * (1 - k);
        let go = (1 - m) * (1 - k);
        let bo = (1 - y) * (1 - k);
        // Simulate dot gain: midtones darken slightly in CMYK print
        const gain = 0.12;
        ro = ro - ro * (1 - ro) * gain;
        go = go - go * (1 - go) * gain;
        bo = bo - bo * (1 - bo) * gain;
        d[i]     = Math.round(Math.max(0, Math.min(1, ro)) * 255);
        d[i + 1] = Math.round(Math.max(0, Math.min(1, go)) * 255);
        d[i + 2] = Math.round(Math.max(0, Math.min(1, bo)) * 255);
      }
      ctx.putImageData(id, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function ImageModal({ src, transparentSrc, onClose, isOpen }: { src: string; transparentSrc?: string; onClose: () => void; isOpen: boolean }) {
  const [cmykLoading, setCmykLoading] = useState(false);
  const [cmykPreview, setCmykPreview] = useState(false);
  const [cmykSrc, setCmykSrc] = useState<string | null>(null);
  const [cmykTiffBlob, setCmykTiffBlob] = useState<Blob | null>(null);
  const [simulating, setSimulating] = useState(false);
  const prevSrcRef = useRef<string>('');
  useEffect(() => {
    if (src && src !== prevSrcRef.current) {
      prevSrcRef.current = src;
      setCmykPreview(false);
      setCmykSrc(null);
      setCmykTiffBlob(null);
    }
  }, [src]);
  if (!isOpen) return null;
  const dl = (href: string, name: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    a.click();
  };
  const downloadCmyk = async () => {
    if (cmykLoading) return;
    if (cmykTiffBlob) {
      const url = URL.createObjectURL(cmykTiffBlob);
      dl(url, "issei-print-cmyk.tif");
      URL.revokeObjectURL(url);
      return;
    }
    if (!transparentSrc) return;
    setCmykLoading(true);
    try {
      const res = await fetch("/api/convert-cmyk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: transparentSrc }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      setCmykTiffBlob(blob);
      const url = URL.createObjectURL(blob);
      dl(url, "issei-print-cmyk.tif");
      URL.revokeObjectURL(url);
    } finally {
      setCmykLoading(false);
    }
  };
  const toggleCmykPreview = async () => {
    if (cmykPreview) { setCmykPreview(false); return; }
    if (cmykSrc) { setCmykPreview(true); return; }
    if (!transparentSrc) return;
    setSimulating(true);
    try {
      const result = await simulateCmykOnCanvas(transparentSrc);
      setCmykSrc(result);
      setCmykPreview(true);
    } finally {
      setSimulating(false);
    }
  };
  return (
    <div
      className="fixed inset-0 bg-black/85 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {cmykPreview && cmykSrc ? (
          <div className="w-full rounded-2xl overflow-hidden shadow-2xl bg-white p-6">
            <img src={cmykSrc} alt="印刷イメージ確認" className="w-full" />
            <p className="text-center text-xs text-gray-400 mt-3 tracking-wider">CMYKシミュレーション（印刷色目安）</p>
          </div>
        ) : (
          <img src={src} alt="拡大プレビュー" className="w-full rounded-2xl shadow-2xl" />
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={toggleCmykPreview}
            disabled={simulating || !transparentSrc}
            className={`rounded-full px-4 py-2 shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50 font-semibold text-xs tracking-wide ${cmykPreview ? "bg-amber-500 text-white ring-2 ring-amber-300" : "bg-amber-400 hover:bg-amber-500 text-black"}`}
            title="CMYKシミュレーション（印刷色の確認）"
          >
            <span>{simulating ? "処理中…" : "印刷イメージ確認"}</span>
          </button>
          {transparentSrc && (
            <button
              onClick={() => dl(transparentSrc, "issei-print.png")}
              className="bg-white/90 hover:bg-white rounded-full px-3 py-2 shadow transition-colors flex items-center gap-1.5"
              title="透過PNG（プリント部分のみ）"
            >
              <Download className="w-4 h-4 text-black" />
              <span className="text-xs text-black font-medium">透過</span>
            </button>
          )}
          {transparentSrc && (
            <button
              onClick={downloadCmyk}
              disabled={cmykLoading}
              className="bg-white/90 hover:bg-white rounded-full px-3 py-2 shadow transition-colors flex items-center gap-1.5 disabled:opacity-60"
              title="CMYK TIFFダウンロード（印刷用）"
            >
              <Download className="w-4 h-4 text-black" />
              <span className="text-xs text-black font-medium">{cmykLoading ? "変換中…" : "CMYK↓"}</span>
            </button>
          )}
          <button
            onClick={() => dl(src, "issei-design.png")}
            className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow transition-colors"
            title="ダウンロード"
          >
            <Download className="w-5 h-5 text-black" />
          </button>
          <button
            onClick={onClose}
            className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow transition-colors"
            title="閉じる"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}

const Product: React.FC = () => {
  const [selectedShapeId, setSelectedShapeId] = useState<number | null>(() => {
    const v = localStorage.getItem("p1_shapeId"); return v ? Number(v) : null;
  });
  const [selectedFillId, setSelectedFillId] = useState<number | null>(() => {
    const v = localStorage.getItem("p1_fillId"); return v ? Number(v) : null;
  });
  const [shapeImg, setShapeImg] = useState<HTMLImageElement | null>(null);
  const [fillImg, setFillImg] = useState<HTMLImageElement | null>(null);
  const [tshirtBaseImg, setTshirtBaseImg] = useState<HTMLImageElement | null>(null);
  const [tshirtBlackImg, setTshirtBlackImg] = useState<HTMLImageElement | null>(null);
  const [tshirtAspect, setTshirtAspect] = useState(960 / 1080);
  const [tshirtBlackAspect, setTshirtBlackAspect] = useState(976 / 1079);
  const [tshirtColor, setTshirtColor] = useState<"white" | "black">("white");
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [fillScale, setFillScale] = useState(1.0);
  const [shapeScale, setShapeScale] = useState(1.0);
  const [designPos, setDesignPos] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ w: 480, h: 480 });
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [modalTransparentImg, setModalTransparentImg] = useState<string | null>(null);
  const [labelVisible, setLabelVisible] = useState(true);
  const [labelLang, setLabelLang] = useState<"en" | "ja">("en");
  const [labelImgEn, setLabelImgEn] = useState<HTMLImageElement | null>(null);
  const [labelImgJa, setLabelImgJa] = useState<HTMLImageElement | null>(null);
  const labelImg = labelLang === "en" ? labelImgEn : labelImgJa;
  const [labelOffset, setLabelOffset] = useState({ x: 0, y: 0 });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [artworkScrollH, setArtworkScrollH] = useState<number | null>(null);

  const compositeRef = useRef<HTMLCanvasElement>(null);
  const tshirtRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const maskForImgRef = useRef<HTMLImageElement | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fillSectionRef = useRef<HTMLDivElement>(null);
  const shapeColRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const tshirtDraggingRef = useRef(false);
  const tshirtDragStartScreenRef = useRef({ x: 0, y: 0 });
  const tshirtDragStartOffsetRef = useRef({ x: 0, y: 0 });

  const { data: shapes = [] } = useQuery<ProductShape[]>({
    queryKey: ["product-shapes"],
    queryFn: () => fetch("/api/product-shapes").then((r) => r.json()),
  });

  const { data: artworks = [] } = useQuery<ArtworkItem[]>({
    queryKey: ["/api/artworks"],
    queryFn: () => fetch("/api/artworks").then((r) => r.json()),
  });

  const visibleArtworks = artworks.slice(0, visibleCount);
  const hasMore = visibleCount < artworks.length;

  useEffect(() => {
    if (selectedShapeId == null) return;
    maskRef.current = null;
    maskForImgRef.current = null;
    setShapeImg(null);
    setOffset({ x: 0, y: 0 });
    setFillScale(1.0);
    setShapeScale(1.0);
    setDesignPos({ x: 0, y: 0 });
    const shape = shapes.find((s) => s.id === selectedShapeId);
    if (!shape) return;
    let cancelled = false;
    loadImg(shape.imageUrl).then((img) => {
      if (cancelled) return;
      const maxW = Math.min(480, window.innerWidth - 48);
      const aspect = img.naturalWidth / img.naturalHeight;
      setCanvasSize({ w: maxW, h: Math.round(maxW / aspect) });
      setShapeImg(img);
    });
    return () => { cancelled = true; };
  }, [selectedShapeId, shapes]);

  useEffect(() => {
    if (selectedFillId == null) return;
    if (selectedFillId === -1) { setFillImg(null); return; }
    const art = artworks.find((a) => a.id === selectedFillId);
    if (!art) return;
    let cancelled = false;
    loadImg(art.imageUrl).then((img) => { if (!cancelled) setFillImg(img); });
    return () => { cancelled = true; };
  }, [selectedFillId, artworks]);

  useEffect(() => {
    loadImg("/product/tshirt-base.jpg").then((img) => {
      setTshirtBaseImg(img);
      setTshirtAspect(img.naturalWidth / img.naturalHeight);
    }).catch(() => {});
    loadImg("/product/tshirt-black-base.jpg").then((img) => {
      setTshirtBlackImg(img);
      setTshirtBlackAspect(img.naturalWidth / img.naturalHeight);
    }).catch(() => {});
    loadImg("/product/label-en-white.png").then(setLabelImgEn).catch(() => {});
    loadImg("/product/label-ja-white.png").then(setLabelImgJa).catch(() => {});
  }, []);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (shapeColRef.current) {
        setArtworkScrollH(shapeColRef.current.offsetHeight - 44);
      }
    });
    if (shapeColRef.current) ro.observe(shapeColRef.current);
    return () => ro.disconnect();
  }, [shapes]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => prev + PAGE_SIZE);
      }
    }, { threshold: 0.1 });
    io.observe(sentinel);
    return () => io.disconnect();
  }, [visibleArtworks.length]);

  const renderComposite = useCallback(() => {
    const canvas = compositeRef.current;
    if (!canvas) return;
    const { w, h } = canvasSize;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);

    if (!shapeImg) return;

    if (!fillImg) {
      const masked = buildMask(shapeImg, w, h);
      ctx.drawImage(masked, 0, 0, w, h);
      return;
    }
    if (!maskRef.current || maskForImgRef.current !== shapeImg) {
      maskRef.current = buildMask(shapeImg, w, h);
      maskForImgRef.current = shapeImg;
    }
    const scaleF = Math.max((w * 1.2) / fillImg.width, (h * 1.2) / fillImg.height) * fillScale;
    const fw = fillImg.width * scaleF;
    const fh = fillImg.height * scaleF;
    ctx.drawImage(fillImg, (w - fw) / 2 + offset.x, (h - fh) / 2 + offset.y, fw, fh);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(maskRef.current, 0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
  }, [shapeImg, fillImg, offset, fillScale, canvasSize]);

  const renderTshirt = useCallback(() => {
    const canvas = tshirtRef.current;
    if (!canvas || !compositeRef.current) return;
    const W = 1600;
    const aspect = tshirtColor === "black" ? tshirtBlackAspect : tshirtAspect;
    const H = Math.round(W / aspect);
    canvas.width = W;
    canvas.height = H;
    drawTshirt(canvas, compositeRef.current, tshirtBaseImg, tshirtBlackImg, tshirtColor, shapeScale, designPos, labelImg, labelVisible, labelLang, labelOffset);
  }, [tshirtBaseImg, tshirtBlackImg, tshirtAspect, tshirtBlackAspect, tshirtColor, shapeScale, designPos, labelImg, labelVisible, labelLang, labelOffset]);

  useEffect(() => {
    if (!shapeImg || selectedFillId === null) return;
    renderComposite();
    const timer = setTimeout(() => renderTshirt(), 10);
    return () => clearTimeout(timer);
  }, [shapeImg, fillImg, selectedFillId, offset, fillScale, canvasSize, renderComposite, renderTshirt]);

  useEffect(() => {
    if (shapeImg && selectedFillId !== null) {
      setTimeout(() => {
        const el = previewRef.current;
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: "smooth" });
      }, 200);
    }
  }, [shapeImg, selectedFillId]);

  useEffect(() => {
    if (!selectedShapeId || fillImg) return;
    if (window.innerWidth >= 768) return;
    setTimeout(() => {
      const el = fillSectionRef.current;
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    }, 200);
  }, [selectedShapeId]);

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const sx = canvasSize.w / rect.width;
    const sy = canvasSize.h / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * sx, y: (e.touches[0].clientY - rect.top) * sy };
    }
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  };

  const onDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!compositeRef.current) return;
    const p = getCanvasPos(e, compositeRef.current);
    draggingRef.current = true;
    dragMovedRef.current = false;
    dragStartRef.current = { x: p.x - offset.x, y: p.y - offset.y };
  };
  const onMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current || !compositeRef.current) return;
    dragMovedRef.current = true;
    const p = getCanvasPos(e, compositeRef.current);
    setOffset({ x: p.x - dragStartRef.current.x, y: p.y - dragStartRef.current.y });
  };
  const getTransparentPng = useCallback((): string | null => {
    const dc = compositeRef.current;
    if (!dc || dc.width === 0) return null;
    const aspect = tshirtColor === "black" ? tshirtBlackAspect : tshirtAspect;
    const PRINT_SCALE = 3;
    const W = 1600 * PRINT_SCALE;
    const H = Math.round(W / aspect);
    const off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    const ctx = off.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    const da = dc.width / dc.height;
    const maxW = W * 0.38 * shapeScale;
    const maxH = H * 0.34 * shapeScale;
    let rw = maxW, rh = rw / da;
    if (rh > maxH) { rh = maxH; rw = rh * da; }
    ctx.drawImage(dc, (W - rw) / 2 + designPos.x * PRINT_SCALE, H * 0.26 + designPos.y * PRINT_SCALE, rw, rh);
    drawLabelOnCtx(ctx, W, H, labelImg, labelVisible, labelLang, labelOffset, tshirtColor);
    return injectDpi300(off.toDataURL("image/png"));
  }, [tshirtColor, tshirtAspect, tshirtBlackAspect, shapeScale, designPos, labelImg, labelVisible, labelLang, labelOffset]);

  const openModal = useCallback(() => {
    setModalImg(tshirtRef.current?.toDataURL("image/png") ?? null);
    setModalTransparentImg(getTransparentPng());
  }, [getTransparentPng]);

  const onUp = () => {
    if (draggingRef.current && !dragMovedRef.current) {
      openModal();
    }
    draggingRef.current = false;
  };
  const onTouchDown = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!compositeRef.current) return;
    const p = getCanvasPos(e, compositeRef.current);
    draggingRef.current = true;
    dragMovedRef.current = false;
    dragStartRef.current = { x: p.x - offset.x, y: p.y - offset.y };
  };
  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!draggingRef.current || !compositeRef.current) return;
    dragMovedRef.current = true;
    const p = getCanvasPos(e, compositeRef.current);
    setOffset({ x: p.x - dragStartRef.current.x, y: p.y - dragStartRef.current.y });
  };
  const onTouchEnd = () => {
    if (draggingRef.current && !dragMovedRef.current) { openModal(); }
    draggingRef.current = false;
  };

  const onTshirtDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    tshirtDraggingRef.current = true;
    dragMovedRef.current = false;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    tshirtDragStartScreenRef.current = { x: clientX, y: clientY };
    tshirtDragStartOffsetRef.current = { x: designPos.x, y: designPos.y };
  };
  const onTshirtMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!tshirtDraggingRef.current || !tshirtRef.current) return;
    if ("touches" in e) e.preventDefault();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const dx = clientX - tshirtDragStartScreenRef.current.x;
    const dy = clientY - tshirtDragStartScreenRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMovedRef.current = true;
    if (!dragMovedRef.current) return;
    const rect = tshirtRef.current.getBoundingClientRect();
    const scale = 1600 / rect.width;
    setDesignPos({
      x: Math.max(-280, Math.min(280, tshirtDragStartOffsetRef.current.x + dx * scale)),
      y: Math.max(-80, Math.min(260, tshirtDragStartOffsetRef.current.y + dy * scale)),
    });
  };
  const onTshirtUp = () => {
    if (tshirtDraggingRef.current && !dragMovedRef.current) { openModal(); }
    tshirtDraggingRef.current = false;
  };

  useEffect(() => {
    if (selectedShapeId != null) localStorage.setItem("p1_shapeId", String(selectedShapeId));
    else localStorage.removeItem("p1_shapeId");
  }, [selectedShapeId]);
  useEffect(() => {
    if (selectedFillId != null) localStorage.setItem("p1_fillId", String(selectedFillId));
    else localStorage.removeItem("p1_fillId");
  }, [selectedFillId]);

  const isReady = !!shapeImg && selectedFillId !== null;
  const [orderOpen, setOrderOpen] = useState(false);
  const selectedFillArt = selectedFillId != null && selectedFillId !== -1
    ? artworks.find((a) => a.id === selectedFillId) ?? null
    : null;
  const artDetailUrl = selectedFillArt
    ? `${window.location.origin}/artwork/${selectedFillId}`
    : null;

  return (
    <div className="min-h-screen bg-white py-12">
      <ImageModal isOpen={!!modalImg} src={modalImg ?? ''} transparentSrc={modalTransparentImg ?? undefined} onClose={() => { setModalImg(null); setModalTransparentImg(null); }} />

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
          <span className="text-sm tracking-widest text-black border-b-2 border-black pb-1">
            PRODUCT 1
          </span>
          <ScrollToTopLink href="/product2" className="text-sm tracking-widest text-gray-400 hover:text-black transition-colors">
            PRODUCT 2
          </ScrollToTopLink>
          <ScrollToTopLink href="/product3" className="text-sm tracking-widest text-gray-400 hover:text-black transition-colors">
            PRODUCT 3
          </ScrollToTopLink>
        </div>

        <div className="max-w-xl mx-auto mb-12 text-center space-y-4">
          <p className="text-sm leading-relaxed tracking-wide text-black">
            型を選び、絵を選ぶ。
          </p>
          <p className="text-sm leading-relaxed tracking-wide text-black">
            ただそれだけで、絵画はウェアラブルな表現へと変容します。<br className="hidden md:block" />
            ISSEIの作品が、あなただけのかたちに。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          <div ref={shapeColRef} className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">1</span>
              <span className="font-semibold text-sm tracking-wider">型の絵を選ぶ</span>
            </div>
            {shapes.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center border rounded-xl">
                まだ登録されていません。<br />アドミンで型の絵を登録してください。
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {shapes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedShapeId(s.id)}
                    className={`rounded-xl border-2 transition-all flex flex-col overflow-hidden h-[10.5rem] ${
                      selectedShapeId === s.id ? "border-black shadow-md" : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <div className="flex-1 w-full bg-gray-50 min-h-0">
                      <img src={s.imageUrl} alt={s.title} className="w-full h-full object-contain p-1" />
                    </div>
                    <p className="text-xs text-center px-1 truncate w-full text-black shrink-0" style={{ height: "1.75rem", lineHeight: "1.75rem" }}>{s.title}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col" ref={fillSectionRef}>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">2</span>
              <span className="font-semibold text-sm tracking-wider">中身の絵を選ぶ</span>
              <span className="text-xs text-black">ISSEIの作品から選択</span>
            </div>
            {artworks.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center border rounded-xl">作品がありません</p>
            ) : (
              <div
                className="overflow-y-auto"
                style={artworkScrollH ? { height: `${artworkScrollH}px` } : { maxHeight: "400px" }}
              >
                <div className="grid grid-cols-3 gap-2 pr-1">
                  <button
                    onClick={() => setSelectedFillId(-1)}
                    className={`rounded-xl overflow-hidden border-2 transition-all aspect-square flex items-center justify-center bg-gray-50 ${
                      selectedFillId === -1 ? "border-black shadow-md" : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xl text-gray-300">—</span>
                      <span className="text-xs text-gray-400">中身なし</span>
                    </div>
                  </button>
                  {visibleArtworks.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedFillId(a.id)}
                      className={`rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                        selectedFillId === a.id ? "border-black shadow-md" : "border-transparent hover:border-gray-300"
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
        </div>

        {isReady && (
          <div ref={previewRef} className="mt-16 pt-8 mb-4 flex items-center gap-4 flex-wrap">
            {selectedFillId !== -1 && (
              <label className="flex items-center gap-2 text-sm text-black">
                <span className="text-xs whitespace-nowrap">型の中の絵</span>
                <input
                  type="range" min={50} max={300} step={5} value={Math.round(fillScale * 100)}
                  onChange={(e) => setFillScale(Number(e.target.value) / 100)}
                  className="w-28 accent-black"
                />
                <span className="text-xs text-black w-8">{Math.round(fillScale * 100)}%</span>
              </label>
            )}
            <label className="flex items-center gap-2 text-sm text-black">
              <span className="text-xs whitespace-nowrap">絵のサイズ</span>
              <input
                type="range" min={30} max={200} step={5} value={Math.round(shapeScale * 100)}
                onChange={(e) => setShapeScale(Number(e.target.value) / 100)}
                className="w-28 accent-black"
              />
              <span className="text-xs text-black w-8">{Math.round(shapeScale * 100)}%</span>
            </label>
            <button
              onClick={() => setOffset({ x: 0, y: 0 })}
              className="flex items-center gap-1.5 text-sm text-black hover:text-gray-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              位置リセット
            </button>
          </div>
        )}

        {isReady && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-semibold tracking-wider text-black uppercase mb-1">
                プレビュー
              </p>
              <p className="text-xs text-black mb-3">
                ドラッグで中身の絵を動かせます　クリックで拡大
              </p>
              <div
                className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-gray-50"
                style={{ width: "100%", aspectRatio: `${canvasSize.w} / ${canvasSize.h}` }}
              >
                <canvas
                  ref={compositeRef}
                  style={{
                    width: "100%", height: "100%", display: "block",
                    cursor: "grab",
                    touchAction: "none",
                  }}
                  onMouseDown={onDown}
                  onMouseMove={onMove}
                  onMouseUp={onUp}
                  onMouseLeave={() => { draggingRef.current = false; }}
                  onTouchStart={onTouchDown}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold tracking-wider text-black uppercase">
                  Tシャツ イメージ
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setTshirtColor("white")}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      tshirtColor === "white" ? "bg-black text-white border-black" : "bg-white text-gray-500 border-gray-300 hover:border-gray-500"
                    }`}
                  >
                    白
                  </button>
                  <button
                    onClick={() => setTshirtColor("black")}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      tshirtColor === "black" ? "bg-black text-white border-black" : "bg-white text-gray-500 border-gray-300 hover:border-gray-500"
                    }`}
                  >
                    黒
                  </button>
                </div>
              </div>
              <p className="text-xs text-black mb-3">ドラッグ: 絵の位置調整 / クリック: 拡大</p>
              <div
                className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-100 cursor-grab active:cursor-grabbing select-none"
                style={{ width: "100%", aspectRatio: tshirtColor === "black" ? `${tshirtBlackAspect}` : `${tshirtAspect}` }}
                onMouseDown={onTshirtDown}
                onMouseMove={onTshirtMove}
                onMouseUp={onTshirtUp}
                onMouseLeave={onTshirtUp}
                onTouchStart={onTshirtDown}
                onTouchMove={onTshirtMove}
                onTouchEnd={onTshirtUp}
              >
                <canvas
                  ref={tshirtRef}
                  style={{ width: "100%", height: "100%", display: "block", pointerEvents: "none" }}
                />
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
                      <button onClick={() => setLabelLang("ja")} className={`px-3 py-1 transition-colors ${labelLang === "ja" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}`}>JP</button>
                    </div>
                    <div className="flex items-center gap-3 ml-1">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-black w-5">←→</span>
                          <input type="range" min={-200} max={100} value={labelOffset.x}
                            onChange={(e) => setLabelOffset((p) => ({ ...p, x: Number(e.target.value) }))}
                            className="w-28 accent-black" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-black w-5">↑↓</span>
                          <input type="range" min={-400} max={50} value={labelOffset.y}
                            onChange={(e) => setLabelOffset((p) => ({ ...p, y: Number(e.target.value) }))}
                            className="w-28 accent-black" />
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
          </div>
        )}

        {isReady && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={() => setOrderOpen(true)}
              className="px-14 py-4 border border-black text-black bg-white text-sm tracking-[0.5em] font-light hover:bg-black hover:text-white transition-all duration-500"
            >
              注文する
            </button>
          </div>
        )}

        {artDetailUrl && selectedFillArt && (
          <a
            href={artDetailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-32 mb-12 group flex flex-col sm:flex-row overflow-hidden rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="w-full h-72 sm:h-auto sm:w-52 md:w-72 flex-shrink-0">
              <img src={selectedFillArt.imageUrl} alt={selectedFillArt.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between px-7 py-7 sm:px-10 sm:py-9">
              <div>
                <p className="text-xs tracking-[0.35em] uppercase text-black mb-3">使用した作品</p>
                <p className="text-lg sm:text-2xl font-light tracking-widest text-black mb-4 leading-snug">{selectedFillArt.title}</p>
                {selectedFillArt.description && (
                  <p className="text-xs text-black leading-relaxed tracking-wide line-clamp-3">{selectedFillArt.description}</p>
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

        {!isReady && (
          <div className="text-center py-20 text-black text-sm tracking-wider">
            ①②で絵を選ぶとプレビューが表示されます
          </div>
        )}

        {orderOpen && (
          <OrderModal
            imageDataUrl={tshirtRef.current?.toDataURL("image/png") ?? ""}
            transparentDataUrl={getTransparentPng()}
            productName="PRODUCT 1"
            artworkTitle={selectedFillArt?.title}
            onClose={() => setOrderOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Product;
