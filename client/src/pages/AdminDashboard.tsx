import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Dropzone } from "@/components/Dropzone";
import type { Exhibition } from "@db/schema";

const adminPath = "/api/admin";

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("exhibitions");

  const { data: exhibitions } = useQuery<Exhibition[]>({
    queryKey: ["exhibitions"],
    queryFn: () => fetch(`${adminPath}/exhibitions`).then(res => res.json()),
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">管理画面</h1>
        <Button variant="outline" onClick={handleLogout}>
          ログアウト
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="exhibitions">展示会管理</TabsTrigger>
          <TabsTrigger value="artworks">作品管理</TabsTrigger>
          <TabsTrigger value="collections">コレクション管理</TabsTrigger>
        </TabsList>

        <TabsContent value="exhibitions">
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">展示会一覧</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>新規展示会を追加</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto z-50 relative">
                  <DialogHeader>
                    <DialogTitle>新規展示会を追加</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);

                    try {
                      const response = await fetch(`${adminPath}/exhibitions`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          title: formData.get('title'),
                          subtitle: formData.get('subtitle'),
                          description: formData.get('description'),
                          location: formData.get('location'),
                          imageUrl: formData.get('imageUrl'),
                          subImageUrls: formData.getAll('subImageUrls'),
                          startDate: formData.get('startDate'),
                          endDate: formData.get('endDate'),
                        }),
                      });

                      if (!response.ok) {
                        throw new Error('展示会の作成に失敗しました');
                      }

                      queryClient.invalidateQueries({ queryKey: ["exhibitions"] });
                      toast({ title: "展示会を作成しました" });
                      (e.target as HTMLFormElement).reset();
                    } catch (error) {
                      console.error('Exhibition creation error:', error);
                      toast({
                        variant: "destructive",
                        title: "エラー",
                        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました"
                      });
                    }
                  }} className="space-y-6">
                    <div>
                      <Label htmlFor="title">タイトル *</Label>
                      <Input 
                        id="title" 
                        name="title" 
                        required 
                      />
                    </div>
                    <div>
                      <Label>メイン画像 *</Label>
                      <Dropzone
                        onFileChange={async (file) => {
                          const formData = new FormData();
                          formData.append('image', file);
                          
                          try {
                            const response = await fetch(`${adminPath}/upload`, {
                              method: 'POST',
                              body: formData,
                            });
                            
                            if (!response.ok) throw new Error('画像のアップロードに失敗しました');
                            
                            const data = await response.json();
                            if (!data.imageUrl) throw new Error('画像URLの取得に失敗しました');
                            
                            const imageUrlInput = document.getElementById('imageUrl') as HTMLInputElement;
                            if (imageUrlInput) imageUrlInput.value = data.imageUrl;
                            
                            toast({ title: "メイン画像をアップロードしました" });

                            // Scroll to form top after toast
                            const dialogContent = document.querySelector('[role="dialog"]');
                            if (dialogContent) {
                              dialogContent.scrollTop = 0;
                            }
                          } catch (error) {
                            toast({
                              variant: "destructive",
                              title: "画像のアップロードに失敗しました",
                              description: error instanceof Error ? error.message : "予期せぬエラーが発生しました"
                            });
                          }
                        }}
                        className="aspect-video w-full"
                      />
                      <Input
                        id="imageUrl"
                        name="imageUrl"
                        type="hidden"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">場所 *</Label>
                      <Input 
                        id="location" 
                        name="location" 
                        required 
                      />
                    </div>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={async () => {
                        const title = (document.getElementById('title') as HTMLInputElement)?.value;
                        const location = (document.getElementById('location') as HTMLInputElement)?.value;
                        
                        if (!title || !location) {
                          toast({
                            variant: "destructive",
                            title: "入力エラー",
                            description: "タイトルと場所を入力してください"
                          });
                          return;
                        }

                        try {
                          const response = await fetch(`${adminPath}/ai/generate-content`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ title, location }),
                          });

                          if (!response.ok) throw new Error('AI生成に失敗しました');

                          const data = await response.json();
                          
                          const subtitleInput = document.getElementById('subtitle') as HTMLInputElement;
                          const descriptionInput = document.getElementById('description') as HTMLTextAreaElement;
                          
                          if (subtitleInput) subtitleInput.value = data.subtitle;
                          if (descriptionInput) descriptionInput.value = data.description;
                          
                          toast({ title: "AI生成が完了しました" });
                        } catch (error) {
                          toast({
                            variant: "destructive",
                            title: "AI生成に失敗しました",
                            description: error instanceof Error ? error.message : "予期せぬエラーが発生しました"
                          });
                        }
                      }}
                    >
                      AIでサブタイトルと説明を生成
                    </Button>
                    <div>
                      <Label htmlFor="subtitle">サブタイトル *</Label>
                      <Input 
                        id="subtitle" 
                        name="subtitle" 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">説明 *</Label>
                      <Textarea 
                        id="description" 
                        name="description" 
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">開始日時 *</Label>
                        <Input 
                          id="startDate" 
                          name="startDate" 
                          type="datetime-local"
                          required 
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">終了日時 *</Label>
                        <Input 
                          id="endDate" 
                          name="endDate" 
                          type="datetime-local"
                          required 
                        />
                      </div>
                    </div>
                    <div>
                      <Label>サブ画像（複数可）</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {[1, 2, 3, 4].map((index) => (
                          <div key={index} className="space-y-2">
                            <Dropzone
                              onFileChange={async (file) => {
                                const formData = new FormData();
                                formData.append('image', file);
                                
                                try {
                                  const response = await fetch(`${adminPath}/upload`, {
                                    method: 'POST',
                                    body: formData,
                                  });
                                  
                                  if (!response.ok) throw new Error('画像のアップロードに失敗しました');
                                  
                                  const data = await response.json();
                                  if (!data.imageUrl) throw new Error('画像URLの取得に失敗しました');
                                  
                                  const form = document.querySelector('form');
                                  if (form) {
                                    const subImageInput = document.createElement('input');
                                    subImageInput.type = 'hidden';
                                    subImageInput.name = 'subImageUrls';
                                    subImageInput.value = data.imageUrl;
                                    form.appendChild(subImageInput);
                                  }
                                  
                                  toast({ title: "サブ画像をアップロードしました" });
                                } catch (error) {
                                  toast({
                                    variant: "destructive",
                                    title: "画像のアップロードに失敗しました",
                                    description: error instanceof Error ? error.message : "予期せぬエラーが発生しました"
                                  });
                                }
                              }}
                              className="aspect-square w-full"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      展示会を作成
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {exhibitions?.map((exhibition) => (
                <Card key={exhibition.id} className="overflow-hidden">
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
                  <div className="p-4 space-y-2">
                    <h3 className="text-lg font-semibold">{exhibition.title}</h3>
                    <p className="text-sm text-gray-500">{exhibition.subtitle}</p>
                    <p className="text-sm">{exhibition.location}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>開始: {new Date(exhibition.startDate).toLocaleString()}</span>
                      <span>終了: {new Date(exhibition.endDate).toLocaleString()}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;