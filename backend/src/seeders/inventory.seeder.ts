import { DataSource } from 'typeorm';
import { Category, CategoryType } from '../entities/inventory/category.entity';
import { Brand } from '../entities/inventory/brand.entity';
import { Uom } from '../entities/inventory/uom.entity';
import { Warehouse } from '../entities/inventory/warehouse.entity';

export async function seedInventory(dataSource: DataSource): Promise<void> {
  console.log('Seeding inventory data...');

  // Seed Categories
  const categories = [
    // Fixed Assets
    {
      code: 'CAT-FA-001',
      name: 'Kendaraan',
      type: CategoryType.FIXED,
      description: 'Kendaraan operasional',
    },
    {
      code: 'CAT-FA-002',
      name: 'Peralatan Kantor',
      type: CategoryType.FIXED,
      description: 'Peralatan kantor dan furniture',
    },
    {
      code: 'CAT-FA-003',
      name: 'Peralatan IT',
      type: CategoryType.FIXED,
      description: 'Komputer, laptop, printer, dll',
    },
    {
      code: 'CAT-FA-004',
      name: 'Mesin & Alat Berat',
      type: CategoryType.FIXED,
      description: 'Mesin dan alat berat operasional',
    },
    // Consumables
    {
      code: 'CAT-CS-001',
      name: 'ATK',
      type: CategoryType.CONSUMABLE,
      description: 'Alat tulis kantor',
    },
    {
      code: 'CAT-CS-002',
      name: 'Bahan Bakar',
      type: CategoryType.CONSUMABLE,
      description: 'BBM dan pelumas',
    },
    {
      code: 'CAT-CS-003',
      name: 'Spare Part',
      type: CategoryType.CONSUMABLE,
      description: 'Suku cadang kendaraan dan mesin',
    },
    {
      code: 'CAT-CS-004',
      name: 'Bahan Bangunan',
      type: CategoryType.CONSUMABLE,
      description: 'Material konstruksi',
    },
    {
      code: 'CAT-CS-005',
      name: 'Perlengkapan K3',
      type: CategoryType.CONSUMABLE,
      description: 'Alat keselamatan kerja',
    },
  ];

  // Seed Brands (only code and name - no description field in entity)
  const brands = [
    { code: 'BRD-001', name: 'Toyota' },
    { code: 'BRD-002', name: 'Honda' },
    { code: 'BRD-003', name: 'Caterpillar' },
    { code: 'BRD-004', name: 'Komatsu' },
    { code: 'BRD-005', name: 'HP' },
    { code: 'BRD-006', name: 'Lenovo' },
    { code: 'BRD-007', name: 'Pertamina' },
    { code: 'BRD-008', name: 'Shell' },
    { code: 'BRD-009', name: 'Generic' },
  ];

  // Seed UOMs (only code and name - no symbol/description field in entity)
  const uoms = [
    { code: 'UNIT', name: 'Unit' },
    { code: 'PCS', name: 'Pieces' },
    { code: 'BOX', name: 'Box' },
    { code: 'LTR', name: 'Liter' },
    { code: 'KG', name: 'Kilogram' },
    { code: 'MTR', name: 'Meter' },
    { code: 'RIM', name: 'Rim' },
    { code: 'SET', name: 'Set' },
    { code: 'DRUM', name: 'Drum' },
    { code: 'SAK', name: 'Sak' },
  ];

  // Seed Warehouses (without workLocationId and picEmployeeId for now - can be linked later)
  const warehouses = [
    {
      code: 'WH-001',
      name: 'Gudang Utama',
      address: 'Site Taliabu - Area Utama',
      isActive: true,
    },
    {
      code: 'WH-002',
      name: 'Gudang Spare Part',
      address: 'Site Taliabu - Workshop',
      isActive: true,
    },
    {
      code: 'WH-003',
      name: 'Gudang BBM',
      address: 'Site Taliabu - Fuel Station',
      isActive: true,
    },
    {
      code: 'WH-004',
      name: 'Gudang ATK',
      address: 'Site Taliabu - Kantor',
      isActive: true,
    },
  ];

  // Insert data using upsert pattern (insert if not exists)
  const categoryRepo = dataSource.getRepository(Category);
  const brandRepo = dataSource.getRepository(Brand);
  const uomRepo = dataSource.getRepository(Uom);
  const warehouseRepo = dataSource.getRepository(Warehouse);

  // Seed categories
  for (const cat of categories) {
    const existing = await categoryRepo.findOne({ where: { code: cat.code } });
    if (!existing) {
      await categoryRepo.save(categoryRepo.create(cat));
    }
  }
  console.log(`  ✓ Seeded ${categories.length} categories`);

  // Seed brands
  for (const brand of brands) {
    const existing = await brandRepo.findOne({ where: { code: brand.code } });
    if (!existing) {
      await brandRepo.save(brandRepo.create(brand));
    }
  }
  console.log(`  ✓ Seeded ${brands.length} brands`);

  // Seed UOMs
  for (const uom of uoms) {
    const existing = await uomRepo.findOne({ where: { code: uom.code } });
    if (!existing) {
      await uomRepo.save(uomRepo.create(uom));
    }
  }
  console.log(`  ✓ Seeded ${uoms.length} UOMs`);

  // Seed warehouses
  for (const wh of warehouses) {
    const existing = await warehouseRepo.findOne({ where: { code: wh.code } });
    if (!existing) {
      await warehouseRepo.save(warehouseRepo.create(wh));
    }
  }
  console.log(`  ✓ Seeded ${warehouses.length} warehouses`);

  console.log('Inventory seeding completed!');
}