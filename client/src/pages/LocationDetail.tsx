import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ImageModal from "@/components/ImageModal";

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
  googleMapUrl?: string;
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
    description: "大学入学を機に上京し、美術部の友人の影響で初の抽象画",
    longDescription: `2002年、大学入学を機に広島から東京に出てきた私は、新宿での一人暮らしを始めました。都市の生活に慣れていく中で、趣味のひとつとして再び絵筆を手に取ることになりました。

    同じく上京し、高校時代に美術部に所属していた友人の影響で、趣味の一環で油絵を描いてみました。自由なタッチで描く友人を真似て抽象画を描いてみて、色彩と形の自由な表現に新たな可能性を感じました。

    新宿という都市の多様性と活気が、私の抽象表現に大きなインスピレーションを与えました。昼と夜で異なる顔を見せる街並み、雑多な看板や光の洪水、人々の絶え間ない流れ。これらの都市の要素を抽象的な色彩と形で表現することを試みました。

    いくつか描いてみると、友人から「個展ができるんじゃないか」と言われました。このときは何気ない言葉でしたが、後にフランスでも認められる画風であったことを示していたのかもしれません。

    この時期の作品制作は、私の芸術的成長における重要な転換点となり、その後の創作活動の基盤を築く貴重な経験となりました。`,
    images: [
      {
        url: "/images/tokyo_shinjuku_1.jpg",
        caption: "抽象画：光の起源",
      },
      {
        url: "/images/tokyo_shinjuku_2.jpg",
        caption: "抽象的構成：闇からの脱出",
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
    description:
      "3ヶ月で150枚制作。抽象画に加え女の子の絵を描くようになった新画風への転換期",
    longDescription: `2022年、絵を描く時間が増え、赤坂に部屋を借りて毎日創作に専念していました。この期間は私の創作活動において極めて重要な転換期となりました。

    3ヶ月という短期間で150枚の作品を制作し、非常に密度の高い創作活動を行いました。一日数枚のペースで描き続けることで、技法の向上と表現の幅の拡大を同時に実現することができました。

    この時期の最も重要な変化は、これまでの抽象画に加え、女の子の絵を描くようになったことです。今までとは違った画風の作品を創ることができ、自分の表現の可能性が大きく広がりました。

    赤坂は伝統的な日本文化と現代的な都市景観が交差する場所です。古くからの歴史と洗練された現代の要素が共存するこの地域は、アーティストにとって創造性を刺激する環境を提供しています。

    赤坂での滞在中、私は日本の繊細な美意識と現代的な洗練さが混ざり合う瞬間を捉えることに焦点を当てました。伝統的な和の空間と現代建築が並存する風景、そして四季の移り変わりを敏感に捉える日本の感性は、私の作品に深い影響を与えています。

    この集中的な創作期間は、後の作品において新しい表現の可能性を追求する重要な基盤となりました。`,
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
    description: "中学3年生で描いた油絵から始まったアートへの道",
    longDescription: `1998年、中学3年生の美術の授業で初めて手にした油絵の具。

    祖父が油絵を描いていた影響もあり、美術の授業を選択しました。絵の具の香りが祖父の部屋の匂いがして心地よかったです。

    最初に描いたのは静物画でした。茶色の箱とススキ、そして時計と黄色いレモンを題材にした作品です。今思えば油絵にしては薄く描いていました。

    広島という破壊と再生を経験した平和を象徴する街で育ち、祖父の作品に囲まれて育ったことで、アートに関する感性が磨かれたのかもしれません。この中学3年生での油絵体験が、その後の私の芸術人生の原点となっています。`,
    images: [
      { url: "/images/S__9044006.jpg", caption: "静物画：茶色の箱とススキ" },
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
    year: "2021",
    description: "展覧会出展により英国王立美術家協会の名誉会員に招待",
    longDescription: `2021年、ロンドンで開かれた展覧会に出展する機会をいただきました。歴史と伝統のある芸術都市での展示は、私にとって大変光栄な体験でした。

    ロンドンは数世紀にわたる歴史と最先端の現代文化が共存する都市として、アーティストに無限のインスピレーションを提供します。テムズ川沿いの歴史的建造物から、ショーディッチやイーストロンドンの最新アートシーンまで、ロンドンの多様性は私の作品に新たな視点をもたらしました。

    この展覧会での作品が評価され、英国王立美術家協会（Royal Society of British Artists）の名誉会員に招待されました。これは私の国際的な芸術活動にとって重要な節目となり、イギリスの芸術コミュニティとの貴重な繋がりを築くことができました。

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
    description:
      "単独の個展では初めての個展。芸術の本場パリで大絶賛を受けた記念すべき展示",
    longDescription: `2019年、私にとって記念すべき初めての単独個展を、芸術の本場パリで開催することができました。パリ11区のバスティーユ広場近くにあるGallery Art.Cでの展示でした。

    この展示では、パリの方々から皆大絶賛をいただき、「C'est magnifique!（セマニフィク！）素晴らしい！」や「Très bien!（トレビアン！）」「C'est mignon（セミニョン！）かわいい！」と口々に言われました。展示した作品のポストカードが飛ぶように売れ、絵画も複数点購入していただくことができました。

    特に印象的だったのは、ギャラリーのオーナーから「30年ギャラリーをやっているけれど、短期間の個展でしかも新人アーティストで絵が売れたのは初めて」と言われたことです。この言葉は、私の作品がパリの芸術界で認められた瞬間として、非常に感慨深いものでした。

    Gallery Art.Cは、パリ11区の文化的な地域に位置し、多くの芸術愛好家が訪れる場所です。バスティーユ広場という歴史的な場所の近くで、フランス革命の象徴的な地で自分の作品を展示できたことは、とても意味深いことでした。

    この成功体験は、私の国際的なアーティスト活動の原点となり、その後のヨーロッパでの展開への大きな自信となりました。パリという芸術の都で認められたことで、自分の作品が持つ普遍的な魅力を確信することができました。

    Gallery Art.Cは、パリ11区の芸術地区に位置し、多くの新進アーティストを支援する重要な文化拠点として機能しています。このギャラリーでの展示は、私の作品がヨーロッパの芸術界で認められる第一歩となりました。`,
    googleMapUrl:
      "https://www.google.com/maps/place/Gallery+Art.C/@48.8627958,2.3715929,15.28z/data=!4m6!3m5!1s0x47e66df6e7e17e19:0xd9e32fde1323238d!8m2!3d48.8591481!4d2.3819519!16s%2Fg%2F11f1056qcq?entry=ttu&g_ep=EgoyMDI1MDcwOS4wIKXMDSoASAFQAw%3D%3D",
    images: [
      { url: "/images/paris_1.jpg", caption: "パリのGallery Art.C外観" },
      {
        url: "/images/paris_2.jpg",
        caption: "ギャラリーのウィンドウに展示された「POKO FACE」シリーズ",
      },
      {
        url: "/paris_gallery3.jpg",
        caption: "ギャラリーでの展示を鑑賞する来場者と「POKO FACE」シリーズ",
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
        caption: "丘の上から���ニース全景",
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
    description: "海外初出品で『ひょこあに』シリーズが来場者アンケート1位",
    longDescription: `2019年、私はアブダビで記念すべき初めて海外で作品を出展する機会に恵まれました。この展覧会は、私の国際的なアーティスト活動の出発点となる重要なイベントでした。

    池袋のアトリエで制作していた数々の作品の中から、特に反響の良かった「ひょこあに」シリーズをベースに作成し、出展しました。動物が穴から顔を出しているデザインの「ひょこっとあにまる」コレクションは、言語や文化の壁を超えて多くの来場者の心を掴みました。12匹の動物を並べ、色合いが着物のように見えたので『ひょこあに 十二単』というタイトルを付けました。

    砂漠の国アブダビという、日本とは全く異なる文化圏での展示でしたが、シンプルで親しみやすいキャラクターデザインと鮮やかな色彩が、現地の方々に温かく受け入れられました。特に「ひょこあに」シリーズの作品は、来場者アンケートで一番人気を獲得するという嬉しい結果となりました。

    この成功体験は、アートには文化的な境界を超えた普遍的な力があることを実感させてくれました。また、国際的な展示活動への自信と確信を与えてくれる貴重な機会となり、その後のヨーロッパでの展開への道筋を切り開く重要なステップとなりました。`,
    images: [
      {
        url: "/images/abu_dhabi_1.jpg",
        caption: "アブダビでの個展にて『ひょこあに 十二単』と共に",
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
    description: "ビジネスに打ち込んだ後、仕事仲間の勧めで絵画制作を再開",
    longDescription: `2018年頃まで、私は研究や起業、ビジネスに打ち込んでいて、長い間絵から遠ざかっていました。日々の仕事に追われる中で、創作活動から離れた生活を送っていました。

    しかし、仕事を少し減らしたことをきっかけに時間に余裕ができ、久しぶりに絵筆を手に取る機会が訪れました。油絵に詳しい仕事仲間から「絵が上手いから、もっと描くといいよ」と勧められたことが、再び創作活動を始める大きなきっかけとなりました。

    池袋の部屋で制作をすると、どの絵も素晴らしいと言ってもらえました。お題を出してもらって描いたり、抽象画を描いたりしました、ビジネスの世界で培った経験や視点が、無意識のうちに作品に反映されていたのかもしれません。

    描いた作品を見た周囲の人々からは「素晴らしい」という評価をいただき、仕事仲間は「ぜひ本場のフランスで個展を開いて、たくさんの人に見てもらいたい」と言っていました。

    この時期は私にとって大きな転機となりました。単なる趣味として描いていた絵画制作が、国際的に評価される可能性があるとは思っていませんでした。`,
    images: [
      {
        url: "/images/LINE_ALBUM_20241124_250525_65.jpg",
        caption: "ひょこあに ハリネズミ",
      },
      {
        url: "/images/スクリーンショット 2025-05-25 23.25.39.png",
        caption: "エッフェル塔 ねこ",
      },
      {
        url: "/tokyo_ikebukuro3.jpg",
        caption: "アトリエでの作品風景と池袋の街並み",
      },
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
    description: "新大久保のギャラリーで動物シリーズを展示、絵本化企画も",
    longDescription: `新大久保のおしゃれなギャラリーで作品を展示しました。動物シリーズを中心とした展示で、友人からの依頼で描いた作品たちが多くの来場者に愛されました。

    新大久保は多文化が共存する国際的な街として知られ、様々な国籍の人々が行き交う活気あふれるエリアです。このような多様性に富んだ環境の中で、動物をモチーフとした作品を展示することで、言語や文化の壁を超えた普遍的な愛らしさと親しみやすさを表現することができました。

    友人からの依頼で制作した動物シリーズは、犬や猫をはじめとする身近な動物たちを独特の色彩感覚で描いた作品群です。鮮やかな色彩と親しみやすい表現で、多くの人々の心を捉えました。特に子どもから大人まで幅広い世代の来場者が作品を楽しんでくれたことが印象的でした。

    展示期間中には絵本化の企画も持ち上がり、作品の持つストーリー性や教育的価値についても話し合われました。動物というモチーフが持つ普遍的な魅力と、アートとしての表現力の両立について考える貴重な機会となりました。

    新大久保という国際色豊かな街での展示は、文化的背景の異なる人々にも受け入れられるアートの可能性を実感させてくれる体験となりました。`,
    images: [
      {
        url: "/images/tokyo_okubo_1.jpg",
        caption: "大久保ギャラリーでの動物シリーズ展示風景",
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
    
    印象派の画家たちも愛したノルマンディーの光の変化は、特に朝霧や夕暮れ時に独特の雰囲気を醸し出しin�色彩と光の表現に関する新たな試みへとつながりました。
    
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
    
    アティスモンスでの日々は、特に創作のリズムと日常の観察に焦点を当てていました。朝の散歩で出会う地元の人々や、市場
�� ��交流、そして季節の移り変わりを敏感に捉える時間は、作品の深みと持続性を考える上で重要な経験となりました。
    
    この地域の住宅建築や公共空間のデザインも興味深く、特に1960年代から70年代にかけて建設された集合住宅群は、モダニズム建築と生活空間の関係性について考察する ��っかけとなりました。
    
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
    
    この村での滞在中、私は特に「時間の層」と「場所の記憶」というテーマに注目しました。何世紀にもわたって変わらず残る石の質感や、季節の移り変わりとともに変化する光と影のパターンは、作品における時間性と物質性の表現に大きなed�m��を与えています。
    
    村の小さな教会の内部にある中世の壁画や石像は、西洋美術の伝統と現代表現
��接点について考察する機会となりました。
    
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
  // パリ2025
  "paris-2025": {
    id: "paris-2025",
    title: "フランス・パリ",
    country: "フランス",
    year: "2025",
    description: "パリ19区ギャラリーMでの個展とノルマンディーでの撮影プロジェクト",
    googleMapUrl:
      "https://www.google.com/maps/place/Galerie+M/@48.8833818,2.3558281,15z/data=!4m10!1m2!2m1!1sgaleries+d'Art+%C3%A0+Paris+19+-+75019!3m6!1s0x47e66dcc29fc1777:0x83e9f48e42f9f33b!8m2!3d48.8833818!4d2.3738525!15sCiJnYWxlcmllcyBkJ0FydCDDoCBQYXJpcyAxOSAtIDc1MDE5kgELYXJ0X2dhbGxlcnngAQA!16s%2Fg%2F11shpzh34l?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoKLDEwMDc5MjA2N0gBUAM%3D",
    longDescription: `今回の展示の舞台は、パリ19区ジョレス駅近くに位置するギャラリーMでした。フィルハーモニー・ド・パリという都市文化を象徴するコンサートホールと、サン＝マルタン運河の穏やかな水辺に寄り添う、上品で落ち着いたエリアにあります。チームメンバーのお母さんがかつて研修医として勤務していた大学病院の近くという点も、この展示に静かな時間の厚みを与えています。

展示初日の土曜日は、事前に構想していた壁面展示の一部が整わず、思い描いていたレイアウトを完全には実現できませんでした。さらに午後には、テロ抑止のため周辺一帯に交通規制が敷かれ、街の流れが一時的に止まります。そのような静寂の中で来場したのは、子ども二人を連れた家族、ダリを思わせる雰囲気の年配の男性、そして近隣カフェのオーナーでした。特にカフェオーナーは作品に強い関心を示し、ポストカードを20枚購入するとともに、近隣の店主仲間へ展示の案内を配布してくれることになりました。

翌日の日曜日は、オランダからの学生や、運河沿いの散策帰りに立ち寄る来場者が多く見られました。二組が撮影に応じてくれ、そのうち一組はカメラマンのカップルと母親で、約一時間にわたりギャラリーに滞在し、作品と空間構成の双方を高く評価してくれました。彼らは人物シリーズのパネル10枚とキーホルダーを購入し、深い共鳴を残していきました。

来場者から寄せられた言葉も印象的です。色使いを「天才的」と評する声や、年齢を感じさせない制作量と完成度に驚嘆する意見、生い立ちに興味を持ち丁寧に質問を重ねる姿がありました。また、風景画を特に気に入った来場者は、「購入を検討する際には連絡したい」と連絡先を求めました。

なかでも忘れがたいのは、84歳の女性の来場です。生涯パリに暮らしながら、これまで一度もギャラリーに入ったことがなかったという彼女は、ガラス越しに作品を見て心を打たれ、初めて展示空間へ足を踏み入れました。「すべてがピュアで、これを描いた人の心は間違いなく純粋に違いない」と語り、作品とポストカードを手に取って静かに帰っていきました。

展示と並行して行われたノルマンディーでの撮影は、自然との対話そのものでした。暴風雨と晴天が瞬時に入れ替わる過酷な天候の中、大きなイーゼルは何度も風に倒され、小さな木製イーゼルは吹き飛ばされて壊れました。その合間を縫うように晴れ間を待ち、濡れた椅子を拭き、乾いた地面を探しながら撮影を続けました。

撮影地の一つであるディエップの浜辺は、多色の石が敷き詰められた独特の景観を持ち、遠く対岸には見えないながらもイギリス、ブライトンの街を感じさせます。黄色い船はその海路を示していました。リンゴ農園や公園など、細かな移動を重ねながらも、風景は一貫してノルマンディーの静けさに包まれていました。

体調不良という影も、旅の序盤にはありました。同行者や関係者にも不調が重なり、到着直後はこのまま何も成せず帰国するのではないかという不安もありました。それでも展示は成立し、対話は生まれ、作品は人の手へと渡っていきました。運転や運営を担うメンバーも、疲労を抱えながら静かに役割を果たしていました。

本個展は、華やかな成功を誇示するものではありません。偶然や制約、身体の限界、天候、そして来場者のまなざしが重なり合う現実の中で、作品がどのように立ち上がり、届いていくのかを示すことができました。静かではありますが、フランス・パリにて確かな手応えを残す展示となりました。`,
    images: [
      { url: "/exhibitions/france-2025/01.jpg", caption: "ギャラリーM外観" },
      { url: "/exhibitions/france-2025/02.jpg", caption: "ギャラリー内展示風景" },
      { url: "/exhibitions/france-2025/03.jpg", caption: "作品展示" },
      { url: "/exhibitions/france-2025/04.jpg", caption: "来場者との交流" },
      { url: "/exhibitions/france-2025/05.jpg", caption: "ノルマンディー公園での撮影" },
      { url: "/exhibitions/france-2025/06.jpg", caption: "庭園での作品撮影" },
      { url: "/exhibitions/france-2025/07.jpg", caption: "ディエップ浜辺での撮影" },
    ],
    relatedLocations: [
      { id: "bourges", title: "ブールジュ", image: "/images/13463.jpg" },
      { id: "paris", title: "パリ第一回", image: "/images/paris_1.jpg" },
    ],
  },
  // パリ第二回
  "paris-second": {
    id: "paris-second",
    title: "パリ第二回",
    country: "フランス",
    year: "2022",
    description:
      "コロナ明けの2回目個展を2箇所で開催。フランスの方々が作品について深く語る情熱的な反応",
    longDescription: `2022年、コロナの影響で個展の機会を逃しましたが、明けて2回目の個展を行うことができました。2回目は2箇所で開催し、このときも温かい反応をいただきました。

    第一会場「Petite boutique de Charonne」では2022年9月10日〜14日に開催されました。バスティーユ地区の19 Rue Paul Bertにあるこのギャラリーでは、「POKO FACE」シリーズの新作を発表しました。

    第二会場「Boutique des Arts et Metiers」では2022年9月24日〜27日に開催されました。マレ地区の59 Rue Notre Dame de Nazarethにあるこのギャラリーでも、同様に熱い反響をいただきました。

    フランスの方々は作品を前にして、深く感じ取ったことを時間をかけて話してくださいます。中には何十分も、時には1時間も作品について語ってくださる方もいらっしゃいます。作品がそれだけ心に響いていることを実感できて、とても嬉しく思います。

    2箇所のギャラリーでの連続開催により、より多くの方に作品を見ていただくことができ、パリのアートシーンでの認知度も高まりました。フランス人アートコレクターやギャラリストとの深い対話を通じて、日本とフランスの文化的な感性の違いや共通点について考える貴重な機会となりました。

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
    title: "フランス・サヴィニー地方",
    country: "フランス",
    year: "2019",
    description:
      "パリでのファンが招待してくれた地元美術イベント。高校生がひょこあにTシャツでファッションショー",
    longDescription: `2019年、パリ第一回個展でファンになってくださった方がイベントに紹介してくださり、フランス・サヴィニー地方の地元美術イベントに出展する機会をいただきました。

    このイベントは地方都市での文化交流を目的としたもので、パリとは異なる親密な雰囲気の中で開催されました。私の「ひょこあに」シリーズの作品が展示され、地元の方々から温かい反応をいただきました。

    特に印象的だったのは、地元の高校生の子がひょこあにのTシャツを着てファッションショーを行ってくれたことです。とても似合っていて、アートとファッションの融合という新しい表現の可能性を実感できました。

    若い世代がアートを身近に感じ、自分なりの表現として取り入れてくれる姿を見て、アートの持つ普遍的な力と、文化を超えた共感の可能性を改めて感じました。

    地方都市での草の根的な文化活動は、大都市のギャラリーとは違った親密さと温かみがあり、地域の人々とアーティストの間に直接的な対話が生まれる貴重な場となりました。この経験は、アートの社会的役割とアクセシビリティについて考える重要な機会となりました。`,
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

    展示では、私の代表作であるカラフルなキャラクターたちが大型スクリーンに投影され、ガウディの建築が持つ曲線と色彩の豊かさと共鳴するような展示となりました。展示会では「Diplōma Honorificus」を受賞し、スペインとイタリア（ミラノ）の両方で作品が紹㻋さ
 �ました。

    カサ・ミラの波打つようなファサードと、私の作品に登場する流動的なラインや色彩表現との間には、不思議な共通点があります。建築とアートの境界を超えた対話は、私の創作活動に新たな視点をもたらしてくれました。`,
    images: [
      {
        url: "/images/23624_0.jpg",
        caption: "￫サ・ミラ（ラ・ペドレラ）の外観",
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
    
    フランスで最も有名な城のひとつであるシャンボール城は、その壮麗なルネサンス建築と広大な自然公園で知られています。城の周囲に広がる水堀と森林に囲まれた環境は、アーティストにとって格別のインスピレーション源とF��りました。
    
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

    モンマルトルは、ピカソやヴァン・ゴッホ、モディリアーニなど多くの偉大な芸術家たちが創ig-��活動を行った歴史的な地区です。石畳の道、階段、そして象徴的なサクレクール寺院の白亜のドームが特徴的なこの丘の上の地区は、今日も多くの芸術家たちの創作意欲を刺激し続けています。
    
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

// 展示場所の順序を定義
const locationOrder = [
  "hiroshima",
  "tokyo-shinjuku",
  "tokyo-ikebukuro",
  "abu-dhabi",
  "tokyo-okubo",
  "paris",
  "france-savigny",
  "london",
  "tokyo-akasaka",
  "paris-second",
  "atis-mons",
  "spain-casamila",
  "normandy",
  "tokyo-higashi-shinjuku",
  "atis-mons-church",
  "france-chambord",
  "montmartre",
  "tokyo-shinjuku-2024",
  "chaumont",
  "nice",
  "monaco",
  "fukuyama",
  "saint-hilaire-andre",
  "bourges",
  "paris-2025",
];

const LocationDetail: React.FC = () => {
  // URLからロケーションIDを直接取得 - 末尾から取得する形式に修正
  const path = window.location.pathname;
  // exhibition/location/:locationId 形式から正確にlocationIdを抽出
  const match = path.match(/\/exhibition\/location\/([^\/]+)$/);
  const locationId = match ? match[1] : null;

  const [location, setLocation] = useState<LocationData | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    caption: string;
  } | null>(null);

  console.log("LocationDetail - URL path:", path);
  console.log("LocationDetail - Extracted locationId from URL:", locationId);

  useEffect(() => {
    console.log("LocationDetail with locationId:", locationId);

    // まず状態をリセット
    setLocation(null);
    setSelectedImage(null);

    if (locationId && locationsData[locationId]) {
      console.log("Found location data for:", locationId);
      // 少し遅延を入れて確実にリセット後に設定
      setTimeout(() => {
        setLocation(locationsData[locationId]);
        const index = locationOrder.indexOf(locationId);
        setCurrentIndex(index);
      }, 0);
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
    <div key={locationId} className="container mx-auto px-4 py-12 min-h-screen">
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
            <dt className="text-gray-600">{location.id === "paris-2025" ? "開催日" : "訪問年"}</dt>
            <dd className="font-medium">{location.id === "paris-2025" ? "2025/11/29, 30" : location.year}</dd>
          </div>
          {location.id === "paris-2025" && (
            <div className="flex justify-between">
              <dt className="text-gray-600">ギャラリー</dt>
              <dd className="font-medium">
                <a
                  href="https://www.thestorefront.com/fr/spaces/france/Ile-de-france/paris/41631-galerie-dart-proche-de-la-rotonde-?fbclid=IwY2xjawOs2UhleHRuA2FlbQIxMABicmlkETFrYlZMaVJFQ09PbHVhQmFLc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHvl3mxRvIFgorR33AIVtvmG4KafPi7h3B-hc5C3d1MMnY-YAJEXpt_inbF4R_aem_k4JYavq9fiaZK7rPRB7mVg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Galerie M
                </a>
              </dd>
            </div>
          )}
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
            <div
              className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
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

      {/* Google Map */}
      {location.id === "paris-second" && (
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">
            ギャラリー所在地
          </h3>
          <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
            {/* 第一会場 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">
                第一会場: Petite boutique de Charonne
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                開催期間: 2022年9月10日〜14日
                <br />
                住所: 19 Rue Paul Bert, 75011 Paris
              </p>
              <div className="aspect-w-16 aspect-h-9 h-[36rem] rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2625.2847!2d2.3824404!3d48.8522623!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e6720bcf608ab1%3A0xc5c3334e65233e67!2s19%20Rue%20Paul%20Bert%2C%2075011%20Paris!5e0!3m2!1sja!2sjp!4v1640000000000!5m2!1sja!2sjp"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                ></iframe>
              </div>
              <div className="mt-4">
                <a
                  href="https://www.google.com/maps/place/19+Rue+Paul+Bert,+75011+Paris,+%E3%83%95%E3%83%A9%E3%83%B3%E3%82%B9/@48.8522623,2.3846424,17z/data=!3m1!4b1!4m6!3m5!1s0x47e6720bcf608ab1:0xc5c3334e65233e67!8m2!3d48.8522623!4d2.3846424!16s%2Fg%2F11bw3yzmfd?entry=ttu&g_ep=EgoyMDI1MDcwOS4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Google Mapで開く
                </a>
              </div>
            </div>

            {/* 第二会場 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">
                第二会場: Boutique des Arts et Metiers
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                開催期間: 2022年9月24日〜27日
                <br />
                住所: 59 Rue Notre Dame de Nazareth, 75003 Paris
              </p>
              <div className="aspect-w-16 aspect-h-9 h-[36rem] rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.0195!2d2.3558460!3d48.8677068!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e102494e30b%3A0x310e4fabdd693656!2s59%20Rue%20Notre%20Dame%20de%20Nazareth%2C%2075003%20Paris!5e0!3m2!1sja!2sjp!4v1640000000000!5m2!1sja!2sjp"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                ></iframe>
              </div>
              <div className="mt-4">
                <a
                  href="https://www.google.com/maps/place/59+Rue+Notre+Dame+de+Nazareth,+75003+Paris,+%E3%83%95%E3%83%A9%E3%83%B3%E3%82%B9/@48.8644181,2.358046,15.33z/data=!4m6!3m5!1s0x47e66e102494e30b:0x310e4fabdd693656!8m2!3d48.8677068!4d2.356054!16s%2Fg%2F11bw3ys27t?entry=ttu&g_ep=EgoyMDI1MDcwOS4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Google Mapで開く
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* パリ2025のGoogle Map */}
      {location.id === "paris-2025" && (
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">
            ギャラリー所在地
          </h3>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-800">
              Galerie M
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              パリ19区ジョレス駅近く
            </p>
            <div className="aspect-w-16 aspect-h-9 h-[36rem] rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2623.5!2d2.3738525!3d48.8833818!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66dcc29fc1777%3A0x83e9f48e42f9f33b!2sGalerie%20M!5e0!3m2!1sja!2sjp!4v1640000000000!5m2!1sja!2sjp"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
              ></iframe>
            </div>
            <div className="mt-4">
              <a
                href="https://www.google.com/maps/place/Galerie+M/@48.8833818,2.3558281,15z/data=!4m10!1m2!2m1!1sgaleries+d'Art+%C3%A0+Paris+19+-+75019!3m6!1s0x47e66dcc29fc1777:0x83e9f48e42f9f33b!8m2!3d48.8833818!4d2.3738525!15sCiJnYWxlcmllcyBkJ0FydCDDoCBQYXJpcyAxOSAtIDc1MDE5kgELYXJ0X2dhbGxlcnngAQA!16s%2Fg%2F11shpzh34l?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoKLDEwMDc5MjA2N0gBUAM%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Google Mapで開く
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 他の場所のGoogle Map */}
      {location.googleMapUrl && location.id !== "paris-second" && location.id !== "paris-2025" && (
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">
            ギャラリー所在地
          </h3>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="aspect-w-16 aspect-h-9 h-[36rem] rounded-lg overflow-hidden">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.8919!2d2.3819519!3d48.8591481!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66df6e7e17e19%3A0xd9e32fde1323238d!2sGallery%20Art.C!5e0!3m2!1sja!2sjp!4v1640000000000!5m2!1sja!2sjp`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
              ></iframe>
            </div>
            <div className="mt-4">
              <a
                href={location.googleMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Google Mapで開く
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ナビゲーション */}
      <div className="mt-32 border-t pt-16">
        <div className="max-w-4xl mx-auto">
          {/* スマートフォンでは縦積み、PCでは横並び */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            {/* 前のページ */}
            <div className="flex-1 flex justify-start max-w-full md:max-w-[45%]">
              {currentIndex > 0 ? (
                <Link
                  href={`/exhibition/location/${locationOrder[currentIndex - 1]}`}
                  className="w-full"
                >
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 p-3 md:p-4 h-auto hover:bg-gray-50 w-full justify-start"
                  >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <div className="text-left min-w-0 flex-1 overflow-hidden">
                      <div className="text-xs md:text-sm text-gray-500 mb-1">
                        前のページ
                      </div>
                      <div className="font-medium text-sm md:text-base line-clamp-2">
                        {locationsData[locationOrder[currentIndex - 1]]
                          ?.title || ""}
                      </div>
                      <div className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">
                        {locationsData[locationOrder[currentIndex - 1]]
                          ?.description || ""}
                      </div>
                    </div>
                  </Button>
                </Link>
              ) : (
                <div></div>
              )}
            </div>

            {/* 次のページ */}
            <div className="flex-1 flex justify-end max-w-full md:max-w-[45%]">
              {currentIndex >= 0 && currentIndex < locationOrder.length - 1 ? (
                <Link
                  href={`/exhibition/location/${locationOrder[currentIndex + 1]}`}
                  className="w-full"
                >
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 p-3 md:p-4 h-auto hover:bg-gray-50 w-full justify-end"
                  >
                    <div className="text-right min-w-0 flex-1 overflow-hidden order-2 md:order-1">
                      <div className="text-xs md:text-sm text-gray-500 mb-1">
                        次のページ
                      </div>
                      <div className="font-medium text-sm md:text-base line-clamp-2">
                        {locationsData[locationOrder[currentIndex + 1]]
                          ?.title || ""}
                      </div>
                      <div className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">
                        {locationsData[locationOrder[currentIndex + 1]]
                          ?.description || ""}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 order-2" />
                  </Button>
                </Link>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 画像モーダル */}
      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.url || ""}
        caption={selectedImage?.caption}
      />
    </div>
  );
};

export default LocationDetail;
