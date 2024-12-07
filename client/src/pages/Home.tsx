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
    "アーティストisseiが、",
    "心が沈み、孤独を感じる瞬間",
    "自らを励ますために描く希望のアート",
    "華やかさの中に漂うほのかな儚さが、",
    "心の深淵を映し出しています",
    "その一枚一枚が、見る人の心にそっと寄り添い",
    "優雅で鮮やかな色彩と力強い形は",
    "温かな幸福感と希望の光をもたらします"
  ];

  return (
    <div className="space-y-20">
      <section className="min-h-[90vh] flex items-center relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-90"
          style={{ 
            backgroundImage: "url('/hero.jpg')",
            filter: "brightness(1.1) contrast(0.95)"
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 reveal-text">
              ATELIER ISSEI
            </h1>
            <p className="text-xl md:text-2xl font-light mb-12 reveal-text">
              見る人の心を豊かにする、幸せを呼ぶアート
            </p>
            <div className="space-y-6 bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-lg">
              {poem.map((line, index) => (
                <p key={index} className="text-lg reveal-text tracking-wider leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">GALLERY LOCATION</h2>
        <CustomMap />
      </section>

      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Latest Exhibition</h2>
            <img
              src="https://pixabay.com/get/g0c8027ca1ea75068b9f2b971e7dda6cc76f3223fd1cba1e57dd027246913006e8d60025ea28c8021cb3ac2574e770655c4349b981341e22c9611556d726dac6d_1280.jpg"
              alt="Latest Exhibition"
              className="w-full h-[400px] object-cover rounded-lg"
            />
            <Button asChild className="w-full">
              <Link href="/artworks">View Gallery</Link>
            </Button>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Featured Collection</h2>
            <img
              src="https://pixabay.com/get/g35ce7a466715d938a4b0e607ba2d6c53c474d22fb5a833ceec258ffe8a3d15bcfc687542a3fa999734f3c11a05e5b1c4f01f6e21f2b0d9547133b87427e2c2cd_1280.jpg"
              alt="Featured Collection"
              className="w-full h-[400px] object-cover rounded-lg"
            />
            <Button asChild variant="outline" className="w-full">
              <Link href="/news">Latest News</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
