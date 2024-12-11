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
import type { InsertArtwork, Artwork } from "@db/schema";
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

  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: '',
    size: '',
    status: 'available',
    createdLocation: '銀座',
    storedLocation: '銀座'
  });

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
    mutationFn: async (artwork: Partial<Artwork>) => {
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
    if (!selectedArtwork && (!file || !(file instanceof File))) {
      toast({
        variant: "destructive",
        title: "画像を選択してください",
      });
      return;
    }

    if (selectedArtwork) {
      const artworkData = {
        id: selectedArtwork.id,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        price: formData.get('price') as string,
        size: formData.get('size') as string | null,
        status: formData.get('status') as string,
        createdLocation: formData.get('createdLocation') as string,
        storedLocation: formData.get('storedLocation') as string,
        isAvailable: true,
        imageUrl: selectedArtwork.imageUrl,
      };
      updateArtworkMutation.mutate(artworkData);
    } else {
      createArtworkMutation.mutate(formData);
    }
  };

  const ArtworkForm = () => (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <Label htmlFor="image">作品画像</Label>
        <Dropzone
          existingImageUrl={formData.imageUrl || selectedArtwork?.imageUrl}
          onFileChange={async (file) => {
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

              if (!data.title || !data.description) {
                throw new Error('タイトルまたは説明文の生成に失敗しました');
              }

              // フォーム要素を直接取得せず、React的な方法で値を更新
              // フォームデータを更新
              setFormData(prev => ({
                ...prev,
                title: data.title,
                description: data.description,
                imageUrl: data.imageUrl
              }));

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
          }}
          className="h-[200px]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          name="title"
          value={formData.title || selectedArtwork?.title || ''}
          onChange={(e) => {
            const value = e.target.value;
            if (!e.target.getAttribute('composing')) {
              setFormData(prev => ({ ...prev, title: value }));
            }
          }}
          onCompositionStart={(e) => {
            e.currentTarget.setAttribute('composing', 'true');
          }}
          onCompositionEnd={(e) => {
            e.currentTarget.removeAttribute('composing');
            setFormData(prev => ({ ...prev, title: e.currentTarget.value }));
          }}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">説明</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || selectedArtwork?.description || ''}
          onChange={(e) => {
            const value = e.target.value;
            if (!e.target.getAttribute('composing')) {
              setFormData(prev => ({ ...prev, description: value }));
            }
          }}
          onCompositionStart={(e) => {
            e.currentTarget.setAttribute('composing', 'true');
          }}
          onCompositionEnd={(e) => {
            e.currentTarget.removeAttribute('composing');
            setFormData(prev => ({ ...prev, description: e.currentTarget.value }));
          }}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">価格</Label>
        <Input
          id="price"
          name="price"
          type="text"
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
      </header>

      <main className="space-y-8">
        <div className="flex justify-between items-center">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks?.map((artwork) => (
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
      </main>
    </div>
  );
};

export default AdminDashboard;
