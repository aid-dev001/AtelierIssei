import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ArtworkCard from "@/components/ArtworkCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Artwork } from "@db/schema";

const PAGE_SIZE = 12;

const Artworks = () => {
  const [page, setPage] = useState(1);
  const { data: artworks, isLoading } = useQuery<Artwork[]>({
    queryKey: ["artworks"],
    queryFn: async () => {
      const response = await fetch("/api/artworks");
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error("Expected array of artworks, got:", data);
        return [];
      }
      return data;
    },
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0 });
  };

  const totalPages = artworks?.length ? Math.ceil(artworks.length / PAGE_SIZE) : 0;
  const paginatedArtworks = artworks?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) || [];

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[...Array(PAGE_SIZE)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="w-full aspect-square" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-20">
      <section>
        <div className="text-center py-20 bg-white">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-12 tracking-wider text-gray-800">ARTWORKS</h1>
            {page === 1 && (
              <p className="text-xl text-gray-700 leading-relaxed font-medium max-w-2xl mx-auto">
                アーティストisseiが、時に感じる孤独な心に寄り添い描く希望のアート。優雅で鮮やかな色彩と力強い形が、温かな幸福感と光をもたらします。
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {paginatedArtworks?.map((artwork) => (
              <div key={artwork.id} className="flex flex-col">
                <ArtworkCard artwork={artwork} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                {page} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default Artworks;
