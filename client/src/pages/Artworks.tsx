import { useQuery } from "@tanstack/react-query";
import ArtworkCard from "@/components/ArtworkCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Artwork } from "@db/schema";

const Artworks = () => {
  const { data: artworks, isLoading } = useQuery<Artwork[]>({
    queryKey: ["artworks"],
    queryFn: () => fetch("/api/artworks").then(res => res.json()),
  });

  const LoadingSkeleton = () => (
    <div className="artwork-grid">
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
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">ARTWORKS</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          心の深淵から生まれる、希望のアート。
          一枚一枚に込められた想いが、あなたの心に響きますように。
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="artwork-grid">
          {artworks?.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Artworks;
