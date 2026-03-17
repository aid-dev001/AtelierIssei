import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

type Props = {
  imageDataUrl: string;
  imageDataUrl2?: string | null;
  transparentDataUrl?: string | null;
  transparentDataUrl2?: string | null;
  productName: string;
  artworkTitle?: string;
  onClose: () => void;
};

const SIZES = ["S", "M", "L", "XL", "XXL"];

const CARD_STYLE = {
  style: {
    base: {
      fontSize: "14px",
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      color: "#1a1a1a",
      "::placeholder": { color: "#aab7c4" },
    },
    invalid: { color: "#e74c3c" },
  },
};

type FormData = {
  name: string;
  email: string;
  address: string;
  size: string;
  comment: string;
};

function PaymentStep({
  formData,
  clientSecret,
  onSuccess,
}: {
  formData: FormData;
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setPaying(true);
    setPayError("");
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) { setPaying(false); return; }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: { name: formData.name, email: formData.email },
      },
    });

    if (error) {
      setPayError(error.message ?? "支払いに失敗しました");
      setPaying(false);
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
    } else {
      setPayError("支払いを完了できませんでした");
      setPaying(false);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-xs text-black tracking-wider">カード情報を入力してください</p>

      <div className="border border-gray-200 rounded-lg px-3 py-3">
        <CardElement options={CARD_STYLE} />
      </div>

      {payError && <p className="text-xs text-red-500">{payError}</p>}

      <div className="text-center">
        <p className="text-sm tracking-widest font-light mb-4">
          ¥55,000 <span className="text-[10px] text-black">（税込み）</span>
        </p>
        <button
          onClick={handlePay}
          disabled={paying || !stripe}
          className="w-full py-3 bg-black text-white text-xs tracking-widest rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {paying ? "処理中..." : "支払いを完了する"}
        </button>
      </div>
    </div>
  );
}

