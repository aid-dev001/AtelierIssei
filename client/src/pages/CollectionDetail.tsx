import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import type { Collection, Artwork } from "@db/schema";
import ArtworkCard from "@/components/ArtworkCard";

const CollectionDetail = () => {
  const [, params] = useRoute<{ id: string }>("/collections/:id");
  const collectionId = params?.id ? parseInt(params.id) : null;

  const { data: collection, isLoading: isLoadingCollection } = useQuery<Collection>({
    queryKey: ["collections", collectionId],
    queryFn: async () => {
      if (!collectionId) throw new Error("Collection ID is required");
      const response = await fetch(`/api/collections/${collectionId}`);
      if (!response.ok) throw new Error('Failed to fetch collection');
      return response.json();
    },
    enabled: !!collectionId,
  });

  const { data: artworks, isLoading: isLoadingArtworks } = useQuery<Artwork[]>({
    queryKey: ["artworks", collectionId],
    queryFn: async () => {
      const response = await fetch(`/api/artworks?collectionId=${collectionId}`);
      if (!response.ok) throw new Error('Failed to fetch artworks');
      return response.json();
    },
    enabled: !!collectionId,
  });

  const isLoading = isLoadingCollection || isLoadingArtworks;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-500">コレクションが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section className="bg-gray-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 tracking-wider">{collection.title}</h1>
            <p className="text-xl text-gray-700 leading-relaxed">
              {collection.description}
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {artworks?.map((artwork) => (
            <div key={artwork.id} className="flex flex-col">
              <ArtworkCard artwork={artwork} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CollectionDetail;
