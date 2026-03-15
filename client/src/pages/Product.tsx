import React, { useState, useRef, useEffect, useCallback } from "react";
import { Upload, RefreshCw, Shirt } from "lucide-react";

const CANVAS_SIZE = 480;
const TSHIRT_DESIGN_X = 148;
const TSHIRT_DESIGN_Y = 155;
const TSHIRT_DESIGN_W = 210;
const TSHIRT_DESIGN_H = 230;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function createMaskCanvas(
  img: HTMLImageElement,
  threshold = 235
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth || img.width;
  c.height = img.naturalHeight || img.height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const id = ctx.getImageData(0, 0, c.width, c.height);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      d[i + 3] = 0;
    }
  }
  ctx.putImageData(id, 0, 0);
  return c;
}

const Product: React.FC = () => {
  const [shapeImg, setShapeImg] = useState<HTMLImageElement | null>(null);
  const [fillImg, setFillImg] = useState<HTMLImageElement | null>(null);
  const [shapePreview, setShapePreview] = useState<string>("");
  const [fillPreview, setFillPreview] = useState<string>("");
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showTshirt, setShowTshirt] = useState(false);
  const [tshirtBase, setTshirtBase] = useState<HTMLImageElement | null>(null);
  const [threshold, setThreshold] = useState(235);

  const compositeRef = useRef<HTMLCanvasElement>(null);
  const tshirtRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    loadImageFromUrl("/product/tshirt-sample.jpg")
      .then((img) => setTshirtBase(img))
      .catch(() => {});
  }, []);

  const handleShapeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = await loadImageFromFile(file);
    setShapeImg(img);
    setShapePreview(URL.createObjectURL(file));
    maskRef.current = null;
    setOffset({ x: 0, y: 0 });
  };

  const handleFillUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = await loadImageFromFile(file);
    setFillImg(img);
    setFillPreview(URL.createObjectURL(file));
    setOffset({ x: 0, y: 0 });
  };

  const renderComposite = useCallback(() => {
    const canvas = compositeRef.current;
    if (!canvas || !shapeImg || !fillImg) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (!maskRef.current) {
      maskRef.current = createMaskCanvas(shapeImg, threshold);
    }
    const mask = maskRef.current;

    const scaleF = Math.max(
      (CANVAS_SIZE * 1.2) / fillImg.width,
      (CANVAS_SIZE * 1.2) / fillImg.height
    );
    const fw = fillImg.width * scaleF;
    const fh = fillImg.height * scaleF;
    const baseX = (CANVAS_SIZE - fw) / 2;
    const baseY = (CANVAS_SIZE - fh) / 2;

    ctx.drawImage(fillImg, baseX + offset.x, baseY + offset.y, fw, fh);

    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(mask, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.globalCompositeOperation = "source-over";
  }, [shapeImg, fillImg, offset, threshold]);

  const renderTshirt = useCallback(() => {
    const canvas = tshirtRef.current;
    if (!canvas || !compositeRef.current || !tshirtBase) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 500;
    canvas.height = 500;
    ctx.clearRect(0, 0, 500, 500);

    const tscale = Math.min(500 / tshirtBase.width, 500 / tshirtBase.height);
    const tw = tshirtBase.width * tscale;
    const th = tshirtBase.height * tscale;
    const tx = (500 - tw) / 2;
    const ty = (500 - th) / 2;
    ctx.drawImage(tshirtBase, tx, ty, tw, th);

    ctx.globalCompositeOperation = "multiply";
    const dx = tx + TSHIRT_DESIGN_X * tscale;
    const dy = ty + TSHIRT_DESIGN_Y * tscale;
    const dw = TSHIRT_DESIGN_W * tscale;
    const dh = TSHIRT_DESIGN_H * tscale;
    ctx.drawImage(compositeRef.current, dx, dy, dw, dh);
    ctx.globalCompositeOperation = "source-over";
  }, [tshirtBase]);

  useEffect(() => {
    if (shapeImg && fillImg) {
      maskRef.current = null;
      renderComposite();
    }
  }, [shapeImg, fillImg, threshold, renderComposite]);

  useEffect(() => {
    if (shapeImg && fillImg) {
      renderComposite();
    }
  }, [offset, renderComposite]);

  useEffect(() => {
    if (showTshirt && shapeImg && fillImg) {
      setTimeout(() => renderTshirt(), 50);
    }
  }, [showTshirt, renderTshirt, shapeImg, fillImg, offset]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!compositeRef.current) return;
    const pos = getPos(e, compositeRef.current);
    setDragging(true);
    setDragStart({ x: pos.x - offset.x, y: pos.y - offset.y });
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging || !compositeRef.current) return;
    const pos = getPos(e, compositeRef.current);
    setOffset({ x: pos.x - dragStart.x, y: pos.y - dragStart.y });
  };

  const onMouseUp = () => setDragging(false);

  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!compositeRef.current) return;
    const pos = getPos(e, compositeRef.current);
    setDragging(true);
    setDragStart({ x: pos.x - offset.x, y: pos.y - offset.y });
  };

  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!dragging || !compositeRef.current) return;
    const pos = getPos(e, compositeRef.current);
    setOffset({ x: pos.x - dragStart.x, y: pos.y - dragStart.y });
  };

  const resetOffset = () => {
    setOffset({ x: 0, y: 0 });
    maskRef.current = null;
  };

  const isReady = shapeImg && fillImg;

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-3 tracking-wider text-center">PRODUCT</h1>
        <p className="text-center text-gray-500 mb-12 text-sm tracking-wide">
          絵からデザインをシミュレート
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">1</span>
              <span className="font-semibold text-sm tracking-wider">型の絵を選ぶ</span>
              <span className="text-xs text-gray-400 ml-1">（背景が白い絵が最適）</span>
            </div>
            <label className="block cursor-pointer">
              <div className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center h-52 transition-colors ${shapePreview ? "border-gray-300 bg-gray-50" : "border-gray-300 hover:border-black bg-gray-50 hover:bg-gray-100"}`}>
                {shapePreview ? (
                  <img src={shapePreview} alt="型" className="h-full w-full object-contain rounded-xl p-2" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-300 mb-2" />
                    <span className="text-sm text-gray-400">クリックして画像を選択</span>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleShapeUpload} />
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">2</span>
              <span className="font-semibold text-sm tracking-wider">中身の絵を選ぶ</span>
              <span className="text-xs text-gray-400 ml-1">（型の中に流し込む絵）</span>
            </div>
            <label className="block cursor-pointer">
              <div className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center h-52 transition-colors ${fillPreview ? "border-gray-300 bg-gray-50" : "border-gray-300 hover:border-black bg-gray-50 hover:bg-gray-100"}`}>
                {fillPreview ? (
                  <img src={fillPreview} alt="中身" className="h-full w-full object-contain rounded-xl p-2" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-300 mb-2" />
                    <span className="text-sm text-gray-400">クリックして画像を選択</span>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFillUpload} />
            </label>
          </div>
        </div>

        {isReady && (
          <div className="mb-4 flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <span>背景除去の強さ</span>
              <input
                type="range" min={200} max={255} value={threshold}
                onChange={(e) => {
                  maskRef.current = null;
                  setThreshold(Number(e.target.value));
                }}
                className="w-32 accent-black"
              />
              <span className="text-xs text-gray-400 w-6">{threshold}</span>
            </label>
            <button
              onClick={resetOffset}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              位置をリセット
            </button>
          </div>
        )}

        {isReady && (
          <div className="space-y-10">
            <div>
              <h2 className="text-sm font-semibold tracking-wider text-gray-500 mb-3 uppercase">
                プレビュー <span className="font-normal text-gray-400 text-xs ml-2">← ドラッグして中身の絵を動かせます</span>
              </h2>
              <div className="flex justify-center">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-gray-50"
                  style={{ width: "min(100%, 480px)", aspectRatio: "1/1" }}>
                  <canvas
                    ref={compositeRef}
                    style={{
                      width: "100%",
                      height: "100%",
                      cursor: dragging ? "grabbing" : "grab",
                      touchAction: "none",
                      display: "block",
                    }}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onMouseUp}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
                  Tシャツ イメージ
                </h2>
                <button
                  onClick={() => setShowTshirt((v) => !v)}
                  className="flex items-center gap-1.5 bg-black text-white text-xs px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors"
                >
                  <Shirt className="w-3.5 h-3.5" />
                  {showTshirt ? "非表示" : "Tシャツで見る"}
                </button>
              </div>
              {showTshirt && (
                <div className="flex justify-center">
                  <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100"
                    style={{ width: "min(100%, 480px)", aspectRatio: "1/1" }}>
                    <canvas
                      ref={tshirtRef}
                      style={{ width: "100%", height: "100%", display: "block" }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!isReady && (
          <div className="text-center py-20 text-gray-300 text-sm tracking-wider">
            上の①②で画像を選ぶとプレビューが表示されます
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;
