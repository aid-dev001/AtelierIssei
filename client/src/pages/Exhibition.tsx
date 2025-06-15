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
    description: "砂漠の国で開催した個展での作品展示",
    images: ["/images/abu_dhabi_1.jpg"],
  },
  {
    id: "tokyo-okubo",
    label: "東京・大久保",
    year: "2019",
    country: "日本",
    description: "動物シリーズの人気展示",
    images: ["/images/tokyo_okubo_1.jpg"],
  },
  {
    id: "paris",
    label: "パリ第一回",
    year: "2019",
    country: "フランス",
    description: "芸術の都で開催した初個展での作品展示",
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
    description: "フランス地方都市でのファッションとアートの融合展示",
    images: ["/images/s231sa.jpg", "/images/23671.jpg"],
  },
  {
    id: "london",
    label: "ロンドン",
    year: "2021",
    country: "イギリス",
    description: "古典と現代が融合する街での芸術探求",
    images: ["/images/スクリーンショット 2025-05-25 23.21.59.png"],
  },
  {
    id: "tokyo-akasaka",
    label: "東京・赤坂",
    year: "2022",
    country: "日本",
    description: "伝統と革新が交差する街で生まれる新しい表現",
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
    description: "パリ中心部での2回目の個展「POKO FACE」シリーズ",
    images: [
      "/attached_assets/23601.jpg",
      "/attached_assets/23622_0.jpg",
      "/attached_assets/1662819546.jpg",
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

                    {/* その他の場所 - 汎用的な説明 */}
                    {![
                      "hiroshima",
                      "tokyo-shinjuku",
                      "tokyo-ikebukuro",
                    ].includes(location.id) && (
                      <>
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
