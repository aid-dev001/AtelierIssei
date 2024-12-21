import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { PenLine, Trash2, Wand2, Loader2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Artwork, Exhibition } from "@db/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dropzone } from "@/components/ui/dropzone";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const adminPath = window.location.pathname.split('/dashboard')[0];

  const [activeTab, setActiveTab] = useState<'artworks' | 'collections' | 'exhibitions' | 'voices'>('artworks');
  const [selectedCollection, setSelectedCollection] = useState<{ id: number; title: string } | null>(null);
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null);
  const [isEditCollectionDialogOpen, setIsEditCollectionDialogOpen] = useState(false);
  const [isEditExhibitionDialogOpen, setIsEditExhibitionDialogOpen] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
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
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await fetch("/api/collections");
      if (!response.ok) throw new Error('Failed to fetch collections');
      return response.json();
    },
  });

  // Voices data
  const { data: voices } = useQuery({
    queryKey: ["voices"],
    queryFn: async () => {
      const response = await fetch("/api/voices");
      if (!response.ok) throw new Error('Failed to fetch voices');
      return response.json();
    },
  });

  // Create voice mutation
  const createVoiceMutation = useMutation({
    mutationFn: async (voiceData: FormData) => {
      const response = await fetch(`${adminPath}/voices`, {
        method: 'POST',
        body: voiceData,
      });
      if (!response.ok) throw new Error('Failed to create voice');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voices"] });
      toast({ title: "お客様の声を追加しました" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "お客様の声の追加に失敗しました" });
    },
  });

  // Delete voice mutation
  const deleteVoiceMutation = useMutation({
    mutationFn: async (voiceId: number) => {
      const response = await fetch(`${adminPath}/voices/${voiceId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete voice');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voices"] });
      toast({ title: "お客様の声を削除しました" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "お客様の声の削除に失敗しました" });
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

  // Artwork mutations...
  const createArtworkMutation = useMutation({
    mutationFn: async (artworkData: FormData) => {
      const response = await fetch(`${adminPath}/artworks`, {
        method: 'POST',
        body: artworkData,
      });
      if (!response.ok) throw new Error('Failed to create artwork');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${adminPath}/artworks`] });
      toast({ title: "作品を追加しました" });
      setIsEditDialogOpen(false);
      setSelectedArtwork(null);
    },
    onError: () => {
      toast({ variant: "destructive", title: "作品の追加に失敗しました" });
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

  // Form handlers...
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (selectedArtwork) {
      // Update existing artwork
      const updateData = {
        title: formData.get('title'),
        description: formData.get('description'),
        price: formData.get('price') ? parseFloat(formData.get('price') as string) : null,
        size: formData.get('size'),
        status: formData.get('status'),
        createdLocation: formData.get('createdLocation'),
        storedLocation: formData.get('storedLocation'),
        exhibitionLocation: formData.get('exhibitionLocation'),
        imageUrl: imageData.url || selectedArtwork.imageUrl,
        collectionId: formData.get('collectionId') ? parseInt(formData.get('collectionId') as string) : null,
      };

      await updateArtworkMutation.mutateAsync({
        id: selectedArtwork.id,
        data: updateData,
      });
    } else {
      // Create new artwork
      await createArtworkMutation.mutateAsync(formData);
    }
  };

  const handleVoiceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await createVoiceMutation.mutateAsync(formData);
      form.reset();
    } catch (error) {
      console.error('Error submitting voice:', error);
    }
  };

  return (
    <main className="container mx-auto py-8">
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList>
          <TabsTrigger value="artworks">作品管理</TabsTrigger>
          <TabsTrigger value="collections">コレクション管理</TabsTrigger>
          <TabsTrigger value="exhibitions">展示会管理</TabsTrigger>
          <TabsTrigger value="voices">お客様の声</TabsTrigger>
        </TabsList>

        <TabsContent value="artworks">
          <div className="space-y-4">
            <Button onClick={() => {
              setSelectedArtwork(null);
              setIsEditDialogOpen(true);
            }}>
              新規作品を追加
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artworks?.map((artwork) => (
                <div key={artwork.id} className="border p-4 rounded-lg">
                  <img src={artwork.imageUrl} alt={artwork.title} className="w-full h-48 object-cover rounded-lg" />
                  <h3 className="text-lg font-bold mt-2">{artwork.title}</h3>
                  <p className="text-sm text-gray-600">{artwork.description}</p>
                  <div className="mt-4 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
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
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4 mr-2" />
                          削除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>作品を削除しますか？</AlertDialogTitle>
                          <AlertDialogDescription>
                            この操作は取り消せません。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex justify-end space-x-2">
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

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedArtwork ? "作品を編集" : "新規作品を追加"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="image">作品画像</Label>
                  <Dropzone
                    existingImageUrl={selectedArtwork?.imageUrl}
                    onFileChange={async (file) => {
                      const formData = new FormData();
                      formData.append('image', file);
                      try {
                        const response = await fetch(`${adminPath}/upload`, {
                          method: 'POST',
                          body: formData,
                        });
                        if (!response.ok) throw new Error('Failed to upload image');
                        const data = await response.json();
                        setImageData(prev => ({ ...prev, url: data.imageUrl }));
                      } catch (error) {
                        console.error('Error uploading image:', error);
                        toast({
                          variant: "destructive",
                          title: "画像のアップロードに失敗しました"
                        });
                      }
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="title">タイトル</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={selectedArtwork?.title}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">説明</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={selectedArtwork?.description}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="price">価格</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    defaultValue={selectedArtwork?.price}
                  />
                </div>

                <div>
                  <Label htmlFor="size">サイズ</Label>
                  <Input
                    id="size"
                    name="size"
                    defaultValue={selectedArtwork?.size || ""}
                  />
                </div>

                <div>
                  <Label htmlFor="status">ステータス</Label>
                  <select
                    id="status"
                    name="status"
                    className="w-full border rounded-md p-2"
                    defaultValue={selectedArtwork?.status || "available"}
                  >
                    <option value="available">販売可能</option>
                    <option value="sold">売約済</option>
                    <option value="preparing">準備中</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="createdLocation">制作場所</Label>
                  <Input
                    id="createdLocation"
                    name="createdLocation"
                    defaultValue={selectedArtwork?.createdLocation || ""}
                  />
                </div>

                <div>
                  <Label htmlFor="storedLocation">保管場所</Label>
                  <Input
                    id="storedLocation"
                    name="storedLocation"
                    defaultValue={selectedArtwork?.storedLocation || ""}
                  />
                </div>

                <div>
                  <Label htmlFor="exhibitionLocation">展示場所</Label>
                  <Input
                    id="exhibitionLocation"
                    name="exhibitionLocation"
                    defaultValue={selectedArtwork?.exhibitionLocation || ""}
                  />
                </div>

                <div>
                  <Label htmlFor="collectionId">コレクション</Label>
                  <select
                    id="collectionId"
                    name="collectionId"
                    className="w-full border rounded-md p-2"
                    defaultValue={selectedArtwork?.collectionId || ""}
                  >
                    <option value="">コレクションなし</option>
                    {collections?.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.title}
                      </option>
                    ))}
                  </select>
                </div>

                <Button type="submit" className="w-full">
                  {selectedArtwork ? "更新" : "作成"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="voices">
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">お客様の声を追加</h2>
              <form onSubmit={handleVoiceSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="customerName">お客様名</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    required
                    placeholder="お客様のお名前"
                  />
                </div>

                <div>
                  <Label htmlFor="comment">コメント</Label>
                  <Textarea
                    id="comment"
                    name="comment"
                    required
                    placeholder="お客様からのコメント"
                  />
                </div>

                <div>
                  <Label htmlFor="voiceImage">画像</Label>
                  <Dropzone
                    onFileChange={async (file) => {
                      const formData = new FormData();
                      formData.append('image', file);
                      try {
                        const response = await fetch(`${adminPath}/upload`, {
                          method: 'POST',
                          body: formData,
                        });
                        if (!response.ok) throw new Error('Failed to upload image');
                        const data = await response.json();
                        const imageInput = document.getElementById('imageUrl') as HTMLInputElement;
                        if (imageInput) imageInput.value = data.imageUrl;
                      } catch (error) {
                        console.error('Error uploading image:', error);
                        toast({
                          variant: "destructive",
                          title: "画像のアップロードに失敗しました"
                        });
                      }
                    }}
                  />
                  <input type="hidden" id="imageUrl" name="imageUrl" />
                </div>

                <Button type="submit" className="w-full">
                  お客様の声を追加
                </Button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {voices?.map((voice) => (
                <div key={voice.id} className="border p-4 rounded-lg">
                  <img src={voice.imageUrl} alt={voice.customerName} className="w-full h-48 object-cover rounded-lg" />
                  <h3 className="text-lg font-bold mt-2">{voice.customerName}</h3>
                  <p className="text-sm text-gray-600">{voice.comment}</p>
                  <div className="mt-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4 mr-2" />
                          削除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>このお客様の声を削除しますか？</AlertDialogTitle>
                          <AlertDialogDescription>
                            この操作は取り消せません。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex justify-end space-x-2">
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteVoiceMutation.mutate(voice.id)}
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
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default AdminDashboard;