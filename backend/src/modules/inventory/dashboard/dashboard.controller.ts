import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { RequirePermissions } from '../../../common/decorators';
import {
  DashboardMetricsDto,
  InventoryOverviewDto,
  StockSummaryDto,
  RecentTransactionDto,
  LowStockAlertDto,
  StockByCategoryDto,
  TransactionTrendDto,
} from './dto';

@ApiTags('Inventory - Dashboard')
@Controller('inventory/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @RequirePermissions('inventory:dashboard:read')
  @ApiOperation({ summary: 'Get all dashboard metrics (combined)' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard metrics retrieved successfully',
    type: DashboardMetricsDto,
  })
  async getMetrics(): Promise<DashboardMetricsDto> {
    return this.dashboardService.getDashboardMetrics();
  }

  @Get('overview')
  @RequirePermissions('inventory:dashboard:read')
  @ApiOperation({ summary: 'Get inventory overview counts' })
  @ApiResponse({
    status: 200,
    description: 'Inventory overview retrieved successfully',
    type: InventoryOverviewDto,
  })
  async getOverview(): Promise<InventoryOverviewDto> {
    return this.dashboardService.getOverview();
  }

  @Get('stock-summary')
  @RequirePermissions('inventory:dashboard:read')
  @ApiOperation({ summary: 'Get stock health summary' })
  @ApiResponse({
    status: 200,
    description: 'Stock summary retrieved successfully',
    type: StockSummaryDto,
  })
  async getStockSummary(): Promise<StockSummaryDto> {
    return this.dashboardService.getStockSummary();
  }

  @Get('recent-transactions')
  @RequirePermissions('inventory:dashboard:read')
  @ApiOperation({ summary: 'Get recent stock transactions' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of transactions to return (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent transactions retrieved successfully',
    type: [RecentTransactionDto],
  })
  async getRecentTransactions(
    @Query('limit') limit?: number,
  ): Promise<RecentTransactionDto[]> {
    return this.dashboardService.getRecentTransactions(limit || 10);
  }

  @Get('low-stock-alerts')
  @RequirePermissions('inventory:dashboard:read')
  @ApiOperation({ summary: 'Get low stock alerts' })
  @ApiResponse({
    status: 200,
    description: 'Low stock alerts retrieved successfully',
    type: [LowStockAlertDto],
  })
  async getLowStockAlerts(): Promise<LowStockAlertDto[]> {
    return this.dashboardService.getLowStockAlerts();
  }

  @Get('stock-by-category')
  @RequirePermissions('inventory:dashboard:read')
  @ApiOperation({ summary: 'Get stock grouped by category' })
  @ApiResponse({
    status: 200,
    description: 'Stock by category retrieved successfully',
    type: [StockByCategoryDto],
  })
  async getStockByCategory(): Promise<StockByCategoryDto[]> {
    return this.dashboardService.getStockByCategory();
  }

  @Get('transaction-trends')
  @RequirePermissions('inventory:dashboard:read')
  @ApiOperation({ summary: 'Get transaction trends for charting' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to look back (default: 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction trends retrieved successfully',
    type: [TransactionTrendDto],
  })
  async getTransactionTrends(
    @Query('days') days?: number,
  ): Promise<TransactionTrendDto[]> {
    return this.dashboardService.getTransactionTrends(days || 30);
  }
}