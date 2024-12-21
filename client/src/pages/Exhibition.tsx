import { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ScrollToTopLink from "@/components/ScrollToTopLink";
import { Button } from "@/components/ui/button";

const exhibitions = [
  {
    id: "tokyo",
    city: "東京",
    address: "銀座 ATELIER ISSEI本店",
    description: "洗練された空間で新たな芸術体験を",
    mainImage: "/artworks/12648.jpg",
    galleryImages: ["/artworks/12653.jpg", "/artworks/12654.jpg", "/artworks/12655.jpg"],
    detailText: "銀座の中心に位置する本店ギャラリーでは、年間を通じて様々な企画展を開催しています。静謐な空間の中で、心落ち着く時間をお過ごしください。"
  },
  {
    id: "hiroshima",
    city: "広島",
    address: "平和記念公園 アートギャラリー",
    description: "心安らぐ空間での芸術との出会い",
    mainImage: "/artworks/12656.jpg",
    galleryImages: ["/artworks/12657.jpg", "/artworks/12658.jpg", "/artworks/12659.jpg"],
    detailText: "平和を願う想いを込めた作品群を展示しています。静かな祈りの空間で、アートを通じた深い体験をご提供します。"
  },
  {
    id: "paris",
    city: "パリ",
    address: "Galerie ISSEI Paris",
    description: "芸術の都で味わう日本の美意識",
    mainImage: "/artworks/12660.jpg",
    galleryImages: ["/artworks/12661.jpg", "/artworks/12662.jpg", "/artworks/12663.jpg"],
    detailText: "パリの歴史ある街並みの中で、日本の繊細な美意識と現代アートの融合をお楽しみいただけます。"
  }
];

const Exhibition = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="space-y-20">
      <section className="bg-gray-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-12 tracking-wider">EXHIBITION</h1>
            <p className="text-xl text-gray-700 leading-relaxed font-medium max-w-2xl mx-auto">
              世界各地で開催される展示会を通じて、
              アートの持つ普遍的な力と美しさを伝えています。
            </p>
          </div>
          <div className="aspect-video rounded-xl overflow-hidden shadow-2xl mt-12">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/Xti4v4ayTnk"
              title="ATELIER ISSEI Exhibition"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {exhibitions.map((exhibition) => (
            <ScrollToTopLink href={`/exhibition/${exhibition.id}`} key={exhibition.id}>
              <div className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden transform hover:-translate-y-1">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={exhibition.mainImage}
                    alt={`${exhibition.city} Exhibition`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="p-8 space-y-4">
                  <h3 className="text-2xl font-bold tracking-wide group-hover:text-primary/80 transition-colors">
                    {exhibition.city}
                  </h3>
                  <p className="text-lg text-gray-700">{exhibition.address}</p>
                  <p className="text-gray-600 leading-relaxed">{exhibition.description}</p>
                  <div className="pt-4">
                    <span className="text-sm font-medium text-primary/80 group-hover:text-primary transition-colors">
                      詳細を見る →
                    </span>
                  </div>
                </div>
              </div>
            </ScrollToTopLink>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Exhibition;
