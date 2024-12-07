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
    queryFn: () => fetch("/api/artworks").then(res => res.json()),
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0 });
  };

  const totalPages = artworks ? Math.ceil(artworks.length / PAGE_SIZE) : 0;
  const paginatedArtworks = artworks?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    <div className="space-y-12 container mx-auto px-4 py-8">
      {page === 1 && (
        <section className="bg-gray-50/80">
          <div className="container mx-auto px-4 py-20">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold mb-12 tracking-wider text-gray-700">ARTWORKS</h1>
            </div>
          </div>
        </section>
      )}

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
            {paginatedArtworks?.map((artwork) => (
              <div key={artwork.id} className="flex flex-col">
                <ArtworkCard artwork={artwork} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
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
  );
};

export default Artworks;
