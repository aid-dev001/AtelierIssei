import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

// プロジェクトに既に存在する画像を使用

const testimonials = [
  {
    name: "小島 和人",
    title: "高砂熱学工業株式会社　代表取締役社長",
    content: "社内に飾られているのをみてとても好きになりました。よく息子と水族館に行ったので思い入れもあります。",
    location: "東京",
    imageUrl: "/13452.jpg"
  },
  {
    name: "資産家・投資家",
    title: "",
    content: "どれもおしゃれで気に入りました。特に女の子可愛いです。エジソンのような天才が描いた絵！将来1億円になるかもしれないですね。",
    location: "東京",
    imageUrl: "/13454.jpg"
  },
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
    location: "広島",
    imageUrl: "/images/cat1.jpg"
  },
  {
    name: "モンマルトル",
    title: "医療系記者",
    content: "J'aime Montmartre depuis toujours d'autaut plus que ma mere est nee la-bas. Ce tableau revet donc un sens tout particulier.\n\n私はいつもモンマルトルが大好きで、特に母がモンマルトルで生まれています。ですのでこの絵は非常に特別な意味を持ちます。",
    location: "パリ",
    imageUrl: "/images/landscape1.jpg"
  },
  {
    name: "くま",
    title: "パリ郊外役所職員",
    content: "Quand j'ai vu ce tableau pour la premiere fois il y a quelques temps il m'a tout de suite plu. Il est tres mignon et ses couleurs m'apaisent beaucoup.\n\n少し前にこの絵を初めて見たとき、すぐに気に入りました。 とても可愛くて、色合いもとても癒されます。",
    location: "パリ郊外",
    imageUrl: "/images/bear1.jpg"
  },
  {
    name: "エッフェル塔 ねこ",
    title: "フランス美術評論家",
    content: "c'est trop mignon!!\n\nとにかくかわいい！！\n\nc'est formidable de redecouvrir notre Tour Eiffel a travers les yeux d'un peintre japonais. Magnifique!\n\n日本画家の目を通してエッフェル塔を再発見できるのは素晴らしいことです。素敵！",
    location: "パリ",
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
                <div className={`grid grid-cols-1 md:grid-cols-2 h-full ${index % 2 === 0 ? 'md:grid-flow-col' : 'md:grid-flow-col-dense'}`}>
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
