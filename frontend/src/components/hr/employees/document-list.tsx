'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import type { EmployeeDocument, DocumentType } from '@/lib/types/hr';
import { formatFileSize } from '@/lib/utils/file';
import { Download, Trash2, File, FileText, FileImage, FileArchive } from 'lucide-react';

interface DocumentListProps {
  employeeId: string;
  documents: EmployeeDocument[];
  onDocumentDeleted: (documentId: string) => void;
}

// Document type labels
const documentTypeLabels: Record<DocumentType, string> = {
  KTP: 'KTP',
  KK: 'Kartu Keluarga',
  IJAZAH: 'Ijazah',
  SERTIFIKAT: 'Sertifikat',
  KONTRAK: 'Kontrak Kerja',
  SK: 'Surat Keputusan',
  OTHER: 'Lainnya',
};

// Document type badge colors
const documentTypeBadgeColors: Record<DocumentType, string> = {
  KTP: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  KK: 'bg-green-100 text-green-800 hover:bg-green-100',
  IJAZAH: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  SERTIFIKAT: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  KONTRAK: 'bg-red-100 text-red-800 hover:bg-red-100',
  SK: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  OTHER: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
};

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getFileIcon(fileName?: string) {
  if (!fileName) return <File className="h-4 w-4" />;
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
    return <FileImage className="h-4 w-4 text-blue-500" />;
  }
  if (['pdf'].includes(ext || '')) {
    return <FileText className="h-4 w-4 text-red-500" />;
  }
  if (['doc', 'docx'].includes(ext || '')) {
    return <FileText className="h-4 w-4 text-blue-600" />;
  }
  if (['zip', 'rar', '7z'].includes(ext || '')) {
    return <FileArchive className="h-4 w-4 text-yellow-600" />;
  }
  return <File className="h-4 w-4 text-gray-500" />;
}

export function DocumentList({
  employeeId,
  documents,
  onDocumentDeleted,
}: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDownload = (document: EmployeeDocument) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank');
    }
  };

  const handleDelete = async (documentId: string) => {
    setDeletingId(documentId);
    try {
      await employeesApi.deleteDocument(employeeId, documentId);
      toast.success('Dokumen berhasil dihapus');
      onDocumentDeleted(documentId);
    } catch {
      toast.error('Gagal menghapus dokumen');
    } finally {
      setDeletingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="py-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-sm font-medium text-muted-foreground">
          Belum ada dokumen
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Unggah dokumen karyawan untuk memulai
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Tipe</TableHead>
            <TableHead>Nama Dokumen</TableHead>
            <TableHead className="w-[100px]">Ukuran</TableHead>
            <TableHead className="w-[160px]">Tanggal Unggah</TableHead>
            <TableHead className="w-[100px] text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id}>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={documentTypeBadgeColors[document.documentType] || documentTypeBadgeColors.OTHER}
                >
                  {documentTypeLabels[document.documentType] || document.documentType}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getFileIcon(document.documentName)}
                  <span className="font-medium">{document.documentName || '-'}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatFileSize(document.fileSize)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(document.uploadedAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(document)}
                    title="Unduh"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <PermissionGate permissions={['hr:employee:update']}>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deletingId === document.id}
                          title="Hapus"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Dokumen</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus dokumen
                            &quot;{document.documentName}&quot;? Tindakan ini tidak dapat
                            dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(document.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </PermissionGate>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}