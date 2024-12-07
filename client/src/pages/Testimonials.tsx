import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "鈴木 美咲",
    title: "美術館キュレーター",
    content: "ISSEIの作品には魂が宿っています。観る者の心に直接語りかけてくるような力強さと繊細さを持ち合わせており、多くの来館者から感動の声をいただいています。",
    location: "東京都現代美術館"
  },
  {
    name: "Jean-Pierre Dubois",
    title: "アートコレクター",
    content: "日本の伝統と現代アートの融合が見事です。彼の作品は私のコレクションの中でも特別な存在となっています。",
    location: "パリ"
  },
  {
    name: "山田 誠",
    title: "建築家",
    content: "空間に調和をもたらす稀有な才能を持つアーティストです。彼の作品は、建築空間に新たな生命を吹き込んでくれます。",
    location: "大阪"
  },
  {
    name: "Sarah Thompson",
    title: "ギャラリーオーナー",
    content: "ISSEIの作品は、グローバルなアート市場で高い評価を受けています。その独特な視点と表現力は、世界中のコレクターを魅了しています。",
    location: "ニューヨーク"
  },
  {
    name: "中村 洋子",
    title: "美術評論家",
    content: "現代アートシーンにおいて、ISSEIは特筆すべき存在です。その作品は時代を超えて語り継がれていくでしょう。",
    location: "京都"
  }
];

const Testimonials = () => {
  useEffect(() => {
    const cards = document.querySelectorAll('.testimonial-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });

    cards.forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-background/50 pointer-events-none" />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-6 tracking-wider">VOICES</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              芸術を愛する方々からいただいた温かい言葉の数々。
              <br />
              それは私たちの創造への情熱を支える大切な励みとなっています。
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className={`testimonial-card opacity-0 transition-all duration-700 delay-${index * 100} hover:shadow-lg`}
            >
              <CardContent className="p-8 relative">
                <Quote className="absolute top-6 left-6 w-8 h-8 text-primary/10" />
                <div className="space-y-6">
                  <p className="text-lg leading-relaxed text-muted-foreground italic relative z-10">
                    "{testimonial.content}"
                  </p>
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.title}</div>
                    <div className="text-sm text-primary">{testimonial.location}</div>
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
