import { PartialType } from '@nestjs/swagger';
import { CreateMaintenanceRecordDto } from './create-maintainance-record.dto';

export class UpdateMaintenanceRecordDto extends PartialType(
  CreateMaintenanceRecordDto,
) {}
