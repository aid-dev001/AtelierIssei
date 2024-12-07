import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { type Artwork } from "@db/schema";
import { Link } from "wouter";

interface ArtworkCardProps {
  artwork: Artwork;
}

const ArtworkCard = ({ artwork }: ArtworkCardProps) => {
  return (
    <Card className="overflow-hidden group">
      <CardContent className="p-0 relative">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.onerror = null;
            console.error(`Failed to load image: ${artwork.imageUrl}`);
            img.src = '/placeholder.png';
          }}
        />
        <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-md text-sm font-medium">
          ASK
        </div>
        {artwork.location && (
          <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            {artwork.location}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 p-4">
        <h3 className="text-lg font-medium">{artwork.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{artwork.description}</p>
        <Button asChild className="w-full mt-2">
          <Link href="/contact">お問い合わせ</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ArtworkCard;
