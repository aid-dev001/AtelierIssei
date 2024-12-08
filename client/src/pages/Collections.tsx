import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import ScrollToTopLink from "@/components/ScrollToTopLink";
import { ArrowRight } from "lucide-react";

const collections = [
  {
    id: "abstract-2024",
    title: "Abstract Collection 2024",
    description: "抽象的な形と色彩が織りなす、心の風景を表現したコレクション",
    images: ["12653.jpg", "12654.jpg", "12655.jpg", "12656.jpg"],
    year: "2024",
  },
  {
    id: "serenity",
    title: "Serenity Collection",
    description: "静寂と調和をテーマにした、心安らぐアート作品群",
    images: ["12657.jpg", "12658.jpg", "12659.jpg", "12660.jpg"],
    year: "2023",
  },
  {
    id: "memory",
    title: "Memory Collection",
    description: "思い出と感情を色彩豊かに表現した、記憶のアートコレクション",
    images: ["12661.jpg", "12662.jpg", "12663.jpg", "12664.jpg"],
    year: "2023",
  }
];

const Collections = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="space-y-20">
      <section className="bg-gray-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-12 tracking-wider">COLLECTIONS</h1>
            <p className="text-xl text-gray-700 leading-relaxed font-medium max-w-2xl mx-auto">
              アーティストisseiが手掛ける、様々なテーマのコレクション。
              それぞれの作品群が織りなす世界観をお楽しみください。
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="space-y-32">
          {collections.map((collection, index) => (
            <div key={collection.id} className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-wide text-center">{collection.title}</h2>
                <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto">
                  {collection.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {collection.images.map((img, imgIndex) => (
                  <Card key={imgIndex} className="overflow-hidden group">
                    <div className="aspect-square relative">
                      <img
                        src={`/artworks/${img}`}
                        alt={`${collection.title} - Image ${imgIndex + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.onerror = null;
                          img.src = '/placeholder.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center">
                <ScrollToTopLink
                  href={`/artworks`}
                  className="inline-flex items-center gap-2 text-lg font-medium text-gray-700 hover:text-primary/80 transition-colors group"
                >
                  View Collection
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </ScrollToTopLink>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Collections;
