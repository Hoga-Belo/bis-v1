import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

/**
 * Migration untuk membuat tabel audit_logs
 *
 * Tabel ini digunakan untuk menyimpan audit trail dari semua operasi
 * Create, Update, Delete pada sistem dengan konteks 5W1H.
 *
 * Catatan: Jika InitialSchema sudah dijalankan, migration ini akan
 * di-skip karena tabel sudah ada. Migration ini berguna untuk:
 * - Database baru yang belum menjalankan InitialSchema
 * - Referensi dokumentasi struktur tabel audit_logs
 */
export class AddAuditLogsTable1703635400000 implements MigrationInterface {
  name = 'AddAuditLogsTable1703635400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cek apakah tabel sudah ada (dari InitialSchema)
    const tableExists = await queryRunner.hasTable('audit_logs');
    if (tableExists) {
      console.log('Table audit_logs already exists, skipping creation...');
      return;
    }

    // Cek apakah enum sudah ada
    const enumExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'audit_action_enum'
      );
    `);

    if (!enumExists[0].exists) {
      // Buat enum type untuk action
      await queryRunner.query(`
        CREATE TYPE audit_action_enum AS ENUM (
          'CREATE',
          'UPDATE',
          'DELETE',
          'SOFT_DELETE',
          'RESTORE',
          'LOGIN',
          'LOGOUT',
          'EXPORT',
          'IMPORT'
        )
      `);
    }

    // Buat tabel audit_logs
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'module',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Module name (e.g., hr, inventory, mess, building)',
          },
          {
            name: 'entity_type',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Entity type (e.g., Employee, Asset, MessRoom)',
          },
          {
            name: 'table_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'record_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'action',
            type: 'audit_action_enum',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: '5W1H context description',
          },
          {
            name: 'old_value',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'new_value',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
            comment: 'IPv4 or IPv6 address',
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Tambahkan foreign key ke tabel users
    await queryRunner.createForeignKey(
      'audit_logs',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Buat index pada table_name
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_table_name',
        columnNames: ['table_name'],
      }),
    );

    // Buat index pada record_id
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_record_id',
        columnNames: ['record_id'],
      }),
    );

    // Buat index pada user_id
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_user_id',
        columnNames: ['user_id'],
      }),
    );

    // Buat index pada action
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_action',
        columnNames: ['action'],
      }),
    );

    // Buat index pada created_at
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_created_at',
        columnNames: ['created_at'],
      }),
    );

    // Buat composite index pada table_name dan record_id
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_table_record',
        columnNames: ['table_name', 'record_id'],
      }),
    );

    // Buat composite index pada user_id dan created_at
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_user_date',
        columnNames: ['user_id', 'created_at'],
      }),
    );

    // Buat composite index pada action dan created_at
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_action_date',
        columnNames: ['action', 'created_at'],
      }),
    );

    // Buat composite index pada module dan created_at
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_module_date',
        columnNames: ['module', 'created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Cek apakah tabel ada sebelum drop
    const tableExists = await queryRunner.hasTable('audit_logs');
    if (!tableExists) {
      console.log('Table audit_logs does not exist, skipping drop...');
      return;
    }

    // Drop semua indexes
    const indexes = [
      'idx_audit_logs_module_date',
      'idx_audit_logs_action_date',
      'idx_audit_logs_user_date',
      'idx_audit_logs_table_record',
      'idx_audit_logs_created_at',
      'idx_audit_logs_action',
      'idx_audit_logs_user_id',
      'idx_audit_logs_record_id',
      'idx_audit_logs_table_name',
    ];

    for (const indexName of indexes) {
      try {
        await queryRunner.dropIndex('audit_logs', indexName);
      } catch {
        // Index mungkin tidak ada jika dibuat oleh InitialSchema dengan nama berbeda
        console.log(`Index ${indexName} not found, skipping...`);
      }
    }

    // Drop tabel
    await queryRunner.dropTable('audit_logs');

    // Drop enum type (hanya jika tidak digunakan oleh tabel lain)
    try {
      await queryRunner.query('DROP TYPE IF EXISTS audit_action_enum');
    } catch {
      console.log('Enum audit_action_enum still in use, skipping drop...');
    }
  }
}