import React, { useState, useEffect } from "react";
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
import { Collection, ExhibitionFormState } from "@/types/form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dropzone } from "@/components/ui/dropzone";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const AdminDashboard = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const adminPath = window.location.pathname.split('/dashboard')[0];
const createExhibitionMutation = useMutation({
  mutationFn: async (formData: FormData) => {
    const response = await fetch(`${adminPath}/exhibitions`, {
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
  onError: () => {
    toast({ variant: "destructive", title: "展示会の更新に失敗しました" });
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
  onError: () => {
    toast({ variant: "destructive", title: "展示会の削除に失敗しました" });
  },
});
  const [activeTab, setActiveTab] = useState<'artworks' | 'collections' | 'exhibitions'>('artworks');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null);
  const [isEditCollectionDialogOpen, setIsEditCollectionDialogOpen] = useState(false);
  const [isEditExhibitionDialogOpen, setIsEditExhibitionDialogOpen] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<(Artwork & { interiorImageDescriptions: string[] }) | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('available');
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
      const data = await response.json();
      console.log('Fetched collections:', data);
      return data;
    },
  });

  // Exhibitions data
  const { data: exhibitions } = useQuery({
    queryKey: ["exhibitions"],
    queryFn: async () => {
      const response = await fetch("/api/exhibitions");
      if (!response.ok) throw new Error('Failed to fetch exhibitions');
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
      toast({ title: "作品を追加しました（最新位置に作成）" });
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

  const createArtworkLastPositionMutation = useMutation({
    mutationFn: async (artworkData: FormData) => {
      artworkData.append('createPosition', 'last');
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
      toast({ title: "作品を追加しました（一番後ろの位置に作成）" });
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
        body: JSON.stringify({ ...data, updatePosition: true }),
      });
      if (!response.ok) throw new Error('Failed to update artwork');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${adminPath}/artworks`] });
      toast({ title: "作品を更新しました（最新位置に移動）" });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({ variant: "destructive", title: "作品の更新に失敗しました" });
    },
  });

  const updateArtworkSamePositionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`${adminPath}/artworks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, updatePosition: false }),
      });
      if (!response.ok) throw new Error('Failed to update artwork');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${adminPath}/artworks`] });
      toast({ title: "作品を更新しました（同じ位置を保持）" });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({ variant: "destructive", title: "作品の更新に失敗しました" });
    },
  });

  const updateArtworkLastPositionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`${adminPath}/artworks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, updatePosition: "last" }),
      });
      if (!response.ok) throw new Error('Failed to update artwork');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${adminPath}/artworks`] });
      toast({ title: "作品を更新しました（一番後ろの位置に移動）" });
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

  const handleUpdateClick = async (updatePosition: "same" | "latest" | "last") => {
    try {
      if (!selectedArtwork) return;

      const form = document.querySelector('#artwork-form') as HTMLFormElement;
      if (!form) return;

      const formData = new FormData(form);

      // 必須フィールドの検証
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      
      if (!title || !description) {
        toast({
          variant: "destructive",
          title: "必須項目を入力してください",
          description: "タイトルと説明は必須です",
        });
        return;
      }

      // インテリアイメージの説明文をフォームデータから取得
      const interiorDesc1 = formData.get('interior-desc-1') as string || '';
      const interiorDesc2 = formData.get('interior-desc-2') as string || '';
      const interiorDescriptions = [interiorDesc1, interiorDesc2];
      
      const updateData = {
        title,
        description,
        price: formData.get('price') ? parseFloat(formData.get('price') as string) : null,
        size: formData.get('size') as string,
        status: formData.get('status') as string,
        createdLocation: formData.get('createdLocation') as string,
        storedLocation: formData.get('storedLocation') as string,
        exhibitionLocation: formData.get('exhibitionLocation') as string,
        imageUrl: imageData.url || selectedArtwork.imageUrl,
        collectionId: formData.get('collectionId') ? parseInt(formData.get('collectionId') as string) : null,
        creationYear: formData.get('creationYear') ? parseInt(formData.get('creationYear') as string) : null,
        interiorImageDescriptions: interiorDescriptions,
        purchaser: formData.get('purchaser') as string || null,
      };
      
      if (updatePosition === "latest") {
        await updateArtworkMutation.mutateAsync({
          id: selectedArtwork.id,
          data: updateData,
        });
      } else if (updatePosition === "same") {
        await updateArtworkSamePositionMutation.mutateAsync({
          id: selectedArtwork.id,
          data: updateData,
        });
      } else if (updatePosition === "last") {
        await updateArtworkLastPositionMutation.mutateAsync({
          id: selectedArtwork.id,
          data: updateData,
        });
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    }
  };

  const handleCreateClick = async (createPosition: "latest" | "last") => {
    try {
      const form = document.querySelector('#artwork-form') as HTMLFormElement;
      if (!form) return;

      const formData = new FormData(form);

      // 必須フィールドの検証
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      
      if (!title || !description) {
        toast({
          variant: "destructive",
          title: "必須項目を入力してください",
          description: "タイトルと説明は必須です",
        });
        return;
      }

      if (!imageData.url) {
        toast({
          variant: "destructive",
          title: "画像をアップロードしてください",
        });
        return;
      }

      // 画像データを追加
      try {
        const imageResponse = await fetch(imageData.url);
        const imageBlob = await imageResponse.blob();
        formData.append('image', imageBlob);
        
        console.log('Submitting artwork with data:', {
          title,
          description,
          imageUrl: imageData.url,
          createPosition
        });

        if (createPosition === "latest") {
          await createArtworkMutation.mutateAsync(formData);
        } else {
          await createArtworkLastPositionMutation.mutateAsync(formData);
        }
        
        // 成功後にフォームをリセット
        setImageData({
          url: '',
          generatedTitle: '',
          generatedDescription: '',
        });
        setIsEditDialogOpen(false);
      } catch (imageError) {
        console.error('Error processing image:', imageError);
        toast({
          variant: "destructive",
          title: "画像の処理に失敗しました",
          description: imageError instanceof Error ? imageError.message : "予期せぬエラーが発生しました",
        });
      }
    } catch (error) {
      console.error('Create error:', error);
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (selectedArtwork) {
        // 更新の場合は新しいハンドラーを使用（デフォルトで最新位置に移動）
        await handleUpdateClick("latest");
      } else {
        // 新規作成の場合はhandleCreateClickを使用（デフォルトで最新位置に作成）
        await handleCreateClick("latest");
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

  const handleInteriorDescriptionChange = async (index: number, description: string) => {
    try {
      if (!selectedArtwork) return;

      // 新しい説明文の配列を作成
      const newDescriptions: string[] = Array.isArray(selectedArtwork.interiorImageDescriptions) 
        ? [...selectedArtwork.interiorImageDescriptions]
        : ['', ''];

      // インデックスの説明文を更新
      newDescriptions[index] = description;

      // データベースの更新
      await updateArtworkMutation.mutateAsync({
        id: selectedArtwork.id,
        data: {
          interiorImageDescriptions: newDescriptions
        }
      });

      // ローカルステートを更新
      setSelectedArtwork({
        ...selectedArtwork,
        interiorImageDescriptions: newDescriptions
      } as Artwork);

      toast({
        title: "説明文を更新しました",
      });

    } catch (error) {
      console.error('Error updating description:', error);
      toast({
        variant: "destructive",
        title: "説明文の更新に失敗しました",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました"
      });
    }
  };

  const handleInteriorImageUpload = async (file: File, index: number) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      toast({
        title: "インテリアイメージをアップロード中...",
      });

      const response = await fetch(`${adminPath}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || '画像のアップロードに失敗しました');
      }

      const data = await response.json();
      console.log('Upload response:', data);

      if (!data.imageUrl) {
        throw new Error('画像URLの取得に失敗しました');
      }

      // Create a new array with the correct length (2 for now)
      const currentUrls = selectedArtwork?.interiorImageUrls || [];
      let newImageUrls = Array(2).fill(null);
      
      // Copy existing URLs
      if (Array.isArray(currentUrls)) {
        currentUrls.forEach((url: string, i: number) => {
          if (i < 2) newImageUrls[i] = url;
        });
      }
      
      // Update the specific index
      newImageUrls[index] = data.imageUrl;
      
      // Filter out any null values at the end
      newImageUrls = newImageUrls.filter(url => url !== null);

      // アップロードのみ行い、自動保存はしない
      if (selectedArtwork) {
        // 選択された作品の状態を更新（UIに反映）
        setSelectedArtwork(prev => prev ? {
          ...prev,
          interiorImageUrls: newImageUrls
        } : null);
      } else {
        // 新規作成の場合はローカル状態を更新
        setImageData(prev => ({
          ...prev,
          interiorImageUrls: newImageUrls,
        }));
      }
      
      toast({
        title: "インテリアイメージをアップロードしました",
        description: "保存するには「更新」ボタンを押してください",
      });
    } catch (error) {
      console.error('Error handling interior image upload:', error);
      toast({
        variant: "destructive",
        title: "インテリアイメージのアップロードに失敗しました",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    }
  };

  const handleFileChange = async (file: File) => {
    try {
      if (!file) {
        throw new Error('ファイルが選択されていません');
      }

      if (file.size > 30 * 1024 * 1024) {
        throw new Error('ファイルサイズは30MB以下にしてください');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('画像ファイルを選択してください');
      }

      // 現在のフォーム入力値を保持
      const titleInput = document.getElementById('title') as HTMLInputElement;
      const descriptionInput = document.getElementById('description') as HTMLTextAreaElement;
      const currentTitle = titleInput?.value || '';
      const currentDescription = descriptionInput?.value || '';

      toast({
        title: "画像をアップロード中...",
        description: "画像をサーバーにアップロードしています",
      });

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${adminPath}/generate-description`, {
        method: 'POST',
        body: formData,
      });

      let data;
      try {
        const responseText = await response.text();
        data = JSON.parse(responseText);
      } catch (error) {
        console.error('Error parsing response:', error);
        throw new Error('サーバーからの応答を解析できませんでした');
      }

      if (!response.ok) {
        throw new Error(data.error || '画像のアップロードに失敗しました');
      }

      if (!data.imageUrl) {
        throw new Error('画像のアップロードに失敗しました');
      }

      // 状態を更新（既存の入力値を保持）
      setImageData({
        url: data.imageUrl,
        generatedTitle: currentTitle || data.title || "",
        generatedDescription: currentDescription || data.description || "",
      });

      // 編集モードの場合は選択された作品の情報も更新（既存の入力値を保持）
      if (selectedArtwork) {
        setSelectedArtwork(prev => {
          if (!prev) return null;
          return {
            ...prev,
            imageUrl: data.imageUrl,
            title: currentTitle || prev.title,
            description: currentDescription || prev.description,
          };
        });
      }

      toast({
        title: "画像のアップロードが完了しました",
        description: "タイトルと説明文を手動で入力してください",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      });
    }
  };


  // 型定義
interface Exhibition {
  id: number;
  title: string;
  subtitle: string | null;
  description: string;
  details: string | null;
  location: string;
  address: string | null;
  imageUrl: string;
  subImageUrls: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Artwork {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  price: string;
  size: string | null;
  status: string;
  createdLocation: string;
  storedLocation: string;
  exhibitionLocation: string | null;
  collectionId: number | null;
  interiorImageUrls?: string[];
  interiorImageDescriptions: string[];
}

interface ExhibitionFormProps {
  selectedExhibition: Exhibition | null;
  onSubmit: (formData: FormData) => Promise<void>;
}

const ExhibitionForm = ({ selectedExhibition, onSubmit }: ExhibitionFormProps) => {
    const [subImageFiles, setSubImageFiles] = React.useState<File[]>([]);
const [subImageUrls, setSubImageUrls] = React.useState<string[]>([]);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [mainImageUrl, setMainImageUrl] = React.useState<string | null>(selectedExhibition?.imageUrl || null);
    const [formData, setFormData] = React.useState({
      title: selectedExhibition?.title || '',
      location: selectedExhibition?.location || '',
      subtitle: selectedExhibition?.subtitle || '',
      description: selectedExhibition?.description || '',
      startDate: selectedExhibition?.startDate || '',
      endDate: selectedExhibition?.endDate || '',
      imageUrl: selectedExhibition?.imageUrl || '',
      subImageUrls: selectedExhibition?.subImageUrls || [],
      address: selectedExhibition?.address || '',
    });

    const handleInputChange = (key: string, value: string) => {
      setFormData(prev => ({
        ...prev,
        [key]: value
      }));
    };

    useEffect(() => {
      if (selectedExhibition) {
        setFormData({
          title: selectedExhibition.title,
          location: selectedExhibition.location,
          subtitle: selectedExhibition.subtitle || '',
          description: selectedExhibition.description,
          startDate: new Date(selectedExhibition.startDate).toISOString().slice(0, 16),
          endDate: new Date(selectedExhibition.endDate).toISOString().slice(0, 16),
          imageUrl: selectedExhibition.imageUrl,
          subImageUrls: selectedExhibition.subImageUrls || [],
          address: selectedExhibition.address || '',
        });
      }
    }, [selectedExhibition]);

    // フォームデータの更新を処理する関数
    const updateFormData = (field: string, value: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleMainImageUpload = async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch(`${adminPath}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('画像のアップロードに失敗しました');
        }

        const data = await response.json();
        setMainImageUrl(data.imageUrl);
        return data.imageUrl;
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          variant: "destructive",
          title: "画像のアップロードに失敗しました",
        });
        return null;
      }
    };

    const handleGenerateAIContent = async () => {
      if (!formData.title || !formData.location) {
        toast({
          variant: "destructive",
          title: "タイトルと場所を入力してください",
        });
        return;
      }

      setIsGenerating(true);
      try {
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
          throw new Error('AI生成に失敗しました');
        }

        const data = await response.json();
        if (!data.subtitle || !data.description) {
          throw new Error('生成されたデータが不正です');
        }

        // フォームデータを更新
        setFormData(prev => ({
          ...prev,
          subtitle: data.subtitle,
          description: data.description,
        }));

        console.log('AI生成結果を反映:', {
          subtitle: data.subtitle,
          description: data.description
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

    const handleSubImagesUpload = async (files: FileList) => {
      setSubImageFiles(Array.from(files));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsGenerating(true);

      try {
        if (!mainImageUrl) {
          throw new Error('メイン画像を設定してください');
        }

        // フォームデータの準備
        const submitData: ExhibitionFormState = {
          ...formData,
          imageUrl: mainImageUrl || '',
          startDate: typeof formData.startDate === 'string' ? formData.startDate : formData.startDate.toISOString(),
          endDate: typeof formData.endDate === 'string' ? formData.endDate : formData.endDate.toISOString(),
          subImageUrls: [],
        };

        // サブ画像のアップロード
        if (subImageFiles.length > 0) {
          const uploadedUrls = [];
          for (const file of subImageFiles) {
            const imageUrl = await handleMainImageUpload(file);
            if (imageUrl) uploadedUrls.push(imageUrl);
          }
          submitData.subImageUrls = uploadedUrls as string[];
        }

        console.log('送信データ:', submitData);

        if (selectedExhibition) {
          // 既存の展示会の更新
          await updateExhibitionMutation.mutateAsync({
            id: selectedExhibition.id,
            data: submitData,
          });
        } else {
          // 新規作成
          const formDataToSubmit = new FormData();
          Object.entries(submitData).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              formDataToSubmit.append(key, JSON.stringify(value));
            } else if (value !== null && value !== undefined) {
              formDataToSubmit.append(key, value.toString());
            }
          });
          await createExhibitionMutation.mutateAsync(formDataToSubmit);
        }

        toast({
          title: selectedExhibition ? "展示会を更新しました" : "展示会を作成しました",
        });

        // フォームをリセット
        if (!selectedExhibition) {
          setFormData({
            title: '',
            location: '',
            subtitle: '',
            description: '',
            startDate: '',
            endDate: '',
            imageUrl: '',
            subImageUrls: [],
            address: '',
          });
          setMainImageUrl(null);
          setSubImageFiles([]);
        }
      } catch (error) {
        console.error('Error submitting exhibition:', error);
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
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
            existingImageUrl={mainImageUrl || undefined}
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
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">場所</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              required
            />
          </div>

          <Button
            type="button"
            onClick={handleGenerateAIContent}
            disabled={isGenerating || !formData.title || !formData.location}
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
            onChange={(e) => handleInputChange('subtitle', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">概要</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">住所詳細</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtitle">サブタイトル</Label>
          <Input
            id="subtitle"
            name="subtitle"
            value={formData.subtitle}
            onChange={(e) => handleInputChange('subtitle', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">概要</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">住所詳細</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">開始日時</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={selectedExhibition?.startDate ? new Date(selectedExhibition.startDate).toISOString().split('T')[0] : undefined}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">終了日時</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={selectedExhibition?.endDate ? new Date(selectedExhibition.endDate).toISOString().split('T')[0] : undefined}
              required
            />
          </div>
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
          {selectedExhibition?.subImageUrls && Array.isArray(selectedExhibition.subImageUrls) && (
            <div className="grid grid-cols-3 gap-4">
              {selectedExhibition.subImageUrls.map((url: string, index: number) => (
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
          {isGenerating ? "生成中..." : (selectedExhibition ? '更新' : '作成')}
        </Button>
      </form>
    );
  };

  const ArtworkForm = () => (
    <form 
      id="artwork-form"
      key={selectedArtwork ? `edit-${selectedArtwork.id}` : 'new-artwork'}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }} 
      className="space-y-8"
    >
      <div className="space-y-4">
        <Label htmlFor="image">作品画像</Label>
        <Dropzone
          existingImageUrl={imageData.url || selectedArtwork?.imageUrl}
          onFileChange={handleFileChange}
          className="w-full mx-auto h-56"
          maxHeightClass="max-h-[80%]"
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
        <Label htmlFor="creationYear">制作年</Label>
        <Input
          id="creationYear"
          name="creationYear"
          type="number"
          min="1900"
          max="2100"
          defaultValue={(selectedArtwork as any)?.creationYear?.toString() || ''}
          placeholder="例: 2024"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">ステータス</Label>
        <select
          id="status"
          name="status"
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          defaultValue={selectedArtwork?.status || 'available'}
          onChange={(e) => setCurrentStatus(e.target.value)}
          required
        >
          <option value="available">販売中</option>
          <option value="reserved">予約済</option>
          <option value="sold">売約済</option>
          <option value="preparation">準備中</option>
        </select>
      </div>
      {(selectedArtwork ? 
        (selectedArtwork?.status === 'reserved' || selectedArtwork?.status === 'sold') :
        (currentStatus === 'reserved' || currentStatus === 'sold')
      ) && (
        <div className="space-y-2">
          <Label htmlFor="purchaser">購入者</Label>
          <Input
            id="purchaser"
            name="purchaser"
            defaultValue={(selectedArtwork as any)?.purchaser || ''}
            placeholder="購入者名を入力してください"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="createdLocation">制作場所</Label>
        <Input
          id="createdLocation"
          name="createdLocation"
          defaultValue={selectedArtwork?.createdLocation || ''}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="storedLocation">保管場所</Label>
        <Input
          id="storedLocation"
          name="storedLocation"
          defaultValue={selectedArtwork?.storedLocation || ''}
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
          <div className="space-y-2">
            <Dropzone
              existingImageUrl={selectedArtwork?.interiorImageUrls?.[0]}
              onFileChange={(file) => handleInteriorImageUpload(file, 0)}
              className="w-full h-48"
            />
            <div className="space-y-2">
              <Label htmlFor="interior-desc-1">1枚目の説明文</Label>
              <Textarea
                id="interior-desc-1"
                name="interior-desc-1"
                placeholder="1枚目の説明文を入力してください"
                defaultValue={Array.isArray(selectedArtwork?.interiorImageDescriptions) 
                  ? selectedArtwork.interiorImageDescriptions[0] || '' 
                  : ''}
                className="resize-none"
                rows={4}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Dropzone
              existingImageUrl={selectedArtwork?.interiorImageUrls?.[1]}
              onFileChange={(file) => handleInteriorImageUpload(file, 1)}
              className="w-full h-48"
            />
            <div className="space-y-2">
              <Label htmlFor="interior-desc-2">2枚目の説明文</Label>
              <Textarea
                id="interior-desc-2"
                name="interior-desc-2"
                placeholder="2枚目の説明文を入力してください"
                defaultValue={Array.isArray(selectedArtwork?.interiorImageDescriptions) 
                  ? selectedArtwork.interiorImageDescriptions[1] || '' 
                  : ''}
                className="resize-none"
                rows={4}
              />
            </div>
          </div>
        </div>
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
          {Array.isArray(collections) && collections.map((collection: any) => (
            <option key={collection.id} value={collection.id}>
              {collection.title}
            </option>
          ))}
        </select>
      </div>
      {selectedArtwork ? (
        <div className="flex gap-2">
          <Button 
            type="button" 
            onClick={() => handleUpdateClick("latest")} 
            className="flex-1 bg-white text-black border hover:bg-gray-50"
          >
            最新の位置で更新
          </Button>
          <Button 
            type="button" 
            onClick={() => handleUpdateClick("same")} 
            className="flex-1 bg-gray-400 text-white hover:bg-gray-500"
          >
            同じ位置で更新
          </Button>
          <Button 
            type="button" 
            onClick={() => handleUpdateClick("last")} 
            className="flex-1"
            variant="secondary"
          >
            一番後ろの位置で更新
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button 
            type="button" 
            onClick={() => handleCreateClick("latest")} 
            className="flex-1"
          >
            最新の位置に作成
          </Button>
          <Button 
            type="button" 
            onClick={() => handleCreateClick("last")} 
            className="flex-1"
            variant="secondary"
          >
            一番後ろの位置で作成
          </Button>
        </div>
      )}
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
            <button
              className={`px-4 py-2 font-medium transition-all relative ${
                activeTab === 'collections'
                  ? 'text-black font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('collections')}
            >
              コレクション管理
              {activeTab === 'collections' && (
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
                    setCurrentStatus(artwork.status);
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
                        setCurrentStatus(artwork.status);
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
        ) : activeTab === 'exhibitions' ? (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">展示会一覧</h2>
              <Dialog>
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
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedExhibition ? '展示会を編集' : '新規展示会を追加'}
                    </DialogTitle>
                  </DialogHeader>
                  <ExhibitionForm
                    selectedExhibition={selectedExhibition}
                    onSubmit={async (formData) => {
                      try {
                        if (selectedExhibition) {
                          await updateExhibitionMutation.mutateAsync({
                            id: selectedExhibition.id,
                            data: Object.fromEntries(formData),
                          });
                        } else {
                          await createExhibitionMutation.mutateAsync(formData);
                        }
                        setIsEditExhibitionDialogOpen(false);
                      } catch (error) {
                        console.error('Error submitting exhibition:', error);
                        toast({
                          variant: "destructive",
                          title: "エラーが発生しました",
                          description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
                        });
                      }
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(exhibitions) && exhibitions.map((exhibition) => (
                <div
                  key={exhibition.id}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-video relative">
                    <img
                      src={exhibition.imageUrl}
                      alt={exhibition.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-medium">{exhibition.title}</h3>
                    {exhibition.subtitle && (
                      <p className="text-sm text-gray-600">{exhibition.subtitle}</p>
                    )}
                    <p className="text-sm">{exhibition.location}</p>
                    <div className="text-sm text-gray-600">
                      {new Date(exhibition.startDate).toLocaleDateString()} - {new Date(exhibition.endDate).toLocaleDateString()}
                    </div>
                    <div className="pt-4 flex gap-2">
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
          </>
        ) : activeTab === 'collections' ? (
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

              <Dialog open={isEditCollectionDialogOpen} onOpenChange={setIsEditCollectionDialogOpen}>
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

                    if (!selectedCollection) {
                      toast({
                        variant: "destructive",
                        title: "エラー",
                        description: "コレクションが選択されていません"
                      });
                      return;
                    }

                    try {
                      const response = await fetch(`${adminPath}/collections/${selectedCollection.id}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          title: title.trim(),
                          description: description.trim(),
                        }),
                      });

                      if (!response.ok) {
                        throw new Error('コレクションの更新に失敗しました');
                      }

                      queryClient.invalidateQueries({ queryKey: ["collections"] });
                      toast({ title: "コレクションを更新しました" });
                      setIsEditCollectionDialogOpen(false);
                      setSelectedCollection(null);
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
                      <Label htmlFor="edit-title">タイトル</Label>
                      <Input 
                        id="edit-title" 
                        name="title" 
                        defaultValue={selectedCollection?.title}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-description">説明文</Label>
                      <Textarea
                        id="edit-description"
                        name="description"
                        defaultValue={selectedCollection?.description}
                        className="min-h-[100px]"
                      />
                    </div>
                    <Button type="submit">更新</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.isArray(collections) && collections.map((collection: any) => (
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
          </>
        ) : null}
      </main>
    </div>
  );
};

export default AdminDashboard;