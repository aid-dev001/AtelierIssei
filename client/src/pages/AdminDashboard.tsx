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
import type { Artwork, Exhibition } from "@db/schema";
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
import { PenLine, Trash2, Plus } from "lucide-react";

const AdminDashboard = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const adminPath = window.location.pathname.split('/dashboard')[0];
  const [activeTab, setActiveTab] = useState<'artworks' | 'collections' | 'exhibitions'>('artworks');
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null);
  const [isEditCollectionDialogOpen, setIsEditCollectionDialogOpen] = useState(false);
  const [isEditExhibitionDialogOpen, setIsEditExhibitionDialogOpen] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [imageData, setImageData] = useState<{
    file: File | null;
    preview: string | null;
  }>({ file: null, preview: null });

  // Collections data
  const { data: collections, isLoading: isLoadingCollections } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await fetch(`${adminPath}/collections`);
      if (!response.ok) {
        if (response.status === 401) {
          setLocation(adminPath);
          throw new Error('セッションが切れました。再度ログインしてください。');
        }
        throw new Error('コレクションデータの取得に失敗しました');
      }
      return response.json();
    },
  });

  // Exhibitions data
  const { data: exhibitions, isLoading: isLoadingExhibitions } = useQuery({
    queryKey: ["exhibitions"],
    queryFn: async () => {
      const response = await fetch(`${adminPath}/exhibitions`);
      if (!response.ok) {
        if (response.status === 401) {
          setLocation(adminPath);
          throw new Error('セッションが切れました。再度ログインしてください。');
        }
        throw new Error('展示会データの取得に失敗しました');
      }
      return response.json();
    },
  });

  // Artworks data
  const { data: artworks, isLoading: isLoadingArtworks } = useQuery({
    queryKey: ["artworks"],
    queryFn: async () => {
      const response = await fetch(`${adminPath}/artworks`);
      if (!response.ok) {
        if (response.status === 401) {
          setLocation(adminPath);
          throw new Error('セッションが切れました。再度ログインしてください。');
        }
        throw new Error('作品データの取得に失敗しました');
      }
      return response.json();
    },
  });

  // Mutations
  const createExhibitionMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`${adminPath}/exhibitions`, {
        method: 'POST',
        body: data,
      });
      if (!response.ok) throw new Error('展示会の作成に失敗しました');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibitions"] });
      toast({ title: "展示会を作成しました" });
      setIsEditExhibitionDialogOpen(false);
      setSelectedExhibition(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "展示会の作成に失敗しました",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    },
  });

  const updateExhibitionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`${adminPath}/exhibitions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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
        title: "展示会の更新に失敗しました",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    },
  });

  const deleteExhibitionMutation = useMutation({
    mutationFn: async (exhibitionId: number) => {
      const response = await fetch(`${adminPath}/exhibitions/${exhibitionId}`, {
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
        title: "展示会の削除に失敗しました",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    },
  });

  const ExhibitionForm = () => (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      
      if (selectedExhibition) {
        updateExhibitionMutation.mutate({
          id: selectedExhibition.id,
          data: {
            title: formData.get('title'),
            description: formData.get('description'),
            location: formData.get('location'),
            imageUrl: formData.get('imageUrl'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            isActive: true
          }
        });
      } else {
        createExhibitionMutation.mutate(formData);
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
          defaultValue={selectedExhibition?.startDate?.toString().split('T')[0]}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endDate">終了日</Label>
        <Input
          id="endDate"
          name="endDate"
          type="date"
          defaultValue={selectedExhibition?.endDate?.toString().split('T')[0]}
          required
        />
      </div>
      <div className="space-y-4">
        <Label htmlFor="image">展示会画像</Label>
        <Dropzone
          existingImageUrl={selectedExhibition?.imageUrl}
          onFileChange={(file) => {
            const formData = new FormData();
            formData.append('image', file);
            fetch(`${adminPath}/upload`, {
              method: 'POST',
              body: formData,
            })
            .then(res => res.json())
            .then(data => {
              if (selectedExhibition) {
                updateExhibitionMutation.mutate({
                  id: selectedExhibition.id,
                  data: { imageUrl: data.imageUrl }
                });
              }
            })
            .catch(error => {
              toast({
                variant: "destructive",
                title: "画像のアップロードに失敗しました",
                description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
              });
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

  return (
    <div className="min-h-screen bg-gray-50/30">
      <main className="container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          <TabsList className="mb-8">
            <TabsTrigger value="artworks">作品管理</TabsTrigger>
            <TabsTrigger value="collections">コレクション管理</TabsTrigger>
            <TabsTrigger value="exhibitions">展示会管理</TabsTrigger>
          </TabsList>

          <TabsContent value="artworks">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold">作品一覧</h2>
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setSelectedArtwork(null);
                      setImageData({ file: null, preview: null });
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
                    {/* ArtworkForm will be added here */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="space-y-4">
                        <Label htmlFor="image">作品画像</Label>
                        <Dropzone
                          existingImageUrl={imageData.preview || selectedArtwork?.imageUrl}
                          onFileChange={handleFileChange}
                          className="aspect-square w-full h-[200px] mx-auto"
                        />
                      </div>
                      {/* ... rest of ArtworkForm ... */}
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {isLoadingArtworks ? (
                <div>Loading...</div>
              ) : artworks?.map((artwork) => (
                <div
                  key={artwork.id}
                  className="border p-3 rounded-lg hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedArtwork(artwork);
                    setImageData({
                      preview: artwork.imageUrl,
                      file: null,
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
                          preview: artwork.imageUrl,
                          file: null,
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
          </TabsContent>

          <TabsContent value="collections">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold">コレクション一覧</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新規コレクション
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const title = formData.get('title') as string;
                    let description = formData.get('description') as string;
                    
                    if (!title.trim()) {
                      toast({
                        variant: "destructive",
                        title: "エラー",
                        description: "タイトルを入力してください"
                      });
                      return;
                    }

                    // 説明文が空の場合、自動生成
                    if (!description.trim()) {
                      description = `${title.trim()}シリーズの作品群です。独自の美的感性と芸術的表現を追求したコレクションとなっています。`;
                    }

                    try {
                      const response = await fetch(`${adminPath}/collections`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          title: title.trim(),
                          description: description.trim(),
                        }),
                      });

                      if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'コレクションの作成に失敗しました');
                      }

                      queryClient.invalidateQueries({ queryKey: ["collections"] });
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
                      <Input 
                        id="title" 
                        name="title" 
                        required 
                        onBlur={async (e) => {
                          const title = e.target.value.trim();
                          if (title) {
                            const descriptionField = document.getElementById('description') as HTMLTextAreaElement;
                            if (descriptionField && !descriptionField.value) {
                              try {
                                const response = await fetch(`${adminPath}/generate-collection-description`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ title })
                                });
                                
                                if (!response.ok) throw new Error('説明文の生成に失敗しました');
                                
                                const data = await response.json();
                                descriptionField.value = data.description;
                              } catch (error) {
                                console.error('Error generating description:', error);
                                toast({
                                  variant: "destructive",
                                  title: "エラー",
                                  description: "説明文の生成に失敗しました"
                                });
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">説明文</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="コレクションの説明文を入力してください"
                        className="min-h-[100px]"
                      />
                    </div>
                    <Button type="submit">作成</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {isLoadingCollections ? (
                <div>Loading...</div>
              ) : Array.isArray(collections) && collections.map((collection: any) => (
                <div
                  key={collection.id}
                  className="border p-4 rounded-lg hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedCollection(collection);
                    setIsEditCollectionDialogOpen(true);
                  }}
                >
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {artworks?.filter(artwork => artwork.collectionId === collection.id)
                      .slice(0, 4)
                      .map((artwork, index) => (
                        <div key={artwork.id} className="aspect-square overflow-hidden rounded-lg">
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
                    {Array.from({ length: Math.max(0, 4 - (artworks?.filter(artwork => artwork.collectionId === collection.id).length || 0)) }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    ))}
                  </div>
                  <h3 className="font-medium">{collection.title}</h3>
                  <p className="text-sm text-gray-600">{collection.description}</p>
                  <p className="text-sm text-gray-500 mt-1">{collection.year}年</p>
                  <div className="flex gap-2 mt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <PenLine className="w-3 h-3 mr-1" />
                          編集
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>コレクションを編集</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const title = formData.get('title') as string;
                          const description = formData.get('description') as string;
                          
                          if (!title.trim()) {
                            toast({
                              variant: "destructive",
                              title: "エラー",
                              description: "タイトルを入力してください"
                            });
                            return;
                          }

                          try {
                            const response = await fetch(`${adminPath}/collections/${collection.id}`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                title: title.trim(),
                                description: description.trim() || `${title.trim()}コレクション`,
                              }),
                            });

                            if (!response.ok) {
                              throw new Error('コレクションの更新に失敗しました');
                            }

                            queryClient.invalidateQueries({ queryKey: ["collections"] });
                            toast({ title: "コレクションを更新しました" });
                            (e.target as HTMLFormElement).reset();
                          } catch (error) {
                            console.error('Collection update error:', error);
                            toast({ 
                              variant: "destructive", 
                              title: "エラー",
                              description: error instanceof Error ? error.message : "予期せぬエラーが発生しました"
                            });
                          }
                        }} className="space-y-4">
                          <div>
                            <Label htmlFor={`title-${collection.id}`}>タイトル</Label>
                            <Input 
                              id={`title-${collection.id}`} 
                              name="title" 
                              defaultValue={collection.title}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`description-${collection.id}`}>説明文</Label>
                            <Textarea
                              id={`description-${collection.id}`}
                              name="description"
                              defaultValue={collection.description}
                              placeholder="コレクションの説明文を入力してください"
                            />
                          </div>
                          <Button type="submit">更新</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex-1">
                          <Trash2 className="w-3 h-3 mr-1" />
                          削除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>コレクションを削除しますか？</AlertDialogTitle>
                          <AlertDialogDescription>
                            この操作は取り消せません。本当に削除してもよろしいですか？<br />
                            コレクション名: {collection.title}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex justify-end gap-4">
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              try {
                                const response = await fetch(`${adminPath}/collections/${collection.id}`, {
                                  method: 'DELETE',
                                });

                                if (!response.ok) {
                                  throw new Error('コレクションの削除に失敗しました');
                                }

                                queryClient.invalidateQueries({ queryKey: ["collections"] });
                                toast({ title: "コレクションを削除しました" });
                              } catch (error) {
                                console.error('Collection deletion error:', error);
                                toast({ 
                                  variant: "destructive", 
                                  title: "エラー",
                                  description: error instanceof Error ? error.message : "予期せぬエラーが発生しました"
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
          </TabsContent>

          <TabsContent value="exhibitions">
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">展示会一覧</h2>
                <Dialog open={isEditExhibitionDialogOpen} onOpenChange={setIsEditExhibitionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      新規展示会
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
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
                ) : exhibitions?.map((exhibition: Exhibition) => (
                  <div
                    key={exhibition.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="aspect-video relative overflow-hidden">
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
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{exhibition.title}</h3>
                      <p className="text-gray-600 mb-4">{exhibition.description}</p>
                      <div className="space-y-2 text-sm text-gray-500">
                        <p>場所: {exhibition.location}</p>
                        <p>期間: {new Date(exhibition.startDate).toLocaleDateString()} - {new Date(exhibition.endDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
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
                            <Button variant="destructive" size="sm" className="flex-1">
                              <Trash2 className="w-4 h-4 mr-2" />
                              削除
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>展示会を削除しますか？</AlertDialogTitle>
                              <AlertDialogDescription>
                                この操作は取り消せません。本当に削除してもよろしいですか？
                                <br />
                                展示会名: {exhibition.title}
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
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;