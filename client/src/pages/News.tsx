import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { News } from "@db/schema";
import { format } from "date-fns";
import PageTransition from "@/components/PageTransition";

const News = () => {
  const { data: news, isLoading } = useQuery<News[]>({
    queryKey: ["news"],
    queryFn: () => fetch("/api/news").then(res => res.json()),
  });

  const LoadingSkeleton = () => (
    <div className="grid gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <PageTransition>
      <div className="space-y-12">
        <section className="bg-gray-50">
          <div className="container mx-auto px-4 py-20">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold mb-12 tracking-wider">NEWS</h1>
              <p className="text-xl text-gray-700 leading-relaxed font-medium max-w-2xl mx-auto">
                最新の展示情報や活動についてお知らせします。
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-8 max-w-4xl mx-auto">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            news?.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="grid md:grid-cols-2 gap-6">
                  {item.imageUrl && (
                    <div className="aspect-video">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-sm text-gray-500 mb-2">
                      {format(new Date(item.publishedAt), 'yyyy.MM.dd')}
                    </p>
                    <h2 className="text-xl font-bold mb-4">{item.title}</h2>
                    <p className="text-gray-600">{item.content}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default News;