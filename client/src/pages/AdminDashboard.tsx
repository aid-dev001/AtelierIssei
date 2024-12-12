import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Dropzone } from "@/components/ui/dropzone";
import type { Artwork, Exhibition, Collection } from "@db/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PenLine, Trash2 } from "lucide-react";

const AdminDashboard = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'artworks' | 'collections' | 'exhibitions'>('artworks');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditCollectionDialogOpen, setIsEditCollectionDialogOpen] = useState(false);
  const [isEditExhibitionDialogOpen, setIsEditExhibitionDialogOpen] = useState(false);
  const [imageData, setImageData] = useState<{
    file: File | null;
    preview: string | null;
  }>({ file: null, preview: null });
  const [interiorImages, setInteriorImages] = useState<Array<{
    file: File | null;
    preview: string | null;
    description: string;
  }>>([
    { file: null, preview: null, description: '' },
    { file: null, preview: null, description: '' }
  ]);

  // Queries
  const { data: collections, isLoading: isLoadingCollections, error: collectionsError } = useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/collections");
        if (!response.ok) {
          if (response.status === 401) {
            setLocation("/admin");
            throw new Error('セッションが切れました。再度ログインしてください。');
          }
          throw new Error('コレクションの取得に失敗しました');
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          console.error("Expected array of collections, got:", data);
          return [];
        }
        return data;
      } catch (error) {
        console.error('Collections fetch error:', error);
        toast({
          variant: "destructive",
          title: "エラー",
          description: error instanceof Error ? error.message : "コレクションの取得に失敗しました",
        });
        return [];  // Return empty array instead of throwing
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const { data: artworks, isLoading: isLoadingArtworks, error: artworksError } = useQuery<Artwork[]>({
    queryKey: ["artworks"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/artworks");
        if (!response.ok) {
          if (response.status === 401) {
            setLocation(adminPath);
            throw new Error('セッションが切れました。再度ログインしてください。');
          }
          throw new Error('作品の取得に失敗しました');
        }
        const data = await response.json();
        console.log('Fetched artworks:', data);
        if (!Array.isArray(data)) {
          console.error("Expected array of artworks, got:", data);
          return [];
        }
        return data;
      } catch (error) {
        console.error('Artworks fetch error:', error);
        toast({
          variant: "destructive",
          title: "エラー",
          description: error instanceof Error ? error.message : "作品の取得に失敗しました",
        });
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const { data: exhibitions, isLoading: isLoadingExhibitions } = useQuery<Exhibition[]>({
    queryKey: ["exhibitions"],
    queryFn: async () => {
      const response = await fetch("/api/admin/exhibitions");
      if (!response.ok) throw new Error('展示会の取得に失敗しました');
      return response.json();
    },
  });


  const handleFileChange = (file: File) => {
    setImageData({
      file,
      preview: URL.createObjectURL(file)
    });
  };

  const handleInteriorImageChange = (index: number, file: File | null) => {
    if (!file) return;
    setInteriorImages(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        file,
        preview: URL.createObjectURL(file)
      };
      return updated;
    });
  };

  const handleInteriorDescriptionChange = (index: number, description: string) => {
    setInteriorImages(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        description
      };
      return updated;
    });
  };

  const handleArtworkSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      let mainImageUrl = selectedArtwork?.imageUrl;
      let interiorImageUrls = selectedArtwork?.interiorImageUrls || [];
      let interiorImageDescriptions = selectedArtwork?.interiorImageDescriptions || ['', ''];

      // Upload main image if changed
      if (imageData.file) {
        const mainImageFormData = new FormData();
        mainImageFormData.append('image', imageData.file);
        const uploadResponse = await fetch(`${adminPath}/api/upload`, {
          method: 'POST',
          body: mainImageFormData,
        });
        if (!uploadResponse.ok) throw new Error('メイン画像のアップロードに失敗しました');
        const { imageUrl } = await uploadResponse.json();
        mainImageUrl = imageUrl;
      }

      // Upload interior images if changed
      for (let i = 0; i < interiorImages.length; i++) {
        if (interiorImages[i].file) {
          const interiorImageFormData = new FormData();
          interiorImageFormData.append('image', interiorImages[i].file);
          const uploadResponse = await fetch(`${adminPath}/api/upload`, {
            method: 'POST',
            body: interiorImageFormData,
          });
          if (!uploadResponse.ok) throw new Error(`インテリア画像${i + 1}のアップロードに失敗しました`);
          const { imageUrl } = await uploadResponse.json();
          interiorImageUrls[i] = imageUrl;
        }
        interiorImageDescriptions[i] = interiorImages[i].description;
      }

      const artworkData = {
        title: formData.get('title'),
        description: formData.get('description'),
        imageUrl: mainImageUrl,
        price: formData.get('price'),
        size: formData.get('size'),
        status: formData.get('status'),
        createdLocation: formData.get('createdLocation'),
        storedLocation: formData.get('storedLocation'),
        exhibitionLocation: formData.get('exhibitionLocation'),
        collectionId: formData.get('collectionId'),
        interiorImageUrls,
        interiorImageDescriptions,
      };

      const response = await fetch(
        selectedArtwork 
          ? `${adminPath}/api/artworks/${selectedArtwork.id}`
          : `${adminPath}/api/artworks`,
        {
          method: selectedArtwork ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(artworkData),
        }
      );

      if (!response.ok) throw new Error('作品の保存に失敗しました');

      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      toast({ title: `作品を${selectedArtwork ? '更新' : '作成'}しました` });
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    }
  };

  const createExhibitionMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`${adminPath}/api/exhibitions`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('展示会の作成に失敗しました');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibitions"] });
      toast({ title: "展示会を作成しました" });
      setIsEditExhibitionDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    },
  });

  const updateExhibitionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Exhibition> }) => {
      const response = await fetch(`${adminPath}/api/exhibitions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('展示会の更新に失敗しました');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibitions"] });
      toast({ title: "展示会を更新しました" });
      setIsEditExhibitionDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    },
  });

  const deleteExhibitionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${adminPath}/api/exhibitions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('展示会の削除に失敗しました');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibitions"] });
      toast({ title: "展示会を削除しました" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    },
  });

  const ExhibitionForm = () => {
    const [exhibitionImageData, setExhibitionImageData] = useState<{
      file: File | null;
      preview: string | null;
    }>({ 
      file: null, 
      preview: selectedExhibition?.imageUrl || null 
    });

    return (
      <form onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        try {
          if (selectedExhibition) {
            // Update existing exhibition
            const updatedData = {
              title: formData.get('title'),
              description: formData.get('description'),
              location: formData.get('location'),
              startDate: formData.get('startDate'),
              endDate: formData.get('endDate'),
            };

            await updateExhibitionMutation.mutateAsync({
              id: selectedExhibition.id,
              data: updatedData,
            });

            if (exhibitionImageData.file) {
              const imageFormData = new FormData();
              imageFormData.append('image', exhibitionImageData.file);
              const uploadResponse = await fetch(`${adminPath}/api/upload`, {
                method: 'POST',
                body: imageFormData,
              });
              
              if (!uploadResponse.ok) throw new Error('画像のアップロードに失敗しました');
              
              const { imageUrl } = await uploadResponse.json();
              await updateExhibitionMutation.mutateAsync({
                id: selectedExhibition.id,
                data: { imageUrl },
              });
            }
          } else {
            // Create new exhibition
            if (!exhibitionImageData.file) {
              toast({
                variant: "destructive",
                title: "エラー",
                description: "画像を選択してください",
              });
              return;
            }

            const imageFormData = new FormData();
            imageFormData.append('image', exhibitionImageData.file);
            const uploadResponse = await fetch(`${adminPath}/api/upload`, {
              method: 'POST',
              body: imageFormData,
            });

            if (!uploadResponse.ok) throw new Error('画像のアップロードに失敗しました');
            
            const { imageUrl } = await uploadResponse.json();
            const exhibitionData = {
              title: formData.get('title'),
              description: formData.get('description'),
              location: formData.get('location'),
              imageUrl,
              startDate: formData.get('startDate'),
              endDate: formData.get('endDate'),
            };

            await createExhibitionMutation.mutateAsync(exhibitionData);
          }

          setIsEditExhibitionDialogOpen(false);
        } catch (error) {
          toast({
            variant: "destructive",
            title: "エラー",
            description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
          });
        }
      }} className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="title">展示会タイトル</Label>
          <Input
            id="title"
            name="title"
            defaultValue={selectedExhibition?.title}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">説明</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={selectedExhibition?.description}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">開催場所</Label>
          <Input
            id="location"
            name="location"
            defaultValue={selectedExhibition?.location}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">開始日</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={selectedExhibition?.startDate?.split('T')[0]}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">終了日</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={selectedExhibition?.endDate?.split('T')[0]}
            required
          />
        </div>
        <div className="space-y-4">
          <Label htmlFor="image">展示会画像</Label>
          <Dropzone
            existingImageUrl={selectedExhibition?.imageUrl}
            onFileChange={(file) => {
              setExhibitionImageData({
                file,
                preview: URL.createObjectURL(file)
              });
            }}
            className="aspect-video w-full h-[200px] mx-auto"
          />
        </div>
        <Button type="submit" className="w-full">
          {selectedExhibition ? '更新' : '作成'}
        </Button>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">管理画面</h1>
          <Button
            variant="outline"
            onClick={() => {
              fetch("/api/auth/logout", { method: 'POST' })
                .then(() => {
                  setLocation("/admin");
                })
                .catch((error) => {
                  console.error('Logout failed:', error);
                  toast({
                    variant: "destructive",
                    title: "エラー",
                    description: "ログアウトに失敗しました",
                  });
                });
            }}
          >
            ログアウト
          </Button>
        </div>
      </header>
      <main className="container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          <TabsList className="mb-8">
            <TabsTrigger value="artworks">作品管理</TabsTrigger>
            <TabsTrigger value="collections">コレクション管理</TabsTrigger>
            <TabsTrigger value="exhibitions">展示会管理</TabsTrigger>
          </TabsList>

          {/* Artworks Tab */}
          <TabsContent value="artworks">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold">作品一覧</h2>
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setSelectedArtwork(null);
                      setImageData({ file: null, preview: null });
                      setInteriorImages([
                        { file: null, preview: null, description: '' },
                        { file: null, preview: null, description: '' }
                      ]);
                    }}
                  >
                    新規作品を追加
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0">
                  <div className="h-full overflow-y-auto">
                    <div className="sticky top-0 bg-background z-10 px-6 pt-6">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedArtwork ? '作品を編集' : '新規作品を追加'}
                      </DialogTitle>
                    </DialogHeader>
                  </div>
                  <div className="px-6 pb-6 h-[calc(90vh-80px)] overflow-y-auto">
                    <form onSubmit={handleArtworkSubmit} className="space-y-8">
                      <div className="space-y-4">
                        <Label htmlFor="image">作品画像</Label>
                        <Dropzone
                          existingImageUrl={imageData.preview || selectedArtwork?.imageUrl}
                          onFileChange={handleFileChange}
                          className="aspect-square w-[200px] h-[200px] mx-auto"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="title">タイトル</Label>
                        <Input
                          id="title"
                          name="title"
                          defaultValue={selectedArtwork?.title}
                          required
                        />
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="description">説明</Label>
                        <Textarea
                          id="description"
                          name="description"
                          defaultValue={selectedArtwork?.description}
                          required
                        />
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="price">価格（円）</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          defaultValue={selectedArtwork?.price}
                          required
                        />
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="size">サイズ</Label>
                        <Input
                          id="size"
                          name="size"
                          defaultValue={selectedArtwork?.size}
                          placeholder="例: F4(333mm x 242mm)"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="status">ステータス</Label>
                        <select
                          id="status"
                          name="status"
                          defaultValue={selectedArtwork?.status || 'available'}
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2"
                        >
                          <option value="available">販売中</option>
                          <option value="reserved">予約済み</option>
                          <option value="sold">売約済</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="createdLocation">制作場所</Label>
                        <Input
                          id="createdLocation"
                          name="createdLocation"
                          defaultValue={selectedArtwork?.createdLocation || '銀座'}
                        />
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="storedLocation">保管場所</Label>
                        <Input
                          id="storedLocation"
                          name="storedLocation"
                          defaultValue={selectedArtwork?.storedLocation || '銀座'}
                        />
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="exhibitionLocation">展示履歴</Label>
                        <Input
                          id="exhibitionLocation"
                          name="exhibitionLocation"
                          defaultValue={selectedArtwork?.exhibitionLocation}
                        />
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="collectionId">コレクション</Label>
                        <select
                          id="collectionId"
                          name="collectionId"
                          defaultValue={selectedArtwork?.collectionId || ''}
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2"
                        >
                          <option value="">コレクションを選択</option>
                          {collections?.map((collection) => (
                            <option key={collection.id} value={collection.id}>
                              {collection.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Interior Images Section */}
                      <div className="space-y-6 mt-8">
                        <h3 className="text-lg font-medium border-t pt-6">インテリアイメージ</h3>
                        {interiorImages.map((image, index) => (
                          <div key={index} className="space-y-4 p-4 border rounded-lg bg-gray-50/50">
                            <Label className="text-base">インテリアイメージ {index + 1}</Label>
                            <Dropzone
                              existingImageUrl={image.preview || selectedArtwork?.interiorImageUrls?.[index]}
                              onFileChange={(file) => handleInteriorImageChange(index, file)}
                              className="aspect-video w-full h-[150px]"
                            />
                            <div className="space-y-2">
                              <Label>説明</Label>
                              <Textarea
                                value={image.description || selectedArtwork?.interiorImageDescriptions?.[index] || ''}
                                onChange={(e) => handleInteriorDescriptionChange(index, e.target.value)}
                                placeholder="インテリアイメージの説明を入力"
                                className="min-h-[100px]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button type="submit" className="w-full">
                        {selectedArtwork ? '更新' : '作成'}
                      </Button>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoadingArtworks ? (
                [...Array(8)].map((_, i) => (
                  <div key={i} className="border rounded-lg overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : artworksError ? (
                <div className="col-span-full text-center text-red-500">
                  データの取得に失敗しました。ページを再読み込みしてください。
                </div>
              ) : !artworks?.length ? (
                <div className="col-span-full text-center text-gray-500">
                  作品がありません。新しい作品を追加してください。
                </div>
              ) : artworks?.map((artwork) => (
                <div
                  key={artwork.id}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedArtwork(artwork);
                    setImageData({
                      preview: artwork.imageUrl,
                      file: null,
                    });
                    setInteriorImages(
                      (artwork.interiorImageUrls || []).map((url, index) => ({
                        file: null,
                        preview: url,
                        description: artwork.interiorImageDescriptions?.[index] || ''
                      }))
                    );
                    setIsEditDialogOpen(true);
                  }}
                >
                  <div className="aspect-square">
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
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-2">{artwork.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{artwork.description}</p>
                    <p className="text-sm text-gray-600 mt-2">¥{Number(artwork.price).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold">コレクション一覧</h2>
              <Dialog open={isEditCollectionDialogOpen} onOpenChange={setIsEditCollectionDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setSelectedCollection(null);
                      setIsEditCollectionDialogOpen(true);
                    }}
                  >
                    新規コレクション
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedCollection ? 'コレクションを編集' : '新規コレクション'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    try {
                      const collectionData = {
                        title: formData.get('title'),
                        description: formData.get('description')
                      };

                      const response = await fetch(
                        selectedCollection
                          ? `${adminPath}/api/collections/${selectedCollection.id}`
                          : `${adminPath}/api/collections`,
                        {
                          method: selectedCollection ? 'PUT' : 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(collectionData),
                        }
                      );

                      if (!response.ok) throw new Error('コレクションの保存に失敗しました');

                      queryClient.invalidateQueries({ queryKey: ["collections"] });
                      toast({ title: `コレクションを${selectedCollection ? '更新' : '作成'}しました` });
                      setIsEditCollectionDialogOpen(false);
                    } catch (error) {
                      toast({
                        variant: "destructive",
                        title: "エラー",
                        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
                      });
                    }
                  }} className="space-y-8">
                    <div className="space-y-4">
                      <Label htmlFor="title">タイトル</Label>
                      <Input
                        id="title"
                        name="title"
                        defaultValue={selectedCollection?.title}
                        required
                      />
                    </div>
                    <div className="space-y-4">
                      <Label htmlFor="description">説明</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={selectedCollection?.description}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      {selectedCollection ? '更新' : '作成'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingCollections ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="border rounded-lg overflow-hidden animate-pulse">
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="grid grid-cols-4 gap-2">
                        {[...Array(4)].map((_, j) => (
                          <div key={j} className="aspect-square bg-gray-200 rounded" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : collections?.map((collection) => (
                <div
                  key={collection.id}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-medium mb-2">{collection.title}</h3>
                    <p className="text-gray-600 mb-4">{collection.description}</p>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {artworks?.filter(artwork => artwork.collectionId === collection.id)
                        .slice(0, 4)
                        .map((artwork) => (
                          <div key={artwork.id} className="aspect-square rounded overflow-hidden">
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
                        ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">
                        {artworks?.filter(artwork => artwork.collectionId === collection.id).length || 0} 作品
                      </span>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCollection(collection);
                            setIsEditCollectionDialogOpen(true);
                          }}
                        >
                          <PenLine className="w-4 h-4 mr-2" />
                          編集
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Exhibitions Tab Content */}
          <TabsContent value="exhibitions">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold">展示会一覧</h2>
              <Dialog open={isEditExhibitionDialogOpen} onOpenChange={setIsEditExhibitionDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setSelectedExhibition(null);
                      setIsEditExhibitionDialogOpen(true);
                    }}
                  >
                    新規展示会を追加
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 z-[200] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedExhibition ? '展示会を編集' : '新規展示会を追加'}
                    </DialogTitle>
                  </DialogHeader>
                  <ExhibitionForm />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingExhibitions ? (
                <div>Loading...</div>
              ) : exhibitions?.map((exhibition) => (
                <div
                  key={exhibition.id}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-video relative">
                    <img
                      src={exhibition.imageUrl}
                      alt={exhibition.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = '/placeholder.png';
                      }}
                    />
                  </div>
                  <div className="p-4 space-y-4">
                    <h3 className="font-medium text-lg">{exhibition.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{exhibition.description}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">{exhibition.location}</p>
                      <div className="text-sm text-gray-600">
                        {new Date(exhibition.startDate).toLocaleDateString()} - {new Date(exhibition.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedExhibition(exhibition);
                          setIsEditExhibitionDialogOpen(true);
                        }}
                      >
                        <PenLine className="w-4 h-4 mr-2" />
                        編集
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="flex-1">
                            <Trash2 className="w-4 h-4 mr-2" />
                            削除
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>展示会を削除しますか？</AlertDialogTitle>
                            <AlertDialogDescription>
                              この操作は取り消せません。本当に削除してもよろしいですか？
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex justify-end gap-4">
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteExhibitionMutation.mutate(exhibition.id)}
                            >
                              削除
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;