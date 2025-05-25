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
    name: "千本倖生",
    title: "KDDI／ワイモバイル設立者・連続起業家",
    content: "大変素晴らしい絵をありがとう。いつも見ていて心が和みます。別荘ができたら飾ります。",
    location: "東京",
    imageUrl: "/13457.jpg"
  },
  {
    name: "資産家・投資家",
    title: "",
    content: "どれもおしゃれで気に入りました。特に女の子可愛いです。エジソンのような天才が描いた絵！将来1億円になるかもしれないですね。",
    location: "東京",
    imageUrl: "/13454.jpg"
  },
  {
    name: "パリ雑誌メディア経営者・実業家",
    title: "フランス　ディジョン",
    content: "Ce matin je partage mon petit-dejeuner avec le \"coeur\" d'Issei. Le petit chien nous nourrissent de leur confiance dans la vie! Ils attendent la bonne surprise du jour... a moi d'ouvrir l'oeil!\n\nisseiの\"心\"とともに朝食を。\n子犬は生きる自信をくれます！",
    location: "フランス　ディジョン",
    imageUrl: "/images/dog1.jpg"
  },
  {
    name: "川村 明美",
    title: "地方中核産科病院院長夫人",
    content: "夫の病院に飾られた作品が、多くの妊婦さんや新米ママたちに元気を与えています。特に明るい色使いと優しいタッチが、不安を抱える方々の心を和ませてくれる素晴らしいアートです。",
    location: "広島",
    imageUrl: "/attached_assets/image2.jpeg"
  },
  {
    name: "佐々木 健一",
    title: "医療系専門誌記者",
    content: "医療施設におけるアートの癒し効果に関する取材で訪れた病院で初めて作品に出会いました。患者さんとスタッフの双方から高い評価を得ており、医療環境の質向上に貢献している好例です。",
    location: "東京",
    imageUrl: "/attached_assets/dkajeiow92.png"
  },
  {
    name: "パリ郊外役所職員",
    title: "パリ郊外",
    content: "Quand j'ai vu ce tableau pour la premiere fois il y a quelques temps il m'a tout de suite plu. Il est tres mignon et ses couleurs m'apaisent beaucoup.\n\n少し前にこの絵を初めて見たとき、すぐに気に入りました。 とても可愛くて、色合いもとても癒されます。",
    location: "パリ郊外",
    imageUrl: "/images/bear1.jpg"
  },
  {
    name: "フランス美術評論家",
    title: "パリ",
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
