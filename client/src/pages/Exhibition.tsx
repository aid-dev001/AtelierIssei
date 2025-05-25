import { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ScrollToTopLink from "@/components/ScrollToTopLink";
import { Button } from "@/components/ui/button";

// ロケーションデータ（Home.tsxと同じデータを使用）
const locations = [
  { id: "hiroshima", label: "広島", year: "1998", country: "日本", description: "平和への祈りと再生をテーマにした作品の制作拠点", images: ["hiroshima_1.jpg", "hiroshima_2.jpg"] },
  { id: "tokyo-shinjuku", label: "東京・新宿", year: "2002", country: "日本", description: "都市の多様性と活気を色彩豊かに表現した作品", images: ["tokyo_shinjuku_1.jpg", "tokyo_shinjuku_2.jpg", "tokyo_shinjuku_3.jpg"] },
  { id: "tokyo-ikebukuro", label: "東京・池袋", year: "2018", country: "日本", description: "都会の喧騒の中で見つけた静寂を表現するアトリエ", images: ["tokyo_ikebukuro_1.jpg", "tokyo_ikebukuro_2.jpg"] },
  { id: "abu-dhabi", label: "アブダビ", year: "2019", country: "UAE", description: "砂漠の国で開催した個展での作品展示", images: ["abu_dhabi_1.jpg"] },
  { id: "tokyo-okubo", label: "東京・大久保", year: "2019", country: "日本", description: "多様な文化が混ざり合うギャラリーでの作品展示", images: ["tokyo_okubo_1.jpg"] },
  { id: "paris", label: "パリ第一回", year: "2019", country: "フランス", description: "芸術の都で開催した初個展での作品展示", images: ["paris_1.jpg", "paris_2.jpg", "paris_3.jpg"] },
  { id: "saint-hilaire-andre", label: "サンティレースアンドレシス", year: "2019", country: "フランス", description: "中世の面影を残す村での滞在制作", images: ["7853.jpg", "7855.jpg", "8594.jpg"] },
  { id: "tokyo-akasaka", label: "東京・赤坂", year: "2022", country: "日本", description: "伝統と革新が交差する街で生まれる新しい表現", images: ["tokyo_akasaka_1.jpg", "tokyo_akasaka_2.jpg", "tokyo_akasaka_3.jpg"] },
  { id: "london", label: "ロンドン", year: "2022", country: "イギリス", description: "古典と現代が融合する街での芸術探求", images: ["10819.jpg", "10820.jpg", "10821.jpg"] },
  { id: "paris-second", label: "パリ第二回", year: "2022", country: "フランス", description: "パリ中心部での2回目の個展「POKO FACE」シリーズ", images: ["paris_second_1.jpg", "paris_second_2.jpg", "paris_second_3.jpg"] },
  { id: "spain-casamila", label: "スペイン・カサミラ", year: "2022", country: "スペイン", description: "ガウディ建築の傑作と現代アートの融合", images: ["spain_casamila_1.jpg", "spain_casamila_2.jpg", "spain_casamila_3.jpg"] },
  { id: "france-savigny", label: "フランス・サヴィニー地方", year: "2022", country: "フランス", description: "フランス地方都市でのファッションとアートの融合展示", images: ["france_savigny_1.jpg", "france_savigny_2.jpg"] },
  { id: "atis-mons", label: "アティスモンス", year: "2022", country: "フランス", description: "フランス郊外の静かな村での集中的な創作期間", images: ["atis_mons_1.jpg", "atis_mons_2.jpg", "atis_mons_3.jpg"] },
  { id: "atis-mons-church", label: "フランス・アティスモンス教会", year: "2023", country: "フランス", description: "歴史的な教会を舞台にした特別展示会", images: ["atis_mons_church_1.jpg", "atis_mons_church_2.jpg", "atis_mons_church_3.jpg"] },
  { id: "normandy", label: "フランス・ノルマンディー", year: "2023", country: "フランス", description: "歴史と自然が織りなす風景からのインスピレーション", images: ["france_normandy_1.jpg", "12670.jpg", "12671.jpg"] },
  { id: "france-chambord", label: "フランス・シャンボール城", year: "2023", country: "フランス", description: "フランス最大の城を描く野外アートプロジェクト", images: ["chambord_2023_1.jpg", "chambord_2023_2.jpg"] },
  { id: "montmartre", label: "フランス・モンマルトル", year: "2023", country: "フランス", description: "芸術家の聖地で描く街角スケッチの旅", images: ["montmartre_1.jpg", "montmartre_2.jpg"] },
  { id: "chaumont", label: "フランス・ショーモン城", year: "2024", country: "フランス", description: "歴史的な城での特別展示プロジェクト", images: ["chaumont_2024_1.jpg", "chaumont_2024_2.jpg"] },
  { id: "nice", label: "フランス・ニース", year: "2024", country: "フランス", description: "地中海の陽光に照らされた色彩の研究", images: ["nice_2024_1.jpg", "nice_2024_2.jpg", "nice_2024_3.jpg"] },
  { id: "fukuyama", label: "広島・福山", year: "2024", country: "日本", description: "福山こころの病院での愛と癒しをテーマにした作品展示", images: ["fukuyama_1.jpg", "fukuyama_2.jpg"] },
  { id: "bourges", label: "フランス・ブールジュ", year: "2025", country: "フランス", description: "ゴシック建築に囲まれた創作体験", images: ["bourges_2025_1.jpg", "3525.jpg", "3730.jpg"] }
];

const Exhibition = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="space-y-20">
      <section className="bg-gray-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-12 tracking-wider">EXHIBITION</h1>
            <p className="text-xl text-gray-700 leading-relaxed font-medium max-w-2xl mx-auto">
              世界各地で開催される展示会を通じて、
              アートの持つ普遍的な力と美しさを伝えています。
            </p>
          </div>
          <div className="aspect-video rounded-xl overflow-hidden shadow-2xl mt-12">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/Xti4v4ayTnk"
              title="ATELIER ISSEI Exhibition"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* 代表作セクション */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-10 text-center">代表作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { id: "paris-second", label: "パリ第二回", year: "2022", country: "フランス", image: "/paris_second_1.jpg", description: "パリ中心部での2回目の個展「POKO FACE」シリーズ" },
            { id: "chaumont", label: "フランス・ショーモン城", year: "2024", country: "フランス", image: "/chaumont_2024_1.jpg", description: "歴史的な城での特別展示プロジェクト" },
            { id: "montmartre", label: "フランス・モンマルトル", year: "2023", country: "フランス", image: "/montmartre_1.jpg", description: "芸術家の聖地で描く街角スケッチの旅" }
          ].map(item => (
            <ScrollToTopLink href={`/exhibition/location/${item.id}`} key={item.id}>
              <div className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden transform hover:-translate-y-1">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={`${item.label} Exhibition`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.onerror = null;
                      img.src = '/placeholder.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="p-8 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold tracking-wide group-hover:text-primary/80 transition-colors">
                      {item.label}
                    </h3>
                    <span className="text-sm text-gray-500">{item.year}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  <div className="pt-4">
                    <span className="text-sm font-medium text-primary/80 group-hover:text-primary transition-colors">
                      詳細ページへ
                    </span>
                  </div>
                </div>
              </div>
            </ScrollToTopLink>
          ))}
        </div>
      </section>

      {/* 展示歴セクション */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold mb-10 text-center">世界各地での展示歴</h2>
        
        <div className="grid grid-cols-1 gap-6">
          {locations.map((location) => (
            <div key={location.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* 画像セクション */}
                <div className="md:w-1/3 bg-gray-100">
                  <div className="aspect-square md:h-full w-full">
                    <img
                      src={`/${location.images[0]}`}
                      alt={`${location.label} Exhibition`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.onerror = null;
                        img.src = '/placeholder.png';
                      }}
                    />
                  </div>
                </div>
                
                {/* テキストセクション */}
                <div className="md:w-2/3 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold">{location.label}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">{location.year}</span>
                        <span className="text-sm font-medium text-gray-500">{location.country}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{location.description}</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <ScrollToTopLink href={`/exhibition/location/${location.id}`}>
                      <Button variant="outline" size="sm" className="hover:bg-gray-50">
                        詳細ページへ
                      </Button>
                    </ScrollToTopLink>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Exhibition;
