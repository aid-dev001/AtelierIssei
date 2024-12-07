import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Artwork } from "@db/schema";

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
        />
        {artwork.isAvailable && artwork.price && (
          <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded text-sm">
            ¥{artwork.price}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 p-4">
        <h3 className="text-lg font-medium">{artwork.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{artwork.description}</p>
        {artwork.isAvailable && (
          <Button variant="outline" className="mt-2">
            お問い合わせ
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ArtworkCard;
