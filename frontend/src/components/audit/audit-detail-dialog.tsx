'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import {
  AuditLog,
  ACTION_LABELS,
  ACTION_COLORS,
  extractChanges,
} from '@/lib/types/audit';

interface AuditDetailDialogProps {
  log: AuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditDetailDialog({
  log,
  open,
  onOpenChange,
}: AuditDetailDialogProps) {
  if (!log) return null;

  const changes = extractChanges(log);
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy HH:mm:ss');
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Audit Log Detail
            <Badge className={ACTION_COLORS[log.action]}>
              {ACTION_LABELS[log.action] || log.action}
            </Badge>
          </DialogTitle>
          <DialogDescription>{log.description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-4">
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Timestamp:</span>
                <p className="font-mono">{formatDate(log.createdAt)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">User:</span>
                <p>
                  {log.user?.nik || log.userId || 'System'}
                  {log.user?.employee?.fullName && (
                    <span className="text-muted-foreground ml-1">
                      ({log.user.employee.fullName})
                    </span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Module:</span>
                <p>
                  <Badge variant="outline">{log.module}</Badge>
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Entity:</span>
                <p>{log.entityType}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Table:</span>
                <p className="font-mono">{log.tableName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Record ID:</span>
                <p className="font-mono text-xs break-all">{log.recordId}</p>
              </div>
              {log.ipAddress && (
                <div>
                  <span className="text-muted-foreground">IP Address:</span>
                  <p className="font-mono">{log.ipAddress}</p>
                </div>
              )}
              {log.userAgent && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">User Agent:</span>
                  <p className="font-mono text-xs break-all">{log.userAgent}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Changes */}
            {changes.length > 0 ? (
              <div>
                <h4 className="font-semibold mb-3">Changes</h4>
                <div className="space-y-3">
                  {changes.map((change, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="font-medium text-sm mb-2 capitalize">
                        {change.field.replace(/_/g, ' ')}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground text-xs">
                            Old Value:
                          </span>
                          <pre className="bg-red-50 dark:bg-red-950 p-2 rounded text-xs overflow-auto max-h-32 mt-1">
                            {formatValue(change.oldValue)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">
                            New Value:
                          </span>
                          <pre className="bg-green-50 dark:bg-green-950 p-2 rounded text-xs overflow-auto max-h-32 mt-1">
                            {formatValue(change.newValue)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {/* Show raw old/new values if no changes extracted */}
                {(log.oldValue || log.newValue) && (
                  <>
                    <h4 className="font-semibold mb-3">Data</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {log.oldValue && (
                        <div>
                          <span className="text-muted-foreground text-xs">
                            Old Value:
                          </span>
                          <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-48 mt-1">
                            {JSON.stringify(log.oldValue, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.newValue && (
                        <div>
                          <span className="text-muted-foreground text-xs">
                            New Value:
                          </span>
                          <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-48 mt-1">
                            {JSON.stringify(log.newValue, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {!log.oldValue && !log.newValue && (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No data changes recorded for this action
                  </p>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}