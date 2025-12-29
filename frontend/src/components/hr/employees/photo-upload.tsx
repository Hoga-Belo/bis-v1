'use client';

import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PermissionGate } from '@/components/auth';
import { employeesApi } from '@/lib/api/endpoints/hr';
import {
  validatePhotoFile,
  formatFileSize,
  ACCEPTED_IMAGE_TYPES,
  MAX_PHOTO_SIZE,
} from '@/lib/utils/file';
import { Camera, Upload, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  employeeId: string;
  currentPhotoUrl?: string;
  employeeName: string;
  onPhotoUpdated: (newPhotoUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
};

const iconSizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function PhotoUpload({
  employeeId,
  currentPhotoUrl,
  employeeName,
  onPhotoUpdated,
  size = 'lg',
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = useCallback((file: File) => {
    const validation = validatePhotoFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const response = await employeesApi.uploadPhoto(employeeId, selectedFile);
      if (response.success && response.data) {
        toast.success('Foto berhasil diunggah');
        onPhotoUpdated(response.data.photoUrl);
        // Clean up preview
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setSelectedFile(null);
      }
    } catch {
      toast.error('Gagal mengunggah foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl || currentPhotoUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar with upload overlay */}
      <PermissionGate
        permissions={['hr:employee:update']}
        fallback={
          <Avatar className={sizeClasses[size]}>
            <AvatarImage src={currentPhotoUrl} alt={employeeName} />
            <AvatarFallback className="text-2xl">
              {getInitials(employeeName)}
            </AvatarFallback>
          </Avatar>
        }
      >
        <div
          className={cn(
            'relative cursor-pointer group',
            isDragging && 'ring-2 ring-primary ring-offset-2 rounded-full'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Avatar className={cn(sizeClasses[size], 'transition-opacity group-hover:opacity-75')}>
            <AvatarImage src={displayUrl} alt={employeeName} />
            <AvatarFallback className="text-2xl">
              {getInitials(employeeName)}
            </AvatarFallback>
          </Avatar>

          {/* Upload overlay */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100',
              isDragging && 'opacity-100'
            )}
          >
            {isUploading ? (
              <Loader2 className={cn(iconSizeClasses[size], 'text-white animate-spin')} />
            ) : (
              <Camera className={cn(iconSizeClasses[size], 'text-white')} />
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            onChange={handleInputChange}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      </PermissionGate>

      {/* Preview actions */}
      {previewUrl && selectedFile && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {selectedFile.name} ({formatFileSize(selectedFile.size)})
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengunggah...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Simpan
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelPreview}
              disabled={isUploading}
            >
              Batal
            </Button>
          </div>
        </div>
      )}

      {/* Upload hint */}
      {!previewUrl && (
        <PermissionGate permissions={['hr:employee:update']}>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Klik atau seret foto untuk mengunggah
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, JPEG, PNG (Maks. {formatFileSize(MAX_PHOTO_SIZE)})
            </p>
          </div>
        </PermissionGate>
      )}

      {/* Delete photo button */}
      {currentPhotoUrl && !previewUrl && (
        <PermissionGate permissions={['hr:employee:update']}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Foto
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Foto</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus foto profil? Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    // For now, we'll just clear the photo URL
                    // In a real implementation, you'd call an API to delete the photo
                    onPhotoUpdated('');
                    toast.success('Foto berhasil dihapus');
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </PermissionGate>
      )}
    </div>
  );
}