function OrderModalInner({
  imageDataUrl,
  imageDataUrl2,
  transparentDataUrl,
  transparentDataUrl2,
  productName,
  artworkTitle,
  onClose,
  stripePromise,
}: Props & { stripePromise: ReturnType<typeof loadStripe> }) {
  const [name, setName] = useState(() => localStorage.getItem("order_name") ?? "");
  const [email, setEmail] = useState(() => localStorage.getItem("order_email") ?? "");
  const [address, setAddress] = useState(() => localStorage.getItem("order_address") ?? "");
  const [size, setSize] = useState(() => localStorage.getItem("order_size") ?? "M");
  const [comment, setComment] = useState(() => localStorage.getItem("order_comment") ?? "");

  const [step, setStep] = useState<"form" | "payment" | "done">("form");
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { localStorage.setItem("order_name", name); }, [name]);
  useEffect(() => { localStorage.setItem("order_email", email); }, [email]);
  useEffect(() => { localStorage.setItem("order_address", address); }, [address]);
  useEffect(() => { localStorage.setItem("order_size", size); }, [size]);
  useEffect(() => { localStorage.setItem("order_comment", comment); }, [comment]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, product: productName }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setStep("payment");
    } catch {
      setError("支払い処理の開始に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, address, size, comment,
          product: productName,
          artworkTitle: artworkTitle ?? "",
          imageData: imageDataUrl,
          imageData2: imageDataUrl2 ?? null,
          transparentData: transparentDataUrl ?? null,
          transparentData2: transparentDataUrl2 ?? null,
          paymentIntentId,
        }),
      });
      if (!res.ok) throw new Error();
      ["order_name","order_email","order_address","order_size","order_comment"].forEach(k => localStorage.removeItem(k));
      setStep("done");
    } catch {
      setError("注文の送信に失敗しました。サポートにお問い合わせください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-16 bg-black/50 z-[150]" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 top-16 z-[200] flex items-center justify-center bg-black/60 p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-white rounded w-full max-w-lg max-h-[88vh] overflow-y-auto shadow-2xl">

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold tracking-widest">
              {step === "payment" ? "お支払い — " : "注文する — "}{productName}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {step === "done" ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm text-gray-500 mb-8">
                お支払いが完了し、注文を受け付けました。<br />追って担当者よりご連絡させて頂きます。
              </p>
              <button onClick={onClose} className="px-8 py-2.5 bg-black text-white text-xs tracking-widest rounded hover:bg-gray-800 transition-colors">
                閉じる
              </button>
            </div>
          ) : step === "payment" ? (
            <div className="px-6 py-6 space-y-4">
              <div className={`flex gap-3 rounded-xl overflow-hidden bg-gray-50 p-2 ${imageDataUrl2 ? "" : "justify-center"}`}>
                <img src={imageDataUrl} alt="front" className={`object-contain rounded-lg ${imageDataUrl2 ? "flex-1 max-h-36" : "max-h-44"}`} />
                {imageDataUrl2 && <img src={imageDataUrl2} alt="back" className="flex-1 max-h-36 object-contain rounded-lg" />}
              </div>

              <div className="text-xs text-black space-y-0.5 pt-1">
                <p>{name} 様</p>
                <p>{email}</p>
                <p>サイズ: {size}</p>
              </div>

              {clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentStep
                    formData={{ name, email, address, size, comment }}
                    clientSecret={clientSecret}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              )}

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                onClick={() => setStep("form")}
                className="text-xs text-black underline hover:opacity-60 transition-opacity"
              >
                ← 入力内容を修正する
              </button>
            </div>
          ) : (
            <form onSubmit={handleProceedToPayment} className="px-6 py-6 space-y-5">

              <div className={`flex gap-3 rounded-xl overflow-hidden bg-gray-50 p-2 ${imageDataUrl2 ? "" : "justify-center"}`}>
                <img src={imageDataUrl} alt="front" className={`object-contain rounded-lg ${imageDataUrl2 ? "flex-1 max-h-40" : "max-h-52"}`} />
                {imageDataUrl2 && <img src={imageDataUrl2} alt="back" className="flex-1 max-h-40 object-contain rounded-lg" />}
              </div>

              {artworkTitle && (
                <p className="text-[10px] tracking-[0.2em] text-black text-center">使用した作品: {artworkTitle}</p>
              )}

              <p className="text-center text-sm tracking-widest font-light">¥55,000 <span className="text-[10px] text-black">（税込み）</span></p>

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
                <label className="block text-xs tracking-wider text-black mb-1.5">住所 <span className="text-red-400">*</span></label>
                <textarea required value={address} onChange={(e) => setAddress(e.target.value)} rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors resize-none"
                  placeholder="〒000-0000 都道府県市区町村番地..." />
              </div>

              <div>
                <label className="block text-xs tracking-wider text-black mb-1.5">サイズ</label>
                <div className="flex gap-2 flex-wrap">
                  {SIZES.map((s) => (
                    <button key={s} type="button" onClick={() => setSize(s)}
                      className={`px-4 py-1.5 text-xs rounded border transition-all ${size === s ? "bg-black text-white border-black" : "bg-white text-black border-gray-300 hover:border-black"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-wider text-black mb-1.5">コメント・ご要望</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors resize-none"
                  placeholder="カラー、数量、その他ご要望など" />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-black text-white text-xs tracking-widest rounded hover:bg-gray-800 transition-colors disabled:opacity-50">
                {loading ? "処理中..." : "支払いへ進む →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default function OrderModal(props: Props) {
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);

  useEffect(() => {
    fetch("/api/stripe-config")
      .then((r) => r.json())
      .then((d) => {
        if (d.publishableKey) setStripePromise(loadStripe(d.publishableKey));
      })
      .catch(() => {});
  }, []);

  if (!stripePromise) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 h-16 bg-black/50 z-[150]" onClick={props.onClose} />
        <div className="fixed inset-x-0 bottom-0 top-16 z-[200] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded w-full max-w-lg p-12 text-center shadow-2xl">
            <p className="text-sm text-gray-400 tracking-wider">読み込み中...</p>
          </div>
        </div>
      </>
    );
  }

  return <OrderModalInner {...props} stripePromise={stripePromise} />;
}
