// Re-export PaginationMeta from api.ts for convenience
export type { PaginationMeta } from './api';

// Enums
export enum CategoryType {
  FIXED = 'FIXED',
  CONSUMABLE = 'CONSUMABLE',
}

export enum TransactionType {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
}

// Category
export interface Category {
  id: string;
  code: string;
  name: string;
  type: CategoryType;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  code: string;
  name: string;
  type: CategoryType;
  description?: string;
}

export interface UpdateCategoryRequest {
  code?: string;
  name?: string;
  type?: CategoryType;
  description?: string;
}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: CategoryType;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Brand
export interface Brand {
  id: string;
  code: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandRequest {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateBrandRequest {
  code?: string;
  name?: string;
  description?: string;
}

export interface BrandQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// UOM (Unit of Measure)
export interface Uom {
  id: string;
  code: string;
  name: string;
  symbol: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUomRequest {
  code: string;
  name: string;
  symbol: string;
  description?: string;
}

export interface UpdateUomRequest {
  code?: string;
  name?: string;
  symbol?: string;
  description?: string;
}

export interface UomQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Product
export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  category?: Category;
  brandId?: string;
  brand?: Brand;
  uomId: string;
  uom?: Uom;
  minStock: number;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed fields from service
  totalStock?: number;
  isLowStock?: boolean;
  stockBreakdown?: StockBreakdown[];
}

export interface StockBreakdown {
  warehouseId: string;
  warehouseName: string;
  quantity: number;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  brandId?: string;
  uomId: string;
  minStock?: number;
  isActive?: boolean;
}

export interface UpdateProductRequest {
  sku?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  brandId?: string;
  uomId?: string;
  minStock?: number;
  isActive?: boolean;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  isLowStock?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Warehouse
export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address?: string;
  workLocationId?: string;
  workLocation?: { id: string; name: string };
  picEmployeeId?: string;
  picEmployee?: { id: string; fullName: string; nik: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed fields
  totalProducts?: number;
  totalStock?: number;
}

export interface CreateWarehouseRequest {
  code: string;
  name: string;
  address?: string;
  workLocationId?: string;
  picEmployeeId?: string;
  isActive?: boolean;
}

export interface UpdateWarehouseRequest {
  code?: string;
  name?: string;
  address?: string;
  workLocationId?: string;
  picEmployeeId?: string;
  isActive?: boolean;
}

export interface WarehouseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  workLocationId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Stock
export interface Stock {
  id: string;
  productId: string;
  product?: Product;
  warehouseId: string;
  warehouse?: Warehouse;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

// Stock Transaction
export interface StockTransaction {
  id: string;
  transactionNumber: string;
  transactionType: TransactionType;
  productId: string;
  product?: Product;
  warehouseId: string;
  warehouse?: Warehouse;
  targetWarehouseId?: string;
  targetWarehouse?: Warehouse;
  quantity: number;
  referenceNumber?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

export interface CreateStockTransactionRequest {
  transactionType: TransactionType;
  productId: string;
  warehouseId: string;
  targetWarehouseId?: string; // Required for TRANSFER
  quantity: number;
  referenceNumber?: string;
  notes?: string;
}

// Specific request types for each transaction type
export interface CreateInboundRequest {
  productId: string;
  warehouseId: string;
  quantity: number;
  referenceNumber?: string;
  notes?: string;
  transactionDate?: string;
}

export interface CreateOutboundRequest {
  productId: string;
  warehouseId: string;
  quantity: number;
  referenceNumber?: string;
  notes?: string;
  transactionDate?: string;
}

export interface CreateAdjustmentRequest {
  productId: string;
  warehouseId: string;
  quantity: number;
  newQuantity?: number;
  notes: string; // Required for adjustments
  transactionDate?: string;
}

export interface CreateTransferRequest {
  productId: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  quantity: number;
  referenceNumber?: string;
  notes?: string;
  transactionDate?: string;
}

// Product stock response
export interface ProductStockResponse {
  totalStock: number;
  breakdown: Stock[];
}

export interface StockTransactionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  transactionType?: TransactionType;
  productId?: string;
  warehouseId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Dashboard Metrics
export interface InventoryOverview {
  totalProducts: number;
  totalCategories: number;
  totalBrands: number;
  totalWarehouses: number;
  totalStockValue?: number;
}

export interface StockSummary {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  healthyStockCount: number;
}

export interface RecentTransaction {
  id: string;
  transactionNumber: string;
  transactionType: TransactionType;
  productName: string;
  quantity: number;
  warehouseName: string;
  createdAt: string;
}

export interface WarehouseStockBreakdown {
  warehouseId: string;
  warehouseName: string;
  quantity: number;
}

export interface LowStockAlert {
  productId: string;
  productSku: string;
  productName: string;
  categoryName: string;
  currentStock: number;
  minStock: number;
  deficit: number;
  warehouseBreakdown: WarehouseStockBreakdown[];
}

export interface DashboardMetrics {
  overview: InventoryOverview;
  stockSummary: StockSummary;
  recentTransactions: RecentTransaction[];
  lowStockAlerts: LowStockAlert[];
}

export interface StockByCategory {
  categoryId: string;
  categoryName: string;
  categoryType: CategoryType;
  productCount: number;
  totalStock: number;
}

export interface TransactionTrend {
  date: string;
  inbound: number;
  outbound: number;
  adjustment: number;
  transfer: number;
}

// Stock Movement History
export interface StockMovement {
  id: string;
  transactionNumber: string;
  transactionType: TransactionType;
  warehouseName: string;
  targetWarehouseName?: string;
  quantity: number;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}