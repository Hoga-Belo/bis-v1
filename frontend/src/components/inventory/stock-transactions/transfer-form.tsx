'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowRightLeft, AlertTriangle, ArrowRight } from 'lucide-react';
import {
  productsApi,
  warehousesApi,
  stockTransactionsApi,
} from '@/lib/api/endpoints/inventory';
import type { Product, Warehouse } from '@/lib/types/inventory';
import { TransactionType } from '@/lib/types/inventory';

const formSchema = z
  .object({
    productId: z.string().min(1, 'Produk harus dipilih'),
    warehouseId: z.string().min(1, 'Gudang asal harus dipilih'),
    targetWarehouseId: z.string().min(1, 'Gudang tujuan harus dipilih'),
    quantity: z.number().min(1, 'Jumlah harus lebih dari 0'),
    referenceNumber: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.warehouseId !== data.targetWarehouseId, {
    message: 'Gudang tujuan harus berbeda dengan gudang asal',
    path: ['targetWarehouseId'],
  });

type FormData = z.infer<typeof formSchema>;

export function TransferForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [sourceStock, setSourceStock] = useState<number | null>(null);
  const [destStock, setDestStock] = useState<number | null>(null);
  const [isLoadingStock, setIsLoadingStock] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: '',
      warehouseId: '',
      targetWarehouseId: '',
      quantity: 1,
      referenceNumber: '',
      notes: '',
    },
  });

  const watchProductId = form.watch('productId');
  const watchWarehouseId = form.watch('warehouseId');
  const watchTargetWarehouseId = form.watch('targetWarehouseId');
  const watchQuantity = form.watch('quantity');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, warehousesRes] = await Promise.all([
          productsApi.getAll({ limit: 1000 }),
          warehousesApi.getAll({ limit: 1000 }),
        ]);
        setProducts(productsRes.data || []);
        setWarehouses(
          (warehousesRes.data || []).filter((w: Warehouse) => w.isActive)
        );
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Gagal memuat data');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Fetch stock for both warehouses when product and warehouses are selected
  useEffect(() => {
    const fetchStock = async () => {
      if (!watchProductId) {
        setSourceStock(null);
        setDestStock(null);
        return;
      }

      setIsLoadingStock(true);
      try {
        const stockRes = await productsApi.getStock(watchProductId);
        const breakdown = stockRes.data?.breakdown || [];

        if (watchWarehouseId) {
          const sourceWarehouseStock = breakdown.find(
            (s) => s.warehouseId === watchWarehouseId
          );
          setSourceStock(sourceWarehouseStock?.quantity || 0);
        } else {
          setSourceStock(null);
        }

        if (watchTargetWarehouseId) {
          const destWarehouseStock = breakdown.find(
            (s) => s.warehouseId === watchTargetWarehouseId
          );
          setDestStock(destWarehouseStock?.quantity || 0);
        } else {
          setDestStock(null);
        }
      } catch (error) {
        console.error('Error fetching stock:', error);
        setSourceStock(0);
        setDestStock(0);
      } finally {
        setIsLoadingStock(false);
      }
    };

    fetchStock();
  }, [watchProductId, watchWarehouseId, watchTargetWarehouseId]);

  const onSubmit = async (data: FormData) => {
    // Validate stock availability
    if (sourceStock !== null && data.quantity > sourceStock) {
      toast.error(`Stok tidak mencukupi. Stok tersedia: ${sourceStock}`);
      return;
    }

    setIsLoading(true);
    try {
      await stockTransactionsApi.create({
        transactionType: TransactionType.TRANSFER,
        productId: data.productId,
        warehouseId: data.warehouseId,
        targetWarehouseId: data.targetWarehouseId,
        quantity: data.quantity,
        referenceNumber: data.referenceNumber || undefined,
        notes: data.notes || undefined,
      });
      toast.success('Transfer stok berhasil dicatat');
      router.push('/inventory/stock-transactions');
    } catch (error) {
      console.error('Error creating transfer transaction:', error);
      toast.error('Gagal mencatat transfer stok');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === watchProductId);
  const sourceWarehouse = warehouses.find((w) => w.id === watchWarehouseId);
  const destWarehouse = warehouses.find((w) => w.id === watchTargetWarehouseId);
  const isInsufficientStock =
    sourceStock !== null && watchQuantity > sourceStock;

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <ArrowRightLeft className="h-5 w-5" />
          Form Transfer Stok
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produk *</FormLabel>
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

            {selectedProduct && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Produk Terpilih:</p>
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-muted-foreground">
                  SKU: {selectedProduct.sku}
                  {selectedProduct.uom && ` • Satuan: ${selectedProduct.uom.name}`}
                </p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="warehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gudang Asal *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih gudang asal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.code} - {warehouse.name}
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
                name="targetWarehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gudang Tujuan *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih gudang tujuan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouses
                          .filter((w) => w.id !== watchWarehouseId)
                          .map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.code} - {warehouse.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Transfer Visualization */}
            {sourceWarehouse && destWarehouse && (
              <div className="flex items-center justify-center gap-4 rounded-lg border p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Dari</p>
                  <p className="font-medium">{sourceWarehouse.name}</p>
                  {isLoadingStock ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mt-1" />
                  ) : (
                    <p
                      className={`text-lg font-bold ${
                        sourceStock === 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      Stok: {sourceStock ?? 0}
                    </p>
                  )}
                </div>
                <ArrowRight className="h-6 w-6 text-blue-600" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Ke</p>
                  <p className="font-medium">{destWarehouse.name}</p>
                  {isLoadingStock ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mt-1" />
                  ) : (
                    <p className="text-lg font-bold text-muted-foreground">
                      Stok: {destStock ?? 0}
                    </p>
                  )}
                </div>
              </div>
            )}

            {isInsufficientStock && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Jumlah yang diminta ({watchQuantity}) melebihi stok tersedia di
                  gudang asal ({sourceStock}).
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Jumlah *
                    {selectedProduct?.uom && (
                      <span className="text-muted-foreground ml-1">
                        ({selectedProduct.uom.symbol})
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={sourceStock || undefined}
                      placeholder="Masukkan jumlah"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
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
                  <FormLabel>Nomor Referensi</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: TRF-2024-001" {...field} />
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
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan tambahan (opsional)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isInsufficientStock}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Transfer
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}