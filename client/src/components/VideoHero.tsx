import React, { useEffect, useRef } from 'react';

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

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // 動画のロード状態をチェックして再生を試みる
    const attemptPlay = () => {
      // 動画のロードが完了していない場合は、ロード完了時のイベントを設定
      if (videoElement.readyState < 3) { // HAVE_FUTURE_DATA = 3
        videoElement.addEventListener('canplay', handleCanPlay);
      } else {
        // 既にロード済みの場合は直接再生
        startPlayback();
      }
    };

    // 動画が再生可能になった時の処理
    const handleCanPlay = () => {
      videoElement.removeEventListener('canplay', handleCanPlay);
      startPlayback();
    };

    // 再生開始関数
    const startPlayback = () => {
      videoElement.play()
        .catch(error => {
          console.log("自動再生できませんでした: ", error);
        });
    };

    // 即時実行
    attemptPlay();

    // クリーンアップ関数
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('canplay', handleCanPlay);
      }
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: '80vh' }}>
      {/* 動画背景 */}
      <div className="absolute inset-0 bg-black">
        <video 
          ref={videoRef}
          autoPlay 
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
            <p className="text-xl text-gray-100 max-w-2xl">
              各地での創作活動と展示の様子をご覧ください。世界各地での活動を通じて得た経験と感性が、作品に表現されています。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoHero;