import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Palette } from "lucide-react";
import type { Artwork } from "@db/schema";

const ArtworkDetail = () => {
  const [, params] = useRoute("/artwork/:id");
  const artworkId = params?.id;

  const { data: artwork, isLoading } = useQuery<Artwork>({
    queryKey: ["artwork", artworkId],
    queryFn: () => fetch(`/api/artworks/${artworkId}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-[600px] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!artwork) {
    return <div>作品が見つかりませんでした。</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="aspect-[4/5] relative overflow-hidden rounded-2xl shadow-2xl bg-white">
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-4">
                <div className="bg-white/90 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  作成: {artwork.createdLocation || '銀座'}
                </div>
                <div className="bg-white/90 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  展示: {artwork.storedLocation || '銀座'}
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-4">{artwork.title}</h1>
                <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                  {artwork.description}
                </p>
              </div>
              
              <div className="bg-white/90 px-6 py-4 rounded-xl">
                <div className="text-2xl font-bold mb-2">
                  {artwork.status === 'sold' ? 'SOLD' : 
                   artwork.status === 'reserved' ? '予約済' :
                   `¥${Number(artwork.price).toLocaleString()}`}
                </div>
                {artwork.status === 'available' && (
                  <Button asChild className="w-full">
                    <Link href="/contact">お問い合わせ</Link>
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                <h2 className="text-xl font-bold">インテリアイメージ</h2>
                <div className="grid grid-cols-2 gap-4">
                  <img
                    src="/interior1.jpg"
                    alt="Interior View 1"
                    className="w-full aspect-[4/3] object-cover rounded-lg shadow-md"
                  />
                  <img
                    src="/interior2.jpg"
                    alt="Interior View 2"
                    className="w-full aspect-[4/3] object-cover rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetail;