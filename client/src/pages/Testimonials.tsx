import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

// プロジェクトに既に存在する画像を使用

const testimonials = [
  {
    name: "ビーグル ブルドッグ",
    title: "パリ雑誌メディア経営者・実業家",
    content: "Ce matin je partage mon petit-dejeuner avec le \"coeur\" d'Issei. Le petit chien nous nourrissent de leur confiance dans la vie! Ils attendent la bonne surprise du jour... a moi d'ouvrir l'oeil!\n\nisseiの\"心\"とともに朝食を。\n子犬は生きる自信をくれます！",
    location: "パリ",
    imageUrl: "/images/dog1.jpg"
  },
  {
    name: "ひょこあに ねこ",
    title: "地方中核産科病院院長夫人",
    content: "色も色の組み合わせも可愛くて気に入っています。\n玄関で丸い顔が浮き上がっているのを見ると心も弾みます。",
    location: "札幌",
    imageUrl: "/images/cat1.jpg"
  },
  {
    name: "山田 誠",
    title: "建築家",
    content: "空間に調和をもたらす稀有な才能を持つアーティストです。彼の作品は、建築空間に新たな生命を吹き込んでくれます。",
    location: "大阪",
    imageUrl: "/images/landscape1.jpg"
  },
  {
    name: "Sarah Thompson",
    title: "ギャラリーオーナー",
    content: "ISSEIの作品は、グローバルなアート市場で高い評価を受けています。その独特な視点と表現力は、世界中のコレクターを魅了しています。",
    location: "ニューヨーク",
    imageUrl: "/images/bear1.jpg"
  },
  {
    name: "中村 洋子",
    title: "美術評論家",
    content: "現代アートシーンにおいて、ISSEIは特筆すべき存在です。その作品は時代を超えて語り継がれていくでしょう。",
    location: "京都",
    imageUrl: "/images/eiffel1.png"
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
      <section>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-12 tracking-wider text-gray-800">VOICES</h1>
            <p className="text-xl text-gray-700 leading-relaxed font-medium max-w-2xl mx-auto">
              芸術を愛する方々からいただいた言葉の数々が、私たちの創造への情熱を支えています。
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-12 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="testimonial-card opacity-0 translate-y-4 transition-all duration-700 ease-out hover:shadow-lg overflow-hidden bg-transparent"
            >
              <CardContent className="p-0">
                <div className={`grid md:grid-cols-2 h-full ${index % 2 === 0 ? 'md:grid-flow-col' : 'md:grid-flow-col-dense'}`}>
                  <div className="relative h-full overflow-hidden">
                    <img 
                      src={testimonial.imageUrl}
                      alt={`Artwork appreciated by ${testimonial.name}`}
                      className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                      style={{ minHeight: '100%', maxHeight: '100%' }}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.onerror = null;
                        console.error(`Failed to load image: ${testimonial.imageUrl}`);
                        img.src = '/placeholder.png';
                      }}
                    />
                  </div>
                  <div className="p-8 space-y-6 flex flex-col justify-center bg-white">
                    <Quote className="w-8 h-8 text-gray-300" />
                    <div className="text-lg leading-relaxed text-gray-700">
                      {testimonial.content.split('\n').map((line, i) => (
                        <p key={i} className="mb-2">
                          {line}
                        </p>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="font-semibold text-gray-700 text-lg">{testimonial.name}</div>
                      <div className="text-gray-600">{testimonial.title}</div>
                      <div className="text-gray-600">{testimonial.location}</div>
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
