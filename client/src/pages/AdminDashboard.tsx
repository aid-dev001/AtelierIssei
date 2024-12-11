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
import { Dropzone } from "@/components/ui/dropzone";
import type { Artwork } from "@db/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { PenLine, Trash2 } from "lucide-react";

const AdminDashboard = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const adminPath = window.location.pathname.split('/dashboard')[0];
  const [activeTab, setActiveTab] = useState<'artworks' | 'collections'>('artworks');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [imageData, setImageData] = useState<{
    url: string;
    generatedTitle: string;
    generatedDescription: string;
  }>({
    url: '',
    generatedTitle: '',
    generatedDescription: '',
  });

  // Collections data
  const { data: collections } = useQuery({
    queryKey: [`${adminPath}/collections`],
    queryFn: async () => {
      const response = await fetch(`${adminPath}/collections`);
      if (!response.ok) throw new Error('Failed to fetch collections');
      return response.json();
    },
  });

  // Artworks data
  const { data: artworks, isLoading, error } = useQuery<Artwork[]>({
    queryKey: [`${adminPath}/artworks`],
    queryFn: async () => {
      try {
        const response = await fetch(`${adminPath}/artworks`);
        if (!response.ok) {
          if (response.status === 401) {
            setLocation(adminPath);
            throw new Error('セッションが切れました。再度ログインしてください。');
          }
          throw new Error('データの取得に失敗しました');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching artworks:', error);
        if (error instanceof Error && error.message.includes('セッション')) {
          throw error;
        }
        throw new Error('データの取得中にエラーが発生しました');
      }
    },
  });

  if (error) {
    toast({
      variant: "destructive",
      title: "エラー",
      description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
    });
  }

  const createArtworkMutation = useMutation({
    mutationFn: async (artworkData: FormData) => {
      const response = await fetch(`${adminPath}/artworks`, {
        method: 'POST',
        body: artworkData,
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create artwork');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${adminPath}/artworks`] });
      toast({ title: "作品を追加しました" });
      setIsEditDialogOpen(false);
      setSelectedArtwork(null);
      setImageData({
        url: '',
        generatedTitle: '',
        generatedDescription: '',
      });
    },
    onError: (error) => {
      toast({ 
        variant: "destructive", 
        title: "作品の追加に失敗しました",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました"
      });
    },
  });

  const updateArtworkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`${adminPath}/artworks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      if (selectedArtwork) {
        // 更新の場合
        const updateData = {
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          price: parseFloat(formData.get('price') as string),
          size: formData.get('size') as string,
          status: formData.get('status') as string,
          createdLocation: formData.get('createdLocation') as string,
          storedLocation: formData.get('storedLocation') as string,
          imageUrl: imageData.url || selectedArtwork.imageUrl,
          collectionId: formData.get('collectionId') ? parseInt(formData.get('collectionId') as string) : null,
        };
        
        await updateArtworkMutation.mutateAsync({
          id: selectedArtwork.id,
          data: updateData,
        });
      } else {
        // 新規作成の場合
        if (!imageData.url) {
          toast({
            variant: "destructive",
            title: "画像をアップロードしてください",
          });
          return;
        }

        // 画像データを追加
        const imageResponse = await fetch(imageData.url);
        const imageBlob = await imageResponse.blob();
        formData.append('image', imageBlob);

        await createArtworkMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    }
  };

  const handleFileChange = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      toast({
        title: "画像をアップロード中...",
        description: "AIによる説明文の生成を開始します",
      });

      const response = await fetch(`${adminPath}/generate-description`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '説明文の生成に失敗しました');
      }

      const data = await response.json();
      console.log('Generated data:', data);

      if (!data.title || !data.description || !data.imageUrl) {
        throw new Error('タイトルまたは説明文の生成に失敗しました');
      }

      setImageData({
        url: data.imageUrl,
        generatedTitle: data.title,
        generatedDescription: data.description,
      });

      toast({
        title: "作品の説明を生成しました",
        description: "生成されたタイトルと説明文を確認・編集してください",
      });
    } catch (error) {
      console.error('Error generating description:', error);
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "説明の生成に失敗しました",
          description: `エラー詳細: ${error.message}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "説明の生成に失敗しました",
          description: "AIによる説明文の生成に失敗しました。手動で入力してください",
        });
      }
    }
  };

  const ArtworkForm = () => (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <Label htmlFor="image">作品画像</Label>
        <Dropzone
          existingImageUrl={imageData.url || selectedArtwork?.imageUrl}
          onFileChange={handleFileChange}
          className="h-[200px]"
        />
      </div>
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
        <Label htmlFor="collectionId">コレクション</Label>
        <select
          id="collectionId"
          name="collectionId"
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          defaultValue={selectedArtwork?.collectionId || ''}
        >
          <option value="">コレクションを選択</option>
          {collections?.map((collection: any) => (
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
                  ? 'text-primary font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('artworks')}
            >
              作品管理
              {activeTab === 'artworks' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
              )}
            </button>
            <button
              className={`px-4 py-2 font-medium transition-all relative ${
                activeTab === 'collections'
                  ? 'text-primary font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('collections')}
            >
              コレクション管理
              {activeTab === 'collections' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="space-y-8">
        {activeTab === 'artworks' ? (
          <>
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
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedArtwork ? '作品を編集' : '新規作品を追加'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="p-6">
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
          </>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">コレクション一覧</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    新規コレクションを追加
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新規コレクションを追加</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const title = formData.get('title') as string;
                    
                    if (!title.trim()) {
                      toast({
                        variant: "destructive",
                        title: "エラー",
                        description: "タイトルを入力してください"
                      });
                      return;
                    }

                    try {
                      const response = await fetch(`${adminPath}/collections`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          title: title.trim(),
                        }),
                      });

                      if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'コレクションの作成に失敗しました');
                      }

                      queryClient.invalidateQueries({ queryKey: [`${adminPath}/collections`] });
                      toast({ title: "コレクションを作成しました" });
                      (e.target as HTMLFormElement).reset();
                    } catch (error) {
                      console.error('Collection creation error:', error);
                      toast({ 
                        variant: "destructive", 
                        title: "エラー",
                        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました"
                      });
                    }
                  }} className="space-y-4">
                    <div>
                      <Label htmlFor="title">タイトル</Label>
                      <Input id="title" name="title" required />
                    </div>
                    <Button type="submit">作成</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {collections?.map((collection: any) => (
                <div
                  key={collection.id}
                  className="border p-4 rounded-lg hover:shadow-lg transition-all"
                >
                  <div className="aspect-square mb-2 overflow-hidden rounded-lg">
                    <img
                      src={collection.imageUrl}
                      alt={collection.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = '/placeholder.png';
                      }}
                    />
                  </div>
                  <h3 className="font-medium">{collection.title}</h3>
                  <p className="text-sm text-gray-600">{collection.description}</p>
                  <p className="text-sm text-gray-500 mt-1">{collection.year}年</p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
