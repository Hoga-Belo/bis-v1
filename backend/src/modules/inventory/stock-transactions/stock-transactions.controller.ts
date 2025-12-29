import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { StockTransactionsService } from './stock-transactions.service';
import { CreateStockTransactionDto, StockTransactionQueryDto } from './dto';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Inventory - Stock Transactions')
@ApiBearerAuth()
@Controller('inventory/stock-transactions')
export class StockTransactionsController {
  constructor(
    private readonly stockTransactionsService: StockTransactionsService,
  ) {}

  @Get()
  @RequirePermissions('inventory:stock:read')
  @ApiOperation({ summary: 'Get all stock transactions with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'List of stock transactions retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'transactionType', required: false, type: String })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({ name: 'warehouseId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date })
  @ApiQuery({ name: 'dateTo', required: false, type: Date })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  async findAll(@Query() query: StockTransactionQueryDto) {
    return this.stockTransactionsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('inventory:stock:read')
  @ApiOperation({ summary: 'Get a stock transaction by ID' })
  @ApiParam({ name: 'id', description: 'Stock transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Stock transaction retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Stock transaction not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.stockTransactionsService.findOne(id);
  }

  @Post('inbound')
  @RequirePermissions('inventory:stock:create')
  @ApiOperation({ summary: 'Create an inbound stock transaction' })
  @ApiResponse({
    status: 201,
    description: 'Inbound transaction created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Product or warehouse not found' })
  async createInbound(
    @Body() dto: CreateStockTransactionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.stockTransactionsService.createInbound(dto, userId);
  }

  @Post('outbound')
  @RequirePermissions('inventory:stock:create')
  @ApiOperation({ summary: 'Create an outbound stock transaction' })
  @ApiResponse({
    status: 201,
    description: 'Outbound transaction created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data or insufficient stock',
  })
  @ApiResponse({ status: 404, description: 'Product or warehouse not found' })
  async createOutbound(
    @Body() dto: CreateStockTransactionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.stockTransactionsService.createOutbound(dto, userId);
  }

  @Post('adjustment')
  @RequirePermissions('inventory:stock:create')
  @ApiOperation({ summary: 'Create a stock adjustment transaction' })
  @ApiResponse({
    status: 201,
    description: 'Adjustment transaction created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Product or warehouse not found' })
  async createAdjustment(
    @Body() dto: CreateStockTransactionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.stockTransactionsService.createAdjustment(dto, userId);
  }

  @Post('transfer')
  @RequirePermissions('inventory:stock:create')
  @ApiOperation({ summary: 'Create a stock transfer transaction between warehouses' })
  @ApiResponse({
    status: 201,
    description: 'Transfer transaction created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data, insufficient stock, or same source/target warehouse',
  })
  @ApiResponse({ status: 404, description: 'Product or warehouse not found' })
  async createTransfer(
    @Body() dto: CreateStockTransactionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.stockTransactionsService.createTransfer(dto, userId);
  }

  @Get('product/:productId/history')
  @RequirePermissions('inventory:stock:read')
  @ApiOperation({ summary: 'Get stock movement history for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiQuery({
    name: 'warehouseId',
    required: false,
    description: 'Filter by warehouse ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock movement history retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getStockMovementHistory(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.stockTransactionsService.getStockMovementHistory(
      productId,
      warehouseId,
    );
  }
}