import { useEffect } from "react";
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

  useEffect(() => {
    if (artwork) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [artwork]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <Skeleton className="aspect-square rounded-2xl" />
                <div className="flex gap-4">
                  <Skeleton className="h-9 w-32 rounded-lg" />
                  <Skeleton className="h-9 w-32 rounded-lg" />
                </div>
              </div>
              <div className="space-y-8">
                <div className="space-y-4">
                  <Skeleton className="h-10 w-2/3" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <Skeleton className="h-24 rounded-xl" />
                <div className="space-y-6">
                  <Skeleton className="h-8 w-48" />
                  <div className="grid grid-cols-2 gap-6">
                    <Skeleton className="aspect-[4/3] rounded-lg" />
                    <Skeleton className="aspect-[4/3] rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
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
              <div className="relative overflow-hidden shadow-2xl bg-white group">
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
                
              </div>
              <div className="flex gap-4">
                <div className="bg-white/90 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
                  <Palette className="w-4 h-4 text-black" />
                  作成: {artwork.createdLocation || '銀座'}
                </div>
                <div className="bg-white/90 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
                  <Building2 className="w-4 h-4 text-black" />
                  保管: {artwork.storedLocation || '銀座'}
                </div>
                <div className="bg-white/90 px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
                  サイズ: {artwork.size || 'F4'}
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-wide text-gray-800/90">{artwork.title}</h1>
                <p className="text-gray-600/90 text-lg leading-relaxed whitespace-pre-wrap">
                  {artwork.description}
                </p>
              </div>
              
              <div className="bg-white px-8 py-6 rounded-xl shadow-sm">
                <div className="text-2xl font-bold mb-3 tracking-wide text-gray-800/90">
                  {artwork.status === 'sold' ? 'SOLD OUT' : 
                   artwork.status === 'reserved' ? '予約済み' :
                   `¥${Number(artwork.price).toLocaleString()}`}
                </div>
                {artwork.status === 'available' && (
                  <Button asChild className="w-full">
                    <Link href="/contact">お問い合わせ</Link>
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-wide text-gray-800/90">インテリアイメージ</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="relative group">
                    <img
                      src="/artworks/3316.jpg"
                      alt="Interior View 1"
                      className="w-full aspect-[4/3] object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
                    />
                    </div>
                  <div className="relative group">
                    <img
                      src="/artworks/3446.jpg"
                      alt="Interior View 2"
                      className="w-full aspect-[4/3] object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500/80 text-center">
                  ※ インテリアイメージは参考例です
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetail;