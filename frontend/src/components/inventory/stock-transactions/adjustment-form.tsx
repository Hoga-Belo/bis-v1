
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
import { Loader2, Settings2, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import {
  productsApi,
  warehousesApi,
  stockTransactionsApi,
} from '@/lib/api/endpoints/inventory';
import type { Product, Warehouse } from '@/lib/types/inventory';

const ADJUSTMENT_REASONS = [
  { value: 'STOCK_OPNAME', label: 'Stock Opname' },
  { value: 'DAMAGE', label: 'Barang Rusak' },
  { value: 'EXPIRED', label: 'Barang Kadaluarsa' },
  { value: 'LOST', label: 'Barang Hilang' },
  { value: 'FOUND', label: 'Barang Ditemukan' },
  { value: 'CORRECTION', label: 'Koreksi Data' },
  { value: 'OTHER', label: 'Lainnya' },
];

const formSchema = z.object({
  productId: z.string().min(1, 'Produk harus dipilih'),
  warehouseId: z.string().min(1, 'Gudang harus dipilih'),
  adjustmentType: z.enum(['INCREASE', 'DECREASE']),
  quantity: z.number().min(1, 'Jumlah harus lebih dari 0'),
  reason: z.string().min(1, 'Alasan harus dipilih'),
  notes: z.string().min(1, 'Catatan wajib diisi untuk penyesuaian'),
});

type FormData = z.infer<typeof formSchema>;

export function AdjustmentForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [currentStock, setCurrentStock] = useState<number | null>(null);
  const [isLoadingStock, setIsLoadingStock] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: '',
      warehouseId: '',
      adjustmentType: 'INCREASE',
      quantity: 1,
      reason: '',
      notes: '',
    },
  });

  const watchProductId = form.watch('productId');
  const watchWarehouseId = form.watch('warehouseId');
  const watchAdjustmentType = form.watch('adjustmentType');
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

  // Fetch current stock when product and warehouse are selected
  useEffect(() => {
    const fetchStock = async () => {
      if (!watchProductId || !watchWarehouseId) {
        setCurrentStock(null);
        return;
      }

      setIsLoadingStock(true);
      try {
        const stockRes = await productsApi.getStock(watchProductId);
        const breakdown = stockRes.data?.breakdown || [];
        const warehouseStock = breakdown.find(
          (s) => s.warehouseId === watchWarehouseId
        );
        setCurrentStock(warehouseStock?.quantity || 0);
      } catch (error) {
        console.error('Error fetching stock:', error);
        setCurrentStock(0);
      } finally {
        setIsLoadingStock(false);
      }
    };

    fetchStock();
  }, [watchProductId, watchWarehouseId]);

  const onSubmit = async (data: FormData) => {
    // For decrease, validate stock availability
    if (data.adjustmentType === 'DECREASE') {
      if (currentStock !== null && data.quantity > currentStock) {
        toast.error(`Stok tidak mencukupi. Stok tersedia: ${currentStock}`);
        return;
      }
    }

    setIsLoading(true);
    try {
      // For adjustment, quantity is positive for increase, negative for decrease
      const adjustedQuantity =
        data.adjustmentType === 'DECREASE' ? -data.quantity : data.quantity;

      const reasonLabel = ADJUSTMENT_REASONS.find(
        (r) => r.value === data.reason
      )?.label;
      const fullNotes = `[${reasonLabel}] ${data.notes}`;

      await stockTransactionsApi.createAdjustment({
        productId: data.productId,
        warehouseId: data.warehouseId,
        quantity: adjustedQuantity,
        notes: fullNotes,
      });
      toast.success('Penyesuaian stok berhasil dicatat');
      router.push('/inventory/stock-transactions');
    } catch (error) {
      console.error('Error creating adjustment transaction:', error);
      toast.error('Gagal mencatat penyesuaian stok');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === watchProductId);
  const selectedWarehouse = warehouses.find((w) => w.id === watchWarehouseId);
  const isInsufficientStock =
    watchAdjustmentType === 'DECREASE' &&
    currentStock !== null &&
    watchQuantity > currentStock;

  // Calculate projected stock
  const projectedStock =
    currentStock !== null
      ? watchAdjustmentType === 'INCREASE'
        ? currentStock + watchQuantity
        : currentStock - watchQuantity
      : null;

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
        <CardTitle className="flex items-center gap-2 text-yellow-700">
          <Settings2 className="h-5 w-5" />
          Form Penyesuaian Stok
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

            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gudang *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih gudang" />
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

            {/* Current Stock Display */}
            {selectedWarehouse && (
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Stok Saat Ini di {selectedWarehouse.name}
                    </p>
                    {isLoadingStock ? (
                      <Loader2 className="h-4 w-4 animate-spin mt-1" />
                    ) : (
                      <p
                        className={`text-2xl font-bold ${
                          currentStock === 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {currentStock ?? 0}
                        {selectedProduct?.uom && (
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            {selectedProduct.uom.symbol}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  {projectedStock !== null && watchQuantity > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Stok Setelah Penyesuaian
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          projectedStock < 0
                            ? 'text-red-600'
                            : projectedStock === 0
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {projectedStock}
                        {selectedProduct?.uom && (
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            {selectedProduct.uom.symbol}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="adjustmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Penyesuaian *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe penyesuaian" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INCREASE">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span>Penambahan</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="DECREASE">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                          <span>Pengurangan</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isInsufficientStock && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Jumlah pengurangan ({watchQuantity}) melebihi stok tersedia (
                  {currentStock}).
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alasan Penyesuaian *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih alasan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ADJUSTMENT_REASONS.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan detail penyesuaian stok..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/inventory/stock-transactions')}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isInsufficientStock}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Penyesuaian
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}