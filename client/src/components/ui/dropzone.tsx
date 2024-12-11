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

    const handleDrop = React.useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        const file = files[0];
        if (!file.type.startsWith("image/")) {
          toast({
            variant: "destructive",
            title: "画像ファイルのみアップロード可能です",
          });
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast({
            variant: "destructive",
            title: "ファイルサイズは5MB以下にしてください",
          });
          return;
        }

        onFileChange(file);
      },
      [onFileChange, toast]
    );

    const handleFileInput = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
          toast({
            variant: "destructive",
            title: "画像ファイルのみアップロード可能です",
          });
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast({
            variant: "destructive",
            title: "ファイルサイズは5MB以下にしてください",
          });
          return;
        }

        onFileChange(file);
      },
      [onFileChange, toast]
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
          className="absolute inset-0 cursor-pointer opacity-0"
          accept="image/*"
          onChange={handleFileInput}
        />
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <UploadCloud className="h-8 w-8 text-gray-400" />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              クリックまたはドラッグ＆ドロップで画像をアップロード
            </p>
            <p className="text-xs text-gray-500">
              5MB以下のJPG、PNG、GIF形式の画像ファイル
            </p>
          </div>
        </div>
      </div>
    );
  }
);

Dropzone.displayName = "Dropzone";

export { Dropzone };
