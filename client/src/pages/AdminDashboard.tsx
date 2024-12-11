import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const adminPath = window.location.pathname.split('/dashboard')[0];

  const { data: artworks, isLoading } = useQuery({
    queryKey: [`${adminPath}/artworks`],
    queryFn: async () => {
      const response = await fetch(`${adminPath}/artworks`);
      if (!response.ok) {
        throw new Error('Unauthorized');
      }
      return response.json();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "認証エラー",
        description: "管理者権限がありません",
      });
      setLocation(adminPath);
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
        <Button
          variant="outline"
          onClick={() => {
            setLocation(adminPath);
          }}
        >
          ログアウト
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">作品一覧</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks?.map((artwork: any) => (
            <div key={artwork.id} className="border p-4 rounded-lg">
              <h3 className="font-medium">{artwork.title}</h3>
              <p className="text-sm text-gray-600">{artwork.description}</p>
              <p className="text-sm text-gray-600">¥{artwork.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
