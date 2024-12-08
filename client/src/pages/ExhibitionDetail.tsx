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
      <section className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <Button asChild variant="ghost" className="mb-8">
              <ScrollToTopLink href="/exhibition" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Exhibitions
              </ScrollToTopLink>
            </Button>
            <h1 className="text-4xl font-bold mb-4 tracking-wider">{exhibition.city}</h1>
            <p className="text-xl text-gray-600">{exhibition.address}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="aspect-[4/3] overflow-hidden rounded-xl shadow-xl">
                <img
                  src={exhibition.mainImage}
                  alt={exhibition.city}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 tracking-wide">About</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {exhibition.detailText}
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-2xl font-bold tracking-wide">Gallery</h2>
              <div className="grid grid-cols-1 gap-6">
                {exhibition.galleryImages.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-[4/3] overflow-hidden rounded-lg shadow-lg group"
                  >
                    <img
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExhibitionDetail;
