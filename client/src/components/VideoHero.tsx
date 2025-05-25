import React, { useState, useRef } from 'react';

interface VideoHeroProps {
  videoSrc: string;
  posterSrc?: string;
  title?: string;
}

const VideoHero: React.FC<VideoHeroProps> = ({ 
  videoSrc, 
  posterSrc,
  title = "アーティスト活動記録"
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 再生ボタンをクリックしたときの処理
  const handlePlayClick = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    if (videoElement.paused) {
      videoElement.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.log("再生できませんでした: ", error);
        });
    } else {
      videoElement.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: '80vh' }}>
      {/* 動画背景 */}
      <div className="absolute inset-0 bg-black">
        <video 
          ref={videoRef}
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover opacity-80"
          poster={posterSrc || '/images/12653.jpg'}
          preload="auto"
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* 暗いオーバーレイ */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>
      
      {/* コンテンツ */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-wide text-white">
              {title}
            </h2>
            <p className="text-xl text-gray-100 max-w-2xl mb-8">
              各地での創作活動と展示の様子をご覧ください。世界各地での活動を通じて得た経験と感性が、作品に表現されています。
            </p>
            
            {/* 再生ボタン */}
            <button 
              onClick={handlePlayClick}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-all duration-300"
            >
              <svg 
                className="w-6 h-6" 
                fill="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {isPlaying ? (
                  // 一時停止アイコン
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                ) : (
                  // 再生アイコン
                  <path d="M8 5v14l11-7z" />
                )}
              </svg>
              <span>{isPlaying ? '一時停止' : '再生'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoHero;