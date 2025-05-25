import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";

interface VideoModalProps {
  videoSrc: string;
  children: React.ReactNode;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoSrc, children }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = React.useState(false);

  // 動画モーダルが開いたときに自動再生、閉じたときに一時停止
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (open) {
      videoElement.play().catch(error => {
        console.log("再生できませんでした: ", error);
      });
    } else {
      videoElement.pause();
      videoElement.currentTime = 0;
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-full h-screen max-w-none border-none bg-black/95 p-0 m-0 backdrop-blur-sm">
        <div className="sr-only">
          <DialogTitle>アーティスト活動記録</DialogTitle>
        </div>
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            ref={videoRef}
            controls
            className="max-h-full max-w-full"
            preload="auto"
          >
            <source src={videoSrc} type="video/mp4" />
            お使いのブラウザは動画再生に対応していません。
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;