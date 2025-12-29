'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { productsApi } from '@/lib/api/endpoints/inventory';
import { toast } from 'sonner';
import { formatFileSize } from '@/lib/utils/file';

interface ProductPhotoUploadProps {
  productId: string;
  currentPhotoUrl?: string;
  onUploadSuccess?: (photoUrl: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

export function ProductPhotoUpload({
  productId,
  currentPhotoUrl,
  onUploadSuccess,
}: ProductPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return 'Format file tidak didukung. Gunakan JPG, JPEG, PNG, atau GIF.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Ukuran file terlalu besar. Maksimal ${formatFileSize(MAX_FILE_SIZE)}.`;
    }
    return null;
  };

  const handleFile = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      try {
        setUploading(true);
        setProgress(0);

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 100);

        const response = await productsApi.uploadPhoto(productId, file);

        clearInterval(progressInterval);
        setProgress(100);

        if (response.success && response.data && response.data.photoUrl) {
          toast.success('Foto produk berhasil diunggah');
          onUploadSuccess?.(response.data.photoUrl);
        } else {
          toast.error(response.message || 'Gagal mengunggah foto');
          setPreview(null);
        }
      } catch (error) {
        console.error('Failed to upload photo:', error);
        toast.error('Gagal mengunggah foto');
        setPreview(null);
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [productId, onUploadSuccess]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = preview || currentPhotoUrl;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Foto Produk</h3>
            {preview && !uploading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearPreview}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Batal
              </Button>
            )}
          </div>

          {/* Current/Preview Image */}
          {displayUrl ? (
            <div className="relative aspect-square w-full max-w-[300px] mx-auto rounded-lg overflow-hidden border">
              <Image
                src={displayUrl}
                alt="Foto produk"
                fill
                className="object-cover"
                sizes="300px"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </div>
          ) : (
            <div
              className={`
                relative aspect-square w-full max-w-[300px] mx-auto rounded-lg border-2 border-dashed
                flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors
                ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={handleClick}
            >
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center px-4">
                Klik atau seret foto ke sini
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, GIF (maks. 5MB)
              </p>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                Mengunggah... {progress}%
              </p>
            </div>
          )}

          {/* Upload Button */}
          {displayUrl && !uploading && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleClick}>
                <Upload className="h-4 w-4 mr-2" />
                Ganti Foto
              </Button>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FORMATS.join(',')}
            onChange={handleChange}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
}