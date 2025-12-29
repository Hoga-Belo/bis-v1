import apiClient from '../client';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryQueryParams,
  Brand,
  CreateBrandRequest,
  UpdateBrandRequest,
  BrandQueryParams,
  Uom,
  CreateUomRequest,
  UpdateUomRequest,
  UomQueryParams,
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductQueryParams,
  Warehouse,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  WarehouseQueryParams,
  StockTransaction,
  CreateInboundRequest,
  CreateOutboundRequest,
  CreateAdjustmentRequest,
  CreateTransferRequest,
  StockTransactionQueryParams,
  DashboardMetrics,
  InventoryOverview,
  StockSummary,
  LowStockAlert,
  StockByCategory,
  TransactionTrend,
  RecentTransaction,
  StockMovement,
  Stock,
  ProductStockResponse,
} from '../../types/inventory';
import type { ApiResponse } from '../../types/api';

// Categories API
export const categoriesApi = {
  getAll: async (
    params?: CategoryQueryParams
  ): Promise<ApiResponse<Category[]>> => {
    return apiClient.get('/inventory/categories', params as Record<string, unknown>);
  },

  getById: async (id: string): Promise<ApiResponse<Category>> => {
    return apiClient.get(`/inventory/categories/${id}`);
  },

  create: async (data: CreateCategoryRequest): Promise<ApiResponse<Category>> => {
    return apiClient.post('/inventory/categories', data);
  },

  update: async (
    id: string,
    data: UpdateCategoryRequest
  ): Promise<ApiResponse<Category>> => {
    return apiClient.patch(`/inventory/categories/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/inventory/categories/${id}`);
  },
};

// Brands API
export const brandsApi = {
  getAll: async (params?: BrandQueryParams): Promise<ApiResponse<Brand[]>> => {
    return apiClient.get('/inventory/brands', params as Record<string, unknown>);
  },

  getById: async (id: string): Promise<ApiResponse<Brand>> => {
    return apiClient.get(`/inventory/brands/${id}`);
  },

  create: async (data: CreateBrandRequest): Promise<ApiResponse<Brand>> => {
    return apiClient.post('/inventory/brands', data);
  },

  update: async (id: string, data: UpdateBrandRequest): Promise<ApiResponse<Brand>> => {
    return apiClient.patch(`/inventory/brands/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/inventory/brands/${id}`);
  },
};

// UOMs API
export const uomsApi = {
  getAll: async (params?: UomQueryParams): Promise<ApiResponse<Uom[]>> => {
    return apiClient.get('/inventory/uoms', params as Record<string, unknown>);
  },

  getById: async (id: string): Promise<ApiResponse<Uom>> => {
    return apiClient.get(`/inventory/uoms/${id}`);
  },

  create: async (data: CreateUomRequest): Promise<ApiResponse<Uom>> => {
    return apiClient.post('/inventory/uoms', data);
  },

  update: async (id: string, data: UpdateUomRequest): Promise<ApiResponse<Uom>> => {
    return apiClient.patch(`/inventory/uoms/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/inventory/uoms/${id}`);
  },
};

