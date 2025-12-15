import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ScrollToTopLink from "@/components/ScrollToTopLink";
import { Button } from "@/components/ui/button";
import ImageModal from "@/components/ImageModal";

// ロケーションデータ（Home.tsxと同じデータを使用）
const locations = [
  {
    id: "hiroshima",
    label: "広島",
    year: "1998",
    country: "日本",
    description: "中学3年生で描いた油絵から始まった芸術への道",
    images: ["/images/S__9044006.jpg", "/images/S__9044005.jpg"],
  },
  {
    id: "tokyo-shinjuku",
    label: "東京・新宿",
    year: "2002",
    country: "日本",
    description: "大学入学を機に上京し、美術部の友人の影響で初の抽象画",
    images: [
      "/images/tokyo_shinjuku_1.jpg",
      "/images/tokyo_shinjuku_2.jpg",
      "/images/tokyo_shinjuku_3.jpg",
    ],
  },
  {
    id: "tokyo-ikebukuro",
    label: "東京・池袋",
    year: "2018",
    country: "日本",
    description: "ビジネスに打ち込んだ後、仕事仲間の勧めでアート制作を本格始動",
    images: [
      "/images/LINE_ALBUM_20241124_250525_65.jpg",
      "/images/スクリーンショット 2025-05-25 23.25.39.png",
      "/images/14868_1749435597334.jpg",
      "/images/5427.jpg",
      "/images/14867_1749433854412.jpg",
      "/images/14869_1749435600759.jpg",
    ],
  },
  {
    id: "abu-dhabi",
    label: "アブダビ",
    year: "2019",
    country: "UAE",
    description: "海外初出品で『ひょこあに』シリーズが来場者アンケート1位",
    images: ["/images/abu_dhabi_1.jpg"],
  },
  {
    id: "tokyo-okubo",
    label: "東京・大久保",
    year: "2019",
    country: "日本",
    description: "新大久保のギャラリーで動物シリーズを展示、絵本化企画も",
    images: ["/images/tokyo_okubo_1.jpg"],
  },
  {
    id: "paris",
    label: "パリ第一回",
    year: "2019",
    country: "フランス",
    description:
      "単独の個展では初めての個展。芸術の本場パリで大絶賛を受けた記念すべき展示",
    details:
      "パリ11区のバスティーユ広場近くにあるGallery Art.Cで開催。パリの方々から「セマニフィク！」「トレビアン！」と絶賛され、ポストカードが飛ぶように売れ、絵画も購入していただきました。ギャラリーオーナーからは「30年やってるけど、短期間の個展でしかも新人アーティストで絵が売れたのは初めて」と言われた、記念すべき成功体験でした。",
    images: [
      "/images/paris_1.jpg",
      "/images/paris_2.jpg",
      "/paris_gallery3.jpg",
    ],
  },
  {
    id: "france-savigny",
    label: "フランス・サヴィニー地方",
    year: "2019",
    country: "フランス",
    description:
      "パリでのファンが招待してくれた地元美術イベント。高校生がひょこあにTシャツでファッションショー",
    images: ["/images/s231sa.jpg", "/images/23671.jpg"],
  },
  {
    id: "london",
    label: "ロンドン",
    year: "2021",
    country: "イギリス",
    description: "展覧会出展により英国王立美術家協会の名誉会員に招待",
    images: ["/images/スクリーンショット 2025-05-25 23.21.59.png"],
  },
  {
    id: "tokyo-akasaka",
    label: "東京・赤坂",
    year: "2022",
    country: "日本",
    description:
      "3ヶ月で150枚制作。抽象画に加え女の子の絵を描くようになった新画風への転換期",
    images: [
      "/images/akasaka_1.jpg",
      "/images/akasaka_2.jpg",
      "/images/akasaka_3.jpg",
    ],
  },

  {
    id: "paris-second",
    label: "パリ第二回",
    year: "2022",
    country: "フランス",
    description:
      "コロナ明けの2回目個展を2箇所で開催。フランスの方々が作品について深く語る情熱的な反応",
    images: [
      "/attached_assets/23601.jpg",
      "/attached_assets/23622_0.jpg",
      "/attached_assets/1662819546.jpg",
    ],
  },
  {
    id: "atis-mons",
    label: "アティスモンス",
    year: "2022",
    country: "フランス",
    description: "フランス郊外の静かな村での集中的な創作期間",
    images: [
      "/attached_assets/1928320.png",
      "/attached_assets/23611_0.jpg",
      "/attached_assets/23615_0.jpg",
    ],
  },
  {
    id: "spain-casamila",
    label: "スペイン・カサミラ",
    year: "2022",
    country: "スペイン",
    description: "ガウディ建築の傑作と現代アートの融合",
    images: [
      "/images/23624_0.jpg",
      "/images/23630_0.jpg",
      "/images/heji3918.jpg",
    ],
  },
  {
    id: "normandy",
    label: "フランス・ノルマンディー",
    year: "2023",
    country: "フランス",
    description: "歴史と自然が織りなす風景からのインスピレーション",
    images: [
      "/images/Ludo-mediatheque-Etrepagny-Le-Patio--ML-Vittori-min-1200x900.jpg",
    ],
  },
  {
    id: "tokyo-higashi-shinjuku",
    label: "東京・東新宿",
    year: "2023",
    country: "日本",
    description: "都市の夜景に映えるポップアートの展示",
    images: [
      "/attached_assets/LINE_ALBUM_20241124_250525_234.jpg",
      "/attached_assets/LINE_ALBUM_20241124_250525_233.jpg",
      "/attached_assets/LINE_ALBUM_20241124_250525_238.jpg",
    ],
  },
  {
    id: "atis-mons-church",
    label: "フランス・アティスモンス教会",
    year: "2023",
    country: "フランス",
    description: "歴史的な教会を舞台にした特別展示会",
    images: [
      "/images/23588.jpg",
      "/images/23571_0.jpg",
      "/images/23590_0 (1).jpg",
    ],
  },
  {
    id: "france-chambord",
    label: "フランス・シャンボール城",
    year: "2023",
    country: "フランス",
    description: "フランス最大の城を描く野外アートプロジェクト",
    images: ["/images/23694.jpg", "/images/23687_0.jpg"],
  },
  {
    id: "montmartre",
    label: "フランス・モンマルトル",
    year: "2023",
    country: "フランス",
    description: "芸術家の聖地で描く街角スケッチの旅",
    images: ["/images/23704_0.jpg", "/images/23703_0.jpg"],
  },
  {
    id: "tokyo-shinjuku-2024",
    label: "東京・新宿",
    year: "2024",
    country: "日本",
    description: "都市の現代建築とアートの融合",
    images: [
      "/tokyo_shinjuku1.jpg",
      "/tokyo_shinjuku2.jpg",
      "/tokyo_shinjuku3.jpg",
    ],
  },
  {
    id: "chaumont",
    label: "フランス・ショーモン城",
    year: "2024",
    country: "フランス",
    description: "歴史的な城での特別展示プロジェクト",
    images: [
      "/images/LINE_ALBUM_20241124_250525_242.jpg",
      "/images/LINE_ALBUM_20241124_250525_243.jpg",
    ],
  },
  {
    id: "nice",
    label: "フランス・ニース",
    year: "2024",
    country: "フランス",
    description: "地中海の陽光に照らされた色彩の研究",
    images: [
      "/images/スクリーンショット 2025-05-25 19.23.37.png",
      "/images/スクリーンショット 2025-05-25 19.23.54.png",
      "/images/スクリーンショット 2025-05-25 19.24.12.png",
    ],
  },
  {
    id: "monaco",
    label: "モナコ",
    year: "2024",
    country: "モナコ",
    description: "地中海の高級リゾートでの現代アート展示",
    images: ["/monaco1.jpg", "/monaco2.jpg", "/monaco3.jpg"],
  },
  {
    id: "fukuyama",
    label: "広島・福山",
    year: "2024",
    country: "日本",
    description: "福山こころの病院での愛と癒しをテーマにした作品展示",
    images: ["/images/13456_0.jpg"],
  },
  {
    id: "saint-hilaire-andre",
    label: "フランス・ティレーヌアンドレシス教会",
    year: "2024",
    country: "フランス",
    description: "中世の面影を残す村の教会での滞在制作",
    images: [
      "/images/1731420256.jpg",
      "/images/スクリーンショット 2025-05-25 23.14.20.png",
      "/images/スクリーンショット 2025-05-25 23.15.16.png",
    ],
  },
  {
    id: "bourges",
    label: "フランス・ブールジュ",
    year: "2025",
    country: "フランス",
    description: "ゴシック建築に囲まれた創作体験",
    images: ["/images/13463.jpg"],
  },
  {
    id: "paris-2025",
    label: "フランス・パリ",
    year: "2025",
    country: "フランス",
    description: "パリ19区ギャラリーMでの個展とノルマンディーでの撮影",
    details: "パリ19区ジョレス駅近くのギャラリーMで開催。カフェオーナーがポストカード20枚を購入し近隣への案内を配布。カメラマンのカップルは1時間滞在し人物シリーズ10枚を購入。生涯ギャラリーに入ったことがなかった84歳の女性が「すべてがピュア」と感動。並行してノルマンディーで暴風雨の中撮影を敢行、ディエップ浜辺やリンゴ農園で作品を撮影した。",
    images: [
      "/exhibitions/france-2025/01.jpg",
      "/exhibitions/france-2025/02.jpg",
      "/exhibitions/france-2025/03.jpg",
      "/exhibitions/france-2025/04.jpg",
      "/exhibitions/france-2025/05.jpg",
      "/exhibitions/france-2025/06.jpg",
    ],
  },
];

