'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { StockTransaction, TransactionType } from '@/lib/types/inventory';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowRightLeft,
  Settings2,
  Package,
  Warehouse,
  Hash,
  Calendar,
  User,
  FileText,
  ArrowRight,
} from 'lucide-react';

interface StockTransactionDetailCardProps {
  transaction: StockTransaction;
}

const transactionTypeConfig: Record<
  TransactionType,
  {
    label: string;
    icon: React.ReactNode;
    bgColor: string;
    textColor: string;
  }
> = {
  INBOUND: {
    label: 'Barang Masuk',
    icon: <ArrowDownCircle className="h-4 w-4" />,
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  OUTBOUND: {
    label: 'Barang Keluar',
    icon: <ArrowUpCircle className="h-4 w-4" />,
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
  },
  ADJUSTMENT: {
    label: 'Penyesuaian',
    icon: <Settings2 className="h-4 w-4" />,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
  TRANSFER: {
    label: 'Transfer',
    icon: <ArrowRightLeft className="h-4 w-4" />,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
};

export function StockTransactionDetailCard({
  transaction,
}: StockTransactionDetailCardProps) {
  const config = transactionTypeConfig[transaction.transactionType];

  const formatQuantity = (quantity: number, type: TransactionType) => {
    if (type === 'INBOUND' || type === 'TRANSFER') {
      return `+${quantity}`;
    } else if (type === 'OUTBOUND') {
      return `-${quantity}`;
    }
    return quantity > 0 ? `+${quantity}` : quantity.toString();
  };

  const getQuantityColor = (quantity: number, type: TransactionType) => {
    if (type === 'INBOUND' || type === 'TRANSFER') {
      return 'text-green-600';
    } else if (type === 'OUTBOUND') {
      return 'text-red-600';
    }
    return quantity > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            {transaction.transactionNumber}
          </CardTitle>
          <Badge className={`${config.bgColor} ${config.textColor} gap-1`}>
            {config.icon}
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date and Time */}
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Tanggal & Waktu</p>
            <p className="font-medium">
              {format(new Date(transaction.createdAt), 'EEEE, dd MMMM yyyy HH:mm', {
                locale: id,
              })}
            </p>
          </div>
        </div>

        <Separator />

        {/* Product Info */}
        <div className="flex items-start gap-3">
          <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Produk</p>
            {transaction.product ? (
              <div>
                <p className="font-medium">{transaction.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  SKU: {transaction.product.sku}
                  {transaction.product.uom && ` • ${transaction.product.uom.name}`}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">-</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Warehouse Info */}
        <div className="flex items-start gap-3">
          <Warehouse className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {transaction.transactionType === 'TRANSFER' ? 'Gudang' : 'Gudang'}
            </p>
            {transaction.transactionType === 'TRANSFER' ? (
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {transaction.warehouse?.name || '-'}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {transaction.targetWarehouse?.name || '-'}
                </span>
              </div>
            ) : (
              <p className="font-medium">{transaction.warehouse?.name || '-'}</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Quantity */}
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 flex items-center justify-center">
            <span className="text-lg font-bold text-muted-foreground">#</span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Jumlah</p>
            <p
              className={`text-2xl font-bold ${getQuantityColor(
                transaction.quantity,
                transaction.transactionType
              )}`}
            >
              {formatQuantity(transaction.quantity, transaction.transactionType)}
              {transaction.product?.uom && (
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  {transaction.product.uom.symbol}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Reference Number */}
        {transaction.referenceNumber && (
          <>
            <Separator />
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Nomor Referensi</p>
                <p className="font-medium">{transaction.referenceNumber}</p>
              </div>
            </div>
          </>
        )}

        {/* Notes */}
        {transaction.notes && (
          <>
            <Separator />
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Catatan</p>
                <p className="font-medium whitespace-pre-wrap">{transaction.notes}</p>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Created By */}
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Dibuat Oleh</p>
            <p className="font-medium">
              {transaction.createdBy || '-'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}