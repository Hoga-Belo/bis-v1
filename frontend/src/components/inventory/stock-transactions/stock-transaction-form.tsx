'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  stockTransactionsApi,
  productsApi,
  warehousesApi,
} from '@/lib/api/endpoints/inventory';
import type {
  Product,
  Warehouse,
  TransactionType,
  CreateStockTransactionRequest,
} from '@/lib/types/inventory';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const transactionTypes = ['INBOUND', 'OUTBOUND', 'ADJUSTMENT', 'TRANSFER'] as const;

const formSchema = z
  .object({
    transactionType: z.enum(transactionTypes, {
      message: 'Tipe transaksi harus dipilih',
    }),
    productId: z.string().min(1, 'Produk harus dipilih'),
    warehouseId: z.string().min(1, 'Gudang harus dipilih'),
    targetWarehouseId: z.string().optional(),
    quantity: z.number().min(1, 'Jumlah harus lebih dari 0'),
    referenceNumber: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.transactionType === 'TRANSFER') {
        return !!data.targetWarehouseId;
      }
      return true;
    },
    {
      message: 'Gudang tujuan harus dipilih untuk transfer',
      path: ['targetWarehouseId'],
    }
  )
  .refine(
    (data) => {
      if (data.transactionType === 'TRANSFER') {
        return data.warehouseId !== data.targetWarehouseId;
      }
      return true;
    },
    {
      message: 'Gudang tujuan tidak boleh sama dengan gudang asal',
      path: ['targetWarehouseId'],
    }
  );

type FormData = z.infer<typeof formSchema>;

interface StockTransactionFormProps {
  defaultType?: TransactionType;
}

export function StockTransactionForm({
  defaultType,
}: StockTransactionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionType: defaultType || 'INBOUND',
      productId: '',
      warehouseId: '',
      targetWarehouseId: '',
      quantity: 1,
      referenceNumber: '',
      notes: '',
    },
  });

  const transactionType = form.watch('transactionType');
  const selectedWarehouseId = form.watch('warehouseId');

  // Fetch products and warehouses
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const [productsRes, warehousesRes] = await Promise.all([
          productsApi.getAll({ limit: 100, isActive: true }),
          warehousesApi.getAll({ limit: 100, isActive: true }),
        ]);

        if (productsRes.success && productsRes.data) {
          setProducts(productsRes.data);
        }
        if (warehousesRes.success && warehousesRes.data) {
          setWarehouses(warehousesRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch options:', error);
        toast.error('Gagal memuat data produk dan gudang');
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const request: CreateStockTransactionRequest = {
        transactionType: data.transactionType as TransactionType,
        productId: data.productId,
        warehouseId: data.warehouseId,
        quantity: data.quantity,
        referenceNumber: data.referenceNumber || undefined,
        notes: data.notes || undefined,
      };

      if (data.transactionType === 'TRANSFER' && data.targetWarehouseId) {
        request.targetWarehouseId = data.targetWarehouseId;
      }

      const response = await stockTransactionsApi.create(request);

      if (response.success) {
        toast.success('Transaksi berhasil dibuat');
        router.push('/inventory/stock-transactions');
      } else {
        toast.error(response.message || 'Gagal membuat transaksi');
      }
    } catch (error) {
      console.error('Failed to create transaction:', error);
      toast.error('Gagal membuat transaksi');
    } finally {
      setLoading(false);
    }
  };

  if (loadingOptions) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Transaksi Stok</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="transactionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Transaksi</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!defaultType}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe transaksi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INBOUND">Barang Masuk</SelectItem>
                      <SelectItem value="OUTBOUND">Barang Keluar</SelectItem>
                      <SelectItem value="ADJUSTMENT">Penyesuaian</SelectItem>
                      <SelectItem value="TRANSFER">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produk</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih produk" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.sku} - {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {transactionType === 'TRANSFER'
                      ? 'Gudang Asal'
                      : 'Gudang'}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih gudang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {transactionType === 'TRANSFER' && (
              <FormField
                control={form.control}
                name="targetWarehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gudang Tujuan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih gudang tujuan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouses
                          .filter((w) => w.id !== selectedWarehouseId)
                          .map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Masukkan jumlah"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Referensi (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: PO-001, SO-001"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tambahkan catatan..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Transaksi
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}