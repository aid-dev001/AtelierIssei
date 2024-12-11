import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud } from "lucide-react";

interface DropzoneProps extends React.HTMLAttributes<HTMLDivElement> {
  onFileChange: (file: File) => void;
}

const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(
  ({ className, onFileChange, ...props }, ref) => {
    const { toast } = useToast();
    const [isDragging, setIsDragging] = React.useState(false);
    const [preview, setPreview] = React.useState<string | null>(null);

    React.useEffect(() => {
      // クリーンアップ関数
      return () => {
        if (preview) {
          URL.revokeObjectURL(preview);
        }
      };
    }, [preview]);

    const handleDragOver = React.useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    }, []);

    const handleDragLeave = React.useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    }, []);

    const processFile = React.useCallback(
      (file: File) => {
        if (!file.type.startsWith("image/")) {
          toast({
            variant: "destructive",
            title: "画像ファイルのみアップロード可能です",
          });
          return false;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast({
            variant: "destructive",
            title: "ファイルサイズは5MB以下にしてください",
          });
          return false;
        }

        // 既存のプレビューをクリーンアップ
        if (preview) {
          URL.revokeObjectURL(preview);
        }

        // 新しいプレビューを作成
        setPreview(URL.createObjectURL(file));
        onFileChange(file);
        return true;
      },
      [onFileChange, toast, preview]
    );

    const handleDrop = React.useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        processFile(files[0]);
      },
      [processFile]
    );

    const handleFileInput = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        processFile(file);
      },
      [processFile]
    );

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors",
          isDragging && "border-primary bg-primary/5",
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        {...props}
      >
        <input
          type="file"
          name="image"
          className="absolute inset-0 cursor-pointer opacity-0"
          accept="image/*"
          onChange={handleFileInput}
        />
        {preview ? (
          <div className="relative aspect-square w-full overflow-hidden rounded-lg group">
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-all duration-300 group-hover:opacity-100">
              <div className="text-center space-y-2 px-4">
                <p className="text-sm text-white font-medium">クリックまたはドラッグ＆ドロップで画像を変更</p>
                <p className="text-xs text-white/80">推奨サイズ: 1200 x 1200px</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 text-center group">
            <div className="p-6 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300">
              <UploadCloud className="h-10 w-10 text-primary/60 group-hover:text-primary/80 transition-colors duration-300" />
            </div>
            <div className="space-y-2">
              <p className="text-base font-medium text-gray-700">
                クリックまたはドラッグ＆ドロップで画像をアップロード
              </p>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">
                  推奨サイズ: 1200 x 1200px
                </p>
                <p className="text-xs text-gray-400">
                  5MB以下のJPG、PNG、GIF形式の画像ファイル
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Dropzone.displayName = "Dropzone";

export { Dropzone };
