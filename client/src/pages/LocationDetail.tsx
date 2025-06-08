import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";

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
  "tokyo-shinjuku": {
    id: "tokyo-shinjuku",
    title: "東京・新宿",
    country: "日本",
    year: "2002",
    description: "都市の活力とエネルギーが交差する創造的空間",
    longDescription: `新宿は、伝統と革新が共存する東京の中心地として、アーティストに刺激的な創作環境を提供します。

    2002年、私は新宿の多様性と活気からインスピレーションを得て、色彩豊かな抽象画シリーズを制作しました。日々変化する都市の表情と、そこに生きる人々の多様な物語が作品の根底にあります。
    
    昼と夜で異なる顔を見せる新宿の街並み、雑多な看板や光の洪水、そして静かな公園や路地裏など、対照的な要素が交錯する場所での経験が、私の色彩感覚と構図に大きな影響を与えました。

    この時期に制作した作品では、都市の喧騒と孤独、人々の交流と分断といった現代社会の二面性を、鮮やかな色彩のコントラストと抽象的な形態で表現することを試みています。`,
    images: [
      {
        url: "/images/tokyo_shinjuku_1.jpg",
        caption: "抽象画：都市の色彩と形",
      },
      {
        url: "/images/tokyo_shinjuku_2.jpg",
        caption: "抽象的構成：円と曲線の調和",
      },
      {
        url: "/images/tokyo_shinjuku_3.jpg",
        caption: "色彩の交差：ネオンカラーの抽象画",
      },
    ],
    relatedLocations: [
      {
        id: "tokyo-ikebukuro",
        title: "東京・池袋",
        image: "/artworks/12648.jpg",
      },
      {
        id: "tokyo-okubo",
        title: "東京・大久保",
        image: "/artworks/12658.jpg",
      },
    ],
  },
  // 東京・赤坂
  "tokyo-akasaka": {
    id: "tokyo-akasaka",
    title: "東京・赤坂",
    country: "日本",
    year: "2022",
    description: "伝統と革新が交差する街で生まれる新しい表現",
    longDescription: `赤坂は伝統的な日本文化と現代的な都市景観が交差する場所です。
    
    古くからの歴史と洗練された現代の要素が共存するこの地域は、アーティストにとって創造性を刺激する環境を提供しています。
    
    赤坂での滞在中、私は日本の繊細な美意識と現代的な洗練さが混ざり合う瞬間を捉えることに焦点を当てました。伝統的な和の空間と現代建築が並存する風景、そして四季の移り変わりを敏感に捉える日本の感性は、私の作品に深い影響を与えています。
    
    特に印象的だったのは、早朝の静寂の中で見た光と影の美しい調和でした。西洋と東洋の美意識が融合する瞬間を探求し、そこから生まれる新しい美のかたちを模索しています。`,
    images: [
      {
        url: "/images/akasaka_1.jpg",
        caption: "水色の髪の少女「POKO FACE」シリーズ",
      },
      {
        url: "/images/akasaka_2.jpg",
        caption: "壁面展示されたPOKO FACEコレクション",
      },
      {
        url: "/images/akasaka_3.jpg",
        caption: "ピンクと青の顔「POKO FACE」シリーズ",
      },
    ],
    relatedLocations: [
      { id: "tokyo-okubo", title: "東京・大久保", image: "/tokyo_okubo_1.jpg" },
      {
        id: "tokyo-ikebukuro",
        title: "東京・池袋",
        image: "/tokyo_ikebukuro_1.jpg",
      },
    ],
  },
  "tokyo-shibuya": {
    id: "tokyo-shibuya",
    title: "東京・渋谷",
    country: "日本",
    year: "2021",
    description: "都市のエネルギーと若者文化の交差点",
    longDescription: `渋谷は東京の若者文化と革新の中心地であり、常に変化し続ける都市の活力を体現しています。
    
    世界的に有名なスクランブル交差点、ファッションの最前線、音楽、アート、テクノロジーが融合する場所として、渋谷は刺激的な創造のエネルギーに満ちています。
    
    滞在中、私はこの都市の絶え間ない動きと変化、そして多様な人々の交流から生まれる創造性に焦点を当てました。デジタルとアナログが混在する風景、24時間活動し続ける都市のリズム、そして若者たちの自己表現の自由さは、私の作品における動きと色彩の探求に大きな影響を与えています。
    
    特に夜の渋谷は、ネオンの光が織りなす抽象的な風景として、私の新しい色彩表現の源泉となりました。伝統と革新、秩序と混沌が同時に存在するこの場所は、現代社会の複雑さを表現する上で重要なインスピレーションを提供しています。`,
    images: [
      { url: "/images/12659.jpg", caption: "夜のスクランブル交差点" },
      { url: "/images/12660.jpg", caption: "渋谷の街並みと人々の流れ" },
      { url: "/images/12661.jpg", caption: "ネオンに彩られた渋谷の夜景" },
      { url: "/images/12662.jpg", caption: "雨の日の渋谷、傘の風景" },
      {
        url: "/images/12663.jpg",
        caption: "若者文化を象徴するストリートアート",
      },
    ],
    relatedLocations: [
      { id: "tokyo-akasaka", title: "東京・赤坂", image: "/images/12653.jpg" },
      { id: "osaka", title: "大阪", image: "/images/12664.jpg" },
    ],
  },
  hiroshima: {
    id: "hiroshima",
    title: "広島",
    country: "日本",
    year: "1998",
    description: "平和と再生のメッセージを表現する街",
    longDescription: `広島は深い歴史的背景と平和への強い願いを持つ都市として、アーティストに特別な視点を提供します。
    
    中学校の授業で、油画を描いていた祖父の影響で美術を選択し、初めて油画を描く経験をしました。この経験が私の芸術への道を開くきっかけとなりました。
    
    過去の悲劇を乗り越え、平和と再生を象徴する街として発展した広島では、私は「記憶」と「希望」をテーマにした作品制作に取り組みました。
    
    平和記念公園や原爆ドームを訪れ、静かに佇む時間の中で、人間の回復力と平和を求める普遍的な願いについて深く考えさせられました。同時に、活気ある現代都市として成長を続ける広島の姿は、再生と希望の力強いメッセージを伝えています。
    
    この対比が私の作品における「記憶と再生」というテーマの探求につながっています。広島滞在中に制作した作品では、過去を忘れずに未来に向かって歩む人間の強さを表現することを試みました。`,
    images: [
      { url: "/images/S__9044006.jpg", caption: "静物画：茶色のバッグと花" },
      { url: "/images/S__9044005.jpg", caption: "時計と黄色いレモンの静物画" },
    ],
    relatedLocations: [
      { id: "fukuyama", title: "福山", image: "/images/12670.jpg" },
      { id: "kyoto", title: "京都", image: "/images/12660.jpg" },
    ],
  },
  fukuyama: {
    id: "fukuyama",
    title: "福山",
    country: "日本",
    year: "2024",
    description: "福山こころの病院での愛と癒しをテーマにした作品展示",
    longDescription: `福山市は瀬戸内海に面した歴史ある街ですが、2024年には医療福祉の現場での芸術活動に焦点を当てた新たな取り組みを行いました。
    
    福山こころの病院との特別コラボレーションでは、愛と癒しをテーマにした「ハートアート」作品を制作・寄贈する機会に恵まれました。病院の医師やスタッフの方々と共に、アートの持つ癒しの力を医療現場に取り入れる意義について意見交換を行いました。
    
    鮮やかなピンク色の重なり合うハートは、人と人とのつながりや思いやりを表現し、見る人に温かさと前向きな気持ちをもたらすことを意図しています。淡い青色の背景は心の平穏を象徴し、全体として希望と癒しのメッセージを伝えています。
    
    医療の現場にアートを取り入れることで、患者さんの心の支えとなり、また医療スタッフの方々の癒しの空間づくりにも貢献できることを実感しました。この経験は、アートの社会的役割について改めて考える貴重な機会となりました。`,
    images: [
      {
        url: "/images/13456_0.jpg",
        caption: "福山こころの病院での作品贈呈の様子",
      },
    ],
    relatedLocations: [
      { id: "hiroshima", title: "広島", image: "/images/hiroshima_1.jpg" },
      {
        id: "tokyo-akasaka",
        title: "東京・赤坂",
        image: "/images/tokyo_akasaka_1.jpg",
      },
    ],
  },
  london: {
    id: "london",
    title: "ロンドン",
    country: "イギリス",
    year: "2019",
    description: "歴史と革新が共存する文化の中心地",
    longDescription: `ロンドンは数世紀にわたる歴史と最先端の現代文化が共存する都市として、アーティストに無限のインスピレーションを提供します。
    
    テムズ川沿いの歴史的建造物から、ショーディッチやイーストロンドンの最新アートシーンまで、ロンドンの多様性は私の作品に新たな視点をもたらしました。
    
    滞在中、私は主要な美術館や現代アートギャラリーを訪れ、西洋美術の歴史と現代の実験的アプローチの両方に触れる機会を得ました。特にテート・モダンでの展示は、産業的空間と現代アートの対話という点で強い印象を残しています。
    
    また、多文化共生社会であるロンドンの多様な人々との交流は、私の作品における「アイデンティティ」と「境界」の概念の探求に大きな影響を与えています。雨の日のロンドンの街並み、歴史的建築物の陰影、そして都市の喧騒と静寂の対比は、新しい表現方法の模索につながりました。`,
    images: [
      {
        url: "/images/スクリーンショット 2025-05-25 23.21.59.png",
        caption: "ロンドンの街並みと芸術作品",
      },
    ],
    relatedLocations: [
      { id: "paris", title: "パリ", image: "/images/12680.jpg" },
      { id: "abu-dhabi", title: "アブダビ", image: "/images/12685.jpg" },
    ],
  },
  paris: {
    id: "paris",
    title: "パリ第一回",
    country: "フランス",
    year: "2019",
    description: "芸術の都で開催した初個展での作品展示",
    longDescription: `パリは「光の都市」として知られ、芸術と文化の中心地として世界中のアーティストを魅了してきました。
    
    2019年、私はパリで念願の初個展を開催する機会に恵まれました。パリ市内のGallery Art.Cで「POKO FACE」シリーズを中心とした展示を行い、フランスと日本の文化的架け橋となる貴重な経験をすることができました。
    
    この展示では、カラフルな背景の中に浮かぶシンプルな表情のキャラクターたちが、言語や文化の壁を超えて来場者と共鳴し、予想以上の反響をいただきました。特に、エッフェル塔をモチーフにした作品は、パリの象徴と私のアート表現が融合した特別な一枚として注目されました。
    
    フランスの芸術愛好家やギャラリスト、そして現地在住の日本人アーティストとの交流は、国際的な視点で自分の作品を捉え直す貴重な機会となり、その後の創作活動に大きな影響を与えています。
    
    パリでの初個展の成功は、私の創作活動における重要なマイルストーンとなり、その後の国際的な展開への確かな一歩となりました。`,
    images: [
      { url: "/images/paris_1.jpg", caption: "パリのGallery Art.C外観" },
      {
        url: "/images/paris_2.jpg",
        caption: "ギャラリーのウィンドウに展示された「POKO FACE」シリーズ",
      },
      {
        url: "/images/paris_3.jpg",
        caption: "ギャラリー内の壁面に展示された9枚の「POKO FACE」作品",
      },
    ],
    relatedLocations: [
      { id: "london", title: "ロンドン", image: "/images/12675.jpg" },
      {
        id: "nice",
        title: "ニース",
        image: "/images/スクリーンショット 2025-05-25 19.23.37.png",
      },
    ],
  },
  nice: {
    id: "nice",
    title: "ニース",
    country: "フランス",
    year: "2018",
    description: "地中海の光と色彩が融合する南仏の宝石",
    longDescription: `ニースは南フランスの地中海沿岸に位置し、独特の光と鮮やかな色彩で知られる都市です。
    
    マティスやシャガールなど多くの芸術家に影響を与えてきたこの地域の光は、私の色彩表現に新たな可能性をもたらしました。
    
    滞在中、私はプロムナード・デ・ザングレ沿いの鮮やかな青い海と空、旧市街の温かみのあるオレンジや赤のトーンの建物、そして周辺の山々の緑のコントラストに魅了されました。この地域特有の光の質は、色彩の透明感と深みを表現する新しい技法の探求につながりました。
    
    また、マティス美術館やシャガール美術館を訪れることで、これらの巨匠たちがニースの光と風景からどのようにインスピレーションを得たかを理解し、自分自身の作品における光と色の関係性についての考察を深めることができました。`,
    images: [
      {
        url: "/images/スクリーンショット 2025-05-25 19.23.37.png",
        caption: "地中海の青い海とプロムナード・デ・ザングレ",
      },
      {
        url: "/images/スクリーンショット 2025-05-25 19.23.54.png",
        caption: "ニース旧市街の色彩豊かな建物",
      },
      {
        url: "/images/スクリーンショット 2025-05-25 19.24.12.png",
        caption: "丘の上からのニース全景",
      },
    ],
    relatedLocations: [
      { id: "paris", title: "パリ", image: "/images/12680.jpg" },
      { id: "abu-dhabi", title: "アブダビ", image: "/images/12685.jpg" },
    ],
  },
  "abu-dhabi": {
    id: "abu-dhabi",
    title: "アブダビ",
    country: "アラブ首長国連邦",
    year: "2019",
    description: "砂漠の国で開催した個展での作品展示",
    longDescription: `アブダビは砂漠と海に囲まれた未来志向の都市として、伝統と革新の興味深い融合を見せています。
    
    2019年、私はアブダビで初めての個展を開催する機会に恵まれました。中東の文化と日本のポップアートを融合させた作品シリーズを展示し、多くの現地のアート愛好家や国際的な来場者からの反響を得ることができました。
    
    この展示では特に「POKO FACE」シリーズが注目を集め、カラフルな色彩とシンプルな表情のキャラクターが多文化が交差するアブダビという都市の雰囲気とマッチし、新しい対話を生み出すことができました。
    
    中東という新しい文化圏での展示経験は、自分の作品が持つ普遍性と文化的背景について考え直すきっかけとなり、その後の創作活動に大きな影響を与えています。
    
    また、この展示をきっかけに中東地域のアートコレクターとの繋がりが生まれ、継続的な文化交流の機会へと発展しています。`,
    images: [
      {
        url: "/images/abu_dhabi_1.jpg",
        caption: "アブダビでの個展にて「POKO FACE」シリーズと共に",
      },
    ],
    relatedLocations: [
      { id: "london", title: "ロンドン", image: "/images/12675.jpg" },
      { id: "nice", title: "ニース", image: "/images/10820.jpg" },
    ],
  },
  // 東京・池袋
  "tokyo-ikebukuro": {
    id: "tokyo-ikebukuro",
    title: "東京・池袋",
    country: "日本",
    year: "2018",
    description: "都会の喧騒の中で生まれるポップアートの世界",
    longDescription: `池袋は東京の主要な商業・エンターテイメント地区として、多様な文化が交差するクリエイティブな空間です。

    2018年、私は池袋で新しいスタイルのポップアートシリーズに取り組みました。鮮やかな色彩と愛らしいキャラクター表現を通じて、都市の中の癒しと遊び心を表現しています。
    
    この時期の作品では、シンプルな形と鮮やかな色のコントラストを用いて、複雑な都市生活の中での純粋さや喜びの瞬間を切り取ることを試みました。
    
    特に、日常の中で見落とされがちな小さな幸せや、都会の中の安らぎを象徴的なキャラクターと色彩で表現することで、見る人に笑顔をもたらす作品を目指しました。
    
    池袋のサブカルチャーシーンからも大きな影響を受け、アニメやマンガの表現手法を自分のアート言語として取り入れる実験的な試みも行いました。`,
    images: [
      {
        url: "/images/tokyo_ikebukuro_1.jpg",
        caption: "ピンクの世界に浮かぶ愛らしい表情",
      },
      {
        url: "/images/tokyo_ikebukuro_2.jpg",
        caption: "色彩豊かな猫のポップアート",
      },
      { url: "/tokyo_ikebukuro3.jpg", caption: "アトリエでの作品制作風景と東京の街並み" },
    ],
    relatedLocations: [
      { id: "tokyo-akasaka", title: "東京・赤坂", image: "/images/12653.jpg" },
      { id: "tokyo-okubo", title: "東京・大久保", image: "/images/12658.jpg" },
    ],
  },
  // 東京・大久保
  "tokyo-okubo": {
    id: "tokyo-okubo",
    title: "東京・大久保",
    country: "日本",
    year: "2019",
    description: "多様な文化が混ざり合うギャラリーでの作品展示",
    longDescription: `大久保は東京における国際色豊かな地域として知られ、多様な文化が共存する独特の雰囲気を持っています。
    
    2019年、私は大久保のアートギャラリーでポップアートシリーズの小規模展示を行いました。韓国や中国、東南アジアなど多様な文化背景を持つ来場者と交流することで、新しいアート表現の可能性を探ることができました。
    
    この展示では特に「POKO ANIMAL」シリーズの作品が注目を集め、シンプルな形と鮮やかな色彩が言語や文化の壁を超えて多くの人々とコミュニケーションを取ることができました。
    
    大久保の多様性に満ちた環境は、アーティストとしての視野を広げる貴重な機会となりました。異なる価値観や美意識に触れることで、自分の作品がどのように様々な文化背景を持つ人々に受け止められるかを直接体験することができました。
    
    この経験は私の作品における「親しみやすさ」と「普遍性」のテーマ探求に大きな影響を与え、文化の違いを超えた視覚言語としてのアートの可能性についての考察を深めるきっかけとなりました。`,
    images: [
      {
        url: "/images/tokyo_okubo_1.jpg",
        caption: "大久保ギャラリーでの「POKO ANIMAL」シリーズ展示風景",
      },
    ],
    relatedLocations: [
      {
        id: "tokyo-ikebukuro",
        title: "東京・池袋",
        image: "/images/tokyo_ikebukuro_1.jpg",
      },
      {
        id: "tokyo-shinjuku",
        title: "東京・新宿",
        image: "/images/tokyo_shinjuku_1.jpg",
      },
    ],
  },
  // ノルマンディー
  normandy: {
    id: "normandy",
    title: "フランス・ノルマンディー",
    country: "フランス",
    year: "2023",
    description: "歴史と自然が織りなす風景からのインスピレーション",
    longDescription: `ノルマンディーはフランス北西部に位置し、豊かな歴史と印象的な自然景観を持つ地域です。2023年、私は歴史的な修道院を改装した文化施設でアート作品を展示する機会に恵まれました。
    
    石造りの美しい中庭を持つこの施設は、歴史と現代アートが融合する特別な空間でした。アーチ型の回廊に囲まれた中庭では、自然光と建築美が織りなす独特の雰囲気の中で作品展示が行われました。
    
    ノルマンディー滞在中、私は特に自然と人間の歴史との関係性に注目しました。エトルタの荘厳な白亜の崖や、オンフルールの絵画的な港町、そしてノルマンディー上陸作戦のビーチなど、時間と記憶が刻まれた風景は、私の作品における「時間」と「記憶」のテーマ探求に深い影響を与えています。
    
    印象派の画家たちも愛したノルマンディーの光の変化は、特に朝霧や夕暮れ時に独特の雰囲気を醸し出し、色彩と光の表現に関する新たな試みへとつながりました。
    
    また、地元の人々の日常生活や伝統的な市場の光景、そして季節ごとに変化する農村風景は、「ノスタルジア」と「永続性」についての考察を深める機会となりました。`,
    images: [
      {
        url: "/images/montmartre_1.jpg",
        caption: "修道院を改装した文化施設の中庭",
      },
      { url: "/images/montmartre_2.jpg", caption: "オンフルールの港町の風景" },
    ],
    relatedLocations: [
      { id: "paris-second", title: "パリ第二回", image: "/paris_second_1.jpg" },
      {
        id: "france-savigny",
        title: "フランス・サヴィニー",
        image: "/france_savigny_1.jpg",
      },
    ],
  },
  // アティスモンス
  "atis-mons": {
    id: "atis-mons",
    title: "アティスモンス",
    country: "フランス",
    year: "2022",
    description: "フランス郊外の静かな村での集中的な創作期間",
    longDescription: `アティスモンスはパリ郊外に位置する静かな町で、都会の喧騒を離れた集中的な創作環境を提供してくれました。
    
    歴史的な建造物と現代的な都市計画が共存するこの地域での滞在は、「都市と郊外」「中心と周縁」という概念について考察する貴重な機会となりました。
    
    アティスモンスでの日々は、特に創作のリズムと日常の観察に焦点を当てていました。朝の散歩で出会う地元の人々や、市場での交流、そして季節の移り変わりを敏感に捉える時間は、作品の深みと持続性を考える上で重要な経験となりました。
    
    この地域の住宅建築や公共空間のデザインも興味深く、特に1960年代から70年代にかけて建設された集合住宅群は、モダニズム建築と生活空間の関係性について考察するきっかけとなりました。
    
    また、アティスモンスの小さな美術館や文化センターでの展示や地元のアーティストとの交流は、フランスにおける地方の文化活動の重要性を認識する機会となり、私自身のアーティストとしての役割についても再考する時間となりました。`,
    images: [
      {
        url: "/attached_assets/1928320.png",
        caption: "アティスモンスの文化センター外観",
      },
      {
        url: "/attached_assets/23611_0.jpg",
        caption: "「POKO FACE」シリーズの展示風景",
      },
      {
        url: "/attached_assets/23615_0.jpg",
        caption: "地元の方々との交流会の様子",
      },
    ],
    relatedLocations: [
      { id: "paris-second", title: "パリ第二回", image: "/paris_second_1.jpg" },
      {
        id: "atis-mons-church",
        title: "フランス・アティスモンス教会",
        image: "/atis_mons_church_2.jpg",
      },
    ],
  },

  // 東京・東新宿
  "tokyo-higashi-shinjuku": {
    id: "tokyo-higashi-shinjuku",
    title: "東京・東新宿",
    country: "日本",
    year: "2023",
    description: "都市の夜景に映えるポップアートの展示",
    longDescription: `東京・東新宿は、東京の中心部に位置する多様な文化とサブカルチャーが交差するエリアです。
    
    2023年、このエリアでポップアートを中心とした展示会を開催する機会に恵まれました。都市の夜景とネオンの輝きを背景に、「POKO FACE」シリーズの新作を展示し、多くの若いアート愛好家たちとの交流が生まれました。
    
    この展示では特に、紫とピンクのトーンを基調とした宇宙的な背景に浮かぶキャラクターや、黒地に浮かぶカラフルなモチーフを用いた作品が注目を集めました。東新宿のアンダーグラウンドな雰囲気と都市の活気が、作品の鮮やかな色彩と絶妙にマッチしていました。
    
    夜の東新宿を彩るネオンサインや看板の光は、私の作品における色彩の輝きと都市の美学を探求する上で重要なインスピレーション源となりました。都市の持つエネルギーと創造性を反映した展示は、予想以上の反響を得ることができました。
    
    若い世代のアーティストやクリエイターとの交流は、現代のデジタル文化とアートの関係性について新たな視点をもたらし、SNSを通じた作品の共有と拡散の可能性についても考える機会となりました。`,
    images: [
      {
        url: "/attached_assets/LINE_ALBUM_20241124_250525_234.jpg",
        caption: "「Atelier Issei」のキャラクターデザイン",
      },
      {
        url: "/attached_assets/LINE_ALBUM_20241124_250525_233.jpg",
        caption: "紫髪の少女とカラフルなリボンモチーフ",
      },
      {
        url: "/attached_assets/LINE_ALBUM_20241124_250525_238.jpg",
        caption: "青髪の少女と「Atelier Issei」ロゴ",
      },
    ],
    relatedLocations: [
      { id: "tokyo-shibuya", title: "東京・渋谷", image: "/images/12659.jpg" },
      {
        id: "tokyo-akasaka",
        title: "東京・赤坂",
        image: "/images/akasaka_1.jpg",
      },
    ],
  },
  // フランス・アティスモンス教会
  "atis-mons-church": {
    id: "atis-mons-church",
    title: "フランス・アティスモンス教会",
    country: "フランス",
    year: "2023",
    description: "歴史的な教会を舞台にした特別展示会",
    longDescription: `2023年、私はアティスモンスの歴史的な教会を会場とした特別なアート展示会に参加する機会に恵まれました。この美しい石造りの教会は、現代アートと歴史的建造物が融合する独特の空間を提供してくれました。
    
    数世紀の歴史を持つこの教会は、現在はアート施設としても活用されており、古いステンドグラスが現代アートと共存する興味深い対比が生まれています。高い天井と神聖な雰囲気の中で、私の「POKO FACE」シリーズの作品は新たな文脈で捉えられる体験となりました。
    
    展示では、教会の白い壁面に並べられた鮮やかな色彩のポートレートが、来場者の目を引きました。特に青を基調としたバナー作品は、垂直に吊るされることで教会の空間の高さを強調し、作品と空間の対話を生み出すことができました。
    
    地元の芸術愛好家や観光客、そして教会関係者との交流は、芸術と信仰、伝統と革新といったテーマについて考える貴重な機会となりました。歴史的建造物の中での現代アート展示は、時間を超えた対話を生み出し、作品に新たな意味と解釈をもたらすことを実感しました。
    
    この経験は、場所と作品の関係性、そして展示空間が鑑賞体験にもたらす影響について、より深く考察するきっかけとなりました。`,
    images: [
      {
        url: "/images/1731420256.jpg",
        caption: "アティスモンス教会での展示風景と「POKO FACE」バナー作品",
      },
      {
        url: "/images/スクリーンショット 2025-05-25 23.14.20.png",
        caption: "石造りの歴史的な教会の外観",
      },
      {
        url: "/images/スクリーンショット 2025-05-25 23.15.16.png",
        caption: "展示されたポートレート作品群",
      },
    ],
    relatedLocations: [
      {
        id: "atis-mons",
        title: "アティスモンス",
        image: "/attached_assets/1928320.png",
      },
      {
        id: "normandy",
        title: "フランス・ノルマンディー",
        image: "/images/montmartre_1.jpg",
      },
    ],
  },
  // フランス・ティレーヌアンドレシス
  "saint-hilaire-andre": {
    id: "saint-hilaire-andre",
    title: "フランス・ティレーヌアンドレシス教会",
    country: "フランス",
    year: "2024",
    description: "中世の面影を残す村での滞在制作",
    longDescription: `フランス・ティレーヌアンドレシスは中世の面影を色濃く残すフランスの小さな村で、時間がゆっくりと流れる静謐な環境が印象的な場所です。
    
    石造りの古い家々、中世の教会、そして周囲に広がるぶどう畑や農地の風景は、歴史と自然が調和した独特の雰囲気を醸し出しています。
    
    この村での滞在中、私は特に「時間の層」と「場所の記憶」というテーマに注目しました。何世紀にもわたって変わらず残る石の質感や、季節の移り変わりとともに変化する光と影のパターンは、作品における時間性と物質性の表現に大きな影響を与えています。
    
    村の小さな教会の内部にある中世の壁画や石像は、西洋美術の伝統と現代表現の接点について考察する機会となりました。
    
    また、地元の伝統的な祭りや日常的な農作業の風景は、コミュニティと創造性の関係、そして場所に根ざした芸術の意義について再考するきっかけとなりました。時にはぶどう畑で働く農家の方々や、パン屋、鍛冶屋など伝統的な職人との交流も、手仕事と芸術の深い関係性を感じさせるものでした。`,
    images: [
      {
        url: "/images/1731420256.jpg",
        caption: "教会での荘厳な展示",
      },
      {
        url: "/images/スクリーンショット 2025-05-25 23.14.20.png",
        caption: "じっくりと真剣に見る親子",
      },
      {
        url: "/images/スクリーンショット 2025-05-25 23.15.16.png",
        caption: "敬虔なクリスチャンの多いフランス人",
      },
    ],
    relatedLocations: [
      { id: "atis-mons", title: "アティスモンス", image: "/images/12666.jpg" },
      { id: "bourges", title: "ブールジュ", image: "/images/3446.jpg" },
    ],
  },
  // ブールジュ
  bourges: {
    id: "bourges",
    title: "ブールジュ",
    country: "フランス",
    year: "2025",
    description: "ゴシック建築に囲まれた創作体験",
    longDescription: `ブールジュはフランス中部に位置する歴史的な都市で、特に壮麗なゴシック様式の大聖堂で知られています。
    
    中世の面影を色濃く残す旧市街と、その中心に聳え立つサン・テティエンヌ大聖堂は、西洋建築の歴史と美を体現する壮大な存在です。
    
    ブールジュでの滞在中、私はゴシック建築の空間構成と光の演出に特に注目しました。大聖堂のステンドグラスを通して射し込む光が作り出す神秘的な空間体験は、光と色彩に関する新たな表現の可能性を示唆するものでした。
    
    また、旧市街の狭い路地や木組みの家々、そして中世の城壁に囲まれた都市構造は、「閉じた空間と開かれた空間」「内部と外部」という空間概念について考察する機会となりました。
    
    この地域での美術館訪問や現地のアーティストとの交流も刺激的で、特にブールジュの現代美術館での展示は、歴史的文脈における現代表現の位置づけについて再考するきっかけとなりました。
    
    毎年開催される音楽祭「ブールジュの春」に触れる機会もあり、音楽と視覚芸術の接点についても新たな視点を得ることができました。`,
    images: [{ url: "/images/13463.jpg", caption: "ブールジュ大聖堂の全景" }],
    relatedLocations: [
      {
        id: "saint-hilaire-andre",
        title: "フランス・ティレーヌアンドレシス",
        image: "/7853.jpg",
      },
      { id: "chaumont", title: "ショーモン城", image: "/2266.jpg" },
    ],
  },
  // パリ第二回
  "paris-second": {
    id: "paris-second",
    title: "パリ第二回",
    country: "フランス",
    year: "2022",
    description: "パリ中心部での2回目の個展「POKO FACE」シリーズ",
    longDescription: `2019年のパリでの初個展から3年後の2022年、再びパリの中心部で「POKO FACE」シリーズの新作を発表する機会に恵まれました。

    今回の展示会場はパリ市内の白を基調とした明るく開放的なギャラリーで、青い背景に様々な表情を持つカラフルな顔のモチーフを配した作品が、パリの街並みの中で鮮やかに映えました。

    ギャラリーのショーウィンドウには特大サイズの「POKO FACE」バナーを掲示し、通りがかりの人々の目を引くディスプレイとなりました。店内では様々なサイズの作品を展示し、オリジナルグッズの販売も行いました。

    前回の個展から時間が経ち、パリのアートシーンにも少しずつ認知されるようになった手応えを感じました。フランス人アートコレクターやギャラリストとの対話を通じて、日本とフランスの文化的な感性の違いや共通点について考える貴重な機会となりました。

    この経験は、国際的なアート活動を継続することの意義と、文化的背景の異なる人々との創造的な対話の重要性を改めて実感させてくれました。`,
    images: [
      {
        url: "/images/paris2_1.jpg",
        caption:
          "パリのギャラリーショーウィンドウに展示された「POKO FACE」シリーズ",
      },
      {
        url: "/images/paris2_2.jpg",
        caption: "ギャラリーを訪れたコレクターと交流する様子",
      },
      {
        url: "/images/paris2_3.jpg",
        caption: "パリの街並みの中にあるギャラリーの外観",
      },
    ],
    relatedLocations: [
      { id: "paris", title: "パリ第一回", image: "/paris_1.jpg" },
      {
        id: "spain-casamila",
        title: "スペイン・カサミラ",
        image: "/spain_casamila_1.jpg",
      },
    ],
  },
  // フランス・サヴィニー
  "france-savigny": {
    id: "france-savigny",
    title: "フランス・サヴィニー",
    country: "フランス",
    year: "2022",
    description: "フランス地方都市でのファッションとアートの融合展示",
    longDescription: `サヴィニーはフランスの地方都市で、2022年には地域文化の活性化を目的としたアートとファッションの融合イベントが開催されました。

    このイベントでは、私のアート作品「POKO FACE」シリーズがファッションデザインに取り入れられ、アパレル製品として展開する特別なコラボレーションが実現しました。ピンク色をベースにした特徴的なTシャツは、シンプルでありながらもインパクトのあるデザインとして来場者の注目を集めました。

    ファッションショーでは、私のデザインを身につけたモデルがランウェイを歩き、アートとファッションの境界を超えた新しい表現の可能性を示しました。また、会場ではアート作品の展示とともに、デザイン製品の販売も行われ、多くの方々がアートを身近に感じる機会となりました。

    地方都市での文化イベントという草の根的な取り組みは、大都市のギャラリーとはまた違った親密さと温かみがあり、地域の人々とアーティストの間に直接的な対話が生まれる貴重な場となりました。この経験は、アートの社会的役割とアクセシビリティについて考える重要な機会となりました。`,
    images: [
      {
        url: "/attached_assets/s231sa.jpg",
        caption: "「POKO FACE」デザインのTシャツを着用したモデル",
      },
      {
        url: "/attached_assets/23671.jpg",
        caption: "サヴィニーでのファッションショーとアート展示の様子",
      },
    ],
    relatedLocations: [
      { id: "paris", title: "パリ第一回", image: "/images/paris_1.jpg" },
      {
        id: "atis-mons",
        title: "アティスモンス",
        image: "/attached_assets/1928320.png",
      },
    ],
  },
  // スペイン・カサミラ
  "spain-casamila": {
    id: "spain-casamila",
    title: "スペイン・カサミラ",
    country: "スペイン",
    year: "2022",
    description: "ガウディ建築の傑作と現代アートの融合",
    longDescription: `バルセロナにあるカサ・ミラは、建築家アントニ・ガウディによって設計された世界遺産の建物です。その独創的な曲線美と有機的なデザインは、私の芸術観に大きな影響を与えました。

    2022年、私はスペインのM.A.D.S. ART GALLERYが主催する国際アート展「LIQUID ARSENAL」に参加し、カサ・ミラの建築美からインスピレーションを得た作品を発表する機会に恵まれました。

    展示では、私の代表作であるカラフルなキャラクターたちが大型スクリーンに投影され、ガウディの建築が持つ曲線と色彩の豊かさと共鳴するような展示となりました。展示会では「Diplōma Honorificus」を受賞し、スペインとイタリア（ミラノ）の両方で作品が紹介されました。

    カサ・ミラの波打つようなファサードと、私の作品に登場する流動的なラインや色彩表現との間には、不思議な共通点があります。建築とアートの境界を超えた対話は、私の創作活動に新たな視点をもたらしてくれました。`,
    images: [
      {
        url: "/images/23624_0.jpg",
        caption: "カサ・ミラ（ラ・ペドレラ）の外観",
      },
      {
        url: "/images/23630_0.jpg",
        caption: "M.A.D.S. ART GALLERYでの展示の様子",
      },
      {
        url: "/images/heji3918.jpg",
        caption: "「LIQUID ARSENAL」国際アート展での受賞証書",
      },
    ],
    relatedLocations: [
      { id: "paris", title: "パリ第一回", image: "/paris_1.jpg" },
      { id: "london", title: "ロンドン", image: "/10819.jpg" },
    ],
  },
  // フランス・ショーモン城
  chaumont: {
    id: "chaumont",
    title: "フランス・ショーモン城",
    country: "フランス",
    year: "2024",
    description: "歴史的な城での特別展示プロジェクト",
    longDescription: `2024年、ショーモン城で新たな特別展示プロジェクトに参加しました。ロワール渓谷に位置するこの15世紀の城は、その歴史的な建築美と国際ガーデンフェスティバルで知られています。
    
    今回のプロジェクトでは、伝統的な城の建築に現代的な色彩解釈を加える実験的なアプローチを試みました。城内の様々な空間に、鮮やかな色彩のデジタルアートプロジェクションを展開し、歴史的建造物と現代テクノロジーの融合を探求しました。
    
    特に注目したのは、城の石造りの壁面や回廊に投影される色彩の変化が、建築構造をどのように変容させるかという実験です。日中の自然光と夜間の人工照明の下で、まったく異なる表情を見せる作品は、時間と光の関係性についての考察を深める機会となりました。
    
    また、城の内部空間だけでなく、外観や周囲の風景も含めた包括的な視覚体験をデザインし、訪問者が城全体を新しい視点で体験できるようなインスタレーションを構築しました。
    
    このプロジェクトを通じて、伝統と革新、物理的な建築と仮想的な光の共演、歴史的文脈における現代表現の可能性など、多層的なテーマについて探究することができました。また、国際的なアーティストたちとの協働は、文化的背景や専門分野を超えた創造的対話の価値を再認識する機会となりました。`,
    images: [
      {
        url: "/chaumont_2024_1.jpg",
        caption: "ショーモン城の色彩デジタルアートプロジェクション",
      },
      {
        url: "/chaumont_2024_2.jpg",
        caption: "現代的な色彩解釈を加えたショーモン城の風景",
      },
    ],
    relatedLocations: [
      {
        id: "france-chambord",
        title: "フランス・シャンボール城",
        image: "/chambord_2023_1.jpg",
      },
      {
        id: "montmartre",
        title: "フランス・モンマルトル",
        image: "/montmartre_1.jpg",
      },
    ],
  },
  // シャンボール城
  chambord: {
    id: "chambord",
    title: "シャンボール城",
    country: "フランス",
    year: "2022",
    description: "ルネサンス建築の傑作の中での芸術体験",
    longDescription: `シャンボール城はフランス・ルネサンス建築の最高傑作の一つとして知られ、その壮大な規模と革新的なデザインは今なお多くの訪問者を魅了しています。
    
    フランソワ1世の命により16世紀に建設されたこの城は、レオナルド・ダ・ヴィンチの影響を受けたとされる二重螺旋階段など、当時の最先端の建築技術と芸術性を体現しています。
    
    シャンボール城での滞在中、私はルネサンス期の空間概念や幾何学的構成に特に注目しました。城の対称性と数学的調和、そして自然光の取り入れ方は、私の作品における空間構成と光の扱いに新たな視点をもたらしました。
    
    また、城を取り囲む広大な森林と庭園は、自然と人工の関係性について考察する機会となりました。特に、幾何学的に設計された庭園と周囲の野生的な森林の対比は、秩序と自由の共存という芸術的テーマへのインスピレーションとなっています。
    
    城内で開催された現代美術展に参加できたことも貴重な経験で、歴史的建造物と現代表現の対話を通して、時間を超えた芸術の継続性と変容について理解を深めることができました。
    
    シャンボール城の持つ壮大さと繊細さの共存は、私の作品における「スケールの操作」や「細部と全体の関係」について再考するきっかけとなりました。`,
    images: [
      { url: "/IMG_7161.jpg", caption: "シャンボール城の壮大な外観" },
      { url: "/IMG_7162.jpg", caption: "有名な二重螺旋階段" },
      { url: "/IMG_7163.jpg", caption: "城を取り囲む庭園と森林" },
    ],
    relatedLocations: [
      { id: "chaumont", title: "ショーモン城", image: "/2266.jpg" },
      {
        id: "france-chambord",
        title: "フランス・シャンボール城",
        image: "/images/23694.jpg",
      },
    ],
  },

  // フランス・シャンボール城
  "france-chambord": {
    id: "france-chambord",
    title: "フランス・シャンボール城",
    country: "フランス",
    year: "2023",
    description: "フランス最大の城を描く野外アートプロジェクト",
    longDescription: `2023年、私はシャンボール城を再訪し、この歴史的建造物の壮大な美しさを描く野外アートプロジェクトに参加する機会に恵まれました。
    
    フランスで最も有名な城のひとつであるシャンボール城は、その壮麗なルネサンス建築と広大な自然公園で知られています。城の周囲に広がる水堀と森林に囲まれた環境は、アーティストにとって格別のインスピレーション源となりました。
    
    このプロジェクトでは、城を取り囲む水面に映る城の姿を中心に、建築と自然の調和、そして光と影の表現に焦点を当てました。特に、季節の変わり目である秋の訪れとともに変化する森の色彩と、それを背景にした城の威厳ある姿は、時間と永続性についての考察を深める契機となりました。
    
    野外での制作活動は、天候の変化や光の移り変わりなど、自然と直接対話しながら作品を生み出す貴重な経験となりました。イーゼルを立て、城を眺めながら描く過程で、自分自身の視点と表現を再確認する機会にもなりました。
    
    この経験を通じて、歴史的建造物と自然環境の関係性、そして過去と現在の対話としての芸術表現について、新たな視点を得ることができました。`,
    images: [
      { url: "/images/23694.jpg", caption: "シャンボール城を描く様子" },
      {
        url: "/images/23687_0.jpg",
        caption: "水面に映るシャンボール城と野外作品",
      },
    ],
    relatedLocations: [
      {
        id: "normandy",
        title: "フランス・ノルマンディー",
        image: "/france_normandy_1.jpg",
      },
      {
        id: "montmartre",
        title: "フランス・モンマルトル",
        image: "/montmartre_1.jpg",
      },
    ],
  },

  // フランス・モンマルトル
  montmartre: {
    id: "montmartre",
    title: "フランス・モンマルトル",
    country: "フランス",
    year: "2023",
    description: "芸術家の聖地で描く街角スケッチの旅",
    longDescription: `2023年、私はパリの芸術家の聖地として知られるモンマルトルで、街角スケッチのプロジェクトに取り組みました。

    モンマルトルは、ピカソやヴァン・ゴッホ、モディリアーニなど多くの偉大な芸術家たちが創作活動を行った歴史的な地区です。石畳の道、階段、そして象徴的なサクレクール寺院の白亜のドームが特徴的なこの丘の上の地区は、今日も多くの芸術家たちの創作意欲を刺激し続けています。
    
    私のプロジェクトでは、伝統的な画家たちが並ぶ広場テルトル広場から少し離れた場所で、地元の日常風景を捉えることに焦点を当てました。赤いキャノピーの下に並ぶカフェや、石畳の上を行き交う人々、そして遠くに見えるパリの景色などを、明るい色彩で表現しました。
    
    特に印象的だったのは、季節の変わり目の光の変化と、パリ特有の石造りの建物が作り出す影の深さでした。モンマルトルの街角で、イーゼルを立てて描く経験は、即興性と観察力を鍛える貴重な機会となりました。
    
    地元の人々や観光客との自然な交流も、このプロジェクトの魅力の一つでした。時に会話が生まれ、時に静かに見守られる中での制作は、公共空間における芸術の役割について考えさせられる経験となりました。`,
    images: [
      {
        url: "/montmartre_1.jpg",
        caption: "モンマルトルの石畳の通りで絵を描く様子",
      },
      {
        url: "/montmartre_2.jpg",
        caption: "赤いキャノピーのカフェと完成途中の作品",
      },
    ],
    relatedLocations: [
      {
        id: "france-chambord",
        title: "フランス・シャンボール城",
        image: "/images/chambord_2023_1.jpg",
      },
      {
        id: "paris-second",
        title: "パリ第二回",
        image: "/images/paris_second_1.jpg",
      },
    ],
  },

  // 東京・新宿2024
  "tokyo-shinjuku-2024": {
    id: "tokyo-shinjuku-2024",
    title: "東京・新宿",
    country: "日本",
    year: "2024",
    description: "都市の現代建築とアートの融合",
    longDescription: `2024年、東京の新宿地区において、現代建築空間でのアート展示プロジェクトに参加しました。

    新宿は東京の中心的なビジネス地区として知られ、高層ビルと現代建築が立ち並ぶ都市景観が特徴的です。このプロジェクトでは、現代的なギャラリー空間での展示と、都市の夜景を背景とした作品の展示を行いました。

    展示では、カラフルなキャンバス作品を白い壁面に配置し、モダンで洗練された空間での色彩の見え方や、人工的な照明下での作品の印象を研究することができました。特に新宿の高層ビル群が作り出す都市の光景と、作品の鮮やかな色彩との対比が印象的でした。

    夜の新宿のビル群の窓から漏れる光は、まるで巨大なキャンバスのように見え、都市そのものがアート作品となっているような感覚を覚えました。この環境での展示は、都市文化と現代アートの関係性について新たな視点をもたらしてくれました。

    また、多様な文化的背景を持つ来場者との交流を通じて、グローバル都市における芸術の役割と、異なる文化間での美的体験の共有について考察する機会となりました。新宿という国際的な都市空間での展示は、私の作品が持つ普遍性と多様性を再確認する貴重な経験となりました。`,
    images: [
      {
        url: "/tokyo_shinjuku1.jpg",
        caption: "新宿の高層ビル群を背景とした夜景",
      },
      {
        url: "/tokyo_shinjuku2.jpg",
        caption: "モダンなギャラリー空間での作品展示",
      },
      {
        url: "/tokyo_shinjuku3.jpg",
        caption: "カラフルなキャンバス作品の展示風景",
      },
    ],
    relatedLocations: [
      {
        id: "tokyo-higashi-shinjuku",
        title: "東京・東新宿",
        image: "/attached_assets/LINE_ALBUM_20241124_250525_234.jpg",
      },
      {
        id: "tokyo-akasaka",
        title: "東京・赤坂",
        image: "/images/akasaka_1.jpg",
      },
    ],
  },

  // モナコ
  monaco: {
    id: "monaco",
    title: "モナコ",
    country: "モナコ",
    year: "2024",
    description: "地中海の高級リゾートでの現代アート展示",
    longDescription: `2024年、私はモナコ公国において、地中海の美しい海岸線を背景とした野外アート展示プロジェクトに参加しました。

    モナコは世界でも有数の高級リゾート地として知られ、カジノやヨットハーバー、そして美しい地中海の景色で有名です。この恵まれた環境の中で、私の作品は新たな文脈で展示される機会を得ました。

    展示では、砂浜と海を背景に色鮮やかな作品を設置し、自然光の下での色彩の見え方や、海風による作品の動きなどを観察することができました。特に青い海と空の色彩と、作品の鮮やかなピンクや緑のコントラストが印象的でした。

    地中海の強い陽光は、作品の色彩をより一層鮮明に浮かび上がらせ、都市部での屋内展示とは全く異なる視覚体験を提供しました。海岸沿いの遊歩道を歩く人々との自然な交流も生まれ、国際的なリゾート地ならではの多様な文化的背景を持つ鑑賞者からの反応を得ることができました。

    この経験は、自然環境と現代アートの調和、そして場所の持つ文化的コンテクストが作品にもたらす意味の変化について、新たな理解をもたらしてくれました。`,
    images: [
      {
        url: "/monaco1.jpg",
        caption: "モナコの海岸で展示されたカラフルなポートレート作品",
      },
      {
        url: "/monaco2.jpg",
        caption: "地中海を背景にした「POKO FACE」シリーズ",
      },
      {
        url: "/monaco3.jpg",
        caption: "砂浜での野外展示とトラ柄モチーフの作品",
      },
    ],
    relatedLocations: [
      {
        id: "nice",
        title: "フランス・ニース",
        image: "/images/スクリーンショット 2025-05-25 19.23.37.png",
      },
      {
        id: "spain-casamila",
        title: "スペイン・カサミラ",
        image: "/images/23624_0.jpg",
      },
    ],
  },
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
          <span className="text-sm tracking-wider text-gray-500">
            {location.year}
          </span>
          <span className="text-sm uppercase tracking-wider text-gray-500">
            {location.country}
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">{location.title}</h1>
        <p className="text-xl text-gray-700">{location.description}</p>
      </div>

      <Separator className="my-8" />

      {/* メインビジュアル */}
      <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100 mb-12">
        <img
          src={location.images[0]?.url || "/placeholder.png"}
          alt={location.images[0]?.caption || location.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.onerror = null;
            img.src = "/placeholder.png";
          }}
        />
      </div>

      {/* サイドバー情報 - 上部に移動 */}
      <div className="mb-12">
        <h3 className="text-xl font-medium mb-4">詳細情報</h3>
        <dl className="space-y-2 max-w-md">
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

      {/* 詳細文章 */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">アーティスト活動の記録</h2>
        <div className="prose prose-lg max-w-none">
          {location.longDescription.split("\n\n").map((paragraph, i) => (
            <p key={i} className="mb-4">
              {paragraph.trim()}
            </p>
          ))}
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
                  img.src = "/placeholder.png";
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
