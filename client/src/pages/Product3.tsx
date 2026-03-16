import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, X, RefreshCw, Trash2 } from "lucide-react";
import ScrollToTopLink from "@/components/ScrollToTopLink";

function ImageModal({ src, onClose }: { src: string; onClose: () => void }) {
  const download = () => {
    const a = document.createElement("a");
    a.href = src;
    a.download = "issei-design.png";
    a.click();
  };
  return (
    <div className="fixed inset-0 bg-black/85 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt="拡大プレビュー" className="w-full rounded-2xl shadow-2xl" />
        <div className="absolute top-3 right-3 flex gap-2">
          <button onClick={download} className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow transition-colors" title="ダウンロード">
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

type ArtworkItem = { id: number; title: string; imageUrl: string };

type ShapeItem = {
  id: string;
  type: "rect" | "triangle" | "circle";
  cx: number;
  cy: number;
  w: number;
  h: number;
};

const CW = 800;
const CH = 900;
const PAGE_SIZE = 12;
const CLICK_THRESHOLD = 6;

const DEFAULT_SHAPES: ShapeItem[] = [
  { id: "s0", type: "rect", cx: 0.5, cy: 0.35, w: 0.3, h: 0.22 },
];

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

function drawShapePath(ctx: CanvasRenderingContext2D, shape: ShapeItem) {
  const px = shape.cx * CW;
  const py = shape.cy * CH;
  const pw = shape.w * CW;
  const ph = shape.h * CH;
  ctx.beginPath();
  if (shape.type === "rect") {
    ctx.rect(px - pw / 2, py - ph / 2, pw, ph);
  } else if (shape.type === "circle") {
    const r = Math.min(pw, ph) / 2;
    ctx.arc(px, py, r, 0, Math.PI * 2);
  } else {
    ctx.moveTo(px, py - ph / 2);
    ctx.lineTo(px + pw / 2, py + ph / 2);
    ctx.lineTo(px - pw / 2, py + ph / 2);
    ctx.closePath();
  }
}

function isHit(shape: ShapeItem, nx: number, ny: number): boolean {
  const dx = Math.abs(nx - shape.cx) * CW;
  const dy = Math.abs(ny - shape.cy) * CH;
  return dx <= (shape.w * CW) / 2 + 8 && dy <= (shape.h * CH) / 2 + 8;
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
  const [shapes, setShapes] = useState<ShapeItem[]>(DEFAULT_SHAPES);
  const [selectedId, setSelectedId] = useState<string | null>("s0");
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);
  const didMove = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ cx: 0.5, cy: 0.35 });
  const lastHitId = useRef<string | null>(null);

  useEffect(() => {
    Promise.all([
      loadImg("/product/tshirt-base.jpg"),
      loadImg("/product/tshirt-black-base.jpg"),
    ])
      .then(([w, b]) => {
        setShirtImg(w);
        setBlackShirtImg(b);
        setShirtLoaded(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedArtId) return;
    const art = artworks.find((a) => a.id === selectedArtId);
    if (!art) return;
    loadImg(art.imageUrl).then(setArtImg).catch(() => {});
  }, [selectedArtId, artworks]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const shirt = tshirtColor === "black" ? blackShirtImg : shirtImg;
    if (!canvas || !shirt) return;
    const ctx = canvas.getContext("2d")!;
    const blend = tshirtColor === "black" ? "screen" : "multiply";

    ctx.clearRect(0, 0, CW, CH);
    ctx.drawImage(shirt, 0, 0, CW, CH);

    if (artImg && shapes.length > 0) {
      // オフスクリーンキャンバス: 全体に絵を広げ、形を窓として切り抜く
      const off = document.createElement("canvas");
      off.width = CW;
      off.height = CH;
      const offCtx = off.getContext("2d")!;

      // 絵をキャンバス全体にカバー
      const ar = artImg.width / artImg.height;
      const cr = CW / CH;
      let dw: number, dh: number, dx: number, dy: number;
      if (ar > cr) {
        dh = CH; dw = dh * ar; dx = (CW - dw) / 2; dy = 0;
      } else {
        dw = CW; dh = dw / ar; dx = 0; dy = (CH - dh) / 2;
      }
      offCtx.drawImage(artImg, dx, dy, dw, dh);

      // 全形の合計を destination-in でマスク
      offCtx.globalCompositeOperation = "destination-in";
      shapes.forEach((shape) => {
        offCtx.save();
        drawShapePath(offCtx, shape);
        offCtx.fillStyle = "black";
        offCtx.fill();
        offCtx.restore();
      });

      // メインキャンバスにブレンド合成
      ctx.globalCompositeOperation = blend as GlobalCompositeOperation;
      ctx.drawImage(off, 0, 0);
      ctx.globalCompositeOperation = "source-over";
    }

    // 選択中の形をダッシュ枠で表示
    if (selectedId) {
      const sel = shapes.find((s) => s.id === selectedId);
      if (sel) {
        ctx.save();
        drawShapePath(ctx, sel);
        ctx.strokeStyle = "rgba(0,0,0,0.55)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.restore();
      }
    }
  }, [shirtImg, blackShirtImg, artImg, shapes, selectedId, tshirtColor]);

  useEffect(() => { render(); }, [render]);

  // キーボードで削除
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        // input / textarea にフォーカスがある場合は無視
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
    const mx = Math.abs(x - dragStart.current.x);
    const my = Math.abs(y - dragStart.current.y);
    if (mx > CLICK_THRESHOLD || my > CLICK_THRESHOLD) didMove.current = true;
    if (!didMove.current) return;
    const rect = canvas.getBoundingClientRect();
    const ndx = (x - dragStart.current.x) / rect.width;
    const ndy = (y - dragStart.current.y) / rect.height;
    const id = lastHitId.current;
    setShapes((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              cx: Math.max(0.05, Math.min(0.95, dragStartPos.current.cx + ndx)),
              cy: Math.max(0.05, Math.min(0.95, dragStartPos.current.cy + ndy)),
            }
          : s
      )
    );
  };

  const onUp = () => {
    dragging.current = false;
  };

  const addShape = (type: "rect" | "triangle" | "circle") => {
    const id = `s${Date.now()}`;
    setShapes((prev) => [...prev, { id, type, cx: 0.5, cy: 0.38, w: 0.25, h: 0.2 }]);
    setSelectedId(id);
    lastHitId.current = id;
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setShapes((prev) => prev.filter((s) => s.id !== selectedId));
    setSelectedId(null);
    lastHitId.current = null;
  };

  const selectedShape = shapes.find((s) => s.id === selectedId);
  const totalPages = Math.ceil(artworks.length / PAGE_SIZE);
  const visibleArtworks = artworks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-white py-12">
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
          <ScrollToTopLink href="/product" className="text-sm tracking-widest text-gray-400 hover:text-black transition-colors">
            PRODUCT 1
          </ScrollToTopLink>
          <ScrollToTopLink href="/product2" className="text-sm tracking-widest text-gray-400 hover:text-black transition-colors">
            PRODUCT 2
          </ScrollToTopLink>
          <span className="text-sm tracking-widest text-black border-b-2 border-black pb-1">
            PRODUCT 3
          </span>
        </div>

        <div className="max-w-xl mx-auto mb-12 text-center space-y-4">
          <p className="text-sm leading-relaxed tracking-wide text-black">
            形を選び、絵を選ぶ。
          </p>
          <p className="text-sm leading-relaxed tracking-wide text-black">
            ISSEIの作品を四角・丸・三角の窓越しに纏う、<br className="hidden md:block" />
            あなただけのTシャツデザインを。
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Canvas */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-xs text-black tracking-wider">FRONT</span>
              <div className="flex gap-2">
                {(["white", "black"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setTshirtColor(c)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      tshirtColor === c
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-gray-300 hover:border-black"
                    }`}
                  >
                    {c === "white" ? "WHITE" : "BLACK"}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-sm bg-gray-50">
              {!shirtLoaded && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10"
                  style={{ aspectRatio: `${CW} / ${CH}` }}
                >
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
              <button
                onClick={() => setModalImg(canvasRef.current?.toDataURL("image/png") ?? null)}
                className="absolute bottom-3 right-3 bg-white/80 hover:bg-white rounded-full p-2 shadow transition-colors"
                title="拡大・ダウンロード"
              >
                <Download className="w-4 h-4 text-black" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">形をドラッグで移動 · 右下ボタンでダウンロード</p>
          </div>

          {/* Controls */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
            {/* ① 形を調整する */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">1</span>
                <span className="font-semibold text-sm tracking-wider">形を調整する</span>
              </div>

              {/* 形を追加 */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">形を追加</p>
                <div className="flex gap-2">
                  <button onClick={() => addShape("rect")} className="flex-1 py-2 text-xs border border-gray-300 rounded-xl hover:border-black transition-colors">▭ 長方形</button>
                  <button onClick={() => addShape("circle")} className="flex-1 py-2 text-xs border border-gray-300 rounded-xl hover:border-black transition-colors">● 丸</button>
                  <button onClick={() => addShape("triangle")} className="flex-1 py-2 text-xs border border-gray-300 rounded-xl hover:border-black transition-colors">▲ 三角</button>
                </div>
              </div>

              {/* 形の一覧 */}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setShapes((prev) => prev.filter((x) => x.id !== s.id));
                          if (selectedId === s.id) { setSelectedId(null); lastHitId.current = null; }
                        }}
                        className={`transition-colors ${selectedId === s.id ? "text-white/60 hover:text-white" : "text-gray-400 hover:text-red-500"}`}
                        title="削除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 選択中の形のスライダー */}
              {selectedShape ? (
                <div className="bg-gray-50 rounded-xl p-3 space-y-3">
                  <p className="text-xs text-gray-500">サイズを調整</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-black whitespace-nowrap w-6">幅</span>
                    <input
                      type="range" min={0.05} max={0.8} step={0.01}
                      value={selectedShape.w}
                      onChange={(e) =>
                        setShapes((prev) =>
                          prev.map((s) => s.id === selectedId ? { ...s, w: Number(e.target.value) } : s)
                        )
                      }
                      className="flex-1 accent-black"
                    />
                    <span className="text-xs text-gray-400 w-8">{Math.round(selectedShape.w * 100)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-black whitespace-nowrap w-6">高さ</span>
                    <input
                      type="range" min={0.05} max={0.8} step={0.01}
                      value={selectedShape.h}
                      onChange={(e) =>
                        setShapes((prev) =>
                          prev.map((s) => s.id === selectedId ? { ...s, h: Number(e.target.value) } : s)
                        )
                      }
                      className="flex-1 accent-black"
                    />
                    <span className="text-xs text-gray-400 w-8">{Math.round(selectedShape.h * 100)}</span>
                  </div>
                </div>
              ) : (
                shapes.length > 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">形を選ぶとサイズ調整できます</p>
                )
              )}

              <button
                onClick={() => {
                  setShapes([...DEFAULT_SHAPES]);
                  setSelectedId("s0");
                  lastHitId.current = "s0";
                }}
                className="flex items-center gap-1.5 text-sm text-black hover:text-gray-600 transition-colors w-fit mt-4"
              >
                <RefreshCw className="w-4 h-4" />
                リセット
              </button>
            </div>

            {/* ② 絵を選ぶ */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">2</span>
                <span className="font-semibold text-sm tracking-wider">絵を選ぶ</span>
                <span className="text-xs text-black">ISSEIの作品から選択</span>
              </div>
              {artworks.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center border rounded-xl">作品がありません</p>
              ) : (
                <div className="overflow-y-auto" style={{ maxHeight: "280px" }}>
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
            </div>
          </div>
        </div>
      </div>

      {modalImg && <ImageModal src={modalImg} onClose={() => setModalImg(null)} />}
    </div>
  );
}
