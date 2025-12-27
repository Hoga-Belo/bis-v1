import { DataSource } from 'typeorm';
import {
  Province,
  BloodType,
  Religion,
  EducationLevel,
  RelationshipType,
} from '../entities';

export async function seedMasterData(dataSource: DataSource): Promise<void> {
  console.log('Seeding master data...');

  // Seed Provinces (Indonesian provinces)
  const provinceRepo = dataSource.getRepository(Province);
  const provinces = [
    { code: '11', name: 'Aceh' },
    { code: '12', name: 'Sumatera Utara' },
    { code: '13', name: 'Sumatera Barat' },
    { code: '14', name: 'Riau' },
    { code: '15', name: 'Jambi' },
    { code: '16', name: 'Sumatera Selatan' },
    { code: '17', name: 'Bengkulu' },
    { code: '18', name: 'Lampung' },
    { code: '19', name: 'Kepulauan Bangka Belitung' },
    { code: '21', name: 'Kepulauan Riau' },
    { code: '31', name: 'DKI Jakarta' },
    { code: '32', name: 'Jawa Barat' },
    { code: '33', name: 'Jawa Tengah' },
    { code: '34', name: 'DI Yogyakarta' },
    { code: '35', name: 'Jawa Timur' },
    { code: '36', name: 'Banten' },
    { code: '51', name: 'Bali' },
    { code: '52', name: 'Nusa Tenggara Barat' },
    { code: '53', name: 'Nusa Tenggara Timur' },
    { code: '61', name: 'Kalimantan Barat' },
    { code: '62', name: 'Kalimantan Tengah' },
    { code: '63', name: 'Kalimantan Selatan' },
    { code: '64', name: 'Kalimantan Timur' },
    { code: '65', name: 'Kalimantan Utara' },
    { code: '71', name: 'Sulawesi Utara' },
    { code: '72', name: 'Sulawesi Tengah' },
    { code: '73', name: 'Sulawesi Selatan' },
    { code: '74', name: 'Sulawesi Tenggara' },
    { code: '75', name: 'Gorontalo' },
    { code: '76', name: 'Sulawesi Barat' },
    { code: '81', name: 'Maluku' },
    { code: '82', name: 'Maluku Utara' },
    { code: '91', name: 'Papua' },
    { code: '92', name: 'Papua Barat' },
  ];

  for (const province of provinces) {
    const exists = await provinceRepo.findOne({ where: { code: province.code } });
    if (!exists) {
      await provinceRepo.save(provinceRepo.create(province));
    }
  }
  console.log(`  ✓ Seeded ${provinces.length} provinces`);

  // Seed Blood Types
  const bloodTypeRepo = dataSource.getRepository(BloodType);
  const bloodTypes = [
    { code: 'A', name: 'A' },
    { code: 'B', name: 'B' },
    { code: 'AB', name: 'AB' },
    { code: 'O', name: 'O' },
  ];

  for (const bloodType of bloodTypes) {
    const exists = await bloodTypeRepo.findOne({ where: { code: bloodType.code } });
    if (!exists) {
      await bloodTypeRepo.save(bloodTypeRepo.create(bloodType));
    }
  }
  console.log(`  ✓ Seeded ${bloodTypes.length} blood types`);

  // Seed Religions
  const religionRepo = dataSource.getRepository(Religion);
  const religions = [
    { code: 'ISLAM', name: 'Islam' },
    { code: 'KRISTEN', name: 'Kristen Protestan' },
    { code: 'KATOLIK', name: 'Katolik' },
    { code: 'HINDU', name: 'Hindu' },
    { code: 'BUDDHA', name: 'Buddha' },
    { code: 'KONGHUCU', name: 'Konghucu' },
    { code: 'LAINNYA', name: 'Lainnya' },
  ];

  for (const religion of religions) {
    const exists = await religionRepo.findOne({ where: { code: religion.code } });
    if (!exists) {
      await religionRepo.save(religionRepo.create(religion));
    }
  }
  console.log(`  ✓ Seeded ${religions.length} religions`);

  // Seed Education Levels
  const educationLevelRepo = dataSource.getRepository(EducationLevel);
  const educationLevels = [
    { code: 'SD', name: 'Sekolah Dasar', level: 1 },
    { code: 'SMP', name: 'Sekolah Menengah Pertama', level: 2 },
    { code: 'SMA', name: 'Sekolah Menengah Atas', level: 3 },
    { code: 'SMK', name: 'Sekolah Menengah Kejuruan', level: 3 },
    { code: 'D1', name: 'Diploma 1', level: 4 },
    { code: 'D2', name: 'Diploma 2', level: 5 },
    { code: 'D3', name: 'Diploma 3', level: 6 },
    { code: 'D4', name: 'Diploma 4', level: 7 },
    { code: 'S1', name: 'Sarjana (S1)', level: 7 },
    { code: 'S2', name: 'Magister (S2)', level: 8 },
    { code: 'S3', name: 'Doktor (S3)', level: 9 },
  ];

  for (const educationLevel of educationLevels) {
    const exists = await educationLevelRepo.findOne({ where: { code: educationLevel.code } });
    if (!exists) {
      await educationLevelRepo.save(educationLevelRepo.create(educationLevel));
    }
  }
  console.log(`  ✓ Seeded ${educationLevels.length} education levels`);

  // Seed Relationship Types
  const relationshipTypeRepo = dataSource.getRepository(RelationshipType);
  const relationshipTypes = [
    { code: 'SUAMI', name: 'Suami' },
    { code: 'ISTRI', name: 'Istri' },
    { code: 'ANAK', name: 'Anak' },
    { code: 'AYAH', name: 'Ayah' },
    { code: 'IBU', name: 'Ibu' },
    { code: 'SAUDARA', name: 'Saudara Kandung' },
    { code: 'MERTUA', name: 'Mertua' },
    { code: 'LAINNYA', name: 'Lainnya' },
  ];

  for (const relationshipType of relationshipTypes) {
    const exists = await relationshipTypeRepo.findOne({ where: { code: relationshipType.code } });
    if (!exists) {
      await relationshipTypeRepo.save(relationshipTypeRepo.create(relationshipType));
    }
  }
  console.log(`  ✓ Seeded ${relationshipTypes.length} relationship types`);

  console.log('Master data seeding completed!');
}