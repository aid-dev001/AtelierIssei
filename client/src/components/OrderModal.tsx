import { useState, useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  imageDataUrl: string;
  imageDataUrl2?: string | null;
  productName: string;
  artworkTitle?: string;
  onClose: () => void;
  onGetTransparentPng?: () => string | null;
  onGetTransparentPng2?: () => string | null;
};

const SIZES = ["S", "M", "L", "XL", "XXL"];
const BASE_PRICE = 55000;
const ADD_PRICE = 22000;

function parseSizes(val: string): Record<string, number> {
  try { return JSON.parse(val); } catch { return { M: 1 }; }
}

export default function OrderModal({
  imageDataUrl,
  imageDataUrl2,
  productName,
  artworkTitle,
  onClose,
  onGetTransparentPng,
  onGetTransparentPng2,
}: Props) {
  const [name, setName] = useState(() => localStorage.getItem("order_name") ?? "");
  const [email, setEmail] = useState(() => localStorage.getItem("order_email") ?? "");
  const [address, setAddress] = useState(() => localStorage.getItem("order_address") ?? "");
  const [sizes, setSizes] = useState<Record<string, number>>(() =>
    parseSizes(localStorage.getItem("order_sizes") ?? '{"M":1}')
  );
  const [comment, setComment] = useState(() => localStorage.getItem("order_comment") ?? "");

  const [step, setStep] = useState<"form" | "done">("form");
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState("");

  const totalItems = Object.values(sizes).reduce((a, b) => a + b, 0);
  const totalPrice = totalItems <= 1 ? BASE_PRICE : BASE_PRICE + (totalItems - 1) * ADD_PRICE;
  const sizeStr = SIZES.filter((s) => sizes[s] > 0).map((s) => `${s}×${sizes[s]}`).join("、");

  const changeQty = (s: string, delta: number) => {
    setSizes((prev) => {
      const next = { ...prev };
      const cur = next[s] ?? 0;
      const nv = Math.max(0, cur + delta);
      if (nv === 0) delete next[s]; else next[s] = nv;
      return next;
    });
  };

  useEffect(() => { localStorage.setItem("order_name", name); }, [name]);
  useEffect(() => { localStorage.setItem("order_email", email); }, [email]);
  useEffect(() => { localStorage.setItem("order_address", address); }, [address]);
  useEffect(() => { localStorage.setItem("order_sizes", JSON.stringify(sizes)); }, [sizes]);
  useEffect(() => { localStorage.setItem("order_comment", comment); }, [comment]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalItems === 0) { setError("サイズを1つ以上選択してください。"); return; }
    setLoading(true);
    setError("");
    setProgressMsg("デザインを準備中...");

    await new Promise(resolve => setTimeout(resolve, 60));

    const transparentData = onGetTransparentPng?.() ?? null;
    const transparentData2 = onGetTransparentPng2?.() ?? null;

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, address,
          size: sizeStr || "未選択",
          comment,
          product: productName,
          artworkTitle: artworkTitle ?? "",
          imageData: imageDataUrl,
          imageData2: imageDataUrl2 ?? null,
          transparentData,
          transparentData2,
        }),
      });

      if (!res.ok || !res.body) throw new Error("server error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let isDone = false;
      let errorMsg = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.step === "done") {
              isDone = true;
            } else if (data.step === "error") {
              errorMsg = data.msg;
            } else {
              setProgressMsg(data.msg);
            }
          } catch {}
        }
      }

      if (!isDone) throw new Error(errorMsg || "不明なエラー");

      ["order_name", "order_email", "order_address", "order_sizes", "order_comment"].forEach(k => localStorage.removeItem(k));
      setStep("done");
    } catch {
      setError("注文の送信に失敗しました。サポートにお問い合わせください。");
    } finally {
      setLoading(false);
      setProgressMsg("");
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <div className="bg-black/85 text-white rounded-2xl px-10 py-8 flex flex-col items-center gap-4 shadow-2xl min-w-[260px]">
            <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-semibold tracking-widest text-center">{progressMsg || "処理中..."}</div>
            <div className="text-xs text-white/50">この処理には数十秒かかります</div>
          </div>
        </div>
      )}
      <div className="fixed top-0 left-0 right-0 h-16 bg-black/50 z-[150]" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 top-16 z-[200] flex items-center justify-center bg-black/60 p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-white rounded w-full max-w-lg max-h-[88vh] overflow-y-auto shadow-2xl">

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold tracking-widest">
              注文する — {productName}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {step === "done" ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm text-gray-500 mb-8">
                注文を受け付けました。<br />追って担当者よりご連絡させて頂きます。
              </p>
              <button onClick={onClose} className="px-8 py-2.5 bg-black text-white text-xs tracking-widest rounded hover:bg-gray-800 transition-colors">
                閉じる
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

              <div className={`flex gap-3 rounded-xl overflow-hidden bg-gray-50 p-2 ${imageDataUrl2 ? "" : "justify-center"}`}>
                <img src={imageDataUrl} alt="front" className={`object-contain rounded-lg ${imageDataUrl2 ? "flex-1 max-h-40" : "max-h-52"}`} />
                {imageDataUrl2 && <img src={imageDataUrl2} alt="back" className="flex-1 max-h-40 object-contain rounded-lg" />}
              </div>

              {artworkTitle && (
                <p className="text-[10px] tracking-[0.2em] text-black text-center">使用した作品: {artworkTitle}</p>
              )}

              <div className="text-center">
                <p className="text-sm tracking-widest font-light">
                  ¥{totalPrice.toLocaleString()} <span className="text-[10px] text-black">（税込み）</span>
                  {totalItems > 1 && (
                    <span className="ml-1 text-[10px] text-black">× {totalItems}枚</span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-xs tracking-wider text-black mb-1.5">お名前 <span className="text-red-400">*</span></label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors" />
              </div>

              <div>
                <label className="block text-xs tracking-wider text-black mb-1.5">メールアドレス <span className="text-red-400">*</span></label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors" />
              </div>

              <div>
                <label className="block text-xs tracking-wider text-black mb-1.5">お届け先住所 <span className="text-red-400">*</span></label>
                <textarea required value={address} onChange={(e) => setAddress(e.target.value)} rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors resize-none" />
              </div>

              <div>
                <label className="block text-xs tracking-wider text-black mb-2">サイズ・枚数</label>
                <div className="flex flex-wrap gap-3">
                  {SIZES.map((s) => {
                    const qty = sizes[s] ?? 0;
                    return (
                      <div key={s} className={`flex items-center gap-1.5 border rounded-lg px-2 py-1.5 transition-colors ${qty > 0 ? "border-black" : "border-gray-200"}`}>
                        <span className="text-xs font-medium w-7 text-center">{s}</span>
                        <button type="button" onClick={() => changeQty(s, -1)}
                          className="w-5 h-5 flex items-center justify-center text-sm leading-none text-gray-400 hover:text-black transition-colors disabled:opacity-30"
                          disabled={qty === 0}>−</button>
                        <span className="text-xs w-4 text-center">{qty}</span>
                        <button type="button" onClick={() => changeQty(s, 1)}
                          className="w-5 h-5 flex items-center justify-center text-sm leading-none hover:text-black transition-colors">＋</button>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-black mt-2 leading-relaxed">
                  ※ 2枚目以降は1枚追加するごとに ¥{ADD_PRICE.toLocaleString()} 加算されます。
                </p>
              </div>

              <div>
                <label className="block text-xs tracking-wider text-black mb-1.5">コメント・ご要望</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors resize-none"
                  placeholder="その他ご要望など" />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button type="submit" disabled={loading || totalItems === 0}
                className="w-full py-3 bg-black text-white text-xs tracking-widest rounded hover:bg-gray-800 transition-colors disabled:opacity-50">
                {loading ? "処理中..." : "注文する →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
