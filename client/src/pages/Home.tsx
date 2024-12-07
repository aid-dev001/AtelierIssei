import { useEffect } from "react";
import CustomMap from "@/components/Map";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const Home = () => {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal-text');
    elements.forEach((el, i) => {
      (el as HTMLElement).style.animationDelay = `${i * 0.2}s`;
    });
  }, []);

  // Hero section content

  const locations = [
    {
      city: "東京",
      address: "銀座 ATELIER ISSEI本店",
      description: "洗練された空間で新たな芸術体験を"
    },
    {
      city: "広島",
      address: "平和記念公園 アートギャラリー",
      description: "心安らぐ空間での芸術との出会い"
    },
    {
      city: "パリ",
      address: "Galerie ISSEI Paris",
      description: "芸術の都で味わう日本の美意識"
    },
    {
      city: "ニース",
      address: "ISSEI Art Space Nice",
      description: "地中海の光に包まれた展示空間"
    },
    {
      city: "ドバイ",
      address: "ISSEI Gallery Dubai",
      description: "伝統と革新が融合する芸術空間"
    },
    {
      city: "ロンドン",
      address: "ISSEI London Gallery",
      description: "歴史ある街並みに佇む現代アート"
    }
  ];

  return (
    <div className="space-y-20">
      <section className="min-h-screen relative overflow-hidden">
        {/* 背景のグリッドギャラリー */}
        <div className="absolute inset-0 grid grid-cols-6 gap-0.5">
          {[
            // Top row
            "12648.jpg", "12649.jpg", "12650.jpg", "12651.jpg", "12652.jpg", "12653.jpg",
            // Left side
            "12654.jpg", null, null, null, null, "12655.jpg",
            "12656.jpg", null, null, null, null, "12657.jpg",
            "12658.jpg", null, null, null, null, "12659.jpg",
            "12660.jpg", null, null, null, null, "12661.jpg",
            // Bottom row
            "12662.jpg", "12663.jpg", "12664.jpg", "12665.jpg", "12666.jpg", "12667.jpg",
          ].map((img, index) => img ? (
            <div key={index} className="aspect-square overflow-hidden bg-white/5">
              <img
                src={`/${img}`}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover transition-all duration-500 hover:scale-110"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.onerror = null;
                  img.src = '/placeholder.png';
                }}
              />
            </div>
          ) : <div key={index} className="aspect-square bg-transparent" />)}</div>
        {/* オーバーレイとコンテンツ */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center px-4">
              <h1 className="text-6xl md:text-8xl font-bold mb-8 reveal-text tracking-[0.2em] text-gray-800 transition-all duration-700">
                ATELIER ISSEI
              </h1>
              <p className="text-xl md:text-3xl font-light mb-16 reveal-text tracking-[0.3em] text-gray-700">
                洗練された美の世界へ、心を解き放つ旅
              </p>
              <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-10 transform transition-all duration-700 hover:shadow-3xl">
                <p className="text-lg tracking-[0.15em] leading-relaxed font-medium text-gray-800">
                  洗練された美の世界で、新たな芸術体験をお届けします。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-16 text-center tracking-wider">GALLERY LOCATION</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {locations.map((location, index) => (
            <div key={index} className="bg-white/95 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold mb-3">{location.city}</h3>
              <p className="text-lg mb-2 text-gray-700">{location.address}</p>
              <p className="text-sm text-gray-600">{location.description}</p>
            </div>
          ))}
        </div>
        <div className="aspect-[16/9] w-full overflow-hidden rounded-xl shadow-xl">
          <img
            src="/artworks/image.png"
            alt="Gallery Map"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-wider">Latest Exhibition</h2>
            <div className="space-y-4">
              <div className="relative group">
                <img
                  src="/1602605995.jpg"
                  alt="Latest Exhibition"
                  className="w-full h-[500px] object-cover rounded-xl shadow-xl"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              </div>
              <div className="text-left space-y-2">
                <p className="text-lg font-medium text-gray-800">Gallery Art.C</p>
                <p className="text-gray-600">東京都中央区銀座</p>
              </div>
            </div>
            <Button asChild className="w-full h-12 text-lg">
              <Link href="/artworks">View Gallery</Link>
            </Button>
          </div>
          <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-wider">Featured Collection</h2>
            <div className="relative group">
              <img
                src="/3446.jpg"
                alt="Featured Collection"
                className="w-full h-[500px] object-cover rounded-xl shadow-xl"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            </div>
            <Button asChild variant="outline" className="w-full h-12 text-lg">
              <Link href="/news">Latest News</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Exhibition Works */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold mb-16 text-center tracking-wider">LATEST WORKS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {["12648.jpg", "12649.jpg", "12650.jpg"].map((img, index) => (
            <div key={index} className="group relative aspect-square overflow-hidden rounded-lg shadow-xl">
              <img
                src={`/${img}`}
                alt={`Latest Work ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.onerror = null;
                  img.src = '/placeholder.png';
                }}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </section>

      {/* Artistic Vision */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/90 to-white/95" />
        <div className="container relative mx-auto px-4">
          <h2 className="text-5xl font-bold mb-24 text-center tracking-[0.2em] text-gray-800">
            ARTISTIC VISION
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="group relative">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 opacity-75 blur transition duration-500 group-hover:opacity-100" />
              <div className="relative space-y-6 bg-white/80 backdrop-blur-sm p-8 rounded-lg">
                <div className="text-3xl font-light mb-6 tracking-wider text-gray-800">La Lumière</div>
                <p className="text-gray-600 leading-relaxed tracking-wide">
                  光と影の調和から生まれる静謐な空間。色彩の深みが織りなす繊細な世界は、見る者の感性に深く響き渡ります。
                </p>
              </div>
            </div>
            <div className="group relative">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 opacity-75 blur transition duration-500 group-hover:opacity-100" />
              <div className="relative space-y-6 bg-white/80 backdrop-blur-sm p-8 rounded-lg">
                <div className="text-3xl font-light mb-6 tracking-wider text-gray-800">L'essence</div>
                <p className="text-gray-600 leading-relaxed tracking-wide">
                  時を超えて受け継がれる美の本質を追求し、現代的な解釈で新たな芸術の地平を切り開きます。
                </p>
              </div>
            </div>
            <div className="group relative">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 opacity-75 blur transition duration-500 group-hover:opacity-100" />
              <div className="relative space-y-6 bg-white/80 backdrop-blur-sm p-8 rounded-lg">
                <div className="text-3xl font-light mb-6 tracking-wider text-gray-800">L'émotion</div>
                <p className="text-gray-600 leading-relaxed tracking-wide">
                  魂の深淵から湧き上がる感動を、洗練された技法と独自の美意識で表現します。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Media Coverage */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold mb-16 text-center tracking-wider">MEDIA</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-4">
            <div className="text-xl font-medium">Art Journal Magazine</div>
            <p className="text-gray-600">"現代アートシーンに新風を吹き込む注目のアーティスト"</p>
            <div className="text-sm text-gray-500">2024年1月号</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-4">
            <div className="text-xl font-medium">Contemporary Art Review</div>
            <p className="text-gray-600">"伝統と革新の融合：ISSEI's Vision"</p>
            <div className="text-sm text-gray-500">2023年12月特集</div>
          </div>
        </div>
      </section>

      {/* Special Events */}
      <section className="bg-gray-50/80 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-16 text-center tracking-wider">SPECIAL EVENTS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="relative group aspect-[4/3] overflow-hidden rounded-xl shadow-xl">
              <img
                src="/12651.jpg"
                alt="Workshop"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.onerror = null;
                  img.src = '/placeholder.png';
                }}
              />
              <div className="absolute inset-0 bg-black/50 p-8 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-2xl font-medium mb-4">アーティストワークショップ</div>
                <p>ISSEIと共に創造性を探求する特別なワークショップを開催</p>
              </div>
            </div>
            <div className="relative group aspect-[4/3] overflow-hidden rounded-xl shadow-xl">
              <img
                src="/12652.jpg"
                alt="Exhibition"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.onerror = null;
                  img.src = '/placeholder.png';
                }}
              />
              <div className="absolute inset-0 bg-black/50 p-8 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-2xl font-medium mb-4">プライベート展示会</div>
                <p>限定公開の特別展示会。新作のプレビューと対話の機会を提供</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold mb-16 text-center tracking-wider">COLLECTIONS</h2>
        <div className="space-y-16">
          <div className="space-y-8">
            <h3 className="text-2xl font-medium text-center">Abstract Collection 2024</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["12653.jpg", "12654.jpg", "12655.jpg", "12656.jpg"].map((img, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg shadow-lg">
                  <img
                    src={`/${img}`}
                    alt={`Collection ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.onerror = null;
                      img.src = '/placeholder.png';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
