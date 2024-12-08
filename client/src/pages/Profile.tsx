const Profile = () => {
  return (
    <div className="space-y-20">
      <section className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-12 text-center">PROFILE</h1>
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

      <section className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-16 text-center tracking-wider">EXHIBITIONS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/95 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-2xl font-bold mb-3">2024</h3>
            <div className="space-y-4">
              <div>
                <p className="text-lg mb-2 text-gray-700">「光と調和」個展</p>
                <p className="text-sm text-gray-600">Nice Art Gallery</p>
              </div>
              <div>
                <p className="text-lg mb-2 text-gray-700">「祈りと芸術」展</p>
                <p className="text-sm text-gray-600">Bali Sacred Art Space</p>
              </div>
            </div>
          </div>
          <div className="bg-white/95 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-2xl font-bold mb-3">2023</h3>
            <div className="space-y-4">
              <div>
                <p className="text-lg mb-2 text-gray-700">「記憶の風景」パリ個展</p>
                <p className="text-sm text-gray-600">Galerie Paris Modern</p>
              </div>
              <div>
                <p className="text-lg mb-2 text-gray-700">「現代アートの潮流」グループ展</p>
                <p className="text-sm text-gray-600">Tokyo Contemporary</p>
              </div>
            </div>
          </div>
          <div className="bg-white/95 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-2xl font-bold mb-3">2022</h3>
            <div className="space-y-4">
              <div>
                <p className="text-lg mb-2 text-gray-700">「内なる宇宙」パリ個展</p>
                <p className="text-sm text-gray-600">Espace d'Art Paris</p>
              </div>
              <div>
                <p className="text-lg mb-2 text-gray-700">「アートとテクノロジー」展</p>
                <p className="text-sm text-gray-600">Digital Art Space Tokyo</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
