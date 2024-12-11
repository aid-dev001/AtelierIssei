import { Card } from "@/components/ui/card";
import ScrollToTopLink from "@/components/ScrollToTopLink";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Collection, Artwork } from "@db/schema";

const useCollectionsWithArtworks = () => {
  const { data: collections } = useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await fetch("/api/collections");
      if (!response.ok) throw new Error('Failed to fetch collections');
      return response.json();
    },
    gcTime: 1000 * 60 * 5,
    staleTime: 1000 * 30,
  });

  const { data: artworks } = useQuery<Artwork[]>({
    queryKey: ["artworks"],
    queryFn: async () => {
      const response = await fetch("/api/artworks");
      if (!response.ok) throw new Error('Failed to fetch artworks');
      return response.json();
    },
    gcTime: 1000 * 60 * 5,
    staleTime: 1000 * 30,
  });

  return { collections, artworks };
};

const Collections = () => {
  const { collections, artworks } = useCollectionsWithArtworks();

  if (!collections || !artworks) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading collections...</div>
      </div>
    );
  }

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
          {collections.map((collection: Collection) => (
            <div key={collection.id} className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-wide text-center">{collection.title}</h2>
                <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto">
                  {collection.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {artworks.filter((artwork: Artwork) => artwork.collectionId === collection.id)
                  .map((artwork: Artwork) => (
                  <ScrollToTopLink key={artwork.id} href={`/artwork/${artwork.id}`}>
                    <Card className="overflow-hidden group cursor-pointer">
                      <div className="aspect-square relative">
                        <img
                          src={artwork.imageUrl}
                          alt={artwork.title}
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
                  </ScrollToTopLink>
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
