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
import { Card } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import type { Artwork, Exhibition } from "@db/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { PenLine, Trash2 } from "lucide-react";

interface ExhibitionFormState {
  mainImage: string;
  subImages: string[];
  subtitle: string;
}

interface InteriorImageState {
  url: string;
  description: string;
}

interface ArtworkFormState {
  url: string;
  generatedTitle: string;
  generatedDescription: string;
  interiorImages: InteriorImageState[];
}

const AdminDashboard = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'artworks' | 'exhibitions' | 'ateliers' | 'voices'>('artworks');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [exhibitionForm, setExhibitionForm] = useState<ExhibitionFormState>({
    mainImage: '',
    subImages: [],
    subtitle: '',
  });
  const [artworkForm, setArtworkForm] = useState<ArtworkFormState>({
    url: '',
    generatedTitle: '',
    generatedDescription: '',
    interiorImages: [
      { url: '', description: '' },
      { url: '', description: '' }
    ] as { url: string; description: string }[]
  });

  // Fetch exhibitions data
  const { data: exhibitions } = useQuery<Exhibition[]>({
    queryKey: ["exhibitions"],
    queryFn: async () => {
      const response = await fetch("/api/exhibitions");
      if (!response.ok) throw new Error('Failed to fetch exhibitions');
      return response.json();
    },
  });

  // Fetch artworks data
  const { data: artworks, isLoading } = useQuery<Artwork[]>({
    queryKey: ["artworks"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/artworks");
        if (!response.ok) {
          if (response.status === 401) {
            setLocation("/admin");
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

  // Handle exhibition image upload
  const handleExhibitionImageUpload = async (file: File, type: 'main' | 'sub') => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      toast({
        title: "画像をアップロード中...",
      });

      const response = await fetch("/api/upload", {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('画像のアップロードに失敗しました');
      }

      const data = await response.json();
      
      setExhibitionForm(prev => ({
        ...prev,
        ...(type === 'main' 
          ? { mainImage: data.imageUrl }
          : { subImages: [...prev.subImages, data.imageUrl] }
        ),
      }));

      toast({
        title: "画像をアップロードしました",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "画像のアップロードに失敗しました",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    }
  };

  // Generate exhibition subtitle using AI
  const generateExhibitionSubtitle = async (title: string) => {
    try {
      const response = await fetch("/api/generate-subtitle", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error('サブタイトルの生成に失敗しました');
      }

      const data = await response.json();
      setExhibitionForm(prev => ({
        ...prev,
        subtitle: data.subtitle,
      }));
    } catch (error) {
      console.error('Error generating subtitle:', error);
      toast({
        variant: "destructive",
        title: "サブタイトルの生成に失敗しました",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    }
  };

  // Handle artwork form submission
  const handleArtworkSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      if (selectedArtwork) {
        // Update existing artwork
        const response = await fetch(`/api/artworks/${selectedArtwork.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.get('title'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price') as string),
            size: formData.get('size'),
            status: formData.get('status'),
            createdLocation: formData.get('createdLocation'),
            storedLocation: formData.get('storedLocation'),
            imageUrl: artworkForm.url || selectedArtwork.imageUrl,
            interiorImageUrls: artworkForm.interiorImages.map(img => img.url),
            interiorImageDescriptions: artworkForm.interiorImages.map(img => img.description),
          }),
        });

        if (!response.ok) {
          throw new Error('作品の更新に失敗しました');
        }

        toast({ title: "作品を更新しました" });
        setIsEditDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["artworks"] });
      } else {
        // Create new artwork
        if (!artworkForm.url) {
          toast({
            variant: "destructive",
            title: "画像をアップロードしてください",
          });
          return;
        }

        const response = await fetch("/api/artworks", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.get('title'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price') as string),
            size: formData.get('size'),
            status: formData.get('status'),
            createdLocation: formData.get('createdLocation'),
            storedLocation: formData.get('storedLocation'),
            imageUrl: artworkForm.url,
            interiorImageUrls: artworkForm.interiorImages.map(img => img.url),
            interiorImageDescriptions: artworkForm.interiorImages.map(img => img.description),
          }),
        });

        if (!response.ok) {
          throw new Error('作品の作成に失敗しました');
        }

        toast({ title: "作品を追加しました" });
        setIsEditDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["artworks"] });
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

  // Exhibition form JSX
  const ExhibitionForm = () => (
    <form onSubmit={handleExhibitionSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="展示会のタイトルを入力"
          onChange={(e) => generateExhibitionSubtitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">サブタイトル (AI生成)</Label>
        <Input
          id="subtitle"
          name="subtitle"
          value={exhibitionForm.subtitle}
          readOnly
          className="bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">説明</Label>
        <Textarea
          id="description"
          name="description"
          required
          placeholder="展示会の説明を入力"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">場所</Label>
        <Input
          id="location"
          name="location"
          required
          placeholder="展示会の場所を入力"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">開始日</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">終了日</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label>メイン画像</Label>
        <Dropzone
          existingImageUrl={exhibitionForm.mainImage}
          onFileChange={(file) => handleExhibitionImageUpload(file, 'main')}
          className="aspect-video w-full"
        />
      </div>

      <div className="space-y-4">
        <Label>サブ画像</Label>
        <div className="grid grid-cols-2 gap-4">
          {exhibitionForm.subImages.map((url, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={url}
                alt={`サブ画像 ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
          <Dropzone
            onFileChange={(file) => handleExhibitionImageUpload(file, 'sub')}
            className="aspect-square w-full"
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        展示会を作成
      </Button>
    </form>
  );

  // Handle exhibition form submission
  const handleExhibitionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/exhibitions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.get('title'),
          subtitle: exhibitionForm.subtitle,
          description: formData.get('description'),
          location: formData.get('location'),
          startDate: formData.get('startDate'),
          endDate: formData.get('endDate'),
          mainImage: exhibitionForm.mainImage,
          subImages: exhibitionForm.subImages,
        }),
      });

      if (!response.ok) {
        throw new Error('展示会の作成に失敗しました');
      }

      toast({ title: "展示会を作成しました" });
      setExhibitionForm({
        mainImage: '',
        subImages: [],
        subtitle: '',
      });
      queryClient.invalidateQueries({ queryKey: ["exhibitions"] });
    } catch (error) {
      console.error('Exhibition submission error:', error);
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    }
  };

  const handleArtworkImageUpload = async (file: File, index: number) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      toast({ title: '画像アップロード中...' });
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('画像アップロード失敗');
      const data = await response.json();
      const newInteriorImages = [...artworkForm.interiorImages];
      newInteriorImages[index].url = data.imageUrl;
      setArtworkForm(prev => ({...prev, interiorImages: newInteriorImages}));
      toast({ title: '画像アップロード完了' });
    } catch (error) {
      console.error('画像アップロードエラー', error);
      toast({ variant: 'destructive', title: '画像アップロード失敗', description: error instanceof Error ? error.message : '不明なエラー' });
    }
  }

  const handleArtworkInteriorDescriptionChange = (index: number, description: string) => {
    const newInteriorImages = [...artworkForm.interiorImages];
    newInteriorImages[index].description = description;
    setArtworkForm(prev => ({...prev, interiorImages: newInteriorImages}));
  };

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
              onClick={() => setLocation("/admin")}
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
            <button
              className={`px-4 py-2 font-medium transition-all relative ${
                activeTab === 'exhibitions'
                  ? 'text-black font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('exhibitions')}
            >
              展示会管理
              {activeTab === 'exhibitions' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
              )}
            </button>
            <button
              className={`px-4 py-2 font-medium transition-all relative ${
                activeTab === 'ateliers'
                  ? 'text-black font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('ateliers')}
            >
              アトリエ管理
              {activeTab === 'ateliers' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
              )}
            </button>
            <button
              className={`px-4 py-2 font-medium transition-all relative ${
                activeTab === 'voices'
                  ? 'text-black font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('voices')}
            >
              お客様の声
              {activeTab === 'voices' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="space-y-8">
        {activeTab === 'artworks' && (
          // Artwork management content
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">作品一覧</h2>
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setSelectedArtwork(null);
                      setArtworkForm({
                        url: '',
                        generatedTitle: '',
                        generatedDescription: '',
                        interiorImages: [
                          { url: '', description: '' },
                          { url: '', description: '' }
                        ]
                      });
                    }}
                  >
                    新規作品を追加
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedArtwork ? '作品を編集' : '新規作品を追加'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleArtworkSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <Label htmlFor="image">作品画像</Label>
                      <Dropzone
                        existingImageUrl={artworkForm.url || selectedArtwork?.imageUrl}
                        onFileChange={async (file) => {
                          handleArtworkImageUpload(file, 0)
                          setArtworkForm(prev => ({...prev, url: URL.createObjectURL(file)}))
                        }}
                        className="aspect-square w-full h-[200px] mx-auto"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">タイトル</Label>
                      <Input
                        id="title"
                        name="title"
                        defaultValue={selectedArtwork?.title || artworkForm.generatedTitle}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">説明</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={selectedArtwork?.description || artworkForm.generatedDescription}
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
                      <Label htmlFor="exhibitionLocation">展示履歴</Label>
                      <Input
                        id="exhibitionLocation"
                        name="exhibitionLocation"
                        defaultValue={selectedArtwork?.exhibitionLocation || ''}
                        placeholder="例: 銀座ギャラリー"
                      />
                    </div>
                    <div className="space-y-4">
                      <Label>インテリアイメージ</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {artworkForm.interiorImages.map((interiorImage, index) => (
                          <div key={index} className="space-y-2">
                            <Dropzone
                              existingImageUrl={interiorImage.url || selectedArtwork?.interiorImageUrls?.[index]}
                              onFileChange={(file) => handleArtworkImageUpload(file, index)}
                              className="aspect-square w-full h-[160px]"
                            />
                            <div className="space-y-2">
                              <Label htmlFor={`interior-desc-${index + 1}`}>説明文</Label>
                              <Textarea
                                id={`interior-desc-${index + 1}`}
                                name={`interior-desc-${index + 1}`}
                                placeholder={`説明文を入力してください`}
                                value={interiorImage.description}
                                onChange={(e) => handleArtworkInteriorDescriptionChange(index, e.target.value)}
                                className="resize-none"
                                rows={4}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      {selectedArtwork ? '更新' : '作成'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {artworks?.map((artwork) => (
                <Card
                  key={artwork.id}
                  className="overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedArtwork(artwork);
                    setArtworkForm({
                      url: artwork.imageUrl,
                      generatedTitle: '',
                      generatedDescription: '',
                      interiorImages: (artwork.interiorImageUrls || ['', '']).map((url: string, index: number) => ({
                        url,
                        description: (artwork.interiorImageDescriptions || ['', ''])[index] || ''
                      }))
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
                        setArtworkForm({
                          url: artwork.imageUrl,
                          generatedTitle: '',
                          generatedDescription: '',
                          interiorImages: (artwork.interiorImageUrls || ['', '']).map((url: string, index: number) => ({
                            url,
                            description: (artwork.interiorImageDescriptions || ['', ''])[index] || ''
                          }))
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
                            onClick={() => {
                              fetch(`/api/artworks/${artwork.id}`, { method: 'DELETE' })
                                .then(() => {
                                  queryClient.invalidateQueries({ queryKey: ["artworks"] });
                                  toast({ title: '作品を削除しました' });
                                })
                                .catch(error => {
                                  console.error('作品削除エラー', error);
                                  toast({ variant: 'destructive', title: '作品削除失敗', description: error instanceof Error ? error.message : '不明なエラー' });
                                });
                            }}
                          >
                            削除
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {activeTab === 'exhibitions' && (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">展示会一覧</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>新規展示会を追加</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>新規展示会を追加</DialogTitle>
                  </DialogHeader>
                  <ExhibitionForm />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exhibitions?.map((exhibition) => (
                <Card
                  key={exhibition.id}
                  className="overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-video relative">
                    <img
                      src={exhibition.imageUrl}
                      alt={exhibition.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-lg font-semibold">{exhibition.title}</h3>
                    <p className="text-sm text-gray-600">{exhibition.description}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{new Date(exhibition.startDate).toLocaleDateString()} - {new Date(exhibition.endDate).toLocaleDateString()}</span>
                      <span>{exhibition.location}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Placeholder for Atelier and Voices management */}
        {activeTab === 'ateliers' && <p>アトリエ管理ページ</p>}
        {activeTab === 'voices' && <p>お客様の声ページ</p>}
      </main>
    </div>
  );
};

export default AdminDashboard;