import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Loader2 } from "lucide-react";

export interface DropzoneProps extends React.HTMLAttributes<HTMLDivElement> {
  onFileChange: (file: File) => Promise<void> | void;
  existingImageUrl?: string;
  maxHeightClass?: string;
}

const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(
  ({ className, onFileChange, existingImageUrl, maxHeightClass = "max-h-[90%]", ...props }, ref) => {
    const { toast } = useToast();
    const [isDragging, setIsDragging] = React.useState(false);
    const [preview, setPreview] = React.useState<string | null>(existingImageUrl || null);
    const [uploading, setUploading] = React.useState(false);

    React.useEffect(() => {
      if (existingImageUrl) {
        setPreview(existingImageUrl);
      }
    }, [existingImageUrl]);

    React.useEffect(() => {
      return () => {
        if (preview && !preview.startsWith('http')) {
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
      async (file: File) => {
        if (!file.type.startsWith("image/")) {
          toast({ variant: "destructive", title: "画像ファイルのみアップロード可能です" });
          return;
        }

        if (!["image/jpeg", "image/png"].includes(file.type)) {
          toast({ variant: "destructive", title: "JPEGまたはPNG形式の画像のみアップロード可能です" });
          return;
        }

        if (file.size > 30 * 1024 * 1024) {
          toast({ variant: "destructive", title: "ファイルサイズは30MB以下にしてください" });
          return;
        }

        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);
        setUploading(true);

        try {
          await onFileChange(file);
        } catch {
          // アップロード失敗時はプレビューを元に戻す
          URL.revokeObjectURL(localUrl);
          setPreview(existingImageUrl || null);
        } finally {
          setUploading(false);
        }
      },
      [onFileChange, toast, existingImageUrl]
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
        e.target.value = "";
      },
      [processFile]
    );

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-lg border-2 border-dashed border-gray-300 transition-colors",
          preview ? "p-0" : "p-6",
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
          accept="image/jpeg,image/png"
          onChange={handleFileInput}
          disabled={uploading}
        />
        {uploading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 rounded-lg gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            <span className="text-xs text-gray-500">アップロード中...</span>
          </div>
        )}
        {preview ? (
          <div className="relative w-full h-full flex items-center justify-center p-2 rounded-lg">
            <img
              src={preview}
              alt="Preview"
              className={`max-w-full ${maxHeightClass} object-contain dropzone-preview rounded`}
            />
            {!uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100 rounded-lg">
                <p className="text-sm text-white">クリックまたはドラッグ＆ドロップで画像を変更</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <UploadCloud className="h-8 w-8 text-gray-400" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                クリックまたはドラッグ＆ドロップで画像をアップロード
              </p>
              <p className="text-xs text-gray-500">
                30MB以下のJPEGまたはPNG形式の画像ファイル
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Dropzone.displayName = "Dropzone";

export { Dropzone };
