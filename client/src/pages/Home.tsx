import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import CustomMap from "@/components/Map";

const ATELIER_LOCATIONS = ['池袋', '赤坂', '東新宿'] as const;

const AtelierInfo = {
  '池袋': {
    description: "都会の喧騒の中で見つけた静寂を表現するアトリエ",
    address: "東京都豊島区池袋",
    period: "2020-2022",
    mainImage: "/artworks/12648.jpg",
  },
  '赤坂': {
    description: "伝統と革新が交差する街で生まれる新しい表現",
    address: "東京都港区赤坂",
    period: "2022-2023",
    mainImage: "/artworks/12653.jpg",
  },
  '東新宿': {
    description: "多様な文化が混ざり合う場所からインスピレーションを得る",
    address: "東京都新宿区新宿",
    period: "2023-現在",
    mainImage: "/artworks/12658.jpg",
  }
} as const;

const Home = () => {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal-text');
    elements.forEach((el, i) => {
      (el as HTMLElement).style.animationDelay = `${i * 0.2}s`;
    });
  }, []);

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
      <section className="min-h-screen relative overflow-hidden bg-white">
        {/* アートワークグリッド */}
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 gap-1">
          {[...Array(48)].map((_, index) => {
            const artworks = [
              "23313_0.jpg", "23317.jpg", "23677.jpg", "1912_0.jpg", 
              "2266.jpg", "2914.jpg", "3316.jpg", "3446.jpg",
              "3525.jpg", "3730.jpg", "6715.jpg", "7853.jpg",
              "7855.jpg", "8594.jpg", "10819.jpg", "10820.jpg"
            ];
            const imageUrl = `/artworks/${artworks[index % artworks.length]}`;
            
            return (
              <div key={index} className="relative overflow-hidden bg-gray-100">
                <img
                  src={imageUrl}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
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

        {/* 中央コンテンツエリア */}
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/90 backdrop-blur-sm p-16 rounded-2xl">
                <div className="text-center">
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
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-16 text-center tracking-wider">GALLERY LOCATION</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {locations.map((location, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8">
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

      {/* Ateliers Summary */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-16 text-center tracking-wider">ATELIER</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ATELIER_LOCATIONS.map((location) => (
              <div key={location} className="bg-white rounded-xl shadow-lg overflow-hidden group transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <Link href={`/ateliers/${location}`}>
                  <div className="aspect-[4/3] relative overflow-hidden cursor-pointer">
                    <img
                      src={AtelierInfo[location].mainImage}
                      alt={`${location}アトリエ`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-3 tracking-wide">{location}</h3>
                  <p className="text-gray-600 leading-relaxed">{AtelierInfo[location].description}</p>
                  <div className="mt-6">
                    <span className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-bold tracking-wide">
                      {AtelierInfo[location].period}
                    </span>
                  </div>
                </div>
              </div>
            ))}
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
                src={`/artworks/${img}`}
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
                    src={`/artworks/${img}`}
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
