import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
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
  // 東京・新宿
  'tokyo-shinjuku': {
    id: 'tokyo-shinjuku',
    title: '東京・新宿',
    country: '日本',
    year: '2002',
    description: '都市の活力とエネルギーが交差する創造的空間',
    longDescription: `新宿は、伝統と革新が共存する東京の中心地として、アーティストに刺激的な創作環境を提供します。

    2002年、私は新宿の多様性と活気からインスピレーションを得て、色彩豊かな抽象画シリーズを制作しました。日々変化する都市の表情と、そこに生きる人々の多様な物語が作品の根底にあります。
    
    昼と夜で異なる顔を見せる新宿の街並み、雑多な看板や光の洪水、そして静かな公園や路地裏など、対照的な要素が交錯する場所での経験が、私の色彩感覚と構図に大きな影響を与えました。

    この時期に制作した作品では、都市の喧騒と孤独、人々の交流と分断といった現代社会の二面性を、鮮やかな色彩のコントラストと抽象的な形態で表現することを試みています。`,
    images: [
      { url: '/tokyo_shinjuku_1.jpg', caption: '抽象画：都市の色彩と形' },
      { url: '/tokyo_shinjuku_2.jpg', caption: '抽象的構成：円と曲線の調和' },
      { url: '/tokyo_shinjuku_3.jpg', caption: '色彩の交差：ネオンカラーの抽象画' }
    ],
    relatedLocations: [
      { id: 'tokyo-ikebukuro', title: '東京・池袋', image: '/artworks/12648.jpg' },
      { id: 'tokyo-okubo', title: '東京・大久保', image: '/artworks/12658.jpg' }
    ]
  },
  // 東京・赤坂
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
    year: '1998',
    description: '平和と再生のメッセージを表現する街',
    longDescription: `広島は深い歴史的背景と平和への強い願いを持つ都市として、アーティストに特別な視点を提供します。
    
    過去の悲劇を乗り越え、平和と再生を象徴する街として発展した広島では、私は「記憶」と「希望」をテーマにした作品制作に取り組みました。
    
    平和記念公園や原爆ドームを訪れ、静かに佇む時間の中で、人間の回復力と平和を求める普遍的な願いについて深く考えさせられました。同時に、活気ある現代都市として成長を続ける広島の姿は、再生と希望の力強いメッセージを伝えています。
    
    この対比が私の作品における「記憶と再生」というテーマの探求につながっています。広島滞在中に制作した作品では、過去を忘れずに未来に向かって歩む人間の強さを表現することを試みました。`,
    images: [
      { url: '/hiroshima_1.jpg', caption: '静物画：茶色のバッグと花' },
      { url: '/hiroshima_2.jpg', caption: '時計と黄色いレモンの静物画' }
    ],
    relatedLocations: [
      { id: 'fukuyama', title: '福山', image: '/12670.jpg' },
      { id: 'kyoto', title: '京都', image: '/12660.jpg' }
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
    year: '2019',
    description: '砂漠の国で開催した個展での作品展示',
    longDescription: `アブダビは砂漠と海に囲まれた未来志向の都市として、伝統と革新の興味深い融合を見せています。
    
    2019年、私はアブダビで初めての個展を開催する機会に恵まれました。中東の文化と日本のポップアートを融合させた作品シリーズを展示し、多くの現地のアート愛好家や国際的な来場者からの反響を得ることができました。
    
    この展示では特に「POKO FACE」シリーズが注目を集め、カラフルな色彩とシンプルな表情のキャラクターが多文化が交差するアブダビという都市の雰囲気とマッチし、新しい対話を生み出すことができました。
    
    中東という新しい文化圏での展示経験は、自分の作品が持つ普遍性と文化的背景について考え直すきっかけとなり、その後の創作活動に大きな影響を与えています。
    
    また、この展示をきっかけに中東地域のアートコレクターとの繋がりが生まれ、継続的な文化交流の機会へと発展しています。`,
    images: [
      { url: '/abu_dhabi_1.jpg', caption: 'アブダビでの個展にて「POKO FACE」シリーズと共に' }
    ],
    relatedLocations: [
      { id: 'london', title: 'ロンドン', image: '/images/12675.jpg' },
      { id: 'nice', title: 'ニース', image: '/images/10820.jpg' }
    ]
  },
  // 東京・池袋
  'tokyo-ikebukuro': {
    id: 'tokyo-ikebukuro',
    title: '東京・池袋',
    country: '日本',
    year: '2018',
    description: '都会の喧騒の中で生まれるポップアートの世界',
    longDescription: `池袋は東京の主要な商業・エンターテイメント地区として、多様な文化が交差するクリエイティブな空間です。

    2018年、私は池袋で新しいスタイルのポップアートシリーズに取り組みました。鮮やかな色彩と愛らしいキャラクター表現を通じて、都市の中の癒しと遊び心を表現しています。
    
    この時期の作品では、シンプルな形と鮮やかな色のコントラストを用いて、複雑な都市生活の中での純粋さや喜びの瞬間を切り取ることを試みました。
    
    特に、日常の中で見落とされがちな小さな幸せや、都会の中の安らぎを象徴的なキャラクターと色彩で表現することで、見る人に笑顔をもたらす作品を目指しました。
    
    池袋のサブカルチャーシーンからも大きな影響を受け、アニメやマンガの表現手法を自分のアート言語として取り入れる実験的な試みも行いました。`,
    images: [
      { url: '/tokyo_ikebukuro_1.jpg', caption: 'ピンクの世界に浮かぶ愛らしい表情' },
      { url: '/tokyo_ikebukuro_2.jpg', caption: '色彩豊かな猫のポップアート' }
    ],
    relatedLocations: [
      { id: 'tokyo-akasaka', title: '東京・赤坂', image: '/12653.jpg' },
      { id: 'tokyo-okubo', title: '東京・大久保', image: '/12658.jpg' }
    ]
  },
  // 東京・大久保
  'tokyo-okubo': {
    id: 'tokyo-okubo',
    title: '東京・大久保',
    country: '日本',
    year: '2022',
    description: '多様な文化が混ざり合う場所からインスピレーションを得る',
    longDescription: `大久保は東京における国際色豊かな地域として知られ、多様な文化が共存する独特の雰囲気を持っています。
    
    韓国料理店や東南アジアの食材店が立ち並ぶ通りを歩くと、日本にいながらにして海外の空気を感じることができます。この文化的多様性は、私の創作活動において重要なインスピレーション源となっています。
    
    大久保での滞在中、私は異なる文化が交わる瞬間や、共存する多様性の中に生まれる新しい表現に注目しました。特に印象的だったのは、異なる背景を持つ人々が互いの文化を尊重しながら共に生きる姿です。
    
    多国籍の料理や音楽、そして言語が混ざり合う風景は、私の作品における「境界」と「融合」の概念の再考につながりました。大久保のカラフルな街並みや、様々な香辛料の香りが漂う市場の光景は、色彩や質感に関する新たな表現を模索するきっかけとなっています。
    
    この地域での体験は、文化的アイデンティティと創造性の関係について考察する機会となり、作品における多層的な表現の探求に大きな影響を与えています。`,
    images: [
      { url: '/images/12658.jpg', caption: '多国籍の店舗が並ぶ大久保通り' },
      { url: '/images/12659.jpg', caption: '韓国料理店の軒先の風景' },
      { url: '/images/12660.jpg', caption: 'カラフルな市場の様子' },
      { url: '/images/12661.jpg', caption: '国際色豊かな祭りの一コマ' },
      { url: '/images/12662.jpg', caption: '多様な文化が表現された壁画' }
    ],
    relatedLocations: [
      { id: 'tokyo-ikebukuro', title: '東京・池袋', image: '/images/12648.jpg' },
      { id: 'tokyo-shibuya', title: '東京・渋谷', image: '/images/12659.jpg' }
    ]
  },
  // ノルマンディー
  'normandy': {
    id: 'normandy',
    title: 'ノルマンディー',
    country: 'フランス',
    year: '2019',
    description: '歴史と自然が織りなす風景からのインスピレーション',
    longDescription: `ノルマンディーはフランス北西部に位置し、豊かな歴史と印象的な自然景観を持つ地域です。
    
    断崖絶壁の海岸線、緑豊かな田園風景、そして第二次世界大戦の歴史的な遺跡が点在するこの地域は、アーティストにとって多層的なインスピレーション源となっています。
    
    ノルマンディー滞在中、私は特に自然と人間の歴史との関係性に注目しました。エトルタの荘厳な白亜の崖や、オンフルールの絵画的な港町、そしてノルマンディー上陸作戦のビーチなど、時間と記憶が刻まれた風景は、私の作品における「時間」と「記憶」のテーマ探求に深い影響を与えています。
    
    印象派の画家たちも愛したノルマンディーの光の変化は、特に朝霧や夕暮れ時に独特の雰囲気を醸し出し、色彩と光の表現に関する新たな試みへとつながりました。
    
    また、地元の人々の日常生活や伝統的な市場の光景、そして季節ごとに変化する農村風景は、「ノスタルジア」と「永続性」についての考察を深める機会となりました。`,
    images: [
      { url: '/images/12669.jpg', caption: 'エトルタの断崖と自然のアーチ' },
      { url: '/images/12670.jpg', caption: 'オンフルールの港町の風景' },
      { url: '/images/12671.jpg', caption: 'ノルマンディー上陸作戦のビーチ' },
      { url: '/images/2266.jpg', caption: '霧に包まれた田園風景' },
      { url: '/images/2914.jpg', caption: '伝統的な農家の建物' }
    ],
    relatedLocations: [
      { id: 'paris', title: 'パリ', image: '/images/12680.jpg' },
      { id: 'nice', title: 'ニース', image: '/images/10820.jpg' }
    ]
  },
  // アティスモンス
  'atis-mons': {
    id: 'atis-mons',
    title: 'アティスモンス',
    country: 'フランス',
    year: '2019',
    description: 'フランス郊外の静かな村での集中的な創作期間',
    longDescription: `アティスモンスはパリ郊外に位置する静かな町で、都会の喧騒を離れた集中的な創作環境を提供してくれました。
    
    歴史的な建造物と現代的な都市計画が共存するこの地域での滞在は、「都市と郊外」「中心と周縁」という概念について考察する貴重な機会となりました。
    
    アティスモンスでの日々は、特に創作のリズムと日常の観察に焦点を当てていました。朝の散歩で出会う地元の人々や、市場での交流、そして季節の移り変わりを敏感に捉える時間は、作品の深みと持続性を考える上で重要な経験となりました。
    
    この地域の住宅建築や公共空間のデザインも興味深く、特に1960年代から70年代にかけて建設された集合住宅群は、モダニズム建築と生活空間の関係性について考察するきっかけとなりました。
    
    また、アティスモンスの小さな美術館や文化センターでの展示や地元のアーティストとの交流は、フランスにおける地方の文化活動の重要性を認識する機会となり、私自身のアーティストとしての役割についても再考する時間となりました。`,
    images: [
      { url: '/images/12666.jpg', caption: 'アティスモンスの静かな住宅街' },
      { url: '/images/12667.jpg', caption: '地元の小さな広場' },
      { url: '/images/12668.jpg', caption: '郊外の公園の風景' },
      { url: '/images/3446.jpg', caption: '週末の市場の様子' },
      { url: '/images/3525.jpg', caption: '60年代の集合住宅' }
    ],
    relatedLocations: [
      { id: 'paris', title: 'パリ', image: '/images/12680.jpg' },
      { id: 'saint-hilaire-andre', title: 'サンティレースアンドレシス', image: '/images/7853.jpg' }
    ]
  },
  // サンティレースアンドレシス
  'saint-hilaire-andre': {
    id: 'saint-hilaire-andre',
    title: 'サンティレースアンドレシス',
    country: 'フランス',
    year: '2018',
    description: '中世の面影を残す村での滞在制作',
    longDescription: `サンティレースアンドレシスは中世の面影を色濃く残すフランスの小さな村で、時間がゆっくりと流れる静謐な環境が印象的な場所です。
    
    石造りの古い家々、中世の教会、そして周囲に広がるぶどう畑や農地の風景は、歴史と自然が調和した独特の雰囲気を醸し出しています。
    
    この村での滞在中、私は特に「時間の層」と「場所の記憶」というテーマに注目しました。何世紀にもわたって変わらず残る石の質感や、季節の移り変わりとともに変化する光と影のパターンは、作品における時間性と物質性の表現に大きな影響を与えています。
    
    村の小さな教会の内部にある中世の壁画や石像は、西洋美術の伝統と現代表現の接点について考察する機会となりました。
    
    また、地元の伝統的な祭りや日常的な農作業の風景は、コミュニティと創造性の関係、そして場所に根ざした芸術の意義について再考するきっかけとなりました。時にはぶどう畑で働く農家の方々や、パン屋、鍛冶屋など伝統的な職人との交流も、手仕事と芸術の深い関係性を感じさせるものでした。`,
    images: [
      { url: '/images/7853.jpg', caption: '石造りの村の通り' },
      { url: '/images/7855.jpg', caption: '中世の教会の内部' },
      { url: '/images/8594.jpg', caption: '村を囲むぶどう畑の風景' },
      { url: '/images/3730.jpg', caption: '伝統的な村の祭りの様子' },
      { url: '/images/2914.jpg', caption: '古い石造りの家の細部' }
    ],
    relatedLocations: [
      { id: 'atis-mons', title: 'アティスモンス', image: '/images/12666.jpg' },
      { id: 'bourges', title: 'ブールジュ', image: '/images/3446.jpg' }
    ]
  },
  // ブールジュ
  'bourges': {
    id: 'bourges',
    title: 'ブールジュ',
    country: 'フランス',
    year: '2018',
    description: 'ゴシック建築に囲まれた創作体験',
    longDescription: `ブールジュはフランス中部に位置する歴史的な都市で、特に壮麗なゴシック様式の大聖堂で知られています。
    
    中世の面影を色濃く残す旧市街と、その中心に聳え立つサン・テティエンヌ大聖堂は、西洋建築の歴史と美を体現する壮大な存在です。
    
    ブールジュでの滞在中、私はゴシック建築の空間構成と光の演出に特に注目しました。大聖堂のステンドグラスを通して射し込む光が作り出す神秘的な空間体験は、光と色彩に関する新たな表現の可能性を示唆するものでした。
    
    また、旧市街の狭い路地や木組みの家々、そして中世の城壁に囲まれた都市構造は、「閉じた空間と開かれた空間」「内部と外部」という空間概念について考察する機会となりました。
    
    この地域での美術館訪問や現地のアーティストとの交流も刺激的で、特にブールジュの現代美術館での展示は、歴史的文脈における現代表現の位置づけについて再考するきっかけとなりました。
    
    毎年開催される音楽祭「ブールジュの春」に触れる機会もあり、音楽と視覚芸術の接点についても新たな視点を得ることができました。`,
    images: [
      { url: '/images/3446.jpg', caption: 'ブールジュ大聖堂の全景' },
      { url: '/images/3525.jpg', caption: '大聖堂のステンドグラス' },
      { url: '/images/3730.jpg', caption: '中世の旧市街の通り' },
      { url: '/images/2266.jpg', caption: '木組みの伝統的な建物' },
      { url: '/images/2914.jpg', caption: '音楽祭「ブールジュの春」の様子' }
    ],
    relatedLocations: [
      { id: 'saint-hilaire-andre', title: 'サンティレースアンドレシス', image: '/images/7853.jpg' },
      { id: 'chaumont', title: 'ショーモン城', image: '/images/2266.jpg' }
    ]
  },
  // ショーモン城
  'chaumont': {
    id: 'chaumont',
    title: 'ショーモン城',
    country: 'フランス',
    year: '2017',
    description: '歴史的な城での特別展示プロジェクト',
    longDescription: `ショーモン城はロワール渓谷に位置する15世紀の城で、毎年国際ガーデンフェスティバルが開催されることでも知られる歴史的建造物です。
    
    中世の城塞建築と美しく整備された庭園が調和するこの場所は、歴史と現代アートが交差する独特の空間体験を提供してくれました。
    
    ショーモン城での特別展示プロジェクトに参加する機会を得た私は、歴史的文脈における現代表現の可能性に挑戦しました。特に、城の建築構造と現代アートのインスタレーションの対話は、時間と空間の重層性を探求する上で貴重な経験となりました。
    
    城内の展示スペースだけでなく、広大な庭園を舞台にした野外インスタレーションも手がけ、自然環境や季節の変化と作品の関係性について考察を深めることができました。
    
    また、国際的なアーティストやランドスケープデザイナーとの協働は、異なる文化や専門分野を横断する創造的対話の重要性を再認識する機会となりました。
    
    歴史的建造物としての城と、一時的な現代アートの共存は、「永続性と一過性」「伝統と革新」といった二項対立を超えた新たな表現領域の可能性を示唆しています。`,
    images: [
      { url: '/images/2266.jpg', caption: 'ショーモン城の全景' },
      { url: '/images/2914.jpg', caption: '国際ガーデンフェスティバルの展示' },
      { url: '/images/3316.jpg', caption: '城内での現代アート展示' },
      { url: '/images/3446.jpg', caption: 'ロワール川から見た城の風景' },
      { url: '/images/3525.jpg', caption: '特別展示プロジェクトの様子' }
    ],
    relatedLocations: [
      { id: 'bourges', title: 'ブールジュ', image: '/images/3446.jpg' },
      { id: 'chambord', title: 'シャンボール城', image: '/images/IMG_7161.jpg' }
    ]
  },
  // シャンボール城
  'chambord': {
    id: 'chambord',
    title: 'シャンボール城',
    country: 'フランス',
    year: '2017',
    description: 'ルネサンス建築の傑作の中での芸術体験',
    longDescription: `シャンボール城はフランス・ルネサンス建築の最高傑作の一つとして知られ、その壮大な規模と革新的なデザインは今なお多くの訪問者を魅了しています。
    
    フランソワ1世の命により16世紀に建設されたこの城は、レオナルド・ダ・ヴィンチの影響を受けたとされる二重螺旋階段など、当時の最先端の建築技術と芸術性を体現しています。
    
    シャンボール城での滞在中、私はルネサンス期の空間概念や幾何学的構成に特に注目しました。城の対称性と数学的調和、そして自然光の取り入れ方は、私の作品における空間構成と光の扱いに新たな視点をもたらしました。
    
    また、城を取り囲む広大な森林と庭園は、自然と人工の関係性について考察する機会となりました。特に、幾何学的に設計された庭園と周囲の野生的な森林の対比は、秩序と自由の共存という芸術的テーマへのインスピレーションとなっています。
    
    城内で開催された現代美術展に参加できたことも貴重な経験で、歴史的建造物と現代表現の対話を通して、時間を超えた芸術の継続性と変容について理解を深めることができました。
    
    シャンボール城の持つ壮大さと繊細さの共存は、私の作品における「スケールの操作」や「細部と全体の関係」について再考するきっかけとなりました。`,
    images: [
      { url: '/images/IMG_7161.jpg', caption: 'シャンボール城の壮大な外観' },
      { url: '/images/IMG_7162.jpg', caption: '有名な二重螺旋階段' },
      { url: '/images/IMG_7163.jpg', caption: '城を取り囲む庭園と森林' },
      { url: '/images/IMG_7164.jpg', caption: '屋上から見た幾何学的な建築デザイン' },
      { url: '/images/IMG_7165.jpg', caption: '城内での現代美術展の様子' }
    ],
    relatedLocations: [
      { id: 'chaumont', title: 'ショーモン城', image: '/images/2266.jpg' },
      { id: 'paris', title: 'パリ', image: '/images/12680.jpg' }
    ]
  }
};

const LocationDetail: React.FC = () => {
  // URLからロケーションIDを直接取得 - 末尾から取得する形式に修正
  const path = window.location.pathname;
  // exhibition/location/:locationId 形式から正確にlocationIdを抽出
  const match = path.match(/\/exhibition\/location\/([^\/]+)$/);
  const locationId = match ? match[1] : null;
  
  const [location, setLocation] = useState<LocationData | null>(null);
  
  console.log("LocationDetail - URL path:", path);
  console.log("LocationDetail - Extracted locationId from URL:", locationId);

  useEffect(() => {
    console.log("LocationDetail with locationId:", locationId);
    
    if (locationId && locationsData[locationId]) {
      console.log("Found location data for:", locationId);
      setLocation(locationsData[locationId]);
      window.scrollTo(0, 0);
    } else {
      // Handle case when location data not found
      console.log("No location data found for:", locationId);
      console.log("Available locations:", Object.keys(locationsData));
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
      
      {/* 関連する場所セクションは削除 */}
    </div>
  );
};

export default LocationDetail;