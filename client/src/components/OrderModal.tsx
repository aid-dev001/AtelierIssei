import { useState, useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  imageDataUrl: string;
  imageDataUrl2?: string | null;
  productName: string;
  artworkTitle?: string;
  onClose: () => void;
};

const SIZES = ["S", "M", "L", "XL", "XXL"];

export default function OrderModal({ imageDataUrl, imageDataUrl2, productName, artworkTitle, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [size, setSize] = useState("M");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, address, size, comment, product: productName, artworkTitle: artworkTitle ?? "", imageData: imageDataUrl, imageData2: imageDataUrl2 ?? null })
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setError("送信に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold tracking-widest">注文する — {productName}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          <div className="px-6 py-14 text-center">
            <p className="text-lg font-light tracking-wider mb-2">ありがとうございます</p>
            <p className="text-sm text-gray-500 mb-8">注文を受け付けました。<br />追ってご連絡いたします。</p>
            <button onClick={onClose} className="px-8 py-2.5 bg-black text-white text-xs tracking-widest rounded hover:bg-gray-800 transition-colors">
              閉じる
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

            <div className={`flex gap-3 rounded-xl overflow-hidden bg-gray-50 p-2 ${imageDataUrl2 ? "" : "justify-center"}`}>
              <img src={imageDataUrl} alt="front" className={`object-contain rounded-lg ${imageDataUrl2 ? "flex-1 max-h-40" : "max-h-52"}`} />
              {imageDataUrl2 && (
                <img src={imageDataUrl2} alt="back" className="flex-1 max-h-40 object-contain rounded-lg" />
              )}
            </div>

            {artworkTitle && (
              <p className="text-[10px] tracking-[0.2em] text-gray-400 text-center">使用した作品: {artworkTitle}</p>
            )}

            <p className="text-center text-sm tracking-widest font-light">¥55,000 <span className="text-[10px] text-gray-400">（税込み）</span></p>

            <div>
              <label className="block text-xs tracking-wider text-black mb-1.5">
                お名前 <span className="text-red-400">*</span>
              </label>
              <input
                type="text" required value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs tracking-wider text-black mb-1.5">
                メールアドレス <span className="text-red-400">*</span>
              </label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs tracking-wider text-black mb-1.5">
                住所 <span className="text-red-400">*</span>
              </label>
              <textarea
                required value={address} onChange={(e) => setAddress(e.target.value)} rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors resize-none"
                placeholder="〒000-0000 都道府県市区町村番地..."
              />
            </div>

            <div>
              <label className="block text-xs tracking-wider text-black mb-1.5">サイズ</label>
              <div className="flex gap-2 flex-wrap">
                {SIZES.map((s) => (
                  <button
                    key={s} type="button" onClick={() => setSize(s)}
                    className={`px-4 py-1.5 text-xs rounded border transition-all ${
                      size === s ? "bg-black text-white border-black" : "bg-white text-black border-gray-300 hover:border-black"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs tracking-wider text-black mb-1.5">コメント・ご要望</label>
              <textarea
                value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors resize-none"
                placeholder="カラー、数量、その他ご要望など"
              />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-black text-white text-xs tracking-widest rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? "送信中..." : "送信する"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
