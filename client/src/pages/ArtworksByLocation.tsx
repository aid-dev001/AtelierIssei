import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import ArtworkCard from "@/components/ArtworkCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Artwork } from "@db/schema";

const locations = {
  "ikebukuro": {
    title: "池袋",
    description: "都会の喧騒の中で生まれた作品たち",
  },
  "akasaka": {
    title: "赤坂",
    description: "伝統と現代が交差する街で描かれた作品",
  },
  "higashi-shinjuku": {
    title: "東新宿",
    description: "新しい文化の発信地から生まれた作品",
  },
};

const ArtworksByLocation = () => {
  const [, params] = useRoute("/artworks/location/:location");
  const locationKey = params?.location;
  const locationInfo = locationKey ? locations[locationKey as keyof typeof locations] : null;

  const { data: artworks, isLoading } = useQuery<Artwork[]>({
    queryKey: ["artworks", "location", locationKey],
    queryFn: () => fetch(`/api/artworks/location/${locationKey}`).then(res => res.json()),
  });

  if (!locationInfo) {
    return <div>場所が見つかりませんでした。</div>;
  }

  return (
    <div className="space-y-12 container mx-auto px-4 py-8">
      <section className="bg-gray-50/80">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-12 tracking-wider text-gray-700">
              {locationInfo.title}のアトリエより
            </h1>
            <p className="text-xl text-gray-700/90 leading-relaxed font-medium max-w-2xl mx-auto">
              {locationInfo.description}
            </p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="w-full aspect-square" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
          {artworks?.map((artwork) => (
            <div key={artwork.id} className="flex flex-col">
              <ArtworkCard artwork={artwork} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtworksByLocation;
