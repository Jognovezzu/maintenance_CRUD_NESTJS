import { Module } from '@nestjs/common';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Maintenance } from './entities/maintenance.entity';
import { NotificationModule } from 'models/notification/notification.module';

@Module({
    imports: [TypeOrmModule.forFeature([Maintenance]), NotificationModule],
    controllers: [MaintenanceController],
    providers: [MaintenanceService],
})
export class MaintenanceModule {}
