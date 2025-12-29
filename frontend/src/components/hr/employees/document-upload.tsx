'use client';

import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PermissionGate } from '@/components/auth';
import { employeesApi } from '@/lib/api/endpoints/hr';
import type { EmployeeDocument, DocumentType } from '@/lib/types/hr';
import {
  validateDocumentFile,
  formatFileSize,
  getFileNameWithoutExtension,
  ACCEPTED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE,
} from '@/lib/utils/file';
import { Upload, Plus, FileUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
  employeeId: string;
  onDocumentUploaded: (document: EmployeeDocument) => void;
}

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: 'KTP', label: 'KTP' },
  { value: 'KK', label: 'Kartu Keluarga' },
  { value: 'IJAZAH', label: 'Ijazah' },
  { value: 'SERTIFIKAT', label: 'Sertifikat' },
  { value: 'KONTRAK', label: 'Kontrak Kerja' },
  { value: 'SK', label: 'Surat Keputusan' },
  { value: 'OTHER', label: 'Lainnya' },
];

export function DocumentUpload({ employeeId, onDocumentUploaded }: DocumentUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType>('OTHER');
  const [documentName, setDocumentName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setSelectedType('OTHER');
    setDocumentName('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleFileSelect = useCallback((file: File) => {
    const validation = validateDocumentFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setSelectedFile(file);
    // Auto-fill document name from file name if empty
    if (!documentName) {
      setDocumentName(getFileNameWithoutExtension(file.name));
    }
  }, [documentName]);

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
    if (!selectedFile) {
      toast.error('Pilih file terlebih dahulu');
      return;
    }

    if (!documentName.trim()) {
      toast.error('Nama dokumen wajib diisi');
      return;
    }

    setIsUploading(true);
    try {
      const response = await employeesApi.uploadDocument(
        employeeId,
        selectedFile,
        selectedType,
        documentName.trim()
      );
      if (response.success && response.data) {
        toast.success('Dokumen berhasil diunggah');
        onDocumentUploaded(response.data);
        setIsOpen(false);
        resetForm();
      }
    } catch {
      toast.error('Gagal mengunggah dokumen');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <PermissionGate permissions={['hr:employee:update']}>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Unggah Dokumen
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unggah Dokumen</DialogTitle>
            <DialogDescription>
              Pilih file dan isi informasi dokumen karyawan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Document Type */}
            <div className="space-y-2">
              <Label htmlFor="documentType">Tipe Dokumen *</Label>
              <Select
                value={selectedType}
                onValueChange={(value) => setSelectedType(value as DocumentType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe dokumen" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document Name */}
            <div className="space-y-2">
              <Label htmlFor="documentName">Nama Dokumen *</Label>
              <Input
                id="documentName"
                placeholder="Masukkan nama dokumen"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
              />
            </div>

            {/* File Upload Area */}
            <div className="space-y-2">
              <Label>File *</Label>
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50',
                  selectedFile && 'border-green-500 bg-green-50'
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_DOCUMENT_TYPES}
                  onChange={handleInputChange}
                  className="hidden"
                  disabled={isUploading}
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <FileUp className="mx-auto h-10 w-10 text-green-500" />
                    <div>
                      <p className="font-medium text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      Ganti File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Klik atau seret file ke sini
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, DOC, DOCX (Maks. {formatFileSize(MAX_DOCUMENT_SIZE)})
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !selectedFile || !documentName.trim()}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengunggah...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Unggah
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGate>
  );
}