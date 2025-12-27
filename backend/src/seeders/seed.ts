import { AppDataSource } from '../config/data-source';
import { seedMasterData } from './master-data.seeder';
import { seedUserAccess } from './user-access.seeder';
import { seedHR } from './hr.seeder';

async function runSeeders(): Promise<void> {
  console.log('='.repeat(50));
  console.log('Starting database seeding...');
  console.log('='.repeat(50));

  try {
    // Initialize the data source
    console.log('\nInitializing database connection...');
    await AppDataSource.initialize();
    console.log('Database connection established.\n');

    // Run seeders in order (dependencies first)
    // 1. Master data (no dependencies)
    await seedMasterData(AppDataSource);
    console.log('');

    // 2. User access (no dependencies on other seeders)
    await seedUserAccess(AppDataSource);
    console.log('');

    // 3. HR data (depends on master data for cities if work locations need them)
    await seedHR(AppDataSource);
    console.log('');

    console.log('='.repeat(50));
    console.log('All seeders completed successfully!');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    // Close the data source
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\nDatabase connection closed.');
    }
  }
}

// Run the seeders
runSeeders()
  .then(() => {
    console.log('\nSeeding process finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding process failed:', error);
    process.exit(1);
  });