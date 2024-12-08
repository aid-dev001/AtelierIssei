import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const Home = () => {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal-text');
    elements.forEach((el, i) => {
      (el as HTMLElement).style.animationDelay = `${i * 0.2}s`;
    });
  }, []);

  return (
    <div className="space-y-20">
      <section className="min-h-screen relative overflow-hidden">
        {/* 背景の画像ギャラリー */}
        <div className="absolute inset-0">
          {/* グリッド状の画像レイアウト */}
          <div className="grid grid-cols-16 gap-0.5">
            {[...Array(256)].map((_, index) => {
              const imageFiles = [
                "23313_0.jpg", "23317.jpg", "23677.jpg", "1912_0.jpg", 
                "2266.jpg", "2914.jpg", "3316.jpg", "3446.jpg",
                "3525.jpg", "3730.jpg", "6715.jpg", "7853.jpg",
                "7855.jpg", "8594.jpg", "10819.jpg", "10820.jpg"
              ];
              const imgSrc = imageFiles[index % imageFiles.length];
              
              return (
                <div 
                  key={`grid-${index}`} 
                  className="aspect-square overflow-hidden"
                >
                  <img
                    src={`/artworks/${imgSrc}`}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.onerror = null;
                      img.src = '/placeholder.png';
                    }}
                  />
                </div>
              );
            })}
          </div>
          
          {/* 中央の透過カバー - 外側1行1列だけ見えるように調整 */}
          <div className="absolute inset-[60px] bg-white/95 backdrop-blur-sm">
            {/* このdivは透過カバーとして機能します */}
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-6xl md:text-8xl font-bold mb-12 reveal-text tracking-[0.2em] text-gray-800">
                ATELIER ISSEI
              </h1>
              <p className="text-xl md:text-3xl font-light mb-16 reveal-text tracking-[0.3em] text-gray-700">
                心に寄り添うアートを
              </p>
              <div className="max-w-2xl mx-auto space-y-8">
                <p className="text-lg tracking-[0.15em] leading-relaxed font-medium text-gray-700">
                  私たちは、日常の中に特別な瞬間を創造します。
                  温かみのある色彩と大胆な構図で、
                  見る人の心に寄り添う作品を生み出しています。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Art Concept Section - 洗練されたミニマルデザイン */}
      <section className="relative overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-40">
          <img
            src="/artworks/12653.jpg"
            alt="Art Concept Background"
            className="w-full h-full object-cover filter blur-sm"
          />
        </div>
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-32">
            <div className="max-w-4xl mx-auto text-white space-y-16">
              <div className="space-y-8 text-center">
                <h2 className="text-7xl font-bold tracking-[0.3em] opacity-90">
                  ART CONCEPT
                </h2>
                <div className="w-24 h-0.5 bg-white/60 mx-auto"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-light tracking-wider">Tradition</h3>
                  <p className="text-sm leading-relaxed opacity-80">
                    伝統的な技法と現代的な表現を
                    融合させた新しい芸術体験
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-light tracking-wider">Emotion</h3>
                  <p className="text-sm leading-relaxed opacity-80">
                    見る人の心に深く刻まれる
                    感動的な瞬間の創造
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-light tracking-wider">Innovation</h3>
                  <p className="text-sm leading-relaxed opacity-80">
                    革新的なアプローチで
                    新しい価値の創出へ
                  </p>
                </div>
              </div>
              <div className="text-center pt-8">
                <Button asChild className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-12 py-6 text-lg tracking-wider">
                  <Link href="/artworks">View Artworks</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;