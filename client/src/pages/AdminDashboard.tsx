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
import { Artwork, Exhibition, Collection } from "@db/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dropzone } from "@/components/ui/dropzone";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Types
interface Voice {
  id: number;
  imageUrl: string;
  buyerName: string;
  comment: string;
  artworkId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Atelier {
  id: number;
  location: string;
  startYear: number;
  endYear: number;
  description: string;
  imageUrl: string;
  subImageUrls: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminDashboard = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const adminPath = window.location.pathname.split('/dashboard')[0];

  // State
  const [activeTab, setActiveTab] = useState<'artworks' | 'collections' | 'exhibitions' | 'voices' | 'ateliers'>('artworks');
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [selectedAtelier, setSelectedAtelier] = useState<Atelier | null>(null);
  const [isEditVoiceDialogOpen, setIsEditVoiceDialogOpen] = useState(false);
  const [isEditAtelierDialogOpen, setIsEditAtelierDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null);
  const [isEditCollectionDialogOpen, setIsEditCollectionDialogOpen] = useState(false);
  const [isEditExhibitionDialogOpen, setIsEditExhibitionDialogOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  // Fetch data
  const { data: artworks } = useQuery<Artwork[]>({
    queryKey: [`${adminPath}/artworks`],
    queryFn: async () => {
      const response = await fetch(`${adminPath}/artworks`);
      if (!response.ok) throw new Error('作品の取得に失敗しました');
      return response.json();
    },
  });

  const { data: exhibitions } = useQuery({
    queryKey: ["exhibitions"],
    queryFn: async () => {
      const response = await fetch("/api/exhibitions");
      if (!response.ok) throw new Error('展示会の取得に失敗しました');
      return response.json();
    },
  });

  const { data: collections } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await fetch("/api/collections");
      if (!response.ok) throw new Error('コレクションの取得に失敗しました');
      return response.json();
    },
  });

  // Mutations
  const createExhibitionMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`${adminPath}/exhibitions`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '展示会の作成に失敗しました');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibitions"] });
      toast({ title: "展示会を作成しました" });
      setIsEditExhibitionDialogOpen(false);
    },
    onError: (error) => {
      console.error('Exhibition creation error:', error);
      toast({
        variant: "destructive",
        title: "展示会の作成に失敗しました",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    },
  });

  const createVoiceMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`${adminPath}/voices`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('お客様の声の登録に失敗しました');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voices"] });
      toast({ title: "お客様の声を登録しました" });
      setIsEditVoiceDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "お客様の声の登録に失敗しました",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    },
  });

  const createAtelierMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`${adminPath}/ateliers`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('アトリエの登録に失敗しました');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ateliers"] });
      toast({ title: "アトリエを登録しました" });
      setIsEditAtelierDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "アトリエの登録に失敗しました",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    },
  });

  // Forms
  const ExhibitionForm = () => {
    const [formData, setFormData] = useState({
      title: selectedExhibition?.title || '',
      location: selectedExhibition?.location || '',
      subtitle: selectedExhibition?.subtitle || '',
      description: selectedExhibition?.description || '',
      startDate: selectedExhibition?.startDate ? new Date(selectedExhibition.startDate).toISOString().split('T')[0] : '',
      endDate: selectedExhibition?.endDate ? new Date(selectedExhibition.endDate).toISOString().split('T')[0] : '',
      imageUrl: selectedExhibition?.imageUrl || '',
      subImageUrls: selectedExhibition?.subImageUrls || [],
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [mainImageUrl, setMainImageUrl] = useState<string | undefined>(selectedExhibition?.imageUrl);

    useEffect(() => {
      if (selectedExhibition) {
        setFormData({
          title: selectedExhibition.title,
          location: selectedExhibition.location,
          subtitle: selectedExhibition.subtitle || '',
          description: selectedExhibition.description,
          startDate: new Date(selectedExhibition.startDate).toISOString().split('T')[0],
          endDate: new Date(selectedExhibition.endDate).toISOString().split('T')[0],
          imageUrl: selectedExhibition.imageUrl,
          subImageUrls: selectedExhibition.subImageUrls || [],
        });
        setMainImageUrl(selectedExhibition.imageUrl);
      }
    }, [selectedExhibition]);

    const handleMainImageUpload = async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch(`${adminPath}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('画像のアップロードに失敗しました');
        const data = await response.json();
        setMainImageUrl(data.imageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          variant: "destructive",
          title: "画像のアップロードに失敗しました",
        });
      }
    };

    const handleGenerateAIContent = async () => {
      if (!formData.title || !formData.location) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "タイトルと開催場所を入力してください",
        });
        return;
      }

      setIsGenerating(true);
      try {
        console.log('Generating AI content for:', { title: formData.title, location: formData.location });
        const response = await fetch(`${adminPath}/generate-exhibition-description`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title,
            location: formData.location,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'AI生成に失敗しました');
        }

        const data = await response.json();
        console.log('Received AI generated content:', data);

        if (!data.subtitle || !data.description) {
          throw new Error('生成されたデータが不正です');
        }

        // 直接stateを更新
        setFormData(currentFormData => {
          const updatedFormData = {
            ...currentFormData,
            subtitle: data.subtitle,
            description: data.description,
          };
          console.log('Updated form data:', updatedFormData);
          return updatedFormData;
        });

        toast({
          title: "AI生成が完了しました",
          description: "サブタイトルと概要が更新されました",
        });
      } catch (error) {
        console.error('AI generation error:', error);
        toast({
          variant: "destructive",
          title: "AI生成に失敗しました",
          description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
        });
      } finally {
        setIsGenerating(false);
      }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      console.log('Submitting form with data:', formData);

      // バリデーション
      if (!formData.title || !formData.description || !formData.location || !formData.startDate || !formData.endDate) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "必須項目を入力してください",
        });
        return;
      }

      if (!mainImageUrl) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "メイン画像をアップロードしてください",
        });
        return;
      }

      const formDataToSubmit = new FormData();

      try {
        // 日付のフォーマット（時間を除外）
        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);

        // 日付のバリデーション
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error('無効な日付形式です');
        }

        if (endDate < startDate) {
          throw new Error('終了日は開始日より後の日付を選択してください');
        }

        const submitData = {
          ...formData,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          imageUrl: mainImageUrl,
        };

        console.log('Prepared submit data:', submitData);

        // FormDataの構築
        Object.entries(submitData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            formDataToSubmit.append(key, JSON.stringify(value));
          } else if (value !== null && value !== undefined) {
            formDataToSubmit.append(key, value.toString());
          }
        });

        setIsGenerating(true);
        console.log('Sending request to create exhibition');
        const result = await createExhibitionMutation.mutateAsync(formDataToSubmit);
        console.log('Exhibition created successfully:', result);

        toast({
          title: "展示会を登録しました",
        });

        // フォームをリセット
        setFormData({
          title: '',
          subtitle: '',
          description: '',
          location: '',
          startDate: '',
          endDate: '',
          imageUrl: '',
          subImageUrls: [],
        });
        setMainImageUrl(undefined);

      } catch (error) {
        console.error('Error submitting exhibition:', error);
        toast({
          variant: "destructive",
          title: "エラー",
          description: error instanceof Error ? error.message : "展示会の登録に失敗しました",
        });
      } finally {
        setIsGenerating(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <Label htmlFor="mainImage">メイン画像</Label>
          <Dropzone
            existingImageUrl={mainImageUrl}
            onFileChange={handleMainImageUpload}
            className="aspect-video w-full mx-auto"
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">場所</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              required
            />
          </div>

          <Button
            type="button"
            onClick={handleGenerateAIContent}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI生成中...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                AIでサブタイトルと概要を生成
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtitle">サブタイトル</Label>
          <Input
            id="subtitle"
            name="subtitle"
            value={formData.subtitle}
            onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">概要</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">開始日</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">終了日</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isGenerating}>
          {isGenerating ? "生成中..." : (selectedExhibition ? '更新' : '作成')}
        </Button>
      </form>
    );
  };

  const VoiceForm = () => {
    const [selectedArtworkId, setSelectedArtworkId] = useState<string>('');
    const [imageUrl, setImageUrl] = useState<string>('');
    const [buyerName, setBuyerName] = useState<string>('');
    const [comment, setComment] = useState<string>('');

    const handleImageUpload = async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const response = await fetch(`${adminPath}/upload`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('画像のアップロードに失敗しました');
        const data = await response.json();
        setImageUrl(data.imageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          variant: "destructive",
          title: "画像のアップロードに失敗しました",
        });
      }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!imageUrl || !buyerName || !comment || !selectedArtworkId) {
        toast({
          variant: "destructive",
          title: "すべての項目を入力してください",
        });
        return;
      }

      const formData = new FormData();
      formData.append('imageUrl', imageUrl);
      formData.append('buyerName', buyerName);
      formData.append('comment', comment);
      formData.append('artworkId', selectedArtworkId);

      try {
        await createVoiceMutation.mutateAsync(formData);
      } catch (error) {
        console.error('Error creating voice:', error);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <Label htmlFor="image">メイン画像</Label>
          <Dropzone
            existingImageUrl={imageUrl}
            onFileChange={handleImageUpload}
            className="aspect-square w-full h-[200px] mx-auto"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="buyerName">購入者名</Label>
          <Input
            id="buyerName"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment">コメント</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="artworkId">購入した作品</Label>
          <Select
            value={selectedArtworkId}
            onValueChange={setSelectedArtworkId}
          >
            <SelectTrigger>
              <SelectValue placeholder="作品を選択" />
            </SelectTrigger>
            <SelectContent>
              {artworks?.map((artwork) => (
                <SelectItem key={artwork.id} value={artwork.id.toString()}>
                  {artwork.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full">
          登録
        </Button>
      </form>
    );
  };

  const AtelierForm = () => {
    const [formData, setFormData] = useState({
      location: '',
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear(),
      description: '',
      imageUrl: '',
      subImageUrls: [] as string[],
    });
    const [isGenerating, setIsGenerating] = useState(false);

    const handleMainImageUpload = async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const response = await fetch(`${adminPath}/upload`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('画像のアップロードに失敗しました');
        const data = await response.json();
        setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          variant: "destructive",
          title: "画像のアップロードに失敗しました",
        });
      }
    };

    const handleSubImagesUpload = async (files: FileList) => {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('image', file);
        try {
          const response = await fetch(`${adminPath}/upload`, {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) throw new Error('画像のアップロードに失敗しました');
          const data = await response.json();
          uploadedUrls.push(data.imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
          toast({
            variant: "destructive",
            title: "画像のアップロードに失敗しました",
          });
        }
      }
      setFormData(prev => ({
        ...prev,
        subImageUrls: [...prev.subImageUrls, ...uploadedUrls],
      }));
    };

    const handleGenerateDescription = async () => {
      if (!formData.location) {
        toast({
          variant: "destructive",
          title: "場所を入力してください",
        });
        return;
      }

      setIsGenerating(true);
      try {
        const response = await fetch(`${adminPath}/generate-atelier-description`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            location: formData.location,
          }),
        });

        if (!response.ok) throw new Error('説明文の生成に失敗しました');

        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          description: data.description || '',
        }));

        toast({
          title: "説明文を生成しました",
        });
      } catch (error) {
        console.error('Error generating description:', error);
        toast({
          variant: "destructive",
          title: "説明文の生成に失敗しました",
        });
      } finally {
        setIsGenerating(false);
      }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!formData.location || !formData.description || !formData.imageUrl) {
        toast({
          variant: "destructive",
          title: "必須項目を入力してください",
        });
        return;
      }

      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, value.toString());
        }
      });

      try {
        await createAtelierMutation.mutateAsync(submitData);
      } catch (error) {
        console.error('Error creating atelier:', error);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <Label htmlFor="mainImage">メイン画像</Label>
          <Dropzone
            existingImageUrl={formData.imageUrl}
            onFileChange={handleMainImageUpload}
            className="aspect-video w-full mx-auto"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">場所</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startYear">開始年</Label>
            <Input
              id="startYear"
              type="number"
              value={formData.startYear}
              onChange={(e) => setFormData(prev => ({ ...prev, startYear: parseInt(e.target.value) }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endYear">終了年</Label>
            <Input
              id="endYear"
              type="number"
              value={formData.endYear}
              onChange={(e) => setFormData(prev => ({ ...prev, endYear: parseInt(e.target.value) }))}
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <Button
            type="button"
            onClick={handleGenerateDescription}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                説明文を生成中...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                AIで説明文を生成
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">説明</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-4">
          <Label>サブ画像（複数選択可）</Label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleSubImagesUpload(e.target.files)}
            className="w-full"
          />
          {formData.subImageUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {formData.subImageUrls.map((url, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={url}
                    alt={`サブ画像 ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isGenerating}>
          登録
        </Button>
      </form>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">管理ダッシュボード</h1>

      <div className="space-y-8">
        <div className="flex space-x-4">
          <Button
            variant={activeTab === 'artworks' ? 'default' : 'outline'}
            onClick={() => setActiveTab('artworks')}
          >
            作品管理
          </Button>
          <Button
            variant={activeTab === 'collections' ? 'default' : 'outline'}
            onClick={() => setActiveTab('collections')}
          >
            コレクション管理
          </Button>
          <Button
            variant={activeTab === 'exhibitions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('exhibitions')}
          >
            展示会管理
          </Button>
          <Button
            variant={activeTab === 'voices' ? 'default' : 'outline'}
            onClick={() => setActiveTab('voices')}
          >
            お客様の声管理
          </Button>
          <Button
            variant={activeTab === 'ateliers' ? 'default' : 'outline'}
            onClick={() => setActiveTab('ateliers')}
          >
            アトリエ管理
          </Button>
        </div>

        {activeTab === 'exhibitions' && (
          <div>
            <Dialog open={isEditExhibitionDialogOpen} onOpenChange={setIsEditExhibitionDialogOpen}>
              <DialogTrigger asChild>
                <Button>新規展示会を追加</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>展示会を追加</DialogTitle>
                </DialogHeader>
                <ExhibitionForm />
              </DialogContent>
            </Dialog>
          </div>
        )}

        {activeTab === 'voices' && (
          <div>
            <Dialog open={isEditVoiceDialogOpen} onOpenChange={setIsEditVoiceDialogOpen}>
              <DialogTrigger asChild>
                <Button>新規お客様の声を追加</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>お客様の声を追加</DialogTitle>
                </DialogHeader>
                <VoiceForm />
              </DialogContent>
            </Dialog>
          </div>
        )}

        {activeTab === 'ateliers' && (
          <div>
            <Dialog open={isEditAtelierDialogOpen} onOpenChange={setIsEditAtelierDialogOpen}>
              <DialogTrigger asChild>
                <Button>新規アトリエを追加</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>アトリエを追加</DialogTitle>
                </DialogHeader>
                <AtelierForm />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;