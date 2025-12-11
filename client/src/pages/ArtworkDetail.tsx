import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Palette, ArrowRight, Grid3X3, Layers } from "lucide-react";
import ImageModal from "@/components/ImageModal";
import type { Artwork, Collection } from "@db/schema";

const ArtworkDetail = () => {
  const [, params] = useRoute("/artwork/:id");
  const artworkId = params?.id;
  const [selectedImage, setSelectedImage] = useState<{url: string; caption: string} | null>(null);

  const { data: artwork, isLoading } = useQuery<Artwork>({
    queryKey: ["artwork", artworkId],
    queryFn: () => fetch(`/api/artworks/${artworkId}`).then(res => res.json()),
  });

  // Fetch collection info if artwork has a collectionId
  const { data: collection } = useQuery<Collection>({
    queryKey: ["collection", artwork?.collectionId],
    queryFn: () => fetch(`/api/collections/${artwork?.collectionId}`).then(res => res.json()),
    enabled: !!artwork?.collectionId,
  });

  // Fetch all artworks to find related ones from the same collection
  const { data: allArtworks } = useQuery<Artwork[]>({
    queryKey: ["/api/artworks"],
  });

  // Get related artworks from same collection (excluding current artwork)
  const relatedArtworks = allArtworks?.filter(
    (a) => a.collectionId === artwork?.collectionId && a.id !== artwork?.id
  ).slice(0, 4) || [];

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
              <div className="relative overflow-hidden shadow-2xl bg-white group cursor-pointer" onClick={() => setSelectedImage({url: artwork.imageUrl, caption: artwork.title})}>
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.onerror = null;
                    img.src = '/placeholder.png';
                  }}
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <div className="bg-white/90 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
                    <Palette className="w-4 h-4 text-black" />
                    作成: {artwork.createdLocation || '銀座'}
                  </div>
                  <div className="bg-white/90 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
                    <Building2 className="w-4 h-4 text-black" />
                    保管: {artwork.storedLocation || '銀座'}
                  </div>
                  <div className="bg-white/90 px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
                    サイズ: {artwork.size || 'F4(333mm x 242mm)'}
                  </div>
                  {(artwork as any).creationYear && (
                    <div className="bg-white/90 px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
                      作成年: {(artwork as any).creationYear}年
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {artwork.exhibitionLocation && (
                    <div className="bg-white/90 px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
                      展示履歴: {artwork.exhibitionLocation}
                    </div>
                  )}
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
                <div className="space-y-2">
                  <div className="text-xl font-bold tracking-wide text-gray-800/90">
                    ¥{Number(artwork.price).toLocaleString()}
                  </div>
                  {artwork.status !== 'available' && (
                    <div className={`text-lg font-medium tracking-wide ${
                      artwork.status === 'sold' ? 'text-neutral-900' : 
                      artwork.status === 'reserved' ? 'text-neutral-800' :
                      artwork.status === 'preparation' ? 'text-neutral-700' : 'text-neutral-700'
                    }`}>
                      {artwork.status === 'sold' ? '売約済' : 
                       artwork.status === 'reserved' ? '予約済み' :
                       artwork.status === 'preparation' ? '準備中' : '販売中'}
                    </div>
                  )}
                  {(artwork.status === 'reserved' || artwork.status === 'sold') && (artwork as any).purchaser && (
                    <div className="text-sm text-neutral-600 tracking-wide">
                      {(artwork as any).purchaser}
                    </div>
                  )}
                </div>
                {artwork.status === 'available' && (
                  <div className="mt-4">
                    <Button asChild className="w-full">
                      <Link href="/contact">お問い合わせ</Link>
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-wide text-gray-800/90">インテリアイメージ</h2>
                <div className={`flex gap-6 ${artwork.interiorImageUrls?.length === 1 ? 'justify-center' : 'justify-start'}`}>
                    {artwork.interiorImageUrls && Array.isArray(artwork.interiorImageUrls) && artwork.interiorImageUrls.length > 0 ? (
                      artwork.interiorImageUrls.map((url: string, index: number) => (
                        <div key={index} className="space-y-2 flex-1 max-w-[calc(50%-12px)]">
                          <div className="relative group cursor-pointer" onClick={() => setSelectedImage({url, caption: artwork.interiorImageDescriptions?.[index] || `${artwork.title} - インテリアイメージ ${index + 1}`})}>
                            <img
                              src={url}
                              alt={`${artwork.title} - Interior View ${index + 1}`}
                              className="w-full aspect-[4/3] object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.src = '/placeholder.png';
                              }}
                            />
                          </div>
                          {artwork.interiorImageDescriptions?.[index] && (
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {artwork.interiorImageDescriptions[index]}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="w-full flex items-start justify-center text-gray-500 pt-8" style={{ minHeight: '200px' }}>
                        インテリアイメージは準備中です
                      </div>
                    )}
                  </div>
                  {artwork.interiorImageUrls && artwork.interiorImageUrls.length > 0 && (
                    <div className="h-4" />
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Artworks from Same Collection */}
      {collection && relatedArtworks.length > 0 && (
        <div className="container mx-auto px-4 py-8 border-t border-gray-100">
          <div className="flex justify-center">
            <div className="inline-block">
              <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-base font-medium text-gray-500">
                  {collection.title}の他の作品
                </h3>
                <Link href={`/collections/${collection.id}`} onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
                  <span className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 ml-8">
                    もっと見る
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:flex md:justify-start gap-8 md:gap-4 px-6 md:px-0">
                {relatedArtworks.map((relatedArtwork) => (
                  <Link key={relatedArtwork.id} href={`/artwork/${relatedArtwork.id}`} onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })} className="block">
                    <div className="group cursor-pointer relative overflow-hidden rounded shadow-sm aspect-square md:w-[200px] md:h-[200px]">
                      <img
                        src={relatedArtwork.imageUrl}
                        alt={relatedArtwork.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = '/placeholder.png';
                        }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="container mx-auto px-4 py-12 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {collection && (
              <Link href={`/collections/${collection.id}`} onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
                <Button variant="outline" className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  {collection.title}を見る
                </Button>
              </Link>
            )}
            <Link href="/artworks" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
              <Button variant="outline" className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4" />
                すべての作品を見る
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.url || ''}
        caption={selectedImage?.caption}
      />
    </div>
  );
};

export default ArtworkDetail;