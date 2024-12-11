import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Building2 } from "lucide-react";
import { type Artwork } from "@db/schema";
import { Link } from "wouter";

interface ArtworkCardProps {
  artwork: Artwork;
}

const ArtworkCard = ({ artwork }: ArtworkCardProps) => {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-0 relative">
        <Link href={`/artwork/${artwork.id}`}>
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.onerror = null;
              img.src = '/artworks/placeholder.png';
            }}
          />
        </Link>
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <div className="bg-white/90 px-3 py-1 rounded-md text-sm font-medium">
            {artwork.status === 'sold' ? 'SOLD' : 
             artwork.status === 'reserved' ? '予約済' :
             `¥${Number(artwork.price).toLocaleString()}`}
          </div>
          {artwork.status === 'available' && (
            <div className="bg-primary/90 text-white px-3 py-1 rounded-md text-sm font-medium cursor-pointer hover:bg-primary transition-colors">
              予約する
            </div>
          )}
        </div>
        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="bg-white/90 px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-black" />
              作成: {artwork.createdLocation || '銀座'}
            </div>
            <div className="bg-white/90 px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-black" />
              保管: {artwork.storedLocation || '銀座'}
            </div>
          </div>
          <div className="bg-white/90 py-1 rounded-md text-sm font-medium inline-block">
            <span className="px-3">{artwork.size || 'F4'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 p-4">
        <h3 className="text-lg font-medium text-gray-700/90 tracking-wide">{artwork.title}</h3>
        <p className="text-sm text-gray-600/80 line-clamp-2 leading-relaxed">{artwork.description}</p>
        <Button asChild className="w-full mt-2">
          <Link href={`/artwork/${artwork.id}`}>詳細を見る</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ArtworkCard;
