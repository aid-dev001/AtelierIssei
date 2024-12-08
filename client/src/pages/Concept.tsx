const Concept = () => {
  return (
    <div className="space-y-20">
      <section>
        <div className="text-center py-20 bg-white">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-12 tracking-wider text-gray-800">ART CONCEPT</h1>
            <p className="text-xl text-gray-700 leading-relaxed font-medium max-w-2xl mx-auto">
              私たちは、日常の中に特別な瞬間を創造します。
              温かみのある色彩と大胆な構図で、見る人の心に寄り添う作品を生み出しています。
            </p>
          </div>
        </div>

        <div className="relative min-h-[80vh] flex items-center justify-center">
          <div className="absolute inset-0">
            <img
              src="/1731420256.jpg"
              alt="Church Exhibition"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          
          <div className="relative container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-white/20 backdrop-blur-sm p-16 rounded-2xl space-y-8">
              <div className="space-y-6">
                <p className="text-xl text-white leading-loose tracking-wider font-medium text-center">
                  アーティストisseiが、
                </p>
                <p className="text-xl text-white leading-loose tracking-wider font-medium text-center">
                  心が沈み、孤独を感じる瞬間
                </p>
                <p className="text-xl text-white leading-loose tracking-wider font-medium text-center">
                  自らを励ますために描く希望のアート
                </p>
                <p className="text-xl text-white leading-loose tracking-wider font-medium text-center">
                  華やかさの中に漂うほのかな儚さが、
                </p>
                <p className="text-xl text-white leading-loose tracking-wider font-medium text-center">
                  心の深淵を映し出しています
                </p>
                <p className="text-xl text-white leading-loose tracking-wider font-medium text-center">
                  その一枚一枚が、見る人の心にそっと寄り添い
                </p>
                <p className="text-xl text-white leading-loose tracking-wider font-medium text-center">
                  優雅で鮮やかな色彩と力強い形は
                </p>
                <p className="text-xl text-white leading-loose tracking-wider font-medium text-center">
                  温かな幸福感と希望の光をもたらします
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-wide">創造の源泉</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              日々の生活の中で感じる感動や驚き、そして静寂。
              それらの瞬間を捉え、キャンバスの上で新しい物語として紡ぎ出します。
              私たちの作品は、見る人それぞれの心の中で、
              新たな意味と価値を見出していくことを願っています。
            </p>
          </div>
          <div className="aspect-square relative overflow-hidden rounded-xl shadow-xl">
            <img
              src="/artworks/12648.jpg"
              alt="Art Process"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">色彩の調和</h3>
              <p className="text-gray-600 leading-relaxed">
                温かみのある色使いと大胆な構図で、
                見る人の心に直接語りかける作品を目指しています。
              </p>
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">空間との対話</h3>
              <p className="text-gray-600 leading-relaxed">
                作品が置かれる空間との調和を常に意識し、
                その場所にしかない特別な存在となることを大切にしています。
              </p>
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">感動の共有</h3>
              <p className="text-gray-600 leading-relaxed">
                アートを通じて感動を分かち合い、
                新しい価値観との出会いを創造していきます。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Concept;
