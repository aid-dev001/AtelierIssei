import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "鈴木 美咲",
    title: "美術館キュレーター",
    content: "ISSEIの作品には魂が宿っています。観る者の心に直接語りかけてくるような力強さと繊細さを持ち合わせており、多くの来館者から感動の声をいただいています。",
    location: "東京都現代美術館",
    imageUrl: "23313_0.jpg"
  },
  {
    name: "Jean-Pierre Dubois",
    title: "アートコレクター",
    content: "日本の伝統と現代アートの融合が見事です。彼の作品は私のコレクションの中でも特別な存在となっています。",
    location: "パリ",
    imageUrl: "23317.jpg"
  },
  {
    name: "山田 誠",
    title: "建築家",
    content: "空間に調和をもたらす稀有な才能を持つアーティストです。彼の作品は、建築空間に新たな生命を吹き込んでくれます。",
    location: "大阪",
    imageUrl: "23677.jpg"
  },
  {
    name: "Sarah Thompson",
    title: "ギャラリーオーナー",
    content: "ISSEIの作品は、グローバルなアート市場で高い評価を受けています。その独特な視点と表現力は、世界中のコレクターを魅了しています。",
    location: "ニューヨーク",
    imageUrl: "23313_0.jpg"
  },
  {
    name: "中村 洋子",
    title: "美術評論家",
    content: "現代アートシーンにおいて、ISSEIは特筆すべき存在です。その作品は時代を超えて語り継がれていくでしょう。",
    location: "京都",
    imageUrl: "23317.jpg"
  }
];

const Testimonials = () => {
  useEffect(() => {
    const cards = document.querySelectorAll('.testimonial-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-4');
        }
      });
    }, { 
      threshold: 0.2,
      rootMargin: '50px'
    });

    cards.forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/90 to-white/30 backdrop-blur-sm"></div>
        <div className="container relative mx-auto px-4 py-32">
          <div className="text-center">
            <h1 className="inline-block text-5xl font-bold tracking-tight text-gray-900/90 mb-8">
              <span className="block transform transition-all duration-500 hover:translate-y-[-2px]">VOICES</span>
            </h1>
            <div className="max-w-2xl mx-auto space-y-6">
              <p className="text-2xl font-light tracking-wide text-gray-800/90 leading-relaxed">
                芸術を愛する方々からいただいた
                <span className="font-medium">温かい言葉</span>
                の数々
              </p>
              <div className="w-16 h-px bg-primary/30 mx-auto transform transition-all duration-500 hover:w-24 hover:bg-primary/50"></div>
              <p className="text-lg text-gray-700/80 leading-loose tracking-wide">
                それは私たちの創造への情熱を支える
                <br className="hidden sm:block" />
                かけがえのない励みとなっています
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="testimonial-card opacity-0 translate-y-4 transition-all duration-700 ease-out hover:shadow-lg"
            >
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl shadow-lg bg-gray-100">
                      <img 
                        src={testimonial.imageUrl}
                        alt={`Artwork appreciated by ${testimonial.name}`}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 space-y-4">
                    <Quote className="w-8 h-8 text-gray-300" />
                    <p className="text-base leading-relaxed text-gray-700 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold text-gray-700">{testimonial.name}</div>
                      <div className="text-sm text-gray-700">{testimonial.title}</div>
                      <div className="text-sm text-gray-700">{testimonial.location}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Testimonials;
