import { PartialType } from '@nestjs/swagger';
import { CreateEmploymentStatusDto } from './create-employment-status.dto';

export class UpdateEmploymentStatusDto extends PartialType(
  CreateEmploymentStatusDto,
) {}