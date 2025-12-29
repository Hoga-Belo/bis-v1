import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Product } from '../../../entities/inventory/product.entity';
import { Category } from '../../../entities/inventory/category.entity';
import { Brand } from '../../../entities/inventory/brand.entity';
import { Warehouse } from '../../../entities/inventory/warehouse.entity';
import { Stock } from '../../../entities/inventory/stock.entity';
import { StockTransaction } from '../../../entities/inventory/stock-transaction.entity';
import {
  InventoryOverviewDto,
  StockSummaryDto,
  RecentTransactionDto,
  LowStockAlertDto,
  DashboardMetricsDto,
  StockByCategoryDto,
  TransactionTrendDto,
  WarehouseStockBreakdownDto,
} from './dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(StockTransaction)
    private readonly stockTransactionRepository: Repository<StockTransaction>,
  ) {}

  /**
   * Get inventory overview counts (products, categories, brands, warehouses)
   */
  async getOverview(): Promise<InventoryOverviewDto> {
    const [totalProducts, totalCategories, totalBrands, totalWarehouses] =
      await Promise.all([
        this.productRepository.count({ where: { deletedAt: IsNull() } }),
        this.categoryRepository.count({ where: { deletedAt: IsNull() } }),
        this.brandRepository.count({ where: { deletedAt: IsNull() } }),
        this.warehouseRepository.count({ where: { deletedAt: IsNull() } }),
      ]);

    return {
      totalProducts,
      totalCategories,
      totalBrands,
      totalWarehouses,
    };
  }

  /**
   * Get stock health summary (total items, low stock, out of stock, healthy stock)
   */
  async getStockSummary(): Promise<StockSummaryDto> {
    // Get all products with their total stock across all warehouses
    const productsWithStock = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.stocks', 'stock', 'stock.deletedAt IS NULL')
      .select('product.id', 'productId')
      .addSelect('product.minStock', 'minStock')
      .addSelect('COALESCE(SUM(stock.quantity), 0)', 'totalStock')
      .where('product.deletedAt IS NULL')
      .groupBy('product.id')
      .addGroupBy('product.minStock')
      .getRawMany();

    let totalItems = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let healthyStockCount = 0;

    for (const product of productsWithStock) {
      const totalStock = parseInt(product.totalStock, 10) || 0;
      const minStock = product.minStock || 0;

      totalItems += totalStock;

      if (totalStock === 0) {
        outOfStockCount++;
      } else if (totalStock < minStock) {
        lowStockCount++;
      } else {
        healthyStockCount++;
      }
    }

    return {
      totalItems,
      lowStockCount,
      outOfStockCount,
      healthyStockCount,
    };
  }

  /**
   * Get recent stock transactions with product and warehouse names
   */
  async getRecentTransactions(limit: number = 10): Promise<RecentTransactionDto[]> {
    const transactions = await this.stockTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.product', 'product')
      .leftJoinAndSelect('transaction.warehouse', 'warehouse')
      .where('transaction.deletedAt IS NULL')
      .orderBy('transaction.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return transactions.map((transaction) => ({
      id: transaction.id,
      transactionNumber: transaction.transactionNumber,
      transactionType: transaction.transactionType,
      productName: transaction.product?.name || 'Unknown Product',
      quantity: transaction.quantity,
      warehouseName: transaction.warehouse?.name || 'Unknown Warehouse',
      createdAt: transaction.createdAt,
    }));
  }

  /**
   * Get low stock alerts for products where total stock < minStock
   */
  async getLowStockAlerts(): Promise<LowStockAlertDto[]> {
    // Get products with their total stock and category info
    const productsWithStock = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoin('product.stocks', 'stock', 'stock.deletedAt IS NULL')
      .select('product.id', 'productId')
      .addSelect('product.sku', 'productSku')
      .addSelect('product.name', 'productName')
      .addSelect('product.minStock', 'minStock')
      .addSelect('category.name', 'categoryName')
      .addSelect('COALESCE(SUM(stock.quantity), 0)', 'totalStock')
      .where('product.deletedAt IS NULL')
      .groupBy('product.id')
      .addGroupBy('product.sku')
      .addGroupBy('product.name')
      .addGroupBy('product.minStock')
      .addGroupBy('category.name')
      .having('COALESCE(SUM(stock.quantity), 0) < product.minStock')
      .orderBy('product.minStock - COALESCE(SUM(stock.quantity), 0)', 'DESC')
      .getRawMany();

    // Get warehouse breakdown for each low stock product
    const alerts: LowStockAlertDto[] = [];

    for (const product of productsWithStock) {
      const currentStock = parseInt(product.totalStock, 10) || 0;
      const minStock = product.minStock || 0;

      // Get stock breakdown by warehouse
      const warehouseBreakdown = await this.stockRepository
        .createQueryBuilder('stock')
        .leftJoinAndSelect('stock.warehouse', 'warehouse')
        .select('warehouse.id', 'warehouseId')
        .addSelect('warehouse.name', 'warehouseName')
        .addSelect('stock.quantity', 'quantity')
        .where('stock.productId = :productId', { productId: product.productId })
        .andWhere('stock.deletedAt IS NULL')
        .andWhere('warehouse.deletedAt IS NULL')
        .getRawMany();

      const breakdown: WarehouseStockBreakdownDto[] = warehouseBreakdown.map((item) => ({
        warehouseId: item.warehouseId,
        warehouseName: item.warehouseName || 'Unknown Warehouse',
        quantity: item.quantity || 0,
      }));

      alerts.push({
        productId: product.productId,
        productSku: product.productSku,
        productName: product.productName,
        categoryName: product.categoryName || 'Uncategorized',
        currentStock,
        minStock,
        deficit: minStock - currentStock,
        warehouseBreakdown: breakdown,
      });
    }

    return alerts;
  }

  /**
   * Get all dashboard metrics combined
   */
  async getDashboardMetrics(): Promise<DashboardMetricsDto> {
    const [overview, stockSummary, recentTransactions, lowStockAlerts] =
      await Promise.all([
        this.getOverview(),
        this.getStockSummary(),
        this.getRecentTransactions(10),
        this.getLowStockAlerts(),
      ]);

    return {
      overview,
      stockSummary,
      recentTransactions,
      lowStockAlerts,
    };
  }

  /**
   * Get stock summary grouped by category (for charts)
   */
  async getStockByCategory(): Promise<StockByCategoryDto[]> {
    const result = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.products', 'product', 'product.deletedAt IS NULL')
      .leftJoin('product.stocks', 'stock', 'stock.deletedAt IS NULL')
      .select('category.id', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('COALESCE(SUM(stock.quantity), 0)', 'totalStock')
      .addSelect('COUNT(DISTINCT product.id)', 'productCount')
      .where('category.deletedAt IS NULL')
      .groupBy('category.id')
      .addGroupBy('category.name')
      .orderBy('category.name', 'ASC')
      .getRawMany();

    return result.map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      totalStock: parseInt(item.totalStock, 10) || 0,
      productCount: parseInt(item.productCount, 10) || 0,
    }));
  }

  /**
   * Get transaction trends for the last N days (for charts)
   */
  async getTransactionTrends(days: number = 30): Promise<TransactionTrendDto[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const result = await this.stockTransactionRepository
      .createQueryBuilder('transaction')
      .select("TO_CHAR(transaction.transactionDate, 'YYYY-MM-DD')", 'date')
      .addSelect('transaction.transactionType', 'transactionType')
      .addSelect('COUNT(*)', 'count')
      .where('transaction.deletedAt IS NULL')
      .andWhere('transaction.transactionDate >= :startDate', { startDate })
      .groupBy("TO_CHAR(transaction.transactionDate, 'YYYY-MM-DD')")
      .addGroupBy('transaction.transactionType')
      .orderBy('date', 'ASC')
      .addOrderBy('transaction.transactionType', 'ASC')
      .getRawMany();

    return result.map((item) => ({
      date: item.date,
      transactionType: item.transactionType,
      count: parseInt(item.count, 10) || 0,
    }));
  }
}