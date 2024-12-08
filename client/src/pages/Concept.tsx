const Concept = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="relative">
        {/* 背景のオーバーレイ効果 */}
        <div className="absolute inset-0 bg-[url('/artworks/12648.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        
        {/* メインコンテンツ */}
        <div className="relative z-10">
          <section className="min-h-screen flex items-center justify-center px-4 py-20">
            <div className="max-w-4xl mx-auto text-center space-y-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-24 tracking-[0.2em] text-white/90">
                ART CONCEPT
              </h1>
              
              <div className="space-y-12 leading-relaxed tracking-wider">
                <p className="text-2xl md:text-3xl font-light text-white/80 mb-16">
                  アーティストisseiが、
                </p>
                
                <div className="space-y-8 text-xl md:text-2xl font-light">
                  <p className="text-white/90">
                    心が沈み、孤独を感じる瞬間
                  </p>
                  <p className="text-white/90">
                    自らを励ますために描く希望のアート
                  </p>
                </div>
                
                <div className="space-y-8 text-lg md:text-xl font-light pt-8">
                  <p className="text-white/80">
                    華やかさの中に漂うほのかな儚さが、<br />
                    心の深淵を映し出しています
                  </p>
                  
                  <p className="text-white/80">
                    その一枚一枚が、見る人の心にそっと寄り添い
                  </p>
                  
                  <p className="text-white/80">
                    優雅で鮮やかな色彩と力強い形は<br />
                    温かな幸福感と希望の光をもたらします
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* アート作品のグリッド */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {["/artworks/12653.jpg", "/artworks/12654.jpg", "/artworks/12655.jpg"].map((src, index) => (
                  <div 
                    key={index} 
                    className="relative aspect-square overflow-hidden rounded-lg transform transition-transform duration-500 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-black/30" />
                    <img
                      src={src}
                      alt={`Artwork ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.onerror = null;
                        img.src = '/placeholder.png';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Concept;
