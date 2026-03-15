import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Download, X } from "lucide-react";

type ProductShape = { id: number; title: string; imageUrl: string };
type ArtworkItem = { id: number; title: string; imageUrl: string };

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

function buildMask(img: HTMLImageElement, threshold: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth || img.width;
  c.height = img.naturalHeight || img.height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const id = ctx.getImageData(0, 0, c.width, c.height);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] >= threshold && d[i + 1] >= threshold && d[i + 2] >= threshold) {
      d[i + 3] = 0;
    }
  }
  ctx.putImageData(id, 0, 0);
  return c;
}

function drawBlackTshirt(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const s = W / 500;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 22 * s;
  ctx.shadowOffsetY = 5 * s;
  ctx.beginPath();
  ctx.moveTo(162 * s, 72 * s);
  ctx.bezierCurveTo(198 * s, 138 * s, 302 * s, 138 * s, 338 * s, 72 * s);
  ctx.lineTo(396 * s, 46 * s);
  ctx.lineTo(462 * s, 98 * s);
  ctx.lineTo(456 * s, 198 * s);
  ctx.bezierCurveTo(438 * s, 212 * s, 372 * s, 202 * s, 362 * s, 176 * s);
  ctx.lineTo(362 * s, 446 * s);
  ctx.lineTo(138 * s, 446 * s);
  ctx.lineTo(138 * s, 176 * s);
  ctx.bezierCurveTo(128 * s, 202 * s, 62 * s, 212 * s, 44 * s, 198 * s);
  ctx.lineTo(38 * s, 98 * s);
  ctx.lineTo(104 * s, 46 * s);
  ctx.closePath();
  ctx.fillStyle = "#1a1a1a";
  ctx.fill();
  ctx.restore();
}

