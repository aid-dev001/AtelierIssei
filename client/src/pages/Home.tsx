import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import ScrollToTopLink from "@/components/ScrollToTopLink";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { Collection, Artwork } from "@db/schema";
import CustomMap from "@/components/Map";
import VideoHero from "@/components/VideoHero";
import VideoModal from "@/components/VideoModal";


const ATELIER_LOCATIONS = ["銀座", "広島", "パリ"] as const;

const AtelierInfo = {
  銀座: {
    description: "都会の喧騒の中で、静寂と調和を見出すアトリエ",
    period: "2018-2020",
    mainImage: "/artworks/12648.jpg",
  },
  広島: {
    description: "平和への祈りと共に、新たな芸術表現を追求",
    period: "2020-2022",
    mainImage: "/artworks/12653.jpg",
  },
  パリ: {
    description: "芸術の都で、日本の美意識を世界へ発信",
    period: "2023-現在",
    mainImage: "/artworks/12658.jpg",
  }
} as const;

const CollectionsSection = () => {
  const { data: collections, isLoading, error } = useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await fetch("/api/collections");
      if (!response.ok) throw new Error('Failed to fetch collections');
      return response.json();
    },
  });

  const { data: artworks } = useQuery<Artwork[]>({
    queryKey: ["artworks"],
    queryFn: async () => {
      const response = await fetch("/api/artworks");
      if (!response.ok) throw new Error('Failed to fetch artworks');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">コレクションの読み込みに失敗しました</div>;
  }

  return (
    <>
      {collections?.slice(0, 3).map((collection) => {
        const collectionArtworks = artworks?.filter(
          artwork => artwork.collectionId === collection.id
        ).slice(0, 4) || [];

        return (
          <div key={collection.id} className="space-y-8">
            <h3 className="text-2xl font-medium text-center">
              {collection.title}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {collectionArtworks.map((artwork, index) => (
                <ScrollToTopLink key={index} href={`/collections/${collection.id}`}>
                  <div className="aspect-square overflow-hidden rounded-lg shadow-lg group">
                    <img
                      src={artwork.imageUrl}
                      alt={`${collection.title} - ${artwork.title}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.onerror = null;
                        img.src = '/placeholder.png';
                      }}
                    />
                  </div>
                </ScrollToTopLink>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
};

const Home = () => {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal-text');
    elements.forEach((el, i) => {
      (el as HTMLElement).style.animationDelay = `${i * 0.2}s`;
    });
  }, []);

  const locations = [
    {
      city: "東京",
      address: "銀座 ATELIER ISSEI本店",
      description: "洗練された空間で新たな芸術体験を"
    },
    {
      city: "広島",
      address: "平和記念公園 アートギャラリー",
      description: "心安らぐ空間での芸術との出会い"
    },
    {
      city: "パリ",
      address: "Galerie ISSEI Paris",
      description: "芸術の都で味わう日本の美意識"
    },
    {
      city: "ニース",
      address: "ISSEI Art Space Nice",
      description: "地中海の光に包まれた展示空間"
    },
    {
      city: "ドバイ",
      address: "ISSEI Gallery Dubai",
      description: "伝統と革新が融合する芸術空間"
    },
    {
      city: "ロンドン",
      address: "ISSEI London Gallery",
      description: "歴史ある街並みに佇む現代アート"
    }
  ];

  return (
    <div className="space-y-20">
      <section className="min-h-screen relative overflow-hidden">
        {/* 背景の画像ギャラリー */}
        <div className="absolute inset-0">
          {/* グリッド状の画像レイアウト */}
          <div className="grid grid-cols-15 gap-0.5">
            {[...Array(450)].map((_, index) => {
              const imageFiles = [
                "23313_0.jpg", "23317.jpg", "23677.jpg", "1912_0.jpg", 
                "2266.jpg", "2914.jpg", "3316.jpg", "3446.jpg",
                "3525.jpg", "3730.jpg", "6715.jpg", "7853.jpg",
                "7855.jpg", "8594.jpg", "10819.jpg", "10820.jpg"
              ];
              const imgSrc = imageFiles[index % imageFiles.length];
              
              return (
                <div 
                  key={`grid-${index}`} 
                  className="aspect-square overflow-hidden"
                >
                  <img
                    src={`/artworks/${imgSrc}`}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.onerror = null;
                      img.src = '/placeholder.png';
                    }}
                  />
                </div>
              );
            })}
          </div>
          
          {/* 中央の透過カバー */}
          <div className="absolute left-1/2 -translate-x-1/2 w-[87%] h-[85%] bg-white" style={{ top: 'calc(100vw * 0.125 / 2)' }}>
            {/* メインコンテンツ */}
            <div className="h-full flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                  <h1 className="text-6xl md:text-8xl font-bold mb-12 reveal-text tracking-[0.2em] text-gray-800">
                    ATELIER ISSEI
                  </h1>
                  <p className="text-xl md:text-3xl font-light mb-16 reveal-text tracking-[0.3em] text-gray-700">
                    心に寄り添うアートを
                  </p>
                  <div className="max-w-2xl mx-auto space-y-8">
                    <p className="text-lg tracking-[0.15em] leading-relaxed font-medium text-gray-700">
                      私たちは、日常の中に特別な瞬間を創造します。
                      温かみのある色彩と大胆な構図で、
                      見る人の心に寄り添う作品を生み出しています。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 mb-20">
        <h2 className="text-4xl font-bold mb-16 text-center tracking-wider">FEATURED WORKS</h2>
        
        {/* 代表作品を表示 - スマホは1列 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
          {[
            { 
              src: "/images/girl_artwork.jpg", 
              category: "女の子", 
              title: "Girls Collection", 
              description: "女の子をテーマにした独自の世界観を表現" 
            },
            { 
              src: "/images/digital_artwork.jpg", 
              category: "デジタルアート", 
              title: "Digital Art", 
              description: "デジタル技術を駆使した現代的な表現" 
            },
            { 
              src: "/images/poko_artwork.jpg", 
              category: "ひょこあに", 
              title: "Poko Animal", 
              description: "愛らしい動物たちのユニークな表現" 
            },
            { 
              src: "/images/abstract_artwork.jpg", 
              category: "抽象画", 
              title: "Abstract Collection", 
              description: "色彩と形の自由な探求" 
            },
            { 
              src: "/images/landscape_artwork.jpg", 
              category: "風景画", 
              title: "Landscape", 
              description: "独自の視点で捉えた風景の詩的表現" 
            },
            { 
              src: "/images/animal_artwork.jpg", 
              category: "動物", 
              title: "Animal Collection", 
              description: "動物たちの生命力と美しさを表現" 
            }
          ].map((artwork, index) => (
            <div key={index} className="space-y-3 group">
              <div className="aspect-square bg-gray-100 overflow-hidden rounded shadow-sm">
                <img 
                  src={artwork.src} 
                  alt={artwork.title} 
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.onerror = null;
                    img.src = '/placeholder.png';
                  }}
                />
              </div>
              <div className="space-y-1 px-1">
                <div className="text-sm font-medium text-primary">{artwork.category}</div>
                <h3 className="font-medium text-lg">{artwork.title}</h3>
                <p className="text-sm text-gray-600">{artwork.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Video Section */}
      <div className="my-24">
        <section className="relative w-full overflow-hidden" style={{ minHeight: '80vh' }}>
          <div className="absolute inset-0 bg-black">
            <img
              src="/images/assets/atelier-issei-logo-2.png"
              alt="ATELIER ISSEI"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
          
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4 py-24">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-wide text-white">
                  世界各地での創作活動
                </h2>
                <p className="text-xl text-gray-100 max-w-2xl mb-8">
                  各地での創作活動と展示の様子をご覧ください。世界各地での活動を通じて得た経験と感性が、作品に表現されています。
                </p>
                
                <VideoModal videoSrc="/videos/movie.mp4">
                  <button 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-all duration-300"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>動画を見る</span>
                  </button>
                </VideoModal>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Art Concept Section */}
      <section className="relative overflow-hidden" style={{ height: '80vh' }}>
        <div className="absolute inset-0">
          <img
            src="/artworks/12648.jpg"
            alt="Art Concept Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-0 right-0 w-4/5 md:w-[60%] bg-white shadow-xl transform translate-y-[10%] ml-auto">
          <div className="p-16 md:p-32 space-y-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-wider text-gray-800">ART CONCEPT</h2>
            <div className="space-y-8 max-w-lg ml-auto">
              <p className="text-base md:text-lg leading-relaxed text-gray-800/90 tracking-wider">
                私たちは、日常の中に特別な瞬間を創造します。<br />
                温かみのある色彩と大胆な構図で、<br />
                見る人の心に寄り添う作品を生み出しています。
              </p>
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 pt-4">
                <Button 
                  asChild 
                  className="w-full md:w-auto bg-black/90 hover:bg-black text-white px-8 py-6 text-sm tracking-[0.2em] rounded-lg transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 group relative overflow-hidden"
                >
                  <ScrollToTopLink href="/concept" className="relative z-10 flex items-center justify-center gap-2">
                    詳しく見る
                    <span className="w-5 h-[1px] bg-white transform transition-transform duration-300 group-hover:scale-x-150" />
                  </ScrollToTopLink>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full md:w-auto px-8 py-6 text-sm tracking-[0.2em] rounded-lg border-black/80 hover:border-black bg-white/80 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 group relative overflow-hidden"
                >
                  <ScrollToTopLink href="/artworks" className="relative z-10 flex items-center justify-center gap-2">
                    作品を見る
                    <span className="w-5 h-[1px] bg-black transform transition-transform duration-300 group-hover:scale-x-150" />
                  </ScrollToTopLink>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* World Locations */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4 text-center tracking-wider">WORLD LOCATIONS</h2>
          <p className="text-xl text-center mb-16 text-gray-700">世界各地で取り組んだプロジェクトとインスピレーションを得た場所</p>
          
          {/* 場所のリスト */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-12 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
              {[
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
              ].map((location, index) => (
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
                      // スクロールは不要なので削除
                      // element.scrollIntoView({ behavior: 'smooth' });
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

          <script dangerouslySetInnerHTML={{
            __html: `
              // ページ読み込み時の処理
              function initializeLocationDetail() {
                // 初期データを取得
                const initialData = document.getElementById('initial-location-data');
                const firstLocation = {
                  id: initialData.getAttribute('data-id'),
                  label: initialData.getAttribute('data-label'),
                  year: initialData.getAttribute('data-year'),
                  country: initialData.getAttribute('data-country'),
                  description: initialData.getAttribute('data-description'),
                  images: JSON.parse(initialData.getAttribute('data-images'))
                };
                
                // テキスト内容を設定
                document.getElementById('selected-location-title').textContent = firstLocation.label;
                document.getElementById('selected-location-country').textContent = firstLocation.country;
                document.getElementById('selected-location-year').textContent = firstLocation.year;
                document.getElementById('selected-location-description').textContent = firstLocation.description;
                
                // 詳細ページへのリンクを設定
                const linkWrapper = document.getElementById('location-detail-link-wrapper');
                if (linkWrapper) {
                  linkWrapper.setAttribute('data-location-id', firstLocation.id);
                }
                
                // 画像の更新
                const imageContainer = document.getElementById('selected-location-images');
                if (imageContainer) {
                  imageContainer.innerHTML = '';
                  firstLocation.images.forEach((img, i) => {
                    const imgEl = document.createElement('div');
                    imgEl.className = "aspect-square bg-gray-100 rounded overflow-hidden group";
                    imgEl.innerHTML = \`<img src="\${img}" alt="\${firstLocation.label} - \${i+1}" class="w-full h-full object-cover transition duration-500 group-hover:scale-105" onerror="this.onerror=null;this.src='/placeholder.png';" />\`;
                    imageContainer.appendChild(imgEl);
                  });
                }
                
                // 詳細カードを表示
                document.getElementById('location-detail').classList.remove('hidden');
                
                // 広島のリスト項目に選択状態のスタイルを適用
                const hiroshimaItem = document.querySelector('.bg-white.rounded-xl.shadow-md.overflow-hidden.mb-12.p-4 .grid > div[data-id="hiroshima"]');
                if (hiroshimaItem) {
                  hiroshimaItem.classList.add('bg-gray-100');
                }
              }
              
              // ページロード後に実行
              window.addEventListener('load', initializeLocationDetail);
              // 一応DOMContentLoadedでも実行
              document.addEventListener('DOMContentLoaded', initializeLocationDetail);
              // 即時実行も試す
              setTimeout(initializeLocationDetail, 500);
            `
          }}></script>
          
          {/* 選択された場所の詳細 */}
          <div id="location-detail" className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <div className="border-b pb-6 mb-8">
              <div className="flex items-center gap-3">
                <span id="selected-location-year" className="text-sm tracking-wider text-gray-500">1998</span>
                <span id="selected-location-country" className="text-sm uppercase tracking-wider text-gray-500">日本</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <h2 id="selected-location-title" className="text-3xl font-bold tracking-wide">広島</h2>
                <div id="location-detail-link-wrapper">
                  <a 
                    href="#"
                    className="text-base font-medium text-gray-800 hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      // URLを取得（最初は広島を表示）
                      const locationId = document.getElementById('location-detail-link-wrapper')?.getAttribute('data-location-id') || 'hiroshima';
                      // 詳細ページへ遷移
                      window.location.href = `/exhibition/location/${locationId}`;
                    }}
                  >
                    詳細ページへ
                  </a>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="lg:w-1/3">
                <p id="selected-location-description" className="text-lg text-gray-700 leading-relaxed">
                  伝統と革新が交差する街で生まれる新しい表現
                </p>
                
                <p className="text-lg text-gray-700 leading-relaxed mt-4">
                  風景や文化、人々の表情から生まれるインスピレーションは、
                  作品の色彩や構図、テーマに深く影響しています。
                  特にこの地域で感じた光と影のコントラスト、
                  自然と都市の共存する風景は、
                  新たな表現方法を模索するきっかけとなりました。
                </p>
                
                <p className="text-lg text-gray-700 leading-relaxed mt-4">
                  この場所での体験は、制作活動における
                  重要な転機となり、以降の作品における
                  視点や感性に変化をもたらしました。
                </p>
                

              </div>
              
              <div className="lg:w-2/3">
                <h3 className="text-xl font-medium mb-6 text-gray-800">アーティスト活動の記録</h3>
                <div id="selected-location-images" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 初期表示用の画像 */}
                  <div className="aspect-square bg-gray-100 rounded overflow-hidden group">
                    <img src="/images/hiroshima_1.jpg" alt="広島 - 1" className="w-full h-full object-cover transition duration-500 group-hover:scale-105" onError={(e) => { const img = e.target as HTMLImageElement; img.onerror = null; img.src = '/placeholder.png'; }} />
                  </div>
                  <div className="aspect-square bg-gray-100 rounded overflow-hidden group">
                    <img src="/images/hiroshima_2.jpg" alt="広島 - 2" className="w-full h-full object-cover transition duration-500 group-hover:scale-105" onError={(e) => { const img = e.target as HTMLImageElement; img.onerror = null; img.src = '/placeholder.png'; }} />
                  </div>
                  {/* 画像はJavaScriptで動的に挿入 */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voices Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold mb-16 text-center tracking-wider">VOICES</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              image: "/13452.jpg",
              name: "小島 和人",
              title: "高砂熱学工業株式会社　代表取締役社長",
              quote: "社内に飾られているのをみてとても好きになりました。よく息子と水族館に行ったので思い入れもあります。"
            },
            {
              image: "/13457.jpg",
              name: "千本倖生",
              title: "KDDI／ワイモバイル設立者・連続起業家",
              quote: "大変素晴らしい絵をありがとう。いつも見ていて心が和みます。別荘ができたら飾ります。"
            },
            {
              image: "/13454.jpg",
              name: "資産家・投資家",
              title: "",
              quote: "どれもおしゃれで気に入りました。特に女の子可愛いです。エジソンのような天才が描いた絵！将来1億円になるかもしれないですね。"
            },
            {
              image: "/images/dog1.jpg",
              name: "パリ雑誌メディア経営者・実業家",
              title: "フランス　ディジョン",
              quote: "isseiの\"心\"とともに朝食を。子犬は生きる自信をくれます！"
            },
            {
              image: "/attached_assets/image2.jpeg",
              name: "川村 明美",
              title: "地方中核産科病院院長夫人",
              quote: "夫の病院に飾られた作品が、多くの妊婦さんや新米ママたちに元気を与えています。特に明るい色使いと優しいタッチが、不安を抱える方々の心を和ませてくれる素晴らしいアートです。"
            },
            {
              image: "/attached_assets/dkajeiow92.png",
              name: "佐々木 健一",
              title: "医療系専門誌記者",
              quote: "医療施設におけるアートの癒し効果に関する取材で訪れた病院で初めて作品に出会いました。患者さんとスタッフの双方から高い評価を得ており、医療環境の質向上に貢献している好例です。"
            }
          ].map((voice, index) => (
            <ScrollToTopLink href="/voices" key={index}>
              <div className="grid grid-cols-1 rounded-xl shadow-xl overflow-hidden cursor-pointer">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={voice.image}
                    alt={`Voice by ${voice.name}`}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.onerror = null;
                      img.src = '/placeholder.png';
                    }}
                  />
                </div>
                <div className="p-6 bg-white">
                  <p className="text-lg font-medium mb-4 text-gray-800">
                    "{voice.quote}"
                  </p>
                  <div className="h-px w-12 bg-gray-300 mb-4" />
                  <div className="space-y-1">
                    <p className="font-medium">{voice.name}</p>
                    <p className="text-sm text-gray-600">{voice.title}</p>
                  </div>
                </div>
              </div>
            </ScrollToTopLink>
          ))}
        </div>
      </section>

      {/* Featured Works */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold mb-16 text-center tracking-wider">FEATURED WORKS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            {
              src: "/artworks/LINE_ALBUM_20241124 _2_241208_1.jpg",
              title: "Vibrant Architecture"
            },
            {
              src: "/artworks/LINE_ALBUM_20241124 _2_241208_2.jpg",
              title: "Abstract Portrait"
            },
            {
              src: "/artworks/image.jpg",
              title: "Purple Dreams"
            }
          ].map((work, index) => (
            <div 
              key={index} 
              className="group relative aspect-square overflow-hidden rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 z-10" />
              <img
                src={work.src}
                alt={work.title}
                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.onerror = null;
                  img.src = '/placeholder.png';
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-white text-lg font-medium">{work.title}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button 
            asChild 
            variant="outline" 
            size="lg" 
            className="tracking-wider hover:bg-primary hover:text-white transition-colors duration-300"
          >
            <ScrollToTopLink href="/artworks">View All Works</ScrollToTopLink>
          </Button>
        </div>
      </section>

      {/* Collections */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold mb-16 text-center tracking-wider">COLLECTIONS</h2>
        <div className="space-y-20">
          <div className="space-y-20">
            {/* Collections Display */}
            <CollectionsSection />
          </div>
          <div className="text-center">
            <Button asChild variant="outline" size="lg" className="tracking-wider">
              <ScrollToTopLink href="/collections">View All Collections</ScrollToTopLink>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;