
'use client';

import * as React from 'react';
import { useState, useCallback } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileWarning,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { employeesApi } from '@/lib/api/endpoints/hr';
import type { ImportResult, ImportError } from '@/lib/types/hr';

interface ExcelImportProps {
  onImportComplete?: () => void;
}

type ImportStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

export function ExcelImport({ onImportComplete }: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const errorsPerPage = 10;

  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'Format file tidak valid. Hanya file Excel (.xlsx, .xls) yang diperbolehkan.',
      };
    }
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `Ukuran file terlalu besar. Maksimal ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
      };
    }
    return { isValid: true };
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);

      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile) {
        const validation = validateFile(droppedFile);
        if (validation.isValid) {
          setFile(droppedFile);
          setErrorMessage(null);
          setResult(null);
          setStatus('idle');
        } else {
          setErrorMessage(validation.error || 'File tidak valid');
        }
      }
    },
    [validateFile]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        const validation = validateFile(selectedFile);
        if (validation.isValid) {
          setFile(selectedFile);
          setErrorMessage(null);
          setResult(null);
          setStatus('idle');
        } else {
          setErrorMessage(validation.error || 'File tidak valid');
        }
      }
    },
    [validateFile]
  );

  const handleDownloadTemplate = useCallback(async () => {
    try {
      const blob = await employeesApi.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'template_import_karyawan.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download template:', error);
      setErrorMessage('Gagal mengunduh template. Silakan coba lagi.');
    }
  }, []);

  const handleImport = useCallback(async () => {
    if (!file) return;

    setStatus('uploading');
    setUploadProgress(0);
    setErrorMessage(null);
    setResult(null);

    try {
      const importResult = await employeesApi.importFromExcel(file, (progress) => {
        setUploadProgress(progress);
        if (progress === 100) {
          setStatus('processing');
        }
      });

      setResult(importResult);
      setStatus(importResult.errorCount > 0 ? 'error' : 'success');

      if (importResult.successCount > 0 && onImportComplete) {
        onImportComplete();
      }
    } catch (error: unknown) {
      console.error('Import failed:', error);
      setStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Terjadi kesalahan saat import';
      setErrorMessage(errorMsg);
    }
  }, [file, onImportComplete]);

  const handleDownloadErrorReport = useCallback(async () => {
    if (!result?.errorReportPath) return;

    try {
      const filename = result.errorReportPath.split('/').pop() || 'error_report.xlsx';
      const blob = await employeesApi.downloadErrorReport(filename);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download error report:', error);
      setErrorMessage('Gagal mengunduh laporan error. Silakan coba lagi.');
    }
  }, [result?.errorReportPath]);

  const handleReset = useCallback(() => {
    setFile(null);
    setStatus('idle');
    setUploadProgress(0);
    setResult(null);
    setErrorMessage(null);
    setCurrentPage(1);
  }, []);

  // Pagination for errors
  const paginatedErrors = result?.errors
    ? result.errors.slice((currentPage - 1) * errorsPerPage, currentPage * errorsPerPage)
    : [];
  const totalPages = result?.errors ? Math.ceil(result.errors.length / errorsPerPage) : 0;

  return (
    <div className="space-y-6">
      {/* Download Template Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Template Import
          </CardTitle>
          <CardDescription>
            Unduh template Excel untuk mengisi data karyawan yang akan diimport
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Unduh Template
          </Button>
        </CardContent>
      </Card>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload File Excel
          </CardTitle>
          <CardDescription>
            Pilih atau drag &amp; drop file Excel yang sudah diisi dengan data karyawan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop Zone */}
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${file ? 'bg-muted/50' : 'hover:border-primary/50 hover:bg-muted/25'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={status === 'uploading' || status === 'processing'}
            />
            {file ? (
              <div className="space-y-2">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-green-600" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="font-medium">Drag &amp; drop file Excel di sini</p>
                <p className="text-sm text-muted-foreground">
                  atau klik untuk memilih file (maks. 20MB)
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Upload Progress */}
          {(status === 'uploading' || status === 'processing') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {status === 'uploading' ? 'Mengupload...' : 'Memproses data...'}
                </span>
                <span>{status === 'uploading' ? `${uploadProgress}%` : ''}</span>
              </div>
              {status === 'uploading' ? (
                <Progress value={uploadProgress} />
              ) : (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={!file || status === 'uploading' || status === 'processing'}
            >
              {status === 'uploading' || status === 'processing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {status === 'uploading' ? 'Mengupload...' : 'Memproses...'}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Data
                </>
              )}
            </Button>
            {file && status !== 'uploading' && status !== 'processing' && (
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Result Card */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.errorCount === 0 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Import Berhasil
                </>
              ) : result.successCount > 0 ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Import Selesai dengan Error
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Import Gagal
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">{result.totalRows}</p>
                <p className="text-sm text-muted-foreground">Total Baris</p>
              </div>
              <div className="rounded-lg border p-4 text-center bg-green-50 dark:bg-green-950">
                <p className="text-2xl font-bold text-green-600">{result.successCount}</p>
                <p className="text-sm text-muted-foreground">Berhasil</p>
              </div>
              <div className="rounded-lg border p-4 text-center bg-red-50 dark:bg-red-950">
                <p className="text-2xl font-bold text-red-600">{result.errorCount}</p>
                <p className="text-sm text-muted-foreground">Gagal</p>
              </div>
            </div>

            {/* Success Message */}
            {result.successCount > 0 && result.errorCount === 0 && (
              <Alert variant="success">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Berhasil!</AlertTitle>
                <AlertDescription>
                  Semua {result.successCount} data karyawan berhasil diimport.
                </AlertDescription>
              </Alert>
            )}

            {/* Partial Success Message */}
            {result.successCount > 0 && result.errorCount > 0 && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Import Selesai</AlertTitle>
                <AlertDescription>
                  {result.successCount} data berhasil diimport, {result.errorCount} data gagal.
                  Silakan perbaiki data yang error dan import ulang.
                </AlertDescription>
              </Alert>
            )}

            {/* Error Report Download */}
            {result.errorReportPath && (
              <Button variant="outline" onClick={handleDownloadErrorReport}>
                <FileWarning className="mr-2 h-4 w-4" />
                Unduh Laporan Error
              </Button>
            )}

            {/* Error Table */}
            {result.errors && result.errors.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Detail Error</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Baris</TableHead>
                        <TableHead className="w-32">NIK</TableHead>
                        <TableHead className="w-32">Field</TableHead>
                        <TableHead>Pesan Error</TableHead>
                        <TableHead className="w-32">Nilai Asli</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedErrors.map((error: ImportError, index: number) => (
                        <TableRow key={`${error.rowNumber}-${error.field}-${index}`}>
                          <TableCell>{error.rowNumber}</TableCell>
                          <TableCell className="font-mono text-sm">{error.nik || '-'}</TableCell>
                          <TableCell>{error.field}</TableCell>
                          <TableCell className="text-red-600">{error.message}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {error.originalValue || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Menampilkan {(currentPage - 1) * errorsPerPage + 1} -{' '}
                      {Math.min(currentPage * errorsPerPage, result.errors.length)} dari{' '}
                      {result.errors.length} error
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Halaman {currentPage} dari {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}