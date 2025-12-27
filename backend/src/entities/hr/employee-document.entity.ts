import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Employee } from './employee.entity';

export enum DocumentType {
  KTP = 'KTP',
  KK = 'KK',
  IJAZAH = 'IJAZAH',
  SERTIFIKAT = 'SERTIFIKAT',
  KONTRAK = 'KONTRAK',
  SK = 'SK',
  OTHER = 'OTHER',
}

@Entity('employee_documents')
export class EmployeeDocument extends BaseEntity {
  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'document_type', type: 'enum', enum: DocumentType })
  documentType: DocumentType;

  @Column({ name: 'document_name', type: 'varchar', length: 200 })
  documentName: string;

  @Column({ name: 'file_url', type: 'varchar', length: 255 })
  fileUrl: string;

  @Column({ name: 'file_size', type: 'int' })
  fileSize: number;

  @Column({ name: 'uploaded_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  uploadedAt: Date;
}