// Products API
export const productsApi = {
  getAll: async (params?: ProductQueryParams): Promise<ApiResponse<Product[]>> => {
    return apiClient.get('/inventory/products', params as Record<string, unknown>);
  },

  getById: async (id: string): Promise<ApiResponse<Product>> => {
    return apiClient.get(`/inventory/products/${id}`);
  },

  create: async (data: CreateProductRequest): Promise<ApiResponse<Product>> => {
    return apiClient.post('/inventory/products', data);
  },

  update: async (
    id: string,
    data: UpdateProductRequest
  ): Promise<ApiResponse<Product>> => {
    return apiClient.patch(`/inventory/products/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/inventory/products/${id}`);
  },

  uploadPhoto: async (id: string, file: File): Promise<ApiResponse<Product>> => {
    const formData = new FormData();
    formData.append('photo', file);
    return apiClient.upload(`/inventory/products/${id}/photo`, formData);
  },

  getLowStock: async (): Promise<ApiResponse<Product[]>> => {
    return apiClient.get('/inventory/products/low-stock');
  },

  getStock: async (id: string): Promise<ApiResponse<ProductStockResponse>> => {
    return apiClient.get(`/inventory/products/${id}/stock`);
  },

  getMovementHistory: async (
    id: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<StockMovement[]>> => {
    return apiClient.get(
      `/inventory/stock-transactions/product/${id}/movements`,
      params as Record<string, unknown>
    );
  },
};

// Warehouses API
export const warehousesApi = {
  getAll: async (
    params?: WarehouseQueryParams
  ): Promise<ApiResponse<Warehouse[]>> => {
    return apiClient.get('/inventory/warehouses', params as Record<string, unknown>);
  },

  getById: async (id: string): Promise<ApiResponse<Warehouse>> => {
    return apiClient.get(`/inventory/warehouses/${id}`);
  },

  create: async (data: CreateWarehouseRequest): Promise<ApiResponse<Warehouse>> => {
    return apiClient.post('/inventory/warehouses', data);
  },

  update: async (
    id: string,
    data: UpdateWarehouseRequest
  ): Promise<ApiResponse<Warehouse>> => {
    return apiClient.patch(`/inventory/warehouses/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/inventory/warehouses/${id}`);
  },

  getStock: async (id: string): Promise<ApiResponse<Stock[]>> => {
    return apiClient.get(`/inventory/warehouses/${id}/stock`);
  },

  getStatistics: async (
    id: string
  ): Promise<ApiResponse<{ totalProducts: number; totalStock: number }>> => {
    return apiClient.get(`/inventory/warehouses/${id}/statistics`);
  },
};

// Stock Transactions API
export const stockTransactionsApi = {
  getAll: async (
    params?: StockTransactionQueryParams
  ): Promise<ApiResponse<StockTransaction[]>> => {
    return apiClient.get(
      '/inventory/stock-transactions',
      params as Record<string, unknown>
    );
  },

  getById: async (id: string): Promise<ApiResponse<StockTransaction>> => {
    return apiClient.get(`/inventory/stock-transactions/${id}`);
  },

  createInbound: async (
    data: CreateInboundRequest
  ): Promise<ApiResponse<StockTransaction>> => {
    return apiClient.post('/inventory/stock-transactions/inbound', data);
  },

  createOutbound: async (
    data: CreateOutboundRequest
  ): Promise<ApiResponse<StockTransaction>> => {
    return apiClient.post('/inventory/stock-transactions/outbound', data);
  },

  createAdjustment: async (
    data: CreateAdjustmentRequest
  ): Promise<ApiResponse<StockTransaction>> => {
    return apiClient.post('/inventory/stock-transactions/adjustment', data);
  },

  createTransfer: async (
    data: CreateTransferRequest
  ): Promise<ApiResponse<StockTransaction>> => {
    return apiClient.post('/inventory/stock-transactions/transfer', data);
  },

  getByProduct: async (
    productId: string,
    params?: { page?: number; limit?: number; warehouseId?: string }
  ): Promise<ApiResponse<StockTransaction[]>> => {
    return apiClient.get(
      `/inventory/stock-transactions/product/${productId}/history`,
      params as Record<string, unknown>
    );
  },

  getByWarehouse: async (
    warehouseId: string,
    params?: StockTransactionQueryParams
  ): Promise<ApiResponse<StockTransaction[]>> => {
    return apiClient.get(
      `/inventory/stock-transactions/warehouse/${warehouseId}`,
      params as Record<string, unknown>
    );
  },
};

// Dashboard API
export const inventoryDashboardApi = {
  getMetrics: async (): Promise<ApiResponse<DashboardMetrics>> => {
    return apiClient.get('/inventory/dashboard/metrics');
  },

  getOverview: async (): Promise<ApiResponse<InventoryOverview>> => {
    return apiClient.get('/inventory/dashboard/overview');
  },

  getStockSummary: async (): Promise<ApiResponse<StockSummary>> => {
    return apiClient.get('/inventory/dashboard/stock-summary');
  },

  getLowStockAlerts: async (limit?: number): Promise<ApiResponse<LowStockAlert[]>> => {
    return apiClient.get('/inventory/dashboard/low-stock-alerts', { limit });
  },

  getRecentTransactions: async (
    limit?: number
  ): Promise<ApiResponse<RecentTransaction[]>> => {
    return apiClient.get('/inventory/dashboard/recent-transactions', { limit });
  },

  getStockByCategory: async (): Promise<ApiResponse<StockByCategory[]>> => {
    return apiClient.get('/inventory/dashboard/stock-by-category');
  },

  getTransactionTrends: async (
    days?: number
  ): Promise<ApiResponse<TransactionTrend[]>> => {
    return apiClient.get('/inventory/dashboard/transaction-trends', { days });
  },
};

// Export all inventory APIs
export const inventoryApi = {
  categories: categoriesApi,
  brands: brandsApi,
  uoms: uomsApi,
  products: productsApi,
  warehouses: warehousesApi,
  stockTransactions: stockTransactionsApi,
  dashboard: inventoryDashboardApi,
};