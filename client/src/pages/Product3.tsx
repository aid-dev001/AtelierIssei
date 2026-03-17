import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, X, RefreshCw, Trash2, Eye, EyeOff } from "lucide-react";
import ScrollToTopLink from "@/components/ScrollToTopLink";
import OrderModal from "@/components/OrderModal";
import { injectDpi300 } from "@/lib/pngDpi";

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
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const sat = 0.80;
        let r2 = lum + (r - lum) * sat;
        let g2 = lum + (g - lum) * sat;
        let b2 = lum + (b - lum) * sat;
        const dg = (v: number) => v < 0.5 ? v * (1 - (0.5 - v) * 0.40) : v;
        const dk = 0.90;
        d[i]     = Math.round(Math.max(0, Math.min(255, dg(r2) * dk * 255)));
        d[i + 1] = Math.round(Math.max(0, Math.min(255, dg(g2) * dk * 255)));
        d[i + 2] = Math.round(Math.max(0, Math.min(255, dg(b2) * dk * 255)));
      }
      ctx.putImageData(id, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function ImageModal({ src, transparentSrc, compositeWithCmyk, onClose, isOpen }: {
  src: string;
  transparentSrc?: string;
  compositeWithCmyk?: (cmykBlobUrl: string) => Promise<string>;
  onClose: () => void;
  isOpen: boolean;
}) {
  const [cmykLoading, setCmykLoading] = useState(false);
  const [cmykPreview, setCmykPreview] = useState(false);
  const [cmykSrc, setCmykSrc] = useState<string | null>(null);
  const [cmykTiffBlob, setCmykTiffBlob] = useState<Blob | null>(null);
  const [simulating, setSimulating] = useState(false);
  const cmykBlobUrlRef = useRef<string | null>(null);
  const prevSrcRef = useRef<string>('');
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    if (src && src !== prevSrcRef.current) {
      prevSrcRef.current = src;
      setCmykPreview(false);
      if (cmykBlobUrlRef.current) { URL.revokeObjectURL(cmykBlobUrlRef.current); cmykBlobUrlRef.current = null; }
      setCmykSrc(null);
      setCmykTiffBlob(null);
    }
  }, [src]);
  useEffect(() => {
    return () => { if (cmykBlobUrlRef.current) URL.revokeObjectURL(cmykBlobUrlRef.current); };
  }, []);
  useEffect(() => {
    if (!isOpen) {
      if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
      setCmykLoading(false);
      setSimulating(false);
    }
  }, [isOpen]);
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
    const ac = new AbortController(); abortRef.current = ac;
    setCmykLoading(true);
    try {
      const [tiffRes, previewRes] = await Promise.all([
        fetch("/api/convert-cmyk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageData: transparentSrc }), signal: ac.signal }),
        !cmykSrc ? fetch("/api/cmyk-preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageData: transparentSrc }), signal: ac.signal }) : Promise.resolve(null),
      ]);
      if (!tiffRes.ok) throw new Error();
      const tiffBlob = await tiffRes.blob();
      setCmykTiffBlob(tiffBlob);
      const url = URL.createObjectURL(tiffBlob);
      dl(url, "issei-print-cmyk.tif");
      URL.revokeObjectURL(url);
      if (previewRes?.ok) {
        const previewBlob = await previewRes.blob();
        const blobUrl = URL.createObjectURL(previewBlob);
        if (compositeWithCmyk) {
          const compositeDataUrl = await compositeWithCmyk(blobUrl);
          URL.revokeObjectURL(blobUrl);
          setCmykSrc(compositeDataUrl);
        } else {
          if (cmykBlobUrlRef.current) URL.revokeObjectURL(cmykBlobUrlRef.current);
          cmykBlobUrlRef.current = blobUrl;
          setCmykSrc(blobUrl);
        }
      }
    } catch(e) {
      if ((e as Error).name === 'AbortError') return;
    } finally {
      if (abortRef.current === ac) abortRef.current = null;
      setCmykLoading(false);
    }
  };
  const toggleCmykPreview = async () => {
    if (cmykPreview) { setCmykPreview(false); return; }
    if (!transparentSrc) return;
    if (cmykSrc) { setCmykPreview(true); return; }
    const ac = new AbortController(); abortRef.current = ac;
    setSimulating(true);
    try {
      const [previewRes, tiffRes] = await Promise.all([
        fetch("/api/cmyk-preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageData: transparentSrc }), signal: ac.signal }),
        fetch("/api/convert-cmyk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageData: transparentSrc }), signal: ac.signal }),
      ]);
      if (!previewRes.ok) throw new Error("cmyk-preview failed");
      const blob = await previewRes.blob();
      const cmykDesignBlobUrl = URL.createObjectURL(blob);
      if (compositeWithCmyk) {
        const compositeDataUrl = await compositeWithCmyk(cmykDesignBlobUrl);
        URL.revokeObjectURL(cmykDesignBlobUrl);
        setCmykSrc(compositeDataUrl);
      } else {
        if (cmykBlobUrlRef.current) URL.revokeObjectURL(cmykBlobUrlRef.current);
        cmykBlobUrlRef.current = cmykDesignBlobUrl;
        setCmykSrc(cmykDesignBlobUrl);
      }
      if (tiffRes.ok) setCmykTiffBlob(await tiffRes.blob());
      setCmykPreview(true);
    } catch(e) {
      if ((e as Error).name === 'AbortError') return;
    } finally {
      if (abortRef.current === ac) abortRef.current = null;
      setSimulating(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/85 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      {(simulating || cmykLoading) && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <div className="bg-black/80 text-white rounded-2xl px-8 py-6 flex flex-col items-center gap-3 shadow-2xl">
            <div className="text-sm font-bold tracking-widest animate-pulse">CMYK 変換中...</div>
            <div className="text-xs text-white/60">この処理には数十秒かかります</div>
          </div>
        </div>
      )}
      <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="relative w-full">
          <img
            key={cmykPreview ? "cmyk" : "rgb"}
            src={cmykPreview && cmykSrc ? cmykSrc : src}
            alt={cmykPreview ? "印刷イメージ確認" : "拡大プレビュー"}
            className="w-full rounded-2xl shadow-2xl"
            style={cmykPreview && cmykSrc && !compositeWithCmyk ? { filter: "brightness(1.1)" } : undefined}
          />
          {cmykPreview && (
            <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded font-bold">CMYK印刷色</div>
          )}
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          <button onClick={toggleCmykPreview} disabled={simulating || !transparentSrc} className={`rounded-full px-3 py-2 shadow transition-all flex items-center gap-1.5 disabled:opacity-50 text-xs ${cmykPreview ? "bg-black text-white" : "bg-white/90 hover:bg-white text-black"}`} title="CMYKシミュレーション（印刷色の確認）">
            <span className="font-medium">{simulating ? "処理中…" : "印刷イメージ確認"}</span>
          </button>
          {transparentSrc && (
            <button onClick={() => dl(transparentSrc, "issei-print.png")} className="bg-white/90 hover:bg-white rounded-full px-3 py-2 shadow transition-colors flex items-center gap-1.5" title="透過PNG（プリント部分のみ）">
              <Download className="w-4 h-4 text-black" />
              <span className="text-xs text-black font-medium">透過</span>
            </button>
          )}
          {transparentSrc && (
            <button onClick={downloadCmyk} disabled={cmykLoading} className="bg-white/90 hover:bg-white rounded-full px-3 py-2 shadow transition-colors flex items-center gap-1.5 disabled:opacity-60" title="CMYK TIFFダウンロード（印刷用）">
              <Download className="w-4 h-4 text-black" />
              <span className="text-xs text-black font-medium">{cmykLoading ? "変換中…" : "CMYK↓"}</span>
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

type ArtworkItem = { id: number; title: string; imageUrl: string; description?: string };

type ShapeItem = {
  id: string;
  type: "rect" | "triangle" | "circle";
  cx: number;
  cy: number;
  w: number;
  h: number;
  rotation: number;
};

const CW = 1600;
const CH = 1800;
const PAGE_SIZE = 12;
const CLICK_THRESHOLD = 6;
const SHIRT_L = 0.20;
const SHIRT_R = 0.80;
const SHIRT_T = 0.18;
const SHIRT_B = 0.82;

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

function thumb(url: string, w = 200): string {
  if (!url || url.startsWith('data:')) return url;
  return `/api/thumb?src=${encodeURIComponent(url)}&w=${w}`;
}

const LABEL_TEXT_EN = "ISSEI – Wearable Abstraction";
const LABEL_TEXT_FR = "ISSEI – L'Abstraction à Porter";

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
  const defaultX = canvasW * 0.60;
  const defaultY = canvasH * 0.57;
  const lx = defaultX + labelOffset.x;
  const ly = defaultY + labelOffset.y;
  const scale = canvasW / 1600;
  if (labelImg) {
    const lw = 368 * 0.6 * scale;
    const lh = lw * (labelImg.naturalHeight / labelImg.naturalWidth);
    // Step-down resize for sharpness: halve progressively to avoid one-shot heavy downscale
    let src: CanvasImageSource = labelImg;
    let sw = labelImg.naturalWidth;
    let sh = labelImg.naturalHeight;
    while (sw > lw * 2) {
      const nextW = Math.max(Math.round(lw), Math.round(sw / 2));
      const nextH = Math.round(sh / 2);
      const tmp = document.createElement("canvas");
      tmp.width = nextW; tmp.height = nextH;
      const tc = tmp.getContext("2d")!;
      tc.imageSmoothingEnabled = true; tc.imageSmoothingQuality = "high";
      tc.drawImage(src, 0, 0, nextW, nextH);
      src = tmp; sw = nextW; sh = nextH;
    }
    if (color === "white") ctx.filter = "invert(1)";
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    ctx.drawImage(src, lx - lw, ly - lh * 0.75, lw, lh);
    ctx.filter = "none";
  } else {
    const text = labelLang === "fr" ? LABEL_TEXT_FR : LABEL_TEXT_EN;
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
  return buildMaskAt(shapes, mode, CW, CH);
}

function buildMaskAt(shapes: ShapeItem[], mode: "and" | "or", W: number, H: number): HTMLCanvasElement {
  const drawS = (ctx: CanvasRenderingContext2D, s: ShapeItem) => {
    const pw = s.w * W; const ph = s.h * H;
    ctx.save();
    ctx.translate(s.cx * W, s.cy * H);
    ctx.rotate((s.rotation * Math.PI) / 180);
    ctx.beginPath();
    if (s.type === "rect") { ctx.rect(-pw / 2, -ph / 2, pw, ph); }
    else if (s.type === "circle") { ctx.arc(0, 0, Math.min(pw, ph) / 2, 0, Math.PI * 2); }
    else { ctx.moveTo(0, -ph / 2); ctx.lineTo(pw / 2, ph / 2); ctx.lineTo(-pw / 2, ph / 2); ctx.closePath(); }
    ctx.fillStyle = "black"; ctx.fill();
    ctx.restore();
  };
  const mask = document.createElement("canvas");
  mask.width = W; mask.height = H;
  const ctx = mask.getContext("2d")!;
  if (mode === "or") {
    shapes.forEach((s) => drawS(ctx, s));
  } else {
    ctx.fillStyle = "black"; ctx.fillRect(0, 0, W, H);
    shapes.forEach((s) => {
      const tmp = document.createElement("canvas"); tmp.width = W; tmp.height = H;
      const tmpCtx = tmp.getContext("2d")!; drawS(tmpCtx, s);
      ctx.globalCompositeOperation = "destination-in"; ctx.drawImage(tmp, 0, 0);
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

  const [selectedArtId, setSelectedArtId] = useState<number | null>(() => {
    const v = localStorage.getItem("p3_artId"); return v ? Number(v) : null;
  });
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
  const [modalCompositeWithCmyk, setModalCompositeWithCmyk] = useState<((url: string) => Promise<string>) | undefined>(undefined);
  const [labelVisible, setLabelVisible] = useState(true);
  const [labelLang, setLabelLang] = useState<"en" | "fr">("en");
  const [labelImgEn, setLabelImgEn] = useState<HTMLImageElement | null>(null);
  const [labelImgFr, setLabelImgFr] = useState<HTMLImageElement | null>(null);
  const labelImg = labelLang === "en" ? labelImgEn : labelImgFr;
  const [labelOffset, setLabelOffset] = useState({ x: 50, y: 50 });
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
    loadImg("/product/label-en-white.png").then(setLabelImgEn).catch(() => {});
    loadImg("/product/label-fr-white.png").then(setLabelImgFr).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedArtId) return;
    const art = artworks.find((a) => a.id === selectedArtId);
    if (!art) return;
    loadImg(art.imageUrl).then(setArtImg).catch(() => {});
  }, [selectedArtId, artworks]);
  useEffect(() => {
    if (selectedArtId != null) localStorage.setItem("p3_artId", String(selectedArtId));
    else localStorage.removeItem("p3_artId");
  }, [selectedArtId]);

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
    coverShirtText(ctx, shirt, CW, CH);

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

    drawLabelOnCtx(ctx, CW, CH, labelImg, labelVisible, labelLang, labelOffset, tshirtColor);
  }, [shirtImg, blackShirtImg, artImg, shapes, shapeMode, selectedId, showOutline, tshirtColor, artOffsetX, artOffsetY, artRotation, artScale, labelImg, labelVisible, labelLang, labelOffset]);

  useEffect(() => { render(); }, [render]);

  const getTransparentPng = useCallback((): string | null => {
    if (!artImg || shapes.length === 0) return null;
    const off = document.createElement("canvas");
    const PS = Math.max(3, Math.min(
      Math.max(artImg.naturalWidth, artImg.naturalHeight) / Math.max(CW, CH), 5
    ));
    const W = Math.round(CW * PS);
    const H = Math.round(CH * PS);
    off.width = W;
    off.height = H;
    const offCtx = off.getContext("2d")!;
    offCtx.imageSmoothingEnabled = true;
    offCtx.imageSmoothingQuality = "high";
    const ar = artImg.width / artImg.height;
    const cr = W / H;
    let dw: number, dh: number;
    if (ar > cr) { dh = H; dw = dh * ar; }
    else { dw = W; dh = dw / ar; }
    offCtx.save();
    offCtx.translate(W / 2 + artOffsetX * W, H / 2 + artOffsetY * H);
    offCtx.rotate((artRotation * Math.PI) / 180);
    offCtx.scale(artScale, artScale);
    offCtx.drawImage(artImg, -dw / 2, -dh / 2, dw, dh);
    offCtx.restore();
    const mask = buildMaskAt(shapes, shapeMode, W, H);
    offCtx.globalCompositeOperation = "destination-in";
    offCtx.drawImage(mask, 0, 0);
    offCtx.globalCompositeOperation = "source-over";
    drawLabelOnCtx(offCtx, W, H, labelImg, labelVisible, labelLang, { x: labelOffset.x * PS, y: labelOffset.y * PS }, tshirtColor);
    return injectDpi300(off.toDataURL("image/png"));
  }, [artImg, shapes, shapeMode, artOffsetX, artOffsetY, artRotation, artScale, labelImg, labelVisible, labelLang, labelOffset, tshirtColor]);

  const openModal = useCallback(() => {
    setModalImg(canvasRef.current?.toDataURL("image/png") ?? null);
    setModalTransparentImg(getTransparentPng());
    const shirtI = tshirtColor === "black" ? blackShirtImg : shirtImg;
    const W = CW, H = CH, blend = tshirtColor === "black" ? "screen" : "multiply";
    setModalCompositeWithCmyk(() => (cmykBlobUrl: string) => new Promise<string>((resolve, reject) => {
      const off = document.createElement("canvas"); off.width = W; off.height = H;
      const ctx = off.getContext("2d")!;
      if (shirtI) { ctx.drawImage(shirtI, 0, 0, W, H); coverShirtText(ctx, shirtI, W, H); }
      const img = new window.Image();
      img.onload = () => { ctx.filter = "brightness(1.1)"; ctx.globalCompositeOperation = blend as GlobalCompositeOperation; ctx.drawImage(img, 0, 0, W, H); ctx.globalCompositeOperation = "source-over"; ctx.filter = "none"; resolve(off.toDataURL("image/png")); };
      img.onerror = () => reject(new Error("load failed")); img.src = cmykBlobUrl;
    }));
  }, [getTransparentPng, tshirtColor, shirtImg, blackShirtImg]);

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
    if (dragging.current && !didMove.current && lastHitId.current === null) { openModal(); }
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
                        <input type="range" min={-50} max={50} value={labelOffset.x}
                          onChange={(e) => setLabelOffset((p) => ({ ...p, x: Number(e.target.value) }))}
                          className="w-24 accent-black" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-black w-5">↑↓</span>
                        <input type="range" min={-300} max={50} value={labelOffset.y}
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
                        <img src={thumb(a.imageUrl)} alt={a.title} className="w-full aspect-square object-cover" loading="lazy" />
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

        {selectedArtId != null && shapes.length > 0 && (
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
            {/* Artwork image */}
            <div className="w-full h-72 sm:h-auto sm:w-52 md:w-72 flex-shrink-0">
              <img
                src={selectedArtItem.imageUrl}
                alt={selectedArtItem.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0 flex flex-col justify-between px-7 py-7 sm:px-10 sm:py-9">
              <div>
                <p className="text-xs tracking-[0.35em] uppercase text-black mb-3">使用した作品</p>
                <p className="text-lg sm:text-2xl font-light tracking-widest text-black mb-4 leading-snug">
                  {selectedArtItem.title}
                </p>
                {selectedArtItem.description && (
                  <p className="text-xs text-black leading-relaxed tracking-wide line-clamp-3">
                    {selectedArtItem.description}
                  </p>
                )}
              </div>
              <p className="text-[10px] text-black tracking-[0.2em] mt-6">
                作品を見る →
              </p>
            </div>

            {/* QR — separated by subtle border */}
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
      </div>

      <ImageModal isOpen={!!modalImg} src={modalImg ?? ''} transparentSrc={modalTransparentImg ?? undefined} compositeWithCmyk={modalCompositeWithCmyk} onClose={() => { setModalImg(null); setModalTransparentImg(null); setModalCompositeWithCmyk(undefined); }} />
      {orderOpen && (
        <OrderModal
          imageDataUrl={canvasRef.current?.toDataURL("image/png") ?? ""}
          transparentDataUrl={getTransparentPng()}
          productName="PRODUCT 3"
          artworkTitle={selectedArtItem?.title}
          onClose={() => setOrderOpen(false)}
        />
      )}
    </div>
  );
}
