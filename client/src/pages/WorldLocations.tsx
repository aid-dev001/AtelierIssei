import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Globe, Navigation } from "lucide-react";

// 場所の情報を定義する型
type Location = {
  id: string;
  country: string;
  label: string;
  description?: string;
};

// 全ての場所を定義
const LOCATIONS: Location[] = [
  // 日本
  { 
    id: "tokyo-akasaka", 
    country: "日本",
    label: "東京・赤坂",
    description: "伝統と革新が交差する街で生まれる新しい表現" 
  },
  { 
    id: "tokyo-ikebukuro", 
    country: "日本",
    label: "東京・池袋",
    description: "都会の喧騒の中で見つけた静寂を表現するアトリエ" 
  },
  { 
    id: "tokyo-okubo", 
    country: "日本",
    label: "東京・大久保",
    description: "多様な文化が混ざり合う場所からインスピレーションを得る" 
  },
  { 
    id: "hiroshima", 
    country: "日本",
    label: "広島",
    description: "平和への祈りと再生をテーマにした作品の制作拠点" 
  },
  { 
    id: "fukuyama", 
    country: "日本",
    label: "福山",
    description: "瀬戸内の光と風を感じる穏やかな創作空間" 
  },
  
  // UAE
  { 
    id: "abu-dhabi", 
    country: "UAE",
    label: "アブダビ",
    description: "砂漠の国で出会った光と影のコントラスト" 
  },
  
  // イギリス
  { 
    id: "london", 
    country: "イギリス",
    label: "ロンドン",
    description: "古典と現代が融合する街での芸術探求" 
  },
  
  // フランス
  { 
    id: "paris", 
    country: "フランス",
    label: "パリ",
    description: "芸術の都で培われた感性と表現" 
  },
  { 
    id: "nice", 
    country: "フランス",
    label: "ニース",
    description: "地中海の陽光に照らされた色彩の研究" 
  },
  { 
    id: "atis-mons", 
    country: "フランス",
    label: "アティスモンス",
    description: "フランス郊外の静かな村での集中的な創作期間" 
  },
  { 
    id: "normandy", 
    country: "フランス",
    label: "ノルマンディー",
    description: "歴史と自然が織りなす風景からのインスピレーション" 
  },
  { 
    id: "saint-hilaire-andre", 
    country: "フランス",
    label: "サンティレースアンドレシス",
    description: "中世の面影を残す村での滞在制作" 
  },
  { 
    id: "bourges", 
    country: "フランス",
    label: "ブールジュ",
    description: "ゴシック建築に囲まれた創作体験" 
  },
  { 
    id: "chaumont", 
    country: "フランス",
    label: "ショーモン城",
    description: "歴史的な城での特別展示プロジェクト" 
  },
  { 
    id: "chambord", 
    country: "フランス",
    label: "シャンボール城",
    description: "ルネサンス建築の傑作の中での芸術体験" 
  },
];

// 各場所の画像データを定義
const LOCATION_IMAGES: Record<string, string[]> = {
  "tokyo-akasaka": ["/artworks/12653.jpg", "/artworks/12654.jpg", "/artworks/12655.jpg"],
  "tokyo-ikebukuro": ["/artworks/12648.jpg", "/artworks/12649.jpg", "/artworks/12650.jpg"],
  "tokyo-okubo": ["/artworks/12658.jpg", "/artworks/12659.jpg", "/artworks/12660.jpg"],
  "hiroshima": ["/12672.jpg", "/12673.jpg", "/12674.jpg"],
  "fukuyama": ["/12675.jpg", "/12676.jpg", "/12677.jpg"],
  "abu-dhabi": ["/12678.jpg", "/12679.jpg", "/12680.jpg"],
  "london": ["/10819.jpg", "/10820.jpg", "/10821.jpg"],
  "paris": ["/10822.jpg", "/10823.jpg", "/12662.jpg"],
  "nice": ["/12663.jpg", "/12664.jpg", "/12665.jpg"],
  "atis-mons": ["/12666.jpg", "/12667.jpg", "/12668.jpg"],
  "normandy": ["/12669.jpg", "/12670.jpg", "/12671.jpg"],
  "saint-hilaire-andre": ["/7853.jpg", "/7855.jpg", "/8594.jpg"],
  "bourges": ["/3446.jpg", "/3525.jpg", "/3730.jpg"],
  "chaumont": ["/2266.jpg", "/2914.jpg", "/3316.jpg"],
  "chambord": ["/IMG_7161.jpg", "/IMG_7162.jpg", "/IMG_7163.jpg"],
};

