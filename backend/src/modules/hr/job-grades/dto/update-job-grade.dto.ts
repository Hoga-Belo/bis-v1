import { PartialType } from '@nestjs/swagger';
import { CreateJobGradeDto } from './create-job-grade.dto';

export class UpdateJobGradeDto extends PartialType(CreateJobGradeDto) {}