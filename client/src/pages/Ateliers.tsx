import { useState } from "react";
import { MapPin, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { Artwork } from "@db/schema";

const ATELIER_LOCATIONS = ['池袋', '赤坂', '東新宿'] as const;
type AtelierLocation = typeof ATELIER_LOCATIONS[number];

const AtelierInfo = {
  '池袋': {
    description: "都会の喧騒の中で見つけた静寂を表現するアトリエ",
    address: "東京都豊島区池袋",
    period: "2020-2022",
    mainImage: "/artworks/12648.jpg",
    galleryImages: [
      "/artworks/12649.jpg",
      "/artworks/12650.jpg",
      "/artworks/12651.jpg",
      "/artworks/12652.jpg"
    ]
  },
  '赤坂': {
    description: "伝統と革新が交差する街で生まれる新しい表現",
    address: "東京都港区赤坂",
    period: "2022-2023",
    mainImage: "/artworks/12653.jpg",
    galleryImages: [
      "/artworks/12654.jpg",
      "/artworks/12655.jpg",
      "/artworks/12656.jpg",
      "/artworks/12657.jpg"
    ]
  },
  '東新宿': {
    description: "多様な文化が混ざり合う場所からインスピレーションを得る",
    address: "東京都新宿区新宿",
    period: "2023-現在",
    mainImage: "/artworks/12658.jpg",
    galleryImages: [
      "/artworks/12659.jpg",
      "/artworks/12660.jpg",
      "/artworks/12661.jpg",
      "/artworks/12662.jpg"
    ]
  }
} as const;

import { useScrollTop } from "@/hooks/useScrollTop";

const Ateliers = () => {
  useScrollTop();
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
      <section className="bg-gray-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-12 tracking-wider text-gray-800">ATELIER</h1>
            <p className="text-xl text-gray-700 leading-relaxed font-medium max-w-2xl mx-auto">
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
                className={`p-6 rounded-lg cursor-pointer transition-all duration-300 ${
                  selectedLocation === location
                    ? "bg-gray-900 text-white shadow-lg transform -translate-y-0.5"
                    : "bg-white hover:bg-gray-50 hover:shadow-md"
                }`}
                onClick={() => setSelectedLocation(location)}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5" />
                    <span className="font-bold tracking-wide">{location}</span>
                  </div>
                  <div className="text-sm font-medium pl-8">
                    {AtelierInfo[location].period}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1 space-y-12">
            {/* アトリエ情報 */}
            <div className="bg-white rounded-xl shadow-md p-8 space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-wide">{selectedLocation}</h2>
                <p className="text-gray-700 text-lg leading-relaxed">{AtelierInfo[selectedLocation].description}</p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-600 font-medium">{AtelierInfo[selectedLocation].address}</p>
                <div className="inline-block bg-gray-100 text-gray-800 px-4 py-2 rounded-md text-base font-bold tracking-wide">
                  {AtelierInfo[selectedLocation].period}
                </div>
              </div>
            </div>

            {/* メイン画像 */}
            <div className="aspect-[16/9] relative overflow-hidden rounded-xl shadow-xl">
              <img
                src={AtelierInfo[selectedLocation].mainImage}
                alt={`${selectedLocation}アトリエ メイン写真`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* ギャラリー */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold tracking-wide flex items-center gap-3">
                <Camera className="w-6 h-6" />
                ギャラリー
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {AtelierInfo[selectedLocation].galleryImages.map((image, index) => (
                  <div key={index} className="aspect-square relative overflow-hidden rounded-lg shadow-md group transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <img
                      src={image}
                      alt={`${selectedLocation}アトリエ ギャラリー${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ateliers;
