import { useEffect } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ScrollToTopLink from "@/components/ScrollToTopLink";

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

const ExhibitionDetail = () => {
  const [, params] = useRoute("/exhibition/:id");
  const exhibitionId = params?.id;
  const exhibition = exhibitions.find(e => e.id === exhibitionId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!exhibition) {
    return <div>Exhibition not found</div>;
  }

  return (
    <div className="space-y-20">
      <section className="relative bg-gray-50/80 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Button asChild variant="ghost" className="absolute top-8 left-8">
              <ScrollToTopLink href="/exhibition" className="flex items-center gap-2 group">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span className="text-sm tracking-wider">Back to Exhibitions</span>
              </ScrollToTopLink>
            </Button>
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-5xl font-bold mb-6 tracking-wider text-gray-800">{exhibition.city}</h1>
              <p className="text-xl text-gray-600 tracking-wide">{exhibition.address}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-12">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
                  <img
                    src={exhibition.mainImage}
                    alt={exhibition.city}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-white p-10 rounded-xl shadow-lg">
                  <h2 className="text-2xl font-bold mb-6 tracking-wide text-gray-800">About</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                    {exhibition.detailText}
                  </p>
                </div>
              </div>

              <div className="space-y-10">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-wide text-gray-800">Gallery</h2>
                  <p className="text-gray-600">展示空間のギャラリー</p>
                </div>
                <div className="grid grid-cols-1 gap-8">
                  {exhibition.galleryImages.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-[4/3] overflow-hidden rounded-lg shadow-xl group"
                    >
                      <img
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExhibitionDetail;
