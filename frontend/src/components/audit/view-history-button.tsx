'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import { AuditHistoryDialog } from './audit-history-dialog';

interface ViewHistoryButtonProps {
  tableName: string;
  recordId: string;
  entityName?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ViewHistoryButton({
  tableName,
  recordId,
  entityName,
  variant = 'outline',
  size = 'sm',
  className,
}: ViewHistoryButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={className}
      >
        <History className="h-4 w-4 mr-2" />
        View History
      </Button>

      <AuditHistoryDialog
        tableName={tableName}
        recordId={recordId}
        entityName={entityName}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}