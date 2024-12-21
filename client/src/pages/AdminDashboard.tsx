import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PenLine, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Artwork } from "@db/schema";

interface ImageData {
  url: string;
  generatedTitle: string;
  generatedDescription: string;
}

interface Collection {
  id: number;
  title: string;
  description: string;
}

const AdminDashboard = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('artworks');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [imageData, setImageData] = useState<ImageData>({
    url: '',
    generatedTitle: '',
    generatedDescription: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const adminPath = '/admin'; // This needs to be dynamically determined based on the application's structure

  const { data: artworks } = useQuery<Artwork[]>({
    queryKey: ["artworks"],
    queryFn: () => fetch("/api/artworks").then(res => res.json()),
  });

  const { data: collections } = useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: () => fetch("/api/collections").then(res => res.json()),
  });


  const handleFileChange = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${adminPath}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('アップロード中にエラーが発生しました');

      const data = await response.json();
      setImageData(data);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    }
  };

  const handleInteriorImageUpload = async (file: File, index: number) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${adminPath}/upload-interior`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('インテリア画像のアップロード中にエラーが発生しました');

      const data = await response.json();
      if (selectedArtwork) {
        const newInteriorUrls = Array.isArray(selectedArtwork.interiorImageUrls) 
          ? [...selectedArtwork.interiorImageUrls]
          : ['', ''];
        newInteriorUrls[index] = data.url;
        setSelectedArtwork({
          ...selectedArtwork,
          interiorImageUrls: newInteriorUrls,
        });
      }
    } catch (error) {
      console.error('Interior image upload error:', error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const artworkData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: formData.get('price') as string,
      size: formData.get('size') as string,
      status: formData.get('status') as string,
      createdLocation: formData.get('createdLocation') as string,
      storedLocation: formData.get('storedLocation') as string,
      exhibitionLocation: formData.get('exhibitionLocation') as string,
      imageUrl: imageData.url || selectedArtwork?.imageUrl,
      collectionId: formData.get('collectionId') ? Number(formData.get('collectionId')) : null,
      interiorImageUrls: selectedArtwork?.interiorImageUrls || [],
      interiorImageDescriptions: [
        formData.get('interior-desc-1'),
        formData.get('interior-desc-2'),
      ].filter(Boolean) as string[],
    };

    try {
      const response = await fetch(
        selectedArtwork
          ? `${adminPath}/artworks/${selectedArtwork.id}`
          : `${adminPath}/artworks`,
        {
          method: selectedArtwork ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(artworkData),
        }
      );

      if (!response.ok) throw new Error('作品の保存中にエラーが発生しました');

      await queryClient.invalidateQueries({ queryKey: ["artworks"] });
      toast({ title: `作品を${selectedArtwork ? '更新' : '作成'}しました` });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Artwork submission error:', error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    }
  };

  const ArtworkForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          name="title"
          defaultValue={selectedArtwork?.title || imageData.generatedTitle}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">説明</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={selectedArtwork?.description || imageData.generatedDescription}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">価格</Label>
        <Input
          id="price"
          name="price"
          type="number"
          defaultValue={selectedArtwork?.price?.toString()}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="size">サイズ</Label>
        <Input
          id="size"
          name="size"
          defaultValue={selectedArtwork?.size || ''}
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
          <option value="preparation">準備中</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="createdLocation">制作場所</Label>
        <Input
          id="createdLocation"
          name="createdLocation"
          defaultValue={selectedArtwork?.createdLocation || '銀座'}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="storedLocation">保管場所</Label>
        <Input
          id="storedLocation"
          name="storedLocation"
          defaultValue={selectedArtwork?.storedLocation || '銀座'}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="exhibitionLocation">展示履歴</Label>
        <Input
          id="exhibitionLocation"
          name="exhibitionLocation"
          defaultValue={selectedArtwork?.exhibitionLocation || ''}
          placeholder="例: 銀座ギャラリー"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="collectionId">コレクション</Label>
        <select
          id="collectionId"
          name="collectionId"
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          defaultValue={selectedArtwork?.collectionId || ''}
        >
          <option value="">コレクションを選択</option>
          {Array.isArray(collections) && collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.title}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" className="w-full">
        {selectedArtwork ? '更新' : '作成'}
      </Button>
    </form>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <header className="bg-gray-50/80 p-6 rounded-lg sticky top-0 z-50 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
            <Button
              variant="ghost"
              onClick={() => {
                setLocation(adminPath);
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              ログアウト
            </Button>
          </div>
          <div className="flex gap-4 border-b">
            <button
              className={`px-4 py-2 font-medium transition-all relative ${
                activeTab === 'artworks'
                  ? 'text-black font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('artworks')}
            >
              作品管理
              {activeTab === 'artworks' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">作品一覧</h2>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setSelectedArtwork(null);
                  setImageData({
                    url: '',
                    generatedTitle: '',
                    generatedDescription: '',
                  });
                  setIsEditDialogOpen(true);
                }}
              >
                新規作品を追加
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0">
              <div className="sticky top-0 bg-background z-10 px-6 pt-6">
                <DialogHeader>
                  <DialogTitle>
                    {selectedArtwork ? '作品を編集' : '新規作品を追加'}
                  </DialogTitle>
                </DialogHeader>
              </div>
              <div className="px-6 pb-6 h-[calc(90vh-80px)] overflow-y-auto">
                <ArtworkForm />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {artworks?.map((artwork) => (
            <div
              key={artwork.id}
              className="border p-3 rounded-lg hover:shadow-lg transition-all cursor-pointer"
              onClick={() => {
                setSelectedArtwork(artwork);
                setImageData({
                  url: artwork.imageUrl,
                  generatedTitle: '',
                  generatedDescription: '',
                });
                setIsEditDialogOpen(true);
              }}
            >
              <div className="aspect-square mb-2 overflow-hidden rounded-lg">
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
              <h3 className="font-medium text-sm truncate">{artwork.title}</h3>
              <p className="text-xs text-gray-600 line-clamp-1">{artwork.description}</p>
              <p className="text-xs text-gray-600 mt-1">¥{Number(artwork.price).toLocaleString()}</p>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs py-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedArtwork(artwork);
                    setImageData({
                      url: artwork.imageUrl,
                      generatedTitle: '',
                      generatedDescription: '',
                    });
                    setIsEditDialogOpen(true);
                  }}
                >
                  <PenLine className="w-3 h-3 mr-1" />
                  編集
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                        onClick={async () => {
                          try {
                            const response = await fetch(`${adminPath}/artworks/${artwork.id}`, {
                              method: 'DELETE',
                            });

                            if (!response.ok) throw new Error('削除中にエラーが発生しました');

                            await queryClient.invalidateQueries({ queryKey: ["artworks"] });
                            toast({ title: "作品を削除しました" });
                          } catch (error) {
                            console.error('Delete error:', error);
                            toast({
                              variant: "destructive",
                              title: "エラー",
                              description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
                            });
                          }
                        }}
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
      </main>
    </div>
  );
};

export default AdminDashboard;