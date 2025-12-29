'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionGate } from '@/components/auth';
import { DocumentUpload } from '../document-upload';
import { DocumentList } from '../document-list';
import type { EmployeeDocument } from '@/lib/types/hr';
import { FileText } from 'lucide-react';

interface DocumentsTabProps {
  employeeId: string;
  documents: EmployeeDocument[];
  onUpdate: () => void;
}

export function DocumentsTab({ employeeId, documents, onUpdate }: DocumentsTabProps) {
  const [localDocuments, setLocalDocuments] = useState<EmployeeDocument[]>(documents);

  const handleDocumentUploaded = (newDocument: EmployeeDocument) => {
    setLocalDocuments((prev) => [...prev, newDocument]);
    onUpdate();
  };

  const handleDocumentDeleted = (documentId: string) => {
    setLocalDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    onUpdate();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Dokumen Karyawan
        </CardTitle>
        <PermissionGate permissions={['hr:employee:update']}>
          <DocumentUpload
            employeeId={employeeId}
            onDocumentUploaded={handleDocumentUploaded}
          />
        </PermissionGate>
      </CardHeader>
      <CardContent>
        <DocumentList
          employeeId={employeeId}
          documents={localDocuments}
          onDocumentDeleted={handleDocumentDeleted}
        />

        {/* Upload Guidelines */}
        <div className="mt-4 rounded-lg bg-muted p-4">
          <h4 className="text-sm font-medium mb-2">Panduan Unggah Dokumen</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Format yang didukung: PDF, DOC, DOCX</li>
            <li>• Ukuran maksimal: 10MB per file</li>
            <li>• Pastikan dokumen dapat dibaca dengan jelas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}