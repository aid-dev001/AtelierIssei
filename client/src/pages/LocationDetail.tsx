import React, { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { Separator } from '@/components/ui/separator';

type LocationImage = {
  url: string;
  caption: string;
};

type LocationData = {
  id: string;
  title: string;
  country: string;
  year: string;
  description: string;
  longDescription: string;
  images: LocationImage[];
  relatedLocations?: {
    id: string;
    title: string;
    image: string;
  }[];
};

const locationsData: Record<string, LocationData> = {
  'tokyo-akasaka': {
    id: 'tokyo-akasaka',
    title: '東京・赤坂',
    country: '日本',
    year: '2022',
    description: '伝統と革新が交差する街で生まれる新しい表現',
    longDescription: `赤坂は伝統的な日本文化と現代的な都市景観が交差する場所です。
    
    古くからの歴史と洗練された現代の要素が共存するこの地域は、アーティストにとって創造性を刺激する環境を提供しています。
    
    赤坂での滞在中、私は日本の繊細な美意識と現代的な洗練さが混ざり合う瞬間を捉えることに焦点を当てました。伝統的な和の空間と現代建築が並存する風景、そして四季の移り変わりを敏感に捉える日本の感性は、私の作品に深い影響を与えています。
    
    特に印象的だったのは、早朝の静寂の中で見た光と影の美しい調和でした。西洋と東洋の美意識が融合する瞬間を探求し、そこから生まれる新しい美のかたちを模索しています。`,
    images: [
      { url: '/images/12653.jpg', caption: '赤坂の朝霧に包まれた庭園' },
      { url: '/images/12654.jpg', caption: '現代建築と伝統的な要素の対比' },
      { url: '/images/12655.jpg', caption: '夕暮れ時の赤坂の都市風景' },
      { url: '/images/12656.jpg', caption: '伝統的な日本建築の細部' },
      { url: '/images/12657.jpg', caption: '秋の赤坂、落ち葉と現代建築' },
      { url: '/images/12658.jpg', caption: '雨上がりの赤坂の石畳' }
    ],
    relatedLocations: [
      { id: 'tokyo-shibuya', title: '東京・渋谷', image: '/images/12659.jpg' },
      { id: 'kyoto', title: '京都', image: '/images/12660.jpg' }
    ]
  },
  'tokyo-shibuya': {
    id: 'tokyo-shibuya',
    title: '東京・渋谷',
    country: '日本',
    year: '2021',
    description: '都市のエネルギーと若者文化の交差点',
    longDescription: `渋谷は東京の若者文化と革新の中心地であり、常に変化し続ける都市の活力を体現しています。
    
    世界的に有名なスクランブル交差点、ファッションの最前線、音楽、アート、テクノロジーが融合する場所として、渋谷は刺激的な創造のエネルギーに満ちています。
    
    滞在中、私はこの都市の絶え間ない動きと変化、そして多様な人々の交流から生まれる創造性に焦点を当てました。デジタルとアナログが混在する風景、24時間活動し続ける都市のリズム、そして若者たちの自己表現の自由さは、私の作品における動きと色彩の探求に大きな影響を与えています。
    
    特に夜の渋谷は、ネオンの光が織りなす抽象的な風景として、私の新しい色彩表現の源泉となりました。伝統と革新、秩序と混沌が同時に存在するこの場所は、現代社会の複雑さを表現する上で重要なインスピレーションを提供しています。`,
    images: [
      { url: '/images/12659.jpg', caption: '夜のスクランブル交差点' },
      { url: '/images/12660.jpg', caption: '渋谷の街並みと人々の流れ' },
      { url: '/images/12661.jpg', caption: 'ネオンに彩られた渋谷の夜景' },
      { url: '/images/12662.jpg', caption: '雨の日の渋谷、傘の風景' },
      { url: '/images/12663.jpg', caption: '若者文化を象徴するストリートアート' }
    ],
    relatedLocations: [
      { id: 'tokyo-akasaka', title: '東京・赤坂', image: '/images/12653.jpg' },
      { id: 'osaka', title: '大阪', image: '/images/12664.jpg' }
    ]
  },
  'hiroshima': {
    id: 'hiroshima',
    title: '広島',
    country: '日本',
    year: '2020',
    description: '平和と再生のメッセージを表現する街',
    longDescription: `広島は深い歴史的背景と平和への強い願いを持つ都市として、アーティストに特別な視点を提供します。
    
    過去の悲劇を乗り越え、平和と再生を象徴する街として発展した広島では、私は「記憶」と「希望」をテーマにした作品制作に取り組みました。
    
    平和記念公園や原爆ドームを訪れ、静かに佇む時間の中で、人間の回復力と平和を求める普遍的な願いについて深く考えさせられました。同時に、活気ある現代都市として成長を続ける広島の姿は、再生と希望の力強いメッセージを伝えています。
    
    この対比が私の作品における「記憶と再生」というテーマの探求につながっています。広島滞在中に制作した作品では、過去を忘れずに未来に向かって歩む人間の強さを表現することを試みました。`,
    images: [
      { url: '/images/12665.jpg', caption: '平和記念公園の朝の風景' },
      { url: '/images/12666.jpg', caption: '原爆ドームと川の反射' },
      { url: '/images/12667.jpg', caption: '現代的な広島の街並み' },
      { url: '/images/12668.jpg', caption: '広島城と周辺の公園' },
      { url: '/images/12669.jpg', caption: '夕暮れ時の平和記念公園' }
    ],
    relatedLocations: [
      { id: 'fukuyama', title: '福山', image: '/images/12670.jpg' },
      { id: 'kyoto', title: '京都', image: '/images/12660.jpg' }
    ]
  },
  'fukuyama': {
    id: 'fukuyama',
    title: '福山',
    country: '日本',
    year: '2020',
    description: '伝統と現代が調和する静かな港町',
    longDescription: `福山は瀬戸内海に面した歴史ある港町として、独自の文化的景観を持っています。
    
    福山城を中心とした歴史的建造物と、現代的な都市機能が調和するこの街では、日本の地方都市の静かな魅力を探究しました。
    
    滞在中、私は地元の人々の日常生活や伝統工芸、そして瀬戸内海の穏やかな風景から多くのインスピレーションを得ました。特に印象的だったのは、朝もやに包まれた港の風景や、夕日に照らされる福山城のシルエットでした。
    
    また、鞆の浦などの歴史的な港町を訪れることで、時間の流れの中で変わらない日本の原風景についても考察を深めました。この体験は、私の作品における「時間」と「場所」の関係性の探求に大きな影響を与えています。`,
    images: [
      { url: '/images/12670.jpg', caption: '朝霧に包まれた福山港' },
      { url: '/images/12671.jpg', caption: '福山城と周辺の風景' },
      { url: '/images/12672.jpg', caption: '鞆の浦の歴史的な街並み' },
      { url: '/images/12673.jpg', caption: '瀬戸内海に沈む夕日' },
      { url: '/images/12674.jpg', caption: '地元の祭りの様子' }
    ],
    relatedLocations: [
      { id: 'hiroshima', title: '広島', image: '/images/12665.jpg' },
      { id: 'tokyo-akasaka', title: '東京・赤坂', image: '/images/12653.jpg' }
    ]
  },
  'london': {
    id: 'london',
    title: 'ロンドン',
    country: 'イギリス',
    year: '2019',
    description: '歴史と革新が共存する文化の中心地',
    longDescription: `ロンドンは数世紀にわたる歴史と最先端の現代文化が共存する都市として、アーティストに無限のインスピレーションを提供します。
    
    テムズ川沿いの歴史的建造物から、ショーディッチやイーストロンドンの最新アートシーンまで、ロンドンの多様性は私の作品に新たな視点をもたらしました。
    
    滞在中、私は主要な美術館や現代アートギャラリーを訪れ、西洋美術の歴史と現代の実験的アプローチの両方に触れる機会を得ました。特にテート・モダンでの展示は、産業的空間と現代アートの対話という点で強い印象を残しています。
    
    また、多文化共生社会であるロンドンの多様な人々との交流は、私の作品における「アイデンティティ」と「境界」の概念の探求に大きな影響を与えています。雨の日のロンドンの街並み、歴史的建築物の陰影、そして都市の喧騒と静寂の対比は、新しい表現方法の模索につながりました。`,
    images: [
      { url: '/images/12675.jpg', caption: '霧に包まれたテムズ川とビッグベン' },
      { url: '/images/12676.jpg', caption: 'ショーディッチのストリートアート' },
      { url: '/images/12677.jpg', caption: 'テート・モダンからの眺め' },
      { url: '/images/12678.jpg', caption: '雨の日のロンドン橋' },
      { url: '/images/12679.jpg', caption: 'ノッティングヒルのカラフルな建物' }
    ],
    relatedLocations: [
      { id: 'paris', title: 'パリ', image: '/images/12680.jpg' },
      { id: 'abu-dhabi', title: 'アブダビ', image: '/images/12685.jpg' }
    ]
  },
  'paris': {
    id: 'paris',
    title: 'パリ',
    country: 'フランス',
    year: '2018',
    description: '光と芸術の都市が織りなす創造的空間',
    longDescription: `パリは「光の都市」として知られ、芸術と文化の中心地として長い歴史を持っています。
    
    セーヌ川沿いの歴史的建造物、世界的に有名な美術館、そして独特の都市景観は、多くのアーティストに影響を与えてきました。
    
    私のパリ滞在は、特に光と影の表現、そして都市空間における人間の存在について考察する機会となりました。ルーブル美術館やオルセー美術館での古典から近代までの芸術作品との対話は、私自身の芸術的アプローチを再考する貴重な経験となりました。
    
    モンマルトルやマレ地区などの芸術的地区を散策しながら、私はパリの持つ独特の雰囲気や色彩、そして日常の中の美を捉えようと試みました。カフェでの人々の交流、公園での静かな瞬間、そして夕暮れ時のセーヌ川の輝きは、私の色彩表現と光の扱い方に大きな影響を与えています。`,
    images: [
      { url: '/images/12680.jpg', caption: '朝日に照らされるエッフェル塔' },
      { url: '/images/12681.jpg', caption: 'モンマルトルの街並みと画家たち' },
      { url: '/images/12682.jpg', caption: 'セーヌ川の夕暮れ' },
      { url: '/images/12683.jpg', caption: 'マレ地区の路地裏' },
      { url: '/images/10819.jpg', caption: 'リュクサンブール公園の秋の風景' }
    ],
    relatedLocations: [
      { id: 'london', title: 'ロンドン', image: '/images/12675.jpg' },
      { id: 'nice', title: 'ニース', image: '/images/10820.jpg' }
    ]
  },
  'nice': {
    id: 'nice',
    title: 'ニース',
    country: 'フランス',
    year: '2018',
    description: '地中海の光と色彩が融合する南仏の宝石',
    longDescription: `ニースは南フランスの地中海沿岸に位置し、独特の光と鮮やかな色彩で知られる都市です。
    
    マティスやシャガールなど多くの芸術家に影響を与えてきたこの地域の光は、私の色彩表現に新たな可能性をもたらしました。
    
    滞在中、私はプロムナード・デ・ザングレ沿いの鮮やかな青い海と空、旧市街の温かみのあるオレンジや赤のトーンの建物、そして周辺の山々の緑のコントラストに魅了されました。この地域特有の光の質は、色彩の透明感と深みを表現する新しい技法の探求につながりました。
    
    また、マティス美術館やシャガール美術館を訪れることで、これらの巨匠たちがニースの光と風景からどのようにインスピレーションを得たかを理解し、自分自身の作品における光と色の関係性についての考察を深めることができました。`,
    images: [
      { url: '/images/10820.jpg', caption: '地中海の青い海とプロムナード・デ・ザングレ' },
      { url: '/images/10821.jpg', caption: 'ニース旧市街の色彩豊かな建物' },
      { url: '/images/10822.jpg', caption: '丘の上からのニース全景' },
      { url: '/images/10823.jpg', caption: '朝市の色とりどりの光景' },
      { url: '/images/3316.jpg', caption: '夕日に染まるニースの港' }
    ],
    relatedLocations: [
      { id: 'paris', title: 'パリ', image: '/images/12680.jpg' },
      { id: 'abu-dhabi', title: 'アブダビ', image: '/images/12685.jpg' }
    ]
  },
  'abu-dhabi': {
    id: 'abu-dhabi',
    title: 'アブダビ',
    country: 'アラブ首長国連邦',
    year: '2017',
    description: '伝統と未来が交差する砂漠の現代都市',
    longDescription: `アブダビは砂漠と海に囲まれた未来志向の都市として、伝統と革新の興味深い融合を見せています。
    
    壮大な建築物、砂漠の広大な風景、そして豊かな文化的伝統が共存するこの都市での滞在は、私の作品における「コントラスト」と「調和」の探求に大きな影響を与えました。
    
    特にシェイク・ザイード・グランドモスクの荘厳な白い建築と繊細な装飾、ルーブル・アブダビの革新的な建築と光の演出は、私の造形表現に新たな視点をもたらしました。
    
    また、都市の近代的なスカイラインと砂漠の永遠性のコントラスト、昼の強烈な日差しと夜の穏やかな雰囲気の変化は、光と影、時間と空間の関係性について考察する機会となりました。
    
    アラブ首長国連邦の多文化社会における伝統と現代の共存は、私の作品テーマにおける「アイデンティティ」と「変容」の探求にも重要な示唆を与えています。`,
    images: [
      { url: '/images/12685.jpg', caption: 'シェイク・ザイード・グランドモスクの夕景' },
      { url: '/images/3446.jpg', caption: 'ルーブル・アブダビの特徴的な屋根と光の演出' },
      { url: '/images/3525.jpg', caption: '砂漠の風景と近代的な建築の対比' },
      { url: '/images/3730.jpg', caption: 'コーニッシュからのアブダビのスカイライン' },
      { url: '/images/2914.jpg', caption: '伝統的なアラビアンマーケット' }
    ],
    relatedLocations: [
      { id: 'london', title: 'ロンドン', image: '/images/12675.jpg' },
      { id: 'nice', title: 'ニース', image: '/images/10820.jpg' }
    ]
  }
};

const LocationDetail: React.FC = () => {
  const { locationId } = useParams();
  const [location, setLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    if (locationId && locationsData[locationId]) {
      setLocation(locationsData[locationId]);
      window.scrollTo(0, 0);
    }
  }, [locationId]);

  if (!location) {
    return (
      <div className="container mx-auto px-4 py-20 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">場所が見つかりません</h1>
        <p>指定された場所の情報は見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm tracking-wider text-gray-500">{location.year}</span>
          <span className="text-sm uppercase tracking-wider text-gray-500">{location.country}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">{location.title}</h1>
        <p className="text-xl text-gray-700">{location.description}</p>
      </div>

      <Separator className="my-8" />
      
      {/* メインビジュアル */}
      <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100 mb-12">
        <img 
          src={location.images[0]?.url || '/placeholder.png'} 
          alt={location.images[0]?.caption || location.title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.onerror = null;
            img.src = '/placeholder.png';
          }}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        {/* 詳細文章 */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-6">アーティスト活動の記録</h2>
          <div className="prose prose-lg max-w-none">
            {location.longDescription.split('\n\n').map((paragraph, i) => (
              <p key={i} className="mb-4">{paragraph.trim()}</p>
            ))}
          </div>
        </div>
        
        {/* サイドバー情報 */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-medium mb-4">詳細情報</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">場所</dt>
                <dd className="font-medium">{location.title}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">国</dt>
                <dd className="font-medium">{location.country}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">訪問年</dt>
                <dd className="font-medium">{location.year}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      
      {/* 写真ギャラリー */}
      <h2 className="text-2xl font-semibold mb-6">写真ギャラリー</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {location.images.map((image, index) => (
          <div key={index} className="group">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
              <img 
                src={image.url} 
                alt={image.caption} 
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.onerror = null;
                  img.src = '/placeholder.png';
                }}
              />
            </div>
            <p className="text-sm text-gray-600">{image.caption}</p>
          </div>
        ))}
      </div>
      
      {/* 関連する場所 */}
      {location.relatedLocations && location.relatedLocations.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-6">関連する場所</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {location.relatedLocations.map((related, index) => (
              <a 
                key={index} 
                href={`/exhibition/location/${related.id}`}
                className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img 
                    src={related.image} 
                    alt={related.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.onerror = null;
                      img.src = '/placeholder.png';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{related.title}</h3>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LocationDetail;