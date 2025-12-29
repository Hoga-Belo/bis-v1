'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  productsApi,
  categoriesApi,
  brandsApi,
  uomsApi,
} from '@/lib/api/endpoints/inventory';
import type { Product, Category, Brand, Uom } from '@/lib/types/inventory';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const productFormSchema = z.object({
  sku: z
    .string()
    .min(1, 'SKU wajib diisi')
    .max(50, 'SKU maksimal 50 karakter')
    .regex(/^[A-Za-z0-9-_]+$/, 'SKU hanya boleh berisi huruf, angka, dash, dan underscore'),
  name: z
    .string()
    .min(1, 'Nama produk wajib diisi')
    .max(200, 'Nama produk maksimal 200 karakter'),
  description: z.string().max(1000, 'Deskripsi maksimal 1000 karakter').optional(),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  brandId: z.string().optional(),
  uomId: z.string().min(1, 'Satuan wajib dipilih'),
  minStock: z
    .number({ message: 'Stok minimum wajib diisi dan harus berupa angka' })
    .min(0, { message: 'Stok minimum tidak boleh negatif' }),
  isActive: z.boolean(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  isEditing?: boolean;
}

export function ProductForm({ product, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [uoms, setUoms] = useState<Uom[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      sku: product?.sku || '',
      name: product?.name || '',
      description: product?.description || '',
      categoryId: product?.categoryId || '',
      brandId: product?.brandId || '',
      uomId: product?.uomId || '',
      minStock: product?.minStock ?? 0,
      isActive: product?.isActive ?? true,
    },
  });

  // Fetch dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const [categoriesRes, brandsRes, uomsRes] = await Promise.all([
          categoriesApi.getAll({ limit: 100 }),
          brandsApi.getAll({ limit: 100 }),
          uomsApi.getAll({ limit: 100 }),
        ]);

        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }
        if (brandsRes.success && brandsRes.data) {
          setBrands(brandsRes.data);
        }
        if (uomsRes.success && uomsRes.data) {
          setUoms(uomsRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch options:', error);
        toast.error('Gagal memuat data dropdown');
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);

      // Clean up empty brandId
      const submitData = {
        ...data,
        brandId: data.brandId || undefined,
        description: data.description || undefined,
      };

      let response;
      if (isEditing && product) {
        response = await productsApi.update(product.id, submitData);
      } else {
        response = await productsApi.create(submitData);
      }

      if (response.success) {
        toast.success(isEditing ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan');
        if (isEditing && product) {
          router.push(`/inventory/products/${product.id}`);
        } else {
          router.push('/inventory/products');
        }
      } else {
        toast.error(response.message || 'Gagal menyimpan produk');
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error('Gagal menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  if (loadingOptions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SKU */}
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: PRD-001"
                        {...field}
                        disabled={isEditing}
                      />
                    </FormControl>
                    <FormDescription>
                      Kode unik produk (tidak dapat diubah setelah dibuat)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Produk *</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama produk" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name} ({category.type === 'FIXED' ? 'Aset Tetap' : 'Habis Pakai'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Brand */}
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Merek</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih merek (opsional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Tidak ada merek</SelectItem>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* UOM */}
              <FormField
                control={form.control}
                name="uomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Satuan *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih satuan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {uoms.map((uom) => (
                          <SelectItem key={uom.id} value={uom.id}>
                            {uom.name} ({uom.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Min Stock */}
              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok Minimum</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Peringatan akan muncul jika stok di bawah nilai ini
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan deskripsi produk (opsional)"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Active */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Produk Aktif</FormLabel>
                    <FormDescription>
                      Produk yang tidak aktif tidak akan muncul dalam transaksi
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Actions */}
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
                {isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}