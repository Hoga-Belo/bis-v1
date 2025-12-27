import { DataSource } from 'typeorm';
import {
  Division,
  Department,
  Position,
  JobGrade,
  EmploymentStatus,
  WorkLocation,
} from '../entities';

export async function seedHR(dataSource: DataSource): Promise<void> {
  console.log('Seeding HR data...');

  // Seed Divisions
  const divisionRepo = dataSource.getRepository(Division);
  const divisions = [
    { code: 'BOD', name: 'Board of Directors', description: 'Executive leadership' },
    { code: 'OPS', name: 'Operations', description: 'Mining operations' },
    { code: 'FIN', name: 'Finance', description: 'Finance and accounting' },
    { code: 'HR', name: 'Human Resources', description: 'HR and administration' },
    { code: 'IT', name: 'Information Technology', description: 'IT and systems' },
    { code: 'LOG', name: 'Logistics', description: 'Supply chain and logistics' },
    { code: 'HSE', name: 'Health Safety Environment', description: 'HSE department' },
  ];

  const savedDivisions: Record<string, Division> = {};
  for (const division of divisions) {
    let existing = await divisionRepo.findOne({ where: { code: division.code } });
    if (!existing) {
      existing = await divisionRepo.save(divisionRepo.create(division));
    }
    savedDivisions[division.code] = existing;
  }
  console.log(`  ✓ Seeded ${divisions.length} divisions`);

  // Seed Departments
  const departmentRepo = dataSource.getRepository(Department);
  const departments = [
    // BOD Departments
    {
      code: 'BOD-EXEC',
      name: 'Executive Office',
      divisionCode: 'BOD',
      description: 'Executive management',
    },
    {
      code: 'BOD-SEC',
      name: 'Corporate Secretary',
      divisionCode: 'BOD',
      description: 'Corporate secretariat',
    },

    // Operations Departments
    { code: 'OPS-MINE', name: 'Mining', divisionCode: 'OPS', description: 'Mining operations' },
    { code: 'OPS-PROC', name: 'Processing', divisionCode: 'OPS', description: 'Ore processing' },
    {
      code: 'OPS-MAINT',
      name: 'Maintenance',
      divisionCode: 'OPS',
      description: 'Equipment maintenance',
    },
    {
      code: 'OPS-PLAN',
      name: 'Mine Planning',
      divisionCode: 'OPS',
      description: 'Mine planning and geology',
    },

    // Finance Departments
    { code: 'FIN-ACC', name: 'Accounting', divisionCode: 'FIN', description: 'General accounting' },
    { code: 'FIN-TAX', name: 'Tax', divisionCode: 'FIN', description: 'Tax compliance' },
    {
      code: 'FIN-TREAS',
      name: 'Treasury',
      divisionCode: 'FIN',
      description: 'Treasury management',
    },
    {
      code: 'FIN-BUDGET',
      name: 'Budget & Control',
      divisionCode: 'FIN',
      description: 'Budget and cost control',
    },

    // HR Departments
    { code: 'HR-REC', name: 'Recruitment', divisionCode: 'HR', description: 'Talent acquisition' },
    {
      code: 'HR-COMP',
      name: 'Compensation & Benefits',
      divisionCode: 'HR',
      description: 'Payroll and benefits',
    },
    {
      code: 'HR-DEV',
      name: 'Training & Development',
      divisionCode: 'HR',
      description: 'Employee development',
    },
    {
      code: 'HR-GA',
      name: 'General Affairs',
      divisionCode: 'HR',
      description: 'General administration',
    },

    // IT Departments
    {
      code: 'IT-INF',
      name: 'Infrastructure',
      divisionCode: 'IT',
      description: 'IT infrastructure',
    },
    {
      code: 'IT-APP',
      name: 'Applications',
      divisionCode: 'IT',
      description: 'Application development',
    },
    {
      code: 'IT-SUP',
      name: 'IT Support',
      divisionCode: 'IT',
      description: 'IT helpdesk and support',
    },

    // Logistics Departments
    {
      code: 'LOG-PROC',
      name: 'Procurement',
      divisionCode: 'LOG',
      description: 'Purchasing and procurement',
    },
    { code: 'LOG-WH', name: 'Warehouse', divisionCode: 'LOG', description: 'Warehouse management' },
    {
      code: 'LOG-TRANS',
      name: 'Transportation',
      divisionCode: 'LOG',
      description: 'Fleet and transportation',
    },

    // HSE Departments
    { code: 'HSE-SAFE', name: 'Safety', divisionCode: 'HSE', description: 'Occupational safety' },
    {
      code: 'HSE-ENV',
      name: 'Environment',
      divisionCode: 'HSE',
      description: 'Environmental management',
    },
    { code: 'HSE-HEALTH', name: 'Health', divisionCode: 'HSE', description: 'Occupational health' },
  ];

  for (const dept of departments) {
    const division = savedDivisions[dept.divisionCode];
    if (!division) {
      console.warn(`  ⚠ Division ${dept.divisionCode} not found for department ${dept.code}`);
      continue;
    }

    const existing = await departmentRepo.findOne({ where: { code: dept.code } });
    if (!existing) {
      await departmentRepo.save(
        departmentRepo.create({
          code: dept.code,
          name: dept.name,
          divisionId: division.id,
          description: dept.description,
        }),
      );
    }
  }
  console.log(`  ✓ Seeded ${departments.length} departments`);

  // Seed Positions
  const positionRepo = dataSource.getRepository(Position);
  const positions = [
    { code: 'DIR', name: 'Director', level: 1 },
    { code: 'GM', name: 'General Manager', level: 2 },
    { code: 'SM', name: 'Senior Manager', level: 3 },
    { code: 'MGR', name: 'Manager', level: 4 },
    { code: 'ASST_MGR', name: 'Assistant Manager', level: 5 },
    { code: 'SPV', name: 'Supervisor', level: 6 },
    { code: 'COORD', name: 'Coordinator', level: 7 },
    { code: 'SR_STAFF', name: 'Senior Staff', level: 8 },
    { code: 'STAFF', name: 'Staff', level: 9 },
    { code: 'JR_STAFF', name: 'Junior Staff', level: 10 },
    { code: 'TRAINEE', name: 'Trainee', level: 11 },
    { code: 'OPERATOR', name: 'Operator', level: 9 },
    { code: 'TECHNICIAN', name: 'Technician', level: 8 },
    { code: 'DRIVER', name: 'Driver', level: 10 },
    { code: 'SECURITY', name: 'Security', level: 10 },
    { code: 'CLEANER', name: 'Cleaner', level: 11 },
  ];

  for (const position of positions) {
    const existing = await positionRepo.findOne({ where: { code: position.code } });
    if (!existing) {
      await positionRepo.save(positionRepo.create(position));
    }
  }
  console.log(`  ✓ Seeded ${positions.length} positions`);

  // Seed Job Grades
  const jobGradeRepo = dataSource.getRepository(JobGrade);
  const jobGrades = [
    { code: 'G1', name: 'Grade 1 - Executive', minSalary: 50000000, maxSalary: 100000000 },
    { code: 'G2', name: 'Grade 2 - Senior Management', minSalary: 35000000, maxSalary: 60000000 },
    { code: 'G3', name: 'Grade 3 - Middle Management', minSalary: 25000000, maxSalary: 40000000 },
    { code: 'G4', name: 'Grade 4 - Junior Management', minSalary: 18000000, maxSalary: 28000000 },
    { code: 'G5', name: 'Grade 5 - Senior Professional', minSalary: 12000000, maxSalary: 20000000 },
    { code: 'G6', name: 'Grade 6 - Professional', minSalary: 8000000, maxSalary: 14000000 },
    { code: 'G7', name: 'Grade 7 - Junior Professional', minSalary: 6000000, maxSalary: 10000000 },
    { code: 'G8', name: 'Grade 8 - Senior Staff', minSalary: 5000000, maxSalary: 8000000 },
    { code: 'G9', name: 'Grade 9 - Staff', minSalary: 4000000, maxSalary: 6000000 },
    { code: 'G10', name: 'Grade 10 - Entry Level', minSalary: 3500000, maxSalary: 5000000 },
  ];

  for (const jobGrade of jobGrades) {
    const existing = await jobGradeRepo.findOne({ where: { code: jobGrade.code } });
    if (!existing) {
      await jobGradeRepo.save(jobGradeRepo.create(jobGrade));
    }
  }
  console.log(`  ✓ Seeded ${jobGrades.length} job grades`);

  // Seed Employment Statuses
  const employmentStatusRepo = dataSource.getRepository(EmploymentStatus);
  const employmentStatuses = [
    { code: 'PERMANENT', name: 'Permanent Employee', description: 'Full-time permanent employee' },
    { code: 'CONTRACT', name: 'Contract Employee', description: 'Fixed-term contract employee' },
    { code: 'PROBATION', name: 'Probation', description: 'Employee on probation period' },
    { code: 'INTERN', name: 'Internship', description: 'Internship program participant' },
    { code: 'OUTSOURCE', name: 'Outsourced', description: 'Outsourced/third-party employee' },
    { code: 'DAILY', name: 'Daily Worker', description: 'Daily wage worker' },
    { code: 'RESIGNED', name: 'Resigned', description: 'Employee who has resigned' },
    { code: 'TERMINATED', name: 'Terminated', description: 'Employment terminated' },
    { code: 'RETIRED', name: 'Retired', description: 'Retired employee' },
  ];

  for (const status of employmentStatuses) {
    const existing = await employmentStatusRepo.findOne({ where: { code: status.code } });
    if (!existing) {
      await employmentStatusRepo.save(employmentStatusRepo.create(status));
    }
  }
  console.log(`  ✓ Seeded ${employmentStatuses.length} employment statuses`);

  // Seed Work Locations
  const workLocationRepo = dataSource.getRepository(WorkLocation);
  const workLocations = [
    { code: 'HO-JKT', name: 'Head Office Jakarta', address: 'Jl. Sudirman No. 1, Jakarta Pusat' },
    {
      code: 'SITE-KTM',
      name: 'Site Kalimantan Timur',
      address: 'Kecamatan Kutai, Kalimantan Timur',
    },
    {
      code: 'SITE-KTB',
      name: 'Site Kalimantan Barat',
      address: 'Kecamatan Sanggau, Kalimantan Barat',
    },
    { code: 'SITE-SLW', name: 'Site Sulawesi', address: 'Kecamatan Morowali, Sulawesi Tengah' },
    { code: 'SITE-PPU', name: 'Site Papua', address: 'Kabupaten Mimika, Papua' },
    { code: 'PORT-BJM', name: 'Port Banjarmasin', address: 'Pelabuhan Trisakti, Banjarmasin' },
    { code: 'PORT-SMD', name: 'Port Samarinda', address: 'Pelabuhan Samarinda, Kalimantan Timur' },
    {
      code: 'WH-JKT',
      name: 'Warehouse Jakarta',
      address: 'Kawasan Industri Pulogadung, Jakarta Timur',
    },
    { code: 'WH-SBY', name: 'Warehouse Surabaya', address: 'Kawasan Industri Rungkut, Surabaya' },
    { code: 'REMOTE', name: 'Remote/WFH', address: 'Work from home' },
  ];

  for (const location of workLocations) {
    const existing = await workLocationRepo.findOne({ where: { code: location.code } });
    if (!existing) {
      await workLocationRepo.save(workLocationRepo.create(location));
    }
  }
  console.log(`  ✓ Seeded ${workLocations.length} work locations`);

  console.log('HR data seeding completed!');
}
