import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface DropzoneProps {
  onFileChange: (file: File) => void;
  className?: string;
}

export const Dropzone = ({ onFileChange, className }: DropzoneProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFileChange(file);
    }
  }, [onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg cursor-pointer transition-colors",
        isDragActive ? "border-primary/50 bg-primary/5" : "border-gray-200 hover:border-primary/30",
        className
      )}
    >
      <input {...getInputProps()} />
      {preview ? (
        <div className="relative w-full h-full">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-500">
            {isDragActive ? (
              "ドロップしてアップロード"
            ) : (
              "クリックまたはドラッグ&ドロップで画像をアップロード"
            )}
          </p>
        </div>
      )}
    </div>
  );
};
