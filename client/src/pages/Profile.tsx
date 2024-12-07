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
                2010年よりアーティストとして活動を開始。
                心の機微を捉えた繊細な作風と、
                力強い色使いが特徴的な作品を生み出し続けています。
              </p>
              <p className="text-gray-600 leading-relaxed">
                国内外での個展やグループ展に多数参加。
                近年は、デジタルアートとの融合も試みながら、
                新たな表現の可能性を追求しています。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-16 text-center tracking-wider">EXHIBITIONS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/95 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-2xl font-bold mb-3">2023</h3>
            <div className="space-y-4">
              <div>
                <p className="text-lg mb-2 text-gray-700">「光と影の境界線」個展</p>
                <p className="text-sm text-gray-600">Tokyo Gallery</p>
              </div>
              <div>
                <p className="text-lg mb-2 text-gray-700">「現代アートの潮流」グループ展</p>
                <p className="text-sm text-gray-600">Art Space NY</p>
              </div>
            </div>
          </div>
          <div className="bg-white/95 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-2xl font-bold mb-3">2022</h3>
            <div className="space-y-4">
              <div>
                <p className="text-lg mb-2 text-gray-700">「内なる風景」個展</p>
                <p className="text-sm text-gray-600">Kyoto Museum</p>
              </div>
              <div>
                <p className="text-lg mb-2 text-gray-700">「デジタルアートの未来」展</p>
                <p className="text-sm text-gray-600">Digital Art Festival</p>
              </div>
            </div>
          </div>
          <div className="bg-white/95 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-2xl font-bold mb-3">2021</h3>
            <div className="space-y-4">
              <div>
                <p className="text-lg mb-2 text-gray-700">「記憶の断片」個展</p>
                <p className="text-sm text-gray-600">Gallery Modern</p>
              </div>
              <div>
                <p className="text-lg mb-2 text-gray-700">「アートとテクノロジー」展</p>
                <p className="text-sm text-gray-600">Tech Art Space</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