function drawTshirt(
  canvas: HTMLCanvasElement,
  designCanvas: HTMLCanvasElement | null,
  baseImg: HTMLImageElement | null,
  color: "white" | "black"
) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, W, H);

  if (color === "white") {
    if (baseImg) {
      ctx.drawImage(baseImg, 0, 0, W, H);
    } else {
      ctx.fillStyle = "#888";
      ctx.fillRect(0, 0, W, H);
    }
  } else {
    ctx.fillStyle = "#888888";
    ctx.fillRect(0, 0, W, H);
    drawBlackTshirt(ctx, W, H);
  }

  if (designCanvas && designCanvas.width > 0 && designCanvas.height > 0) {
    const aspect = designCanvas.width / designCanvas.height;
    const maxW = W * 0.38;
    const maxH = H * 0.34;
    let rw = maxW;
    let rh = rw / aspect;
    if (rh > maxH) { rh = maxH; rw = rh * aspect; }
    const dx = (W - rw) / 2;
    const dy = H * 0.26;
    ctx.globalCompositeOperation = color === "white" ? "multiply" : "screen";
    ctx.drawImage(designCanvas, dx, dy, rw, rh);
    ctx.globalCompositeOperation = "source-over";

    if (color === "black") {
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.font = `${Math.round(W * 0.022)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("ISSEI – Wearable Abstraction", W / 2, dy + rh + W * 0.04);
    }
  }
}

function ImageModal({ src, onClose }: { src: string; onClose: () => void }) {
  const download = () => {
    const a = document.createElement("a");
    a.href = src;
    a.download = "issei-design.png";
    a.click();
  };
  return (
    <div
      className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={src} alt="拡大プレビュー" className="w-full rounded-2xl shadow-2xl" />
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={download}
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
  const [selectedShapeId, setSelectedShapeId] = useState<number | null>(null);
  const [selectedFillId, setSelectedFillId] = useState<number | null>(null);
  const [shapeImg, setShapeImg] = useState<HTMLImageElement | null>(null);
  const [fillImg, setFillImg] = useState<HTMLImageElement | null>(null);
  const [tshirtBaseImg, setTshirtBaseImg] = useState<HTMLImageElement | null>(null);
  const [tshirtAspect, setTshirtAspect] = useState(960 / 1080);
  const [tshirtColor, setTshirtColor] = useState<"white" | "black">("white");
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [threshold, setThreshold] = useState(238);
  const [shapeScale, setShapeScale] = useState(1.0);
  const [canvasSize, setCanvasSize] = useState({ w: 480, h: 480 });
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [artworkScrollH, setArtworkScrollH] = useState<number | null>(null);

  const compositeRef = useRef<HTMLCanvasElement>(null);
  const tshirtRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const prevIsReady = useRef(false);
  const shapeColRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

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
    const shape = shapes.find((s) => s.id === selectedShapeId);
    if (!shape) return;
    maskRef.current = null;
    setOffset({ x: 0, y: 0 });
    setShapeScale(1.0);
    loadImg(shape.imageUrl).then((img) => {
      const maxW = Math.min(480, window.innerWidth - 48);
      const aspect = img.naturalWidth / img.naturalHeight;
      setCanvasSize({ w: maxW, h: Math.round(maxW / aspect) });
      setShapeImg(img);
    });
  }, [selectedShapeId, shapes]);

  useEffect(() => {
    if (selectedFillId == null) return;
    const art = artworks.find((a) => a.id === selectedFillId);
    if (!art) return;
    loadImg(art.imageUrl).then(setFillImg);
  }, [selectedFillId, artworks]);

  useEffect(() => {
    loadImg("/product/tshirt-base.jpg").then((img) => {
      setTshirtBaseImg(img);
      setTshirtAspect(img.naturalWidth / img.naturalHeight);
    }).catch(() => {});
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
    if (!canvas || !shapeImg || !fillImg) return;
    const { w, h } = canvasSize;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);
    if (!maskRef.current) {
      maskRef.current = buildMask(shapeImg, threshold);
    }
    const scaleF = Math.max((w * 1.2) / fillImg.width, (h * 1.2) / fillImg.height);
    const fw = fillImg.width * scaleF;
    const fh = fillImg.height * scaleF;
    ctx.drawImage(fillImg, (w - fw) / 2 + offset.x, (h - fh) / 2 + offset.y, fw, fh);
    const mw = w * shapeScale;
    const mh = h * shapeScale;
    const mx = (w - mw) / 2;
    const my = (h - mh) / 2;
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(maskRef.current, mx, my, mw, mh);
    ctx.globalCompositeOperation = "source-over";
  }, [shapeImg, fillImg, offset, threshold, shapeScale, canvasSize]);

  const renderTshirt = useCallback(() => {
    const canvas = tshirtRef.current;
    if (!canvas || !compositeRef.current) return;
    const W = 480;
    const H = tshirtColor === "black" ? Math.round(W / 0.888) : Math.round(W / tshirtAspect);
    canvas.width = W;
    canvas.height = H;
    drawTshirt(canvas, compositeRef.current, tshirtBaseImg, tshirtColor);
  }, [tshirtBaseImg, tshirtAspect, tshirtColor]);

  useEffect(() => {
    if (shapeImg && fillImg) { renderComposite(); }
  }, [shapeImg, fillImg, threshold, shapeScale, canvasSize, renderComposite]);

  useEffect(() => {
    if (shapeImg && fillImg) renderComposite();
  }, [offset, renderComposite]);

  useEffect(() => {
    if (shapeImg && fillImg) setTimeout(() => renderTshirt(), 30);
  }, [shapeImg, fillImg, offset, threshold, canvasSize, tshirtColor, renderTshirt]);

  useEffect(() => {
    const isReady = !!(shapeImg && fillImg);
    if (isReady && !prevIsReady.current) {
      setTimeout(() => previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }
    prevIsReady.current = isReady;
  }, [shapeImg, fillImg]);

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
  const onUp = () => {
    if (draggingRef.current && !dragMovedRef.current) {
      setModalImg(compositeRef.current?.toDataURL("image/png") ?? null);
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
    if (draggingRef.current && !dragMovedRef.current) {
      setModalImg(compositeRef.current?.toDataURL("image/png") ?? null);
    }
    draggingRef.current = false;
  };

  const isReady = shapeImg && fillImg;

  return (
    <div className="min-h-screen bg-white py-12">
      {modalImg && <ImageModal src={modalImg} onClose={() => setModalImg(null)} />}

      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 tracking-wider text-center">PRODUCT</h1>
        <p className="text-center text-black mb-12 text-sm tracking-wide">
          絵からデザインをシミュレート
        </p>

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
                    className={`rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                      selectedShapeId === s.id ? "border-black shadow-md" : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img src={s.imageUrl} alt={s.title} className="w-full h-full object-contain p-1 bg-gray-50" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
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
          <div className="mb-4 flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-black">
              <span className="text-xs whitespace-nowrap">型のサイズ</span>
              <input
                type="range" min={30} max={200} step={5} value={Math.round(shapeScale * 100)}
                onChange={(e) => setShapeScale(Number(e.target.value) / 100)}
                className="w-28 accent-black"
              />
              <span className="text-xs text-black w-8">{Math.round(shapeScale * 100)}%</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-black">
              <span className="text-xs whitespace-nowrap">型のくり抜き調整</span>
              <input
                type="range" min={200} max={254} value={threshold}
                onChange={(e) => { maskRef.current = null; setThreshold(Number(e.target.value)); }}
                className="w-28 accent-black"
              />
              <span className="text-xs text-black">{threshold < 220 ? "広め" : threshold > 245 ? "狭め" : "標準"}</span>
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
          <div ref={previewRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              <p className="text-xs text-black mb-3">クリックで拡大</p>
              <div
                className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 cursor-pointer"
                style={{ width: "100%", aspectRatio: tshirtColor === "black" ? "480 / 540" : `${tshirtAspect}` }}
                onClick={() => setModalImg(tshirtRef.current?.toDataURL("image/png") ?? null)}
              >
                <canvas
                  ref={tshirtRef}
                  style={{ width: "100%", height: "100%", display: "block" }}
                />
              </div>
            </div>
          </div>
        )}

        {!isReady && (
          <div className="text-center py-20 text-black text-sm tracking-wider">
            ①②で絵を選ぶとプレビューが表示されます
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;
