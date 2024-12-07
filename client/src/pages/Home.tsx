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

  const poem = [
    "芸術家 ISSEI が紡ぎ出す、",
    "静謐な時の中で生まれる至高の芸術",
    "深い洞察と繊細な感性から描き出される",
    "優美なる色彩と力強い筆致が織りなす",
    "魂の深淵から湧き上がる創造の結晶",
    "見る者の心に永遠の感動をもたらし",
    "その瞬間、あなたの人生に",
    "かけがえのない輝きを添えます"
  ];

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
      <section className="min-h-[90vh] flex items-center relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-90"
          style={{ 
            backgroundImage: "url('/hero.jpg')",
            filter: "brightness(0.9) contrast(1.1)"
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 reveal-text tracking-wider">
              ATELIER ISSEI
            </h1>
            <p className="text-xl md:text-2xl font-light mb-16 reveal-text tracking-widest">
              洗練された美の世界へ、心を解き放つ旅
            </p>
            <div className="space-y-6 bg-white/95 backdrop-blur-sm p-12 rounded-xl shadow-2xl">
              {poem.map((line, index) => (
                <p key={index} className="text-lg reveal-text tracking-wider leading-relaxed font-medium">
                  {line}
                </p>
              ))}
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
            <div className="relative group">
              <img
                src="/1602605995.jpg"
                alt="Latest Exhibition"
                className="w-full h-[500px] object-cover rounded-xl shadow-xl"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
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
    </div>
  );
};

export default Home;
