import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
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
      <DialogContent className="sm:max-w-4xl border-none bg-transparent p-0">
        <div className="relative w-full overflow-hidden bg-black rounded-lg">
          <video
            ref={videoRef}
            controls
            className="w-full h-auto"
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