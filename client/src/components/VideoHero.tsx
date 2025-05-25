import React, { useEffect, useRef } from 'react';

interface VideoHeroProps {
  videoSrc: string;
  posterSrc?: string;
}

const VideoHero: React.FC<VideoHeroProps> = ({ videoSrc, posterSrc }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // ユーザー操作後に動画を再生する
    const attemptPlay = () => {
      videoElement.play()
        .catch(error => {
          console.log("自動再生できませんでした: ", error);
        });
    };

    // ページが十分に読み込まれた後に再生を試みる
    if (document.readyState === 'complete') {
      attemptPlay();
    } else {
      window.addEventListener('load', attemptPlay);
      return () => window.removeEventListener('load', attemptPlay);
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 動画背景 */}
      <div className="absolute inset-0 bg-black">
        <video 
          ref={videoRef}
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover opacity-75"
          poster={posterSrc || '/images/12653.jpg'}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* 暗いオーバーレイ */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>
      
      {/* コンテンツ */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-8xl font-bold mb-12 tracking-[0.2em] text-white">
              ATELIER ISSEI
            </h1>
            <p className="text-xl md:text-3xl font-light mb-16 tracking-[0.3em] text-gray-100">
              心に寄り添うアートを
            </p>
            <div className="max-w-2xl mx-auto space-y-8">
              <p className="text-lg tracking-[0.15em] leading-relaxed font-medium text-gray-200">
                私たちは、日常の中に特別な瞬間を創造します。
                光と影、色彩と形が織りなす物語を通じて、
                見る人の心に静かな感動を届けます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoHero;