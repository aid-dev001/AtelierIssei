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
                幼少期より芸術に親しみ、祖父の油絵に影響を受けて育つ。
                心の機微を捉えた繊細な作風と力強い色使いが特徴的な作品を生み出し続けています。
              </p>
              <p className="text-gray-600 leading-relaxed">
                国内外での個展やグループ展に多数参加。
                フランスを中心とした海外での展示活動を通じて、
                新たな芸術表現の可能性を追求しています。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-16 text-center tracking-wider">HISTORY</h2>
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* 縦線 */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gray-200 transform -translate-x-1/2" />
            
            <div className="space-y-12">
              {[
                {
                  period: "幼少期",
                  description: "祖父の油絵に囲まれた環境で育ち、自然と芸術への関心を育む",
                },
                {
                  year: "1997",
                  description: "中学校の美術の授業で初めて油絵に触れ、表現の可能性に魅了される",
                },
                {
                  year: "2003",
                  description: "友人の影響で抽象画の制作を開始。以降15年間、独自の表現を模索し続ける",
                },
                {
                  year: "2015",
                  description: "祖父の遺品整理を通じて、家族の芸術の系譜に触れる。曽祖父のラフ画との出会いが転機に",
                },
                {
                  year: "2018",
                  description: "「イマジンシリーズ」で抽象画の新境地を開拓。続けて「ひょこあにシリーズ」を開始し、日本と台湾で撮影プロジェクトを展開",
                },
                {
                  year: "2019",
                  description: "思い出をモチーフにした「メモリーシリーズ」を開始。同年、ドバイや国内での展示を経て、パリで初の個展を開催",
                },
                {
                  year: "2022-2023",
                  description: "パリでの個展を連続開催。ISSEIとしての新たな活動をスタート",
                },
                {
                  year: "2024",
                  description: "活動の場を広げ、フランス・ニースやバリ郊外の教会で個展を開催。より深い精神性を追求した作品群を発表",
                }
              ].map((item, index) => (
                <div key={index} className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  {/* 年代マーカー */}
                  <div className="absolute left-0 md:left-1/2 w-4 h-4 bg-primary/80 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg" />
                  
                  <div className={`md:text-right ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                    <span className="text-xl font-bold text-primary/80">
                      {item.year || item.period}
                    </span>
                  </div>
                  <div className={index % 2 === 0 ? 'md:order-2' : 'md:order-1'}>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
