import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Voice } from "@db/schema";

const Voices = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: voices } = useQuery<Voice[]>({
    queryKey: ["voices"],
    queryFn: async () => {
      const response = await fetch("/api/voices");
      if (!response.ok) throw new Error('Failed to fetch voices');
      return response.json();
    },
  });

  return (
    <div className="space-y-20">
      <section className="bg-gray-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-12 tracking-wider">VOICES</h1>
            <p className="text-xl text-gray-700 leading-relaxed font-medium max-w-2xl mx-auto">
              作品をご購入いただいたお客様の声をご紹介いたします。
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {voices?.map((voice) => (
            <div key={voice.id} className="space-y-6">
              <div className="aspect-square overflow-hidden rounded-xl">
                <img
                  src={voice.imageUrl}
                  alt={`Voice by ${voice.buyerName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold">{voice.buyerName}</h3>
                <p className="text-gray-600 leading-relaxed">{voice.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Voices;
