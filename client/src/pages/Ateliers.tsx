import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ArtworkCard from "@/components/ArtworkCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Artwork } from "@db/schema";
import { MapPin } from "lucide-react";

const ATELIER_LOCATIONS = ['池袋', '赤坂', '東新宿'] as const;
type AtelierLocation = typeof ATELIER_LOCATIONS[number];

const AtelierInfo = {
  '池袋': {
    description: "都会の喧騒の中で見つけた静寂を表現するアトリエ",
    address: "東京都豊島区池袋",
    period: "2020-2022"
  },
  '赤坂': {
    description: "伝統と革新が交差する街で生まれる新しい表現",
    address: "東京都港区赤坂",
    period: "2022-2023"
  },
  '東新宿': {
    description: "多様な文化が混ざり合う場所からインスピレーションを得る",
    address: "東京都新宿区新宿",
    period: "2023-現在"
  }
} as const;

const Ateliers = () => {
  const [selectedLocation, setSelectedLocation] = useState<AtelierLocation>('池袋');
  
  const { data: artworks, isLoading } = useQuery<Artwork[]>({
    queryKey: ["artworks", selectedLocation],
    queryFn: () => fetch(`/api/artworks?location=${selectedLocation}`).then(res => res.json()),
  });

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="w-full aspect-square" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-12">
      <section className="bg-gray-50/80">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-12 tracking-wider text-gray-700">ATELIER</h1>
            <p className="text-xl text-gray-700/90 leading-relaxed font-medium max-w-2xl mx-auto">
              それぞれの場所で感じた空気感や想いを、
              作品を通して表現しています。
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* サイドバー：アトリエ選択 */}
          <div className="md:w-64 space-y-4">
            {ATELIER_LOCATIONS.map((location) => (
              <div
                key={location}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  selectedLocation === location
                    ? "bg-primary text-white"
                    : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => setSelectedLocation(location)}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{location}</span>
                </div>
              </div>
            ))}
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold mb-4">{selectedLocation}</h2>
              <p className="text-gray-600 mb-4">{AtelierInfo[selectedLocation].description}</p>
              <div className="text-sm text-gray-500">
                <p>住所：{AtelierInfo[selectedLocation].address}</p>
                <p>制作期間：{AtelierInfo[selectedLocation].period}</p>
              </div>
            </div>

            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {artworks?.map((artwork) => (
                  <ArtworkCard key={artwork.id} artwork={artwork} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ateliers;
