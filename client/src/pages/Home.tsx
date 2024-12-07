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
        <div className="absolute inset-0 grid grid-cols-12 gap-0.5">
          {[
            // Top row
            "artworks/23313_0.jpg", "artworks/23317.jpg", "artworks/23677.jpg", "artworks/1912_0.jpg", "artworks/2266.jpg", "artworks/2914.jpg", "artworks/3316.jpg", "artworks/3446.jpg", "artworks/3525.jpg", "artworks/3730.jpg", "artworks/6715.jpg", "artworks/7853.jpg",
            // Left side
            "artworks/7855.jpg", "artworks/8594.jpg", "artworks/10819.jpg", "artworks/10820.jpg", "artworks/10821.jpg", "artworks/10822.jpg", "artworks/10823.jpg", "artworks/14996.jpg", "artworks/1602605995.jpg", "artworks/02-scaled.jpg", "artworks/IMG_6937.jpg", "artworks/IMG_6964.JPG",
            // Middle rows
            "artworks/image-2.jpg", "artworks/7855.jpg", "artworks/8594.jpg", "artworks/10819.jpg", "artworks/10820.jpg", "artworks/10821.jpg", "artworks/10822.jpg", "artworks/10823.jpg", "artworks/14996.jpg", "artworks/1602605995.jpg", "artworks/02-scaled.jpg", "artworks/IMG_6937.jpg",
            "artworks/IMG_6964.JPG", "artworks/image-2.jpg", "artworks/7855.jpg", "artworks/8594.jpg", "artworks/10819.jpg", "artworks/10820.jpg", "artworks/10821.jpg", "artworks/10822.jpg", "artworks/10823.jpg", "artworks/14996.jpg", "artworks/1602605995.jpg", "artworks/02-scaled.jpg",
            // Bottom row
            "artworks/IMG_6937.jpg", "artworks/IMG_6964.JPG", "artworks/image-2.jpg", "artworks/image.png", "artworks/23313_0.jpg", "artworks/23317.jpg", "artworks/23677.jpg", "artworks/1912_0.jpg", "artworks/2266.jpg", "artworks/2914.jpg", "artworks/3316.jpg", "artworks/3446.jpg",
          ].map((img, index) => img ? (
            <div key={index} className="aspect-square overflow-hidden bg-white/5">
              <img
                src={`/${img}`}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.onerror = null;
                  img.src = '/placeholder.png';
                }}
              />
            </div>
          ) : <div key={index} className="aspect-square bg-transparent" />)}
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
          {["23313_0.jpg", "23317.jpg", "23677.jpg"].map((img, index) => (
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
              
            </div>
          ))}
        </div>
      </section>

      {/* Concept */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-16">
            <h2 className="text-4xl font-bold text-center tracking-[0.2em] text-gray-800">
              CONCEPT
            </h2>
            <div className="space-y-12">
              <div className="space-y-6 text-center">
                <p className="text-xl tracking-[0.15em] leading-relaxed text-gray-700">
                  優しさと力強さが共存する独自の表現世界。
                  シンプルな形態と鮮やかな色彩で、
                  見る人の心に寄り添う作品を制作しています。
                </p>
                <p className="text-lg tracking-[0.15em] leading-relaxed text-gray-600">
                  時に感じる孤独な心に、
                  温かな光をもたらすような作品を。
                  それが、私たちの目指すアートです。
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
              <div className="absolute inset-0 p-8 text-white opacity-0 group-hover:opacity-100 transition-opacity">
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
              <div className="absolute inset-0 p-8 text-white opacity-0 group-hover:opacity-100 transition-opacity">
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