// 国別にグループ化
const COUNTRIES = Array.from(new Set(LOCATIONS.map(loc => loc.country)));

const WorldLocations = () => {
  // デフォルトで最初のロケーションを選択状態にする
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(LOCATIONS[0]);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  
  const filteredLocations = selectedCountry === "all" 
    ? LOCATIONS 
    : LOCATIONS.filter(loc => loc.country === selectedCountry);
    
  // 国が変更されたとき、その国の最初のロケーションを選択する
  useEffect(() => {
    if (filteredLocations.length > 0) {
      setSelectedLocation(filteredLocations[0]);
    } else {
      setSelectedLocation(null);
    }
  }, [selectedCountry, filteredLocations]);

  // 国別にグループ化した場所のリストを作成
  const locationsByCountry = LOCATIONS.reduce((acc, location) => {
    if (!acc[location.country]) {
      acc[location.country] = [];
    }
    acc[location.country].push(location);
    return acc;
  }, {} as Record<string, Location[]>);

  return (
    <div className="space-y-12 pb-20">
      <section className="bg-gray-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-12 tracking-wider text-gray-800">WORLD LOCATIONS</h1>
            <p className="text-xl text-gray-700 leading-relaxed font-medium max-w-2xl mx-auto">
              世界各地で取り組んだプロジェクトとインスピレーションを得た場所。
              それぞれの地で感じた空気感や文化的影響が作品に反映されています。
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* 国フィルタータブ */}
        <Tabs defaultValue="all" value={selectedCountry} onValueChange={setSelectedCountry} className="mb-8">
          <TabsList className="flex flex-wrap justify-center">
            <TabsTrigger value="all">すべて</TabsTrigger>
            {COUNTRIES.map(country => (
              <TabsTrigger key={country} value={country}>{country}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {/* 超シンプルなリスト表示 - PC表示で複数列 */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-12 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
            {filteredLocations.map((location) => (
              <div 
                key={location.id}
                className={`cursor-pointer hover:bg-gray-50 transition-colors rounded px-3 py-2 ${
                  selectedLocation?.id === location.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => setSelectedLocation(location)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{location.label}</span>
                  <span className="text-sm text-gray-500">2022</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 選択された場所の詳細情報 - シンプルでおしゃれなデザイン */}
        {selectedLocation && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <div className="border-b pb-6 mb-8">
              <div className="flex items-center gap-3">
                <span className="text-sm uppercase tracking-wider text-gray-500">{selectedLocation.country}</span>
                <span className="text-sm tracking-wider text-gray-500">2022</span>
              </div>
              <h2 className="text-3xl font-bold tracking-wide mt-1">{selectedLocation.label}</h2>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="lg:w-1/3">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {selectedLocation.description || `${selectedLocation.label}でのアーティスト活動や訪問を通じて得られた
                  インスピレーションや文化的な影響が作品に反映されています。
                  この地域特有の雰囲気や景観、人々との交流が
                  創作プロセスに大きな影響を与えています。`}
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
                {LOCATION_IMAGES[selectedLocation.id] && LOCATION_IMAGES[selectedLocation.id].length > 0 ? (
                  <div>
                    <h3 className="text-xl font-medium mb-6 text-gray-800">アーティスト活動の記録</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {LOCATION_IMAGES[selectedLocation.id].map((image, i) => (
                        <div 
                          key={i} 
                          className="aspect-square bg-gray-100 rounded overflow-hidden group"
                        >
                          <img 
                            src={image} 
                            alt={`${selectedLocation.label} - ${i+1}`}
                            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded p-6 text-center text-gray-500">
                    この場所の画像はまだ追加されていません
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!selectedLocation && (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <p className="text-xl text-gray-600">
              上のカードをクリックすると、詳細情報と画像が表示されます。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldLocations;