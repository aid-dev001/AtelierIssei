import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud } from "lucide-react";

export interface DropzoneProps extends React.HTMLAttributes<HTMLDivElement> {
  onFileChange: (file: File) => void;
  existingImageUrl?: string;
}

const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(
  ({ className, onFileChange, existingImageUrl, ...props }, ref) => {
    const { toast } = useToast();
    const [isDragging, setIsDragging] = React.useState(false);
    const [preview, setPreview] = React.useState<string | null>(existingImageUrl || null);

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
      (file: File) => {
        if (!file.type.startsWith("image/")) {
          toast({
            variant: "destructive",
            title: "画像ファイルのみアップロード可能です",
          });
          return false;
        }

        if (!["image/jpeg", "image/png"].includes(file.type)) {
          toast({
            variant: "destructive",
            title: "JPEGまたはPNG形式の画像のみアップロード可能です",
          });
          return false;
        }

        if (file.size > 30 * 1024 * 1024) {
          toast({
            variant: "destructive",
            title: "ファイルサイズは30MB以下にしてください",
          });
          return false;
        }

        if (preview && !preview.startsWith('http')) {
          URL.revokeObjectURL(preview);
        }

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
          accept="image/jpeg,image/png"
          onChange={handleFileInput}
        />
        {preview ? (
          <div className="relative w-full overflow-hidden rounded-lg">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto object-contain dropzone-preview"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
              <p className="text-sm text-white">クリックまたはドラッグ＆ドロップで画像を変更</p>
            </div>
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
