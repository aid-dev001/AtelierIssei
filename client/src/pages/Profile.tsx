const Profile = () => {
  return (
    <div className="space-y-20">
      <section className="bg-gray-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-12 tracking-wider">PROFILE</h1>
            <p className="text-xl text-gray-700 leading-relaxed font-medium max-w-2xl mx-auto">
              アーティストisseiの創作活動と歩み。
              芸術を通じて人々の心に寄り添い続けています。
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <img
            src="/artworks/スクリーンショット 2024-12-07 12.26.30.png"
            alt="Artist Profile"
            className="rounded-lg shadow-lg"
          />
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">ISSEI</h2>
            <p className="text-gray-600 leading-relaxed">
              幼少期より芸術に囲まれた環境で育ち、祖父の油絵から深い影響を受ける。
              心の機微を捉えた繊細な作風と、力強い色彩表現が特徴的な作品を生み出し続けています。
            </p>
            <p className="text-gray-600 leading-relaxed">
              抽象画からスタートし、独自のスタイルを確立。
              現在は、日本国内外で個展を開催し、
              伝統と革新が融合する新たな表現の可能性を追求しています。
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-16 text-center tracking-wider">EXHIBITIONS</h2>
        
        {/* WORLD LOCATIONS from Home page */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-12 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
            {[
              {
                id: "hiroshima",
                label: "広島",
                year: "1998",
                country: "日本",
                description: "平和への祈りと再生をテーマにした作品の制作拠点",
                images: ["/images/S__9044006.jpg", "/images/S__9044005.jpg"],
              },
              {
                id: "tokyo-shinjuku",
                label: "東京・新宿",
                year: "2002",
                country: "日本",
                description: "都市の多様性と活気を色彩豊かに表現した作品",
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
                description: "都会の喧騒の中で見つけた静寂を表現するアトリエ",
                images: [
                  "/images/LINE_ALBUM_20241124_250525_65.jpg",
                  "/images/スクリーンショット 2025-05-25 23.25.39.png",
                  "/images/5427.jpg",
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
                description: "多様な文化が混ざり合うギャラリーでの作品展示",
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
                  "/images/paris_3.jpg",
                ],
              },
              {
                id: "france-savigny",
                label: "フランス・サヴィニー地方",
                year: "2019",
                country: "フランス",
                description:
                  "フランス地方都市でのファッションとアートの融合展示",
                images: ["/images/s231sa.jpg", "/images/23671.jpg"],
              },
              {
                id: "london",
                label: "ロンドン",
                year: "2021",
                country: "イギリス",
                description: "古典と現代が融合する街での芸術探求",
                images: [
                  "/images/スクリーンショット 2025-05-25 23.21.59.png",
                ],
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
                description:
                  "歴史と自然が織りなす風景からのインスピレーション",
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
                images: [
                  "/images/chambord_2023_1.jpg",
                  "/images/chambord_2023_2.jpg",
                ],
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
                id: "fukuyama",
                label: "広島・福山",
                year: "2024",
                country: "日本",
                description:
                  "福山こころの病院での愛と癒しをテーマにした作品展示",
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
            ].map((location, index) => (
              <div
                key={location.id}
                className={`hover:bg-gray-50 transition-colors rounded px-3 py-2`}
              >
                <a href={`/exhibition/location/${location.id}`} className="block">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{location.label}</span>
                    <span className="text-sm text-gray-500">
                      {location.year}
                    </span>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50/80 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-16 text-center tracking-wider">ARTIST JOURNEY</h2>
          <div className="max-w-6xl mx-auto">
            {[
              { year: "幼少期", content: "祖父の油絵に囲まれた環境で育つ" },
              { year: "1997", content: "中学3年の美術の授業で油絵と出会い、創作への情熱が芽生える" },
              { year: "2003", content: "抽象画との出会いが、新たな表現の可能性を開く" },
              { year: "2015", content: "祖父の遺品整理を通じて、家族のアートの歴史と向き合う機会を得る" },
              { year: "2018", content: "抽象画のイマジンシリーズを開始。ひょこあにシリーズで日本各地、台湾での撮影を展開" },
              { year: "2019", content: "メモリーシリーズを開始。ドバイ展示会、国内ギャラリー、デザインフェスタに参加。パリで初の個展を開催" },
              { year: "2022", content: "パリ個展開催。世界的な評価を獲得" },
              { year: "2023", content: "パリ個展でisseiブランドの世界観を確立" },
              { year: "2024", content: "フランス・ニースやバリ郊外の教会で個展を開催。国際的な活動の幅を広げる" }
            ].map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-8 mb-8 group">
                <div className="col-span-3 md:text-right">
                  <div className="text-xl font-bold text-gray-800/90">{item.year}</div>
                </div>
                <div className="relative col-span-1 flex justify-center">
                  <div className="w-px h-full bg-gray-200 absolute"></div>
                  <div className="w-3 h-3 rounded-full bg-primary/80 relative top-2 group-hover:scale-125 transition-transform duration-300"></div>
                </div>
                <div className="col-span-8">
                  <p className="text-gray-600 leading-relaxed">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
