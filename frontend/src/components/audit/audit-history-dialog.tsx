'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { auditApi } from '@/lib/api/endpoints/audit';
import {
  AuditLog,
  ACTION_LABELS,
  ACTION_COLORS,
  extractChanges,
} from '@/lib/types/audit';
import { Clock, User, ArrowRight } from 'lucide-react';

interface AuditHistoryDialogProps {
  tableName: string;
  recordId: string;
  entityName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditHistoryDialog({
  tableName,
  recordId,
  entityName,
  open,
  onOpenChange,
}: AuditHistoryDialogProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await auditApi.getRecordHistory(tableName, recordId);
      setLogs(response.data ?? []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [tableName, recordId]);

  useEffect(() => {
    if (open && recordId) {
      fetchHistory();
    }
  }, [open, recordId, fetchHistory]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy HH:mm');
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') {
      if (Array.isArray(value)) return value.join(', ');
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            Change History
            {entityName && (
              <span className="text-muted-foreground font-normal ml-2">
                - {entityName}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Timeline of all changes made to this record
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No history found for this record
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-6">
                {logs.map((log) => {
                  const changes = extractChanges(log);

                  return (
                    <div key={log.id} className="relative pl-10">
                      {/* Timeline dot */}
                      <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />

                      <div className="border rounded-lg p-4 bg-card">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={ACTION_COLORS[log.action]}>
                            {ACTION_LABELS[log.action] || log.action}
                          </Badge>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {log.user?.nik || 'System'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(log.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm mb-3">{log.description}</p>

                        {/* Changes */}
                        {changes.length > 0 && (
                          <>
                            <Separator className="my-3" />
                            <div className="space-y-2">
                              {changes.map((change, changeIndex) => (
                                <div
                                  key={changeIndex}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <span className="font-medium min-w-[100px]">
                                    {change.field}:
                                  </span>
                                  <span className="text-red-600 dark:text-red-400 line-through">
                                    {formatValue(change.oldValue)}
                                  </span>
                                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <span className="text-green-600 dark:text-green-400">
                                    {formatValue(change.newValue)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}