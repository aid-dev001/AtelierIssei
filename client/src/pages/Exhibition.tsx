import { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ScrollToTopLink from "@/components/ScrollToTopLink";
import { Button } from "@/components/ui/button";

// ロケーションデータ（Home.tsxと同じデータを使用）
const locations = [
  { id: "hiroshima", label: "広島", year: "1998", country: "日本", description: "平和への祈りと再生をテーマにした作品の制作拠点", images: ["/images/hiroshima_1.jpg", "/images/hiroshima_2.jpg"] },
  { id: "tokyo-shinjuku", label: "東京・新宿", year: "2002", country: "日本", description: "都市の多様性と活気を色彩豊かに表現した作品", images: ["/images/tokyo_shinjuku_1.jpg", "/images/tokyo_shinjuku_2.jpg", "/images/tokyo_shinjuku_3.jpg"] },
  { id: "tokyo-ikebukuro", label: "東京・池袋", year: "2018", country: "日本", description: "都会の喧騒の中で見つけた静寂を表現するアトリエ", images: ["/images/tokyo_ikebukuro_1.jpg", "/images/tokyo_ikebukuro_2.jpg"] },
  { id: "abu-dhabi", label: "アブダビ", year: "2019", country: "UAE", description: "砂漠の国で開催した個展での作品展示", images: ["/images/abu_dhabi_1.jpg"] },
  { id: "tokyo-okubo", label: "東京・大久保", year: "2019", country: "日本", description: "多様な文化が混ざり合うギャラリーでの作品展示", images: ["/images/tokyo_okubo_1.jpg"] },
  { id: "paris", label: "パリ第一回", year: "2019", country: "フランス", description: "芸術の都で開催した初個展での作品展示", images: ["/images/paris_1.jpg", "/images/paris_2.jpg", "/images/paris_3.jpg"] },
  { id: "france-savigny", label: "フランス・サヴィニー地方", year: "2019", country: "フランス", description: "フランス地方都市でのファッションとアートの融合展示", images: ["/attached_assets/s231sa.jpg", "/attached_assets/23671.jpg"] },
  { id: "tokyo-akasaka", label: "東京・赤坂", year: "2022", country: "日本", description: "伝統と革新が交差する街で生まれる新しい表現", images: ["/images/akasaka_1.jpg", "/images/akasaka_2.jpg", "/images/akasaka_3.jpg"] },
  { id: "london", label: "ロンドン", year: "2022", country: "イギリス", description: "古典と現代が融合する街での芸術探求", images: ["/images/10819.jpg", "/images/10820.jpg", "/images/10821.jpg"] },
  { id: "paris-second", label: "パリ第二回", year: "2022", country: "フランス", description: "パリ中心部での2回目の個展「POKO FACE」シリーズ", images: ["/attached_assets/23601.jpg", "/attached_assets/23622_0.jpg", "/attached_assets/1662819546.jpg"] },
  { id: "spain-casamila", label: "スペイン・カサミラ", year: "2022", country: "スペイン", description: "ガウディ建築の傑作と現代アートの融合", images: ["/images/spain_casamila_1.jpg", "/images/spain_casamila_2.jpg", "/images/spain_casamila_3.jpg"] },
  { id: "atis-mons", label: "アティスモンス", year: "2022", country: "フランス", description: "フランス郊外の静かな村での集中的な創作期間", images: ["/images/atis_mons_1.jpg", "/images/atis_mons_2.jpg", "/images/atis_mons_3.jpg"] },
  { id: "atis-mons-church", label: "フランス・アティスモンス教会", year: "2023", country: "フランス", description: "歴史的な教会を舞台にした特別展示会", images: ["/images/atis_mons_church_1.jpg", "/images/atis_mons_church_2.jpg", "/images/atis_mons_church_3.jpg"] },
  { id: "normandy", label: "フランス・ノルマンディー", year: "2023", country: "フランス", description: "歴史と自然が織りなす風景からのインスピレーション", images: ["/images/france_normandy_1.jpg", "/images/12670.jpg", "/images/12671.jpg"] },
  { id: "france-chambord", label: "フランス・シャンボール城", year: "2023", country: "フランス", description: "フランス最大の城を描く野外アートプロジェクト", images: ["/images/chambord_2023_1.jpg", "/images/chambord_2023_2.jpg"] },
  { id: "montmartre", label: "フランス・モンマルトル", year: "2023", country: "フランス", description: "芸術家の聖地で描く街角スケッチの旅", images: ["/images/montmartre_1.jpg", "/images/montmartre_2.jpg"] },
  { id: "chaumont", label: "フランス・ショーモン城", year: "2024", country: "フランス", description: "歴史的な城での特別展示プロジェクト", images: ["/images/chaumont_2024_1.jpg", "/images/chaumont_2024_2.jpg"] },
  { id: "nice", label: "フランス・ニース", year: "2024", country: "フランス", description: "地中海の陽光に照らされた色彩の研究", images: ["/images/nice_2024_1.jpg", "/images/nice_2024_2.jpg", "/images/nice_2024_3.jpg"] },
  { id: "fukuyama", label: "広島・福山", year: "2024", country: "日本", description: "福山こころの病院での愛と癒しをテーマにした作品展示", images: ["/images/fukuyama_1.jpg", "/images/fukuyama_2.jpg"] },
  { id: "saint-hilaire-andre", label: "フランス・ティレーヌアンドレシス", year: "2024", country: "フランス", description: "中世の面影を残す村での滞在制作", images: ["/images/tireine_1.jpg", "/images/tireine_2.jpg"] },
  { id: "bourges", label: "フランス・ブールジュ", year: "2025", country: "フランス", description: "ゴシック建築に囲まれた創作体験", images: ["/images/bourges_2025_1.jpg", "/images/3525.jpg", "/images/3730.jpg"] }
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

      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4 text-center tracking-wider">WORLD LOCATIONS</h2>
          <p className="text-xl text-center mb-16 text-gray-700">世界各地で取り組んだプロジェクトとインスピレーションを得た場所</p>
          
          {/* 場所のリスト */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-12 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
              {locations.map((location, index) => (
                <div 
                  key={location.id}
                  data-id={location.id}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors rounded px-3 py-2`}
                  onClick={() => {
                    const element = document.getElementById('location-detail');
                    if (element) {
                      document.getElementById('selected-location-title')!.textContent = location.label;
                      document.getElementById('selected-location-country')!.textContent = location.country;
                      document.getElementById('selected-location-year')!.textContent = location.year;
                      document.getElementById('selected-location-description')!.textContent = location.description;
                      
                      // 詳細ページへのリンクを更新
                      const linkWrapper = document.getElementById('location-detail-link-wrapper');
                      if (linkWrapper) {
                        linkWrapper.setAttribute('data-location-id', location.id);
                      }
                      
                      // 画像の更新
                      const imageContainer = document.getElementById('selected-location-images');
                      if (imageContainer) {
                        imageContainer.innerHTML = '';
                        location.images.forEach((img, i) => {
                          const imgEl = document.createElement('div');
                          imgEl.className = "aspect-square bg-gray-100 rounded overflow-hidden group";
                          imgEl.innerHTML = `<img src="${img}" alt="${location.label} - ${i+1}" class="w-full h-full object-cover transition duration-500 group-hover:scale-105" onerror="this.onerror=null;this.src='/placeholder.png';" />`;
                          imageContainer.appendChild(imgEl);
                        });
                      }
                      
                      element.classList.remove('hidden');
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{location.label}</span>
                    <span className="text-sm text-gray-500">{location.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 初期表示用の広島データ */}
          <div id="initial-location-data" 
            data-id="hiroshima"
            data-label="広島" 
            data-year="1998" 
            data-country="日本" 
            data-description="平和への祈りと再生をテーマにした作品の制作拠点"
            data-images='["/images/hiroshima_1.jpg","/images/hiroshima_2.jpg"]'
            className="hidden"
          ></div>

          {/* ロケーション詳細 */}
          <div id="location-detail" className="hidden">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                <div className="md:col-span-1 bg-gray-100 p-8">
                  <div className="space-y-6">
                    <div>
                      <h3 id="selected-location-title" className="text-2xl font-bold mb-2">広島</h3>
                      <div className="flex items-center gap-3 mb-4">
                        <span id="selected-location-country" className="text-sm font-medium text-gray-500">日本</span>
                        <span id="selected-location-year" className="text-sm font-medium text-gray-500">1998</span>
                      </div>
                      <p id="selected-location-description" className="text-gray-700">
                        平和への祈りと再生をテーマにした作品の制作拠点
                      </p>
                    </div>
                    
                    <div id="location-detail-link-wrapper" data-location-id="hiroshima">
                      <ScrollToTopLink href={`/exhibition/location/hiroshima`}>
                        <Button variant="outline" className="w-full justify-center hover:bg-gray-50">
                          詳細ページへ
                        </Button>
                      </ScrollToTopLink>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2 p-8">
                  <h3 className="text-xl font-medium mb-6 text-gray-800">アーティスト活動の記録</h3>
                  <div id="selected-location-images" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 初期表示用の画像 */}
                    <div className="aspect-square bg-gray-100 rounded overflow-hidden group">
                      <img src="/images/hiroshima_1.jpg" alt="広島 - 1" className="w-full h-full object-cover transition duration-500 group-hover:scale-105" onError={(e) => { const img = e.target as HTMLImageElement; img.onerror = null; img.src = '/placeholder.png'; }} />
                    </div>
                    <div className="aspect-square bg-gray-100 rounded overflow-hidden group">
                      <img src="/images/hiroshima_2.jpg" alt="広島 - 2" className="w-full h-full object-cover transition duration-500 group-hover:scale-105" onError={(e) => { const img = e.target as HTMLImageElement; img.onerror = null; img.src = '/placeholder.png'; }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Exhibition;
