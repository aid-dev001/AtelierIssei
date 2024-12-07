const Profile = () => {
  return (
    <div className="space-y-20">
      <section className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-12 text-center">PROFILE</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <img
              src="/artworks/image.png"
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

      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">EXHIBITIONS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">2023</h3>
              <ul className="space-y-2 text-gray-600">
                <li>「光と影の境界線」個展 - Tokyo Gallery</li>
                <li>「現代アートの潮流」グループ展 - Art Space NY</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">2022</h3>
              <ul className="space-y-2 text-gray-600">
                <li>「内なる風景」個展 - Kyoto Museum</li>
                <li>「デジタルアートの未来」展 - Digital Art Festival</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">2021</h3>
              <ul className="space-y-2 text-gray-600">
                <li>「記憶の断片」個展 - Gallery Modern</li>
                <li>「アートとテクノロジー」展 - Tech Art Space</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
