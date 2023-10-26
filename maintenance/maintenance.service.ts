import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Maintenance } from './entities/maintenance.entity';
import { Repository } from 'typeorm';
import { GenericRepository, dtoToEntity } from 'common';
import { MaintenanceCreateDto } from './maintenance-create.dto';
import { NotificationService } from 'models/notification/notification.service';
import { Nack } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class MaintenanceService {
    constructor(
        @InjectRepository(Maintenance)
        private readonly maintenanceRepository: Repository<Maintenance>,
        private readonly notificationService: NotificationService,
    ) {}

    private readonly genericRepository = new GenericRepository(
        this.maintenanceRepository,
    );

    // Get all maintenances ordered by end_maintenance and schedule
    getAll(): Promise<Maintenance[]> {
        const maintenances = this.maintenanceRepository
            .createQueryBuilder('maintenance')
            .orderBy('maintenance.end_maintenance IS NULL', 'DESC')
            //.addOrderBy('maintenance.end_maintenance', 'ASC')
            .addOrderBy('maintenance.schedule', 'ASC')
            .getMany();
        return maintenances;
    }

    // Create maintenance and create notification
    create(data: MaintenanceCreateDto): Promise<any> {
        const maintenanceEntity: Maintenance = dtoToEntity(
            Maintenance,
            data,
        ) as Maintenance;
        if (maintenanceEntity) void this.buildNotification(maintenanceEntity);
        return this.genericRepository.create(maintenanceEntity);
    }
    // Start maintenance by id
    start(id: number): Promise<any> {
        const today = new Date();
        return this.genericRepository.update(id, {
            start_maintenance: today,
        });
    }

    // Finish maintenance by id
    finish(id: number): Promise<any> {
        const today = new Date();
        return this.genericRepository.update(id, {
            end_maintenance: today,
        });
    }

    // Return days left to next maintenance
    async daysleft(): Promise<any> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const maintenance = await this.maintenanceRepository
            .createQueryBuilder('maintenance')
            .where('maintenance.end_maintenance IS NULL')
            .orderBy('maintenance.schedule', 'ASC')
            .getOne();

        if (maintenance != null) {
            const diff = maintenance.schedule.getTime() - today.getTime();
            const daysleft = Math.max(
                0,
                Math.floor(diff / (1000 * 60 * 60 * 24)),
            );
            maintenance['daysleft'] = daysleft;
        } else {
            return 0;
        }
        return maintenance;
    }

    // create notification for technicians
    private buildNotification(maintenance: Maintenance): Promise<void | Nack> {
        return this.notificationService.create({
            category: 'Maintenance',
            date: new Date(),
            handled: false,
            schedule: maintenance.schedule,
        });
    }

    // update maintenance by id
    update(id: number, data: MaintenanceCreateDto): Promise<any> {
        const maintenanceEntity: Maintenance = dtoToEntity(
            Maintenance,
            data,
        ) as Maintenance;
        return this.genericRepository.update(id, maintenanceEntity);
    }
}
