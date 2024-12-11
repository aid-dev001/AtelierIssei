import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { PenLine, Trash2 } from "lucide-react";
import type { Artwork } from "@db/schema";

type ArtworkFormData = Omit<Artwork, "id" | "createdAt" | "updatedAt">;

const AdminDashboard = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const adminPath = window.location.pathname.split('/dashboard')[0];

  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: artworks, isLoading } = useQuery<Artwork[]>({
    queryKey: [`${adminPath}/artworks`],
    queryFn: async () => {
      const response = await fetch(`${adminPath}/artworks`);
      if (!response.ok) {
        throw new Error('Unauthorized');
      }
      return response.json();
    },
  });

  const createArtworkMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`${adminPath}/artworks`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to create artwork');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${adminPath}/artworks`] });
      toast({ title: "作品を追加しました" });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({ variant: "destructive", title: "作品の追加に失敗しました" });
    },
  });

  const updateArtworkMutation = useMutation({
    mutationFn: async (artwork: Artwork) => {
      const response = await fetch(`${adminPath}/artworks/${artwork.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artwork),
      });
      if (!response.ok) throw new Error('Failed to update artwork');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${adminPath}/artworks`] });
      toast({ title: "作品を更新しました" });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({ variant: "destructive", title: "作品の更新に失敗しました" });
    },
  });

  const deleteArtworkMutation = useMutation({
    mutationFn: async (artworkId: number) => {
      const response = await fetch(`${adminPath}/artworks/${artworkId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete artwork');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${adminPath}/artworks`] });
      toast({ title: "作品を削除しました" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "作品の削除に失敗しました" });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const file = formData.get('image') as File;
    if (!file || !(file instanceof File)) {
      toast({
        variant: "destructive",
        title: "画像を選択してください",
      });
      return;
    }

    const artworkData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: formData.get('price') as string,
      size: formData.get('size') as string,
      status: formData.get('status') as 'available' | 'reserved' | 'sold',
      createdLocation: formData.get('createdLocation') as string,
      storedLocation: formData.get('storedLocation') as string,
      isAvailable: true,
    };

    if (selectedArtwork) {
      updateArtworkMutation.mutate({ ...selectedArtwork, ...artworkData });
    } else {
      const submitFormData = new FormData(e.currentTarget);
      createArtworkMutation.mutate(submitFormData);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const ArtworkForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          name="title"
          defaultValue={selectedArtwork?.title}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">説明</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={selectedArtwork?.description}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">画像</Label>
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          required={!selectedArtwork}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              // TODO: ここでOpenAI APIを使用して画像の説明を生成する
            }
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">価格</Label>
        <Input
          id="price"
          name="price"
          type="text"
          defaultValue={selectedArtwork?.price}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="size">サイズ</Label>
        <Input
          id="size"
          name="size"
          defaultValue={selectedArtwork?.size}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">ステータス</Label>
        <select
          id="status"
          name="status"
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          defaultValue={selectedArtwork?.status || 'available'}
          required
        >
          <option value="available">販売中</option>
          <option value="reserved">予約済</option>
          <option value="sold">売約済</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="createdLocation">制作場所</Label>
        <Input
          id="createdLocation"
          name="createdLocation"
          defaultValue={selectedArtwork?.createdLocation}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="storedLocation">保管場所</Label>
        <Input
          id="storedLocation"
          name="storedLocation"
          defaultValue={selectedArtwork?.storedLocation}
          required
        />
      </div>
      <Button type="submit" className="w-full">
        {selectedArtwork ? '更新' : '作成'}
      </Button>
    </form>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
        <Button
          variant="outline"
          onClick={() => {
            setLocation(adminPath);
          }}
        >
          ログアウト
        </Button>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">作品一覧</h2>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setSelectedArtwork(null);
                  setIsEditDialogOpen(true);
                }}
              >
                新規作品を追加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedArtwork ? '作品を編集' : '新規作品を追加'}
                </DialogTitle>
              </DialogHeader>
              <ArtworkForm />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks?.map((artwork: Artwork) => (
            <div key={artwork.id} className="border p-4 rounded-lg">
              <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = '/placeholder.png';
                  }}
                />
              </div>
              <h3 className="font-medium">{artwork.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{artwork.description}</p>
              <p className="text-sm text-gray-600">¥{artwork.price}</p>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedArtwork(artwork);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <PenLine className="w-4 h-4 mr-2" />
                  編集
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="flex-1">
                      <Trash2 className="w-4 h-4 mr-2" />
                      削除
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>作品を削除しますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        この操作は取り消せません。本当に削除してもよろしいですか？
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-4">
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteArtworkMutation.mutate(artwork.id)}
                      >
                        削除
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
