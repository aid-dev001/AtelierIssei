import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

type ProductShape = { id: number; title: string; imageUrl: string };
type ArtworkItem = { id: number; title: string; imageUrl: string };

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

function drawTshirt(
  canvas: HTMLCanvasElement,
  designCanvas: HTMLCanvasElement | null
) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, W, H);
  const s = W / 500;

  ctx.fillStyle = "#888888";
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.22)";
  ctx.shadowBlur = 18 * s;
  ctx.shadowOffsetY = 4 * s;

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
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  if (designCanvas) {
    const dw = designCanvas.width;
    const dh = designCanvas.height;
    const aspect = dw / dh;
    const maxW = 160 * s;
    const maxH = 180 * s;
    let rw = maxW;
    let rh = rw / aspect;
    if (rh > maxH) { rh = maxH; rw = rh * aspect; }
    const dx = (W - rw) / 2;
    const dy = 195 * s;
    ctx.drawImage(designCanvas, dx, dy, rw, rh);

    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.font = `${10 * s}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("ISSEI – Wearable Abstraction", W / 2, dy + rh + 16 * s);
  }
}

const Product: React.FC = () => {
  const [selectedShapeId, setSelectedShapeId] = useState<number | null>(null);
  const [selectedFillId, setSelectedFillId] = useState<number | null>(null);
  const [shapeImg, setShapeImg] = useState<HTMLImageElement | null>(null);
  const [fillImg, setFillImg] = useState<HTMLImageElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [threshold, setThreshold] = useState(238);
  const [canvasSize, setCanvasSize] = useState({ w: 480, h: 480 });

  const compositeRef = useRef<HTMLCanvasElement>(null);
  const tshirtRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);

  const { data: shapes = [] } = useQuery<ProductShape[]>({
    queryKey: ["product-shapes"],
    queryFn: () => fetch("/api/product-shapes").then((r) => r.json()),
  });

  const { data: artworks = [] } = useQuery<ArtworkItem[]>({
    queryKey: ["/api/artworks"],
    queryFn: () => fetch("/api/artworks").then((r) => r.json()),
  });

  useEffect(() => {
    if (selectedShapeId == null) return;
    const shape = shapes.find((s) => s.id === selectedShapeId);
    if (!shape) return;
    maskRef.current = null;
    setOffset({ x: 0, y: 0 });
    loadImg(shape.imageUrl).then((img) => {
      const maxW = Math.min(480, window.innerWidth - 48);
      const aspect = img.naturalWidth / img.naturalHeight;
      const w = maxW;
      const h = Math.round(maxW / aspect);
      setCanvasSize({ w, h });
      setShapeImg(img);
    });
  }, [selectedShapeId, shapes]);

  useEffect(() => {
    if (selectedFillId == null) return;
    const art = artworks.find((a) => a.id === selectedFillId);
    if (!art) return;
    loadImg(art.imageUrl).then(setFillImg);
  }, [selectedFillId, artworks]);

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

    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(maskRef.current, 0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
  }, [shapeImg, fillImg, offset, threshold, canvasSize]);

  const renderTshirt = useCallback(() => {
    const canvas = tshirtRef.current;
    if (!canvas || !compositeRef.current) return;
    canvas.width = 480;
    canvas.height = 560;
    drawTshirt(canvas, compositeRef.current);
  }, []);

  useEffect(() => {
    if (shapeImg && fillImg) {
      maskRef.current = null;
      renderComposite();
    }
  }, [shapeImg, fillImg, threshold, canvasSize, renderComposite]);

  useEffect(() => {
    if (shapeImg && fillImg) renderComposite();
  }, [offset, renderComposite]);

  useEffect(() => {
    if (shapeImg && fillImg) setTimeout(() => renderTshirt(), 30);
  }, [shapeImg, fillImg, offset, threshold, canvasSize, renderTshirt]);

  const getCanvasPos = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement
  ) => {
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
    setDragging(true);
    setDragStart({ x: p.x - offset.x, y: p.y - offset.y });
  };
  const onMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging || !compositeRef.current) return;
    const p = getCanvasPos(e, compositeRef.current);
    setOffset({ x: p.x - dragStart.x, y: p.y - dragStart.y });
  };
  const onUp = () => setDragging(false);
  const onTouchDown = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!compositeRef.current) return;
    const p = getCanvasPos(e, compositeRef.current);
    setDragging(true);
    setDragStart({ x: p.x - offset.x, y: p.y - offset.y });
  };
  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!dragging || !compositeRef.current) return;
    const p = getCanvasPos(e, compositeRef.current);
    setOffset({ x: p.x - dragStart.x, y: p.y - dragStart.y });
  };

  const isReady = shapeImg && fillImg;

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 tracking-wider text-center">PRODUCT</h1>
        <p className="text-center text-gray-400 mb-12 text-sm tracking-wide">
          絵からデザインをシミュレート
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">1</span>
              <span className="font-semibold text-sm tracking-wider">型の絵を選ぶ</span>
              <span className="text-xs text-gray-400">（白背景推奨）</span>
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
                      selectedShapeId === s.id
                        ? "border-black shadow-md"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={s.imageUrl}
                      alt={s.title}
                      className="w-full h-full object-contain p-1 bg-gray-50"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">2</span>
              <span className="font-semibold text-sm tracking-wider">中身の絵を選ぶ</span>
              <span className="text-xs text-gray-400">（アートワークから）</span>
            </div>
            {artworks.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center border rounded-xl">
                作品がありません
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                {artworks.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedFillId(a.id)}
                    className={`rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                      selectedFillId === a.id
                        ? "border-black shadow-md"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={a.imageUrl}
                      alt={a.title}
                      className="w-full h-full object-cover bg-gray-50"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isReady && (
          <div className="mb-4 flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-xs">①型の背景除去</span>
              <input
                type="range" min={200} max={254} value={threshold}
                onChange={(e) => { maskRef.current = null; setThreshold(Number(e.target.value)); }}
                className="w-28 accent-black"
              />
              <span className="text-xs text-gray-400 w-6">{threshold}</span>
            </label>
            <button
              onClick={() => { setOffset({ x: 0, y: 0 }); }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              位置リセット
            </button>
          </div>
        )}

        {isReady && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-3">
                プレビュー
                <span className="font-normal ml-2 text-gray-300">← ドラッグで中身の絵を動かせます</span>
              </p>
              <div
                className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-gray-50"
                style={{ width: "100%", aspectRatio: `${canvasSize.w} / ${canvasSize.h}` }}
              >
                <canvas
                  ref={compositeRef}
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    cursor: dragging ? "grabbing" : "grab",
                    touchAction: "none",
                  }}
                  onMouseDown={onDown}
                  onMouseMove={onMove}
                  onMouseUp={onUp}
                  onMouseLeave={onUp}
                  onTouchStart={onTouchDown}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onUp}
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-3">
                Tシャツ イメージ
              </p>
              <div
                className="rounded-2xl overflow-hidden shadow-lg border border-gray-100"
                style={{ width: "100%", aspectRatio: "480 / 560" }}
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
          <div className="text-center py-20 text-gray-300 text-sm tracking-wider">
            ①②で絵を選ぶとプレビューが表示されます
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;
