import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Download, X } from "lucide-react";
import ScrollToTopLink from "@/components/ScrollToTopLink";

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

function drawTshirt(
  canvas: HTMLCanvasElement,
  designCanvas: HTMLCanvasElement | null,
  baseImg: HTMLImageElement | null,
  blackImg: HTMLImageElement | null,
  color: "white" | "black",
  designScale: number,
  designPos: { x: number; y: number }
) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, W, H);

  const shirt = color === "white" ? baseImg : blackImg;
  if (shirt) {
    ctx.drawImage(shirt, 0, 0, W, H);
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
      className="fixed inset-0 bg-black/85 z-[200] flex items-center justify-center p-4"
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
    const shape = shapes.find((s) => s.id === selectedShapeId);
    if (!shape) return;
    let cancelled = false;
    maskRef.current = null;
    maskForImgRef.current = null;
    setShapeImg(null);
    setOffset({ x: 0, y: 0 });
    setFillScale(1.0);
    setShapeScale(1.0);
    setDesignPos({ x: 0, y: 0 });
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
    drawTshirt(canvas, compositeRef.current, tshirtBaseImg, tshirtBlackImg, tshirtColor, shapeScale, designPos);
  }, [tshirtBaseImg, tshirtBlackImg, tshirtAspect, tshirtBlackAspect, tshirtColor, shapeScale, designPos]);

  useEffect(() => {
    if (!shapeImg || !fillImg) return;
    renderComposite();
    const timer = setTimeout(() => renderTshirt(), 10);
    return () => clearTimeout(timer);
  }, [shapeImg, fillImg, offset, fillScale, canvasSize, renderComposite, renderTshirt]);

  useEffect(() => {
    if (shapeImg && fillImg) {
      setTimeout(() => {
        const el = previewRef.current;
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: "smooth" });
      }, 200);
    }
  }, [shapeImg, fillImg]);

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
      x: tshirtDragStartOffsetRef.current.x + dx * scale,
      y: tshirtDragStartOffsetRef.current.y + dy * scale,
    });
  };
  const onTshirtUp = () => {
    if (tshirtDraggingRef.current && !dragMovedRef.current) {
      setModalImg(tshirtRef.current?.toDataURL("image/png") ?? null);
    }
    tshirtDraggingRef.current = false;
  };

  const isReady = shapeImg && fillImg;

  return (
    <div className="min-h-screen bg-white py-12">
      {modalImg && <ImageModal src={modalImg} onClose={() => setModalImg(null)} />}

      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 tracking-wider text-center">PRODUCT</h1>
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
        </div>

        <div className="max-w-xl mx-auto mb-12 text-center space-y-4">
          <p className="text-sm leading-relaxed tracking-wide text-black">
            型を選び、中身に絵を選ぶ。
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
            <label className="flex items-center gap-2 text-sm text-black">
              <span className="text-xs whitespace-nowrap">型の中の絵</span>
              <input
                type="range" min={50} max={300} step={5} value={Math.round(fillScale * 100)}
                onChange={(e) => setFillScale(Number(e.target.value) / 100)}
                className="w-28 accent-black"
              />
              <span className="text-xs text-black w-8">{Math.round(fillScale * 100)}%</span>
            </label>
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
                className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 cursor-grab active:cursor-grabbing select-none"
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
