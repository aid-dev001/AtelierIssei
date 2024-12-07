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
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-100/50 via-transparent to-transparent"></div>
        <div className="container relative mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-16">
              <h1 className="relative inline-block">
                <span className="text-6xl font-light tracking-[0.2em] text-gray-900/90">
                  VOICES
                </span>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-px bg-primary/30"></div>
              </h1>
              
              <div className="space-y-12 px-4">
                <p className="text-3xl font-extralight tracking-wide text-gray-800/90 leading-relaxed">
                  芸術を愛する方々から
                  <br className="hidden sm:block" />
                  いただいた
                  <span className="font-normal">温かい言葉</span>
                  の数々
                </p>
                
                <div className="max-w-xl mx-auto">
                  <p className="text-lg font-light text-gray-600/90 leading-loose tracking-wider">
                    それは私たちの創造への情熱を支える
                    <br className="hidden sm:block" />
                    かけがえのない励みとなっています
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-primary/[0.02] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-primary/[0.02] rounded-full blur-3xl"></div>
        </div>
      </section>

      <section className="container mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="testimonial-card opacity-0 translate-y-4 transition-all duration-700 ease-out hover:shadow-xl bg-white/50 backdrop-blur-sm border-gray-100/80"
            >
              <CardContent className="p-8">
                <div className="space-y-8">
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl shadow-lg">
                    <img 
                      src={testimonial.imageUrl}
                      alt={`Artwork appreciated by ${testimonial.name}`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="space-y-6">
                    <Quote className="w-10 h-10 text-primary/20" />
                    <p className="text-lg leading-relaxed text-gray-700/90 tracking-wide font-light">
                      "{testimonial.content}"
                    </p>
                    <div className="pt-4 border-t border-gray-100">
                      <div className="font-medium text-lg text-gray-800/90 mb-2">{testimonial.name}</div>
                      <div className="text-base text-gray-600/90">{testimonial.title}</div>
                      <div className="text-base text-gray-600/90">{testimonial.location}</div>
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
