import { useState } from "react";
import { useLocation } from "wouter";
import { PenLine, Trash2, UploadCloud } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Artwork, Voice } from "@db/schema";

const AdminDashboard = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const adminPath = window.location.pathname.split('/dashboard')[0];
  const [activeTab, setActiveTab] = useState<'artworks' | 'collections' | 'exhibitions' | 'voices'>('artworks');
  
  // Voices関連の状態管理
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [isEditVoiceDialogOpen, setIsEditVoiceDialogOpen] = useState(false);

  // Voices データの取得
  const { data: voices } = useQuery<Voice[]>({
    queryKey: ["voices"],
    queryFn: () => fetch("/api/voices").then(res => res.json()),
  });

  // Artworks データの取得（Voice作成時に必要）
  const { data: artworks } = useQuery<Artwork[]>({
    queryKey: ["artworks"],
    queryFn: () => fetch("/api/artworks").then(res => res.json()),
  });

  // Voice mutations
  const createVoiceMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`${adminPath}/voices`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('ボイスの作成に失敗しました');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voices"] });
      toast({ title: "ボイスを作成しました" });
      setIsEditVoiceDialogOpen(false);
      setSelectedVoice(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "ボイスの作成に失敗しました",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    },
  });

  const updateVoiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await fetch(`${adminPath}/voices/${id}`, {
        method: 'PUT',
        body: data,
      });
      if (!response.ok) throw new Error('ボイスの更新に失敗しました');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voices"] });
      toast({ title: "ボイスを更新しました" });
      setIsEditVoiceDialogOpen(false);
    },
    onError: () => {
      toast({ variant: "destructive", title: "ボイスの更新に失敗しました" });
    },
  });

  const deleteVoiceMutation = useMutation({
    mutationFn: async (voiceId: number) => {
      const response = await fetch(`${adminPath}/voices/${voiceId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('ボイスの削除に失敗しました');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voices"] });
      toast({ title: "ボイスを削除しました" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "ボイスの削除に失敗しました" });
    },
  });

  // Voice関連のハンドラー
  const handleVoiceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      
      if (selectedVoice) {
        await updateVoiceMutation.mutateAsync({ 
          id: selectedVoice.id, 
          data: formData 
        });
      } else {
        await createVoiceMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('Error submitting voice:', error);
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    }
  };

  const handleVoiceImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${adminPath}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('画像のアップロードに失敗しました');
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "画像のアップロードに失敗しました",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
      return null;
    }
  };

  // Voicesタブのレンダリング
  const renderVoicesTab = () => {
    if (activeTab !== 'voices') return null;

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">お客様の声一覧</h2>
          <Button
            onClick={() => {
              setSelectedVoice(null);
              setIsEditVoiceDialogOpen(true);
            }}
          >
            新規ボイスを追加
          </Button>
        </div>

        {voices && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {voices.map((voice) => (
              <Card key={voice.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={voice.imageUrl}
                    alt={`Voice by ${voice.buyerName}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-4">
                  <h3 className="text-xl font-bold">{voice.buyerName}</h3>
                  <p className="text-gray-600">{voice.comment}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedVoice(voice);
                        setIsEditVoiceDialogOpen(true);
                      }}
                    >
                      <PenLine className="w-4 h-4 mr-2" />
                      編集
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => deleteVoiceMutation.mutate(voice.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      削除
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isEditVoiceDialogOpen} onOpenChange={setIsEditVoiceDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedVoice ? 'ボイスを編集' : '新規ボイスを追加'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleVoiceSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label>メイン画像</Label>
                <Dropzone
                  existingImageUrl={selectedVoice?.imageUrl}
                  onFileChange={handleVoiceImageUpload}
                  className="aspect-square w-full mx-auto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyerName">購入者名</Label>
                <Input
                  id="buyerName"
                  name="buyerName"
                  defaultValue={selectedVoice?.buyerName}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">コメント</Label>
                <Textarea
                  id="comment"
                  name="comment"
                  defaultValue={selectedVoice?.comment}
                  required
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="artworkId">購入した作品</Label>
                <select
                  id="artworkId"
                  name="artworkId"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  defaultValue={selectedVoice?.artworkId?.toString()}
                  required
                >
                  <option value="">作品を選択してください</option>
                  {artworks?.map((artwork) => (
                    <option key={artwork.id} value={artwork.id}>
                      {artwork.title}
                    </option>
                  ))}
                </select>
              </div>

              <DialogFooter>
                <Button type="submit">
                  {selectedVoice ? '更新' : '作成'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // メインのレンダリング
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="flex space-x-4 border-b">
          <Button
            variant={activeTab === 'artworks' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('artworks')}
          >
            作品管理
          </Button>
          <Button
            variant={activeTab === 'collections' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('collections')}
          >
            コレクション管理
          </Button>
          <Button
            variant={activeTab === 'exhibitions' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('exhibitions')}
          >
            展示会管理
          </Button>
          <Button
            variant={activeTab === 'voices' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('voices')}
          >
            お客様の声管理
          </Button>
        </div>

        {renderVoicesTab()}
        {/* 他のタブ（artworks, collections, exhibitions）のレンダリングはここに追加 */}
      </div>
    </div>
  );
};

export default AdminDashboard;