const Exhibition = () => {
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    caption: string;
  } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="space-y-20">
      <section className="bg-gray-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-12 tracking-wider">
              EXHIBITION
            </h1>
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
          <h2 className="text-4xl font-bold mb-4 text-center tracking-wider">
            WORLD LOCATIONS
          </h2>
          <p className="text-xl text-center mb-16 text-gray-700">
            世界各地で取り組んだプロジェクトとインスピレーションを得た場所
          </p>

          {/* すべてのロケーションを詳細カードで表示 */}
          <div className="space-y-16">
            {locations.map((location) => (
              <div
                key={location.id}
                className="bg-white rounded-xl shadow-lg p-8 mb-12"
              >
                <div className="border-b pb-6 mb-8">
                  <div className="flex items-center gap-3">
                    <span className="text-sm tracking-wider text-gray-500">
                      {location.year}
                    </span>
                    <span className="text-sm uppercase tracking-wider text-gray-500">
                      {location.country}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <h2 className="text-3xl font-bold tracking-wide">
                      {location.label}
                    </h2>
                    <div>
                      <ScrollToTopLink
                        href={`/exhibition/location/${location.id}`}
                      >
                        <span className="text-base font-medium text-gray-800 hover:text-primary transition-colors">
                          詳細ページへ
                        </span>
                      </ScrollToTopLink>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                  <div className="lg:w-1/3">
                    <p className="text-lg text-gray-700 leading-relaxed font-semibold">
                      {location.description}
                    </p>

                    {/* 広島 - 中学時代の詳細説明 */}
                    {location.id === "hiroshima" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          祖父が油絵を描いていた影響で美術を選択し、初めて油絵を描きました。
                          絵の具は祖父の部屋と同じ匂いがしました。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          最初に描いた静物画は、茶色の箱と花、時計と黄色いレモン。この中学3年生での油絵体験が、
                          その後の私の芸術人生の原点となっています。
                        </p>
                      </>
                    )}

                    {/* 東京・新宿 - 大学時代の詳細説明 */}
                    {location.id === "tokyo-shinjuku" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          大学入学を機に広島から東京に出てきて、新宿での一人暮らしを始めました。
                          同じく上京し、高校時代に美術部に所属していた友人の影響で、趣味の一環として抽象画を描きました。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          何枚か描いてみると、友人から「個展ができるんじゃないか」と言われました。
                          このときは重く受け止めていませんでしたが、将来的に海外で認められる可能性を表していたのかもしれません。
                        </p>
                      </>
                    )}

                    {/* 東京・池袋 - ビジネス後の再開の詳細説明 */}
                    {location.id === "tokyo-ikebukuro" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          研究や起業、ビジネスに打ち込んでいて長い間絵から遠ざかっていましたが、
                          仕事を少し減らしたことをきっかけに時間に余裕ができました。
                          油絵に詳しい仕事仲間から「絵が上手いから、もっと描くといい」と勧められたことが、
                          再び創作活動を始める大きなきっかけとなりました。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          たくさんの作品を描くと、作品を見た周囲の人々から「素晴らしい！かわいい！」という評価をいただき、
                          仕事仲間からも「ぜひ本場のフランスで個展を開いて、たくさんの人に見てもらいたい」と言われました。この言葉が国際的な展示への道を開くきっかけとなりました。
                        </p>
                      </>
                    )}

                    {/*  */}
                    {location.id === "abu-dhabi" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          2019年、アブダビで初の海外出展を行いました。池袋のアトリエで制作した「ひょこあに」シリーズを出展し、動物が顔を出す親しみやすいデザインが現地でも好評を博しました。特に「ひょこあに」は来場者アンケートで最も人気を集め、文化を超えて伝わるアートの力を実感。国際的な活動への自信を深め、ヨーロッパ進出への重要な一歩となりました。{" "}
                        </p>
                      </>
                    )}

                    {/*  */}
                    {location.id === "tokyo-okubo" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          新大久保のおしゃれなギャラリーで動物シリーズを展示しました。友人の依頼で描いた犬や猫の作品が多くの来場者に愛され、特に色彩豊かで親しみやすい表現が幅広い世代に好評でした。多文化が共存する街ならではの反響があり、言語や文化を超えるアートの力を実感。展示中には絵本化の話も持ち上がり、作品の可能性を広げる機会となりました。{" "}
                        </p>
                      </>
                    )}

                    {/* パリ第一回 - 詳細説明 */}
                    {location.id === "paris" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          パリ11区のバスティーユ広場近くにあるGallery
                          Art.Cで開催。パリの方々から「C'est
                          magnifique!（セマニフィク！）素晴らしい！」「Très
                          bien!（トレビアン！）」「C'est
                          mignon（セミニョン！）かわいい！」と絶賛され、ポストカードが飛ぶように売れ、絵画も購入していただきました。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          特に印象的だったのは、ギャラリーオーナーから「30年やってるけど、短期間の個展でしかも新人アーティストで絵が売れたのは初めて」と言われたことです。この成功体験が、その後の国際的な展示活動への大きな自信となりました。
                        </p>
                      </>
                    )}

                    {/* フランス・サヴィニー地方 - 詳細説明 */}
                    {location.id === "france-savigny" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          パリ第一回個展でファンになってくださった方がイベントに紹介してくださり、地元の美術イベントに出展する機会をいただきました。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          このイベントでは、地元の高校生の子がひょこあにのTシャツを着てファッションショーをしてくれました。とても似合っていて、アートとファッションの融合を見ることができ、とても感動しました。地方都市でもアートを通じた新しい表現の可能性を実感できた貴重な体験でした。
                        </p>
                      </>
                    )}

                    {/* ロンドン - 詳細説明 */}
                    {location.id === "london" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          ロンドンで開かれた展覧会に出展する機会をいただきました。歴史と伝統のある芸術都市での展示は、私にとって大変光栄な体験でした。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          この展覧会での作品が評価され、英国王立美術家協会（Royal
                          Society of British
                          Artists）の名誉会員に招待されました。国際的な芸術界での認知度が高まり、イギリスの芸術コミュニティとの貴重な繋がりを築くことができました。
                        </p>
                      </>
                    )}

                    {/* 東京・赤坂 - 詳細説明 */}
                    {location.id === "tokyo-akasaka" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          絵を描く時間が増え、赤坂に部屋を借りて毎日創作に専念していました。3ヶ月という短期間で150枚の作品を制作し、非常に密度の高い創作活動を行いました。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          この時期は、これまでの抽象画に加え、女の子の絵を描くようになった重要な転換期でした。今までとは違った画風の作品を創ることができ、自分の表現の幅が大きく広がった時期として印象に残っています。
                        </p>
                      </>
                    )}

                    {/* パリ第二回 - 詳細説明 */}
                    {location.id === "paris-second" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          コロナの影響で個展の機会を逃しましたが、明けて2回目の個展を行うことができました。2回目は2箇所で開催し、このときも大好評でした。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          フランスの方々は普段はあまり感情を表に出しませんが、作品を前にすると、深く感じ取ったことを時間をかけて情熱的に話してくださいます。中には何十分も、時には1時間も作品について語ってくださる方もいらっしゃいます。作品がそれだけ心に響いていることを実感できて、とても嬉しく思います。
                        </p>
                      </>
                    )}

                    {/* パリ2025 - 詳細説明 */}
                    {location.id === "paris-2025" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          パリ19区ジョレス駅近くのギャラリーMで開催。カフェオーナーがポストカード20枚を購入し、近隣店主への案内配布を申し出てくださいました。カメラマンのカップルと母親は約1時間滞在し、人物シリーズ10枚とキーホルダーを購入されました。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          特に印象的だったのは、84歳の女性の来場です。生涯パリに暮らしながら一度もギャラリーに入ったことがなかった彼女は、ガラス越しに作品を見て心を打たれ、初めて展示空間へ足を踏み入れました。「すべてがピュアで、これを描いた人の心は間違いなく純粋に違いない」と語り、作品とポストカードを手に取って静かに帰っていきました。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          並行して行われたノルマンディーでの撮影は、暴風雨と晴天が瞬時に入れ替わる過酷な天候の中で敢行。ディエップの浜辺やリンゴ農園、公園など、ノルマンディーの静けさに包まれた風景の中で作品を撮影しました。
                        </p>
                      </>
                    )}

                    {/* アティスモンス 2022 - 詳細説明 */}
                    {location.id === "atis-mons" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          パリ近郊の静かな住宅地アティスモンスで、集中的な創作期間を過ごしました。フランスの日常生活に溶け込みながら、地元の方々との交流を通じて新しいインスピレーションを得ることができました。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          この滞在中に制作した作品は、フランスの穏やかな空気感と、地域の人々の温かさを反映しています。アトリエでの制作に加え、街を歩きながらスケッチを重ね、後の作品群の土台となる重要な時期でした。
                        </p>
                      </>
                    )}

                    {/* スペイン・カサミラ 2022 - 詳細説明 */}
                    {location.id === "spain-casamila" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          バルセロナにあるガウディの傑作、カサ・ミラ（ラ・ペドレラ）での展示に参加しました。曲線と自然をモチーフにした建築空間の中で、私の作品がどのように見えるか、とても興味深い体験でした。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          ガウディの有機的なデザイン哲学と自分の作品との対話は、芸術における「自然との調和」について深く考えるきっかけとなりました。スペインの情熱的な芸術文化に触れ、表現の幅を広げる貴重な機会となりました。
                        </p>
                      </>
                    )}

                    {/* フランス・ノルマンディー 2023 - 詳細説明 */}
                    {location.id === "normandy" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          ノルマンディー地方のエトルパニーにある図書館・メディアテークで展示を行いました。歴史と自然が織りなすこの地域の風景は、作品制作に大きなインスピレーションを与えてくれました。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          印象派の画家たちも愛したこの地域の柔らかな光と、緑豊かな田園風景の中で、静寂と自然の美しさを感じながら創作活動に取り組みました。
                        </p>
                      </>
                    )}

                    {/* 東京・東新宿 2023 - 詳細説明 */}
                    {location.id === "tokyo-higashi-shinjuku" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          東新宿のギャラリーで、ポップアートと抽象画を融合させた作品群を展示しました。都市の夜景に映える色彩豊かな作品は、来場者の方々から好評をいただきました。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          新宿の多様なエネルギーと文化の交差点で、国内外のアートファンと交流する機会を得ました。この展示は、日本での活動基盤を強化する重要なステップとなりました。
                        </p>
                      </>
                    )}

                    {/* フランス・アティスモンス教会 2023 - 詳細説明 */}
                    {location.id === "atis-mons-church" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          アティスモンスの歴史ある教会を会場に、神聖な空間と現代アートの融合を試みた特別展示会を開催しました。教会の厳かな雰囲気の中で、作品たちは新たな表情を見せてくれました。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          地域の方々が多く訪れ、芸術を通じた心の交流が生まれました。伝統的な建築空間と現代アートの対話は、観る人それぞれに深い印象を残す展示となりました。
                        </p>
                      </>
                    )}

                    {/* フランス・シャンボール城 2023 - 詳細説明 */}
                    {location.id === "france-chambord" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          ロワール渓谷にあるフランス最大の城、シャンボール城での野外アートプロジェクトに参加しました。ルネサンス建築の傑作を背景に、作品の撮影を行いました。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          壮大な城と広大な庭園の中で、歴史と現代アートが出会う瞬間を捉えることができました。この体験は、スケールの大きな作品づくりへの挑戦意欲を高めてくれました。
                        </p>
                      </>
                    )}

                    {/* フランス・モンマルトル 2023 - 詳細説明 */}
                    {location.id === "montmartre" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          芸術家の聖地モンマルトルで、街角スケッチと撮影を行いました。ピカソやゴッホが歩いた同じ石畳の上で、彼らの創作精神を感じながら制作に取り組みました。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          サクレ・クール寺院を望む丘の上で、パリの街並みと自分の作品を一緒に収めた写真は、芸術の歴史と現在を繋ぐ特別な記録となりました。
                        </p>
                      </>
                    )}

                    {/* 東京・新宿 2024 - 詳細説明 */}
                    {location.id === "tokyo-shinjuku-2024" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          2024年、新宿の現代的なギャラリースペースで展示を開催しました。高層ビルが立ち並ぶ都市景観の中で、アートが持つ癒しの力を表現した作品群を発表しました。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          忙しい都会の中で一息つける空間を提供したいという思いを込めて、来場者の方々に穏やかな時間を過ごしていただけるよう心がけました。
                        </p>
                      </>
                    )}

                    {/* フランス・ショーモン城 2024 - 詳細説明 */}
                    {location.id === "chaumont" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          ロワール渓谷のショーモン城で開催された特別展示プロジェクトに参加しました。中世の城と現代アートの融合は、時を超えた芸術の対話を生み出しました。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          城の美しい庭園を舞台に、自然と建築、そしてアートが一体となった空間で作品を展示できたことは、とても光栄な体験でした。
                        </p>
                      </>
                    )}

                    {/* フランス・ニース 2024 - 詳細説明 */}
                    {location.id === "nice" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          コート・ダジュールの中心地ニースで、地中海の陽光に照らされた色彩の研究を行いました。マティスも愛したこの街の光は、作品の色彩感覚に新たなインスピレーションを与えてくれました。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          青い海と空、色とりどりの建物が織りなす風景の中で、明るく生命力あふれる作品群を制作しました。南仏の開放的な雰囲気は、表現の自由さを後押ししてくれました。
                        </p>
                      </>
                    )}

                    {/* モナコ 2024 - 詳細説明 */}
                    {location.id === "monaco" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          地中海に面した高級リゾート、モナコ公国での展示に参加しました。洗練された文化と芸術への深い理解を持つこの地で、作品を発表できたことは大変名誉なことでした。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          世界中から集まる芸術愛好家との交流を通じて、国際的なアートシーンにおける自分の位置づけを再確認する機会となりました。
                        </p>
                      </>
                    )}

                    {/* 広島・福山 2024 - 詳細説明 */}
                    {location.id === "fukuyama" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          福山こころの病院で、愛と癒しをテーマにした作品展示を行いました。医療の現場でアートが持つ力を活かし、患者さんやスタッフの方々に安らぎを届けたいという思いから実現した展示です。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          故郷広島に近いこの場所で、アートを通じた心のケアに貢献できることは、私にとって特別な意味を持つ活動となりました。
                        </p>
                      </>
                    )}

                    {/* フランス・ティレーヌアンドレシス教会 2024 - 詳細説明 */}
                    {location.id === "saint-hilaire-andre" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          中世の面影を残すフランスの小さな村で、歴史ある教会を舞台に滞在制作を行いました。静寂に包まれた環境の中で、内省的な作品づくりに集中することができました。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          村の人々の温かいもてなしを受けながら、時間がゆっくりと流れるこの場所で、心に響く作品を生み出すことができました。
                        </p>
                      </>
                    )}

                    {/* フランス・ブールジュ 2025 - 詳細説明 */}
                    {location.id === "bourges" && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          ユネスコ世界遺産のブールジュ大聖堂がある歴史的な街で、ゴシック建築に囲まれた創作体験をしました。中世の建築美と現代アートの対話を試みました。
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mt-4">
                          フランス中部のこの美しい街で、歴史の重みを感じながら新しい表現に挑戦しました。伝統と革新の融合をテーマにした作品制作に取り組んでいます。
                        </p>
                      </>
                    )}
                  </div>

                  <div className="lg:w-2/3">
                    <h3 className="text-xl font-medium mb-6 text-gray-800">
                      アーティスト活動の記録
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {location.images.map((img, i) => (
                        <div
                          key={i}
                          className="aspect-square bg-gray-100 rounded overflow-hidden group cursor-pointer"
                          onClick={() =>
                            setSelectedImage({
                              url: img,
                              caption: `${location.label} - ${i + 1}`,
                            })
                          }
                        >
                          <img
                            src={img}
                            alt={`${location.label} - ${i + 1}`}
                            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.onerror = null;
                              img.src = "/placeholder.png";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

export default Exhibition;
