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
import { Loader2, ArrowDownCircle } from 'lucide-react';
import {
  productsApi,
  warehousesApi,
  stockTransactionsApi,
} from '@/lib/api/endpoints/inventory';
import type { Product, Warehouse } from '@/lib/types/inventory';

const formSchema = z.object({
  productId: z.string().min(1, 'Produk harus dipilih'),
  warehouseId: z.string().min(1, 'Gudang harus dipilih'),
  quantity: z.number().min(1, 'Jumlah harus lebih dari 0'),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function InboundForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: '',
      warehouseId: '',
      quantity: 1,
      referenceNumber: '',
      notes: '',
    },
  });

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

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await stockTransactionsApi.createInbound({
        productId: data.productId,
        warehouseId: data.warehouseId,
        quantity: data.quantity,
        referenceNumber: data.referenceNumber || undefined,
        notes: data.notes || undefined,
      });
      toast.success('Barang masuk berhasil dicatat');
      router.push('/inventory/stock-transactions');
    } catch (error) {
      console.error('Error creating inbound transaction:', error);
      toast.error('Gagal mencatat barang masuk');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProduct = products.find(
    (p) => p.id === form.watch('productId')
  );

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
        <CardTitle className="flex items-center gap-2 text-green-700">
          <ArrowDownCircle className="h-5 w-5" />
          Form Barang Masuk
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
                  <FormLabel>Gudang Tujuan *</FormLabel>
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
                  <FormLabel>Nomor Referensi</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: PO-2024-001"
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
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Barang Masuk
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}