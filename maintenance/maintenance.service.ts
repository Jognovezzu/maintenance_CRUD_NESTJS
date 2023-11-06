/* eslint-disable @typescript-eslint/no-misused-promises */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Maintenance } from './entities/maintenance.entity';
import { Repository } from 'typeorm';
import { ApiMessages, GenericRepository, dtoToEntity } from 'common';
import {
    MaintenanceCreateDto,
    MaintenanceUpdateDto,
} from './maintenance-create.dto';
import { NotificationService } from 'models/notification/notification.service';
import { Language } from 'common/util/types/language.type';
import { MaintenanceRes } from './maintenance.dto';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class MaintenanceService {
    constructor(
        @InjectRepository(Maintenance)
        private readonly maintenanceRepository: Repository<Maintenance>,
        private readonly notificationService: NotificationService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {}

    private readonly genericRepository = new GenericRepository(
        this.maintenanceRepository,
    );

    // Get all maintenances ordered by end_maintenance and schedule
    async getAll(language: Language): Promise<MaintenanceRes[]> {
        const maintenances = await this.maintenanceRepository
            .createQueryBuilder('maintenance')
            .orderBy('maintenance.end_maintenance IS NULL', 'DESC')
            //.addOrderBy('maintenance.end_maintenance', 'ASC')
            .addOrderBy('maintenance.schedule', 'ASC')
            .getMany();

        const res = maintenances.map((maintenance) =>
            this.entityToDto(maintenance, language),
        );

        return res;
    }

    // Create maintenance and create notifications
    async create(data: MaintenanceCreateDto): Promise<any> {
        const maintenanceEntity: Maintenance = dtoToEntity(
            Maintenance,
            data,
        ) as Maintenance;

        maintenanceEntity.created_at = new Date();
        const createdMaintenance =
            this.maintenanceRepository.create(maintenanceEntity);
        const savedMaintenance = await this.maintenanceRepository.save(
            createdMaintenance,
        );

        void this.buildNotification(savedMaintenance);
        void this.createCronExpression(
            savedMaintenance,
            maintenanceEntity.created_at,
        );
        return ApiMessages.CREATE_SUCCESS;
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
    async daysleft(language: Language): Promise<MaintenanceRes | 0> {
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
            const res = this.entityToDto(maintenance, language);
            res['daysleft'] = daysleft;
            return res;
        } else {
            return 0;
        }
    }

    // create notification for technicians
    async buildNotification(maintenance: Maintenance): Promise<void> {
        await this.notificationService.create({
            category: 'Maintenance',
            date: new Date(),
            handled: false,
            maintenance,
        });
    }

    // update maintenance by id
    async update(id: number, data: MaintenanceUpdateDto): Promise<any> {
        const maintenanceEntity: Maintenance = dtoToEntity(
            Maintenance,
            data,
        ) as Maintenance;

        this.removeCronExpression(id);

        await this.maintenanceRepository.update(id, maintenanceEntity);
        const updatedMaintenance = (await this.genericRepository.getById(
            id,
        )) as Maintenance;
        void this.createCronExpression(
            updatedMaintenance,
            updatedMaintenance.created_at,
        );
        return ApiMessages.UPDATE_SUCCESS;
    }

    private entityToDto(
        maintenance: Maintenance,
        language: Language,
    ): MaintenanceRes {
        const maintenanceDto: MaintenanceRes = {
            id: maintenance.id,
            schedule: maintenance.schedule.toLocaleDateString(language.name),
            start_maintenance:
                maintenance.start_maintenance?.toLocaleDateString(
                    language.name,
                ) || '',
            end_maintenance:
                maintenance.end_maintenance?.toLocaleDateString(
                    language.name,
                ) || '',
            delay: maintenance.delay,
            plant: maintenance.plant,
        };

        return maintenanceDto;
    }

    // Function to create cron expression for notifications of maintenance in 15, 10, 5 and 0 days
    getCronExpression(
        maintenance: Maintenance,
        created_at: Date,
        daysleft: number,
    ): void {
        const cronDate = new Date(maintenance.schedule);
        cronDate.setDate(cronDate.getDate() - daysleft);
        if (cronDate.getTime() > created_at.getTime()) {
            cronDate.setMinutes(created_at.getMinutes());
            cronDate.setSeconds(created_at.getSeconds());

            const job = new CronJob(cronDate, async () => {
                await this.notificationService.create({
                    category: 'Maintenance',
                    date: new Date(),
                    handled: false,
                    maintenance,
                    daysleft: daysleft,
                });
            });

            this.schedulerRegistry.addCronJob(
                `maintenance ${maintenance.id} on ${daysleft} days`,
                job,
            );
            job.start();
        }
    }

    // Function to create cron expression for notifications of maintenance in 15, 10, 5 and 0 days if maintenance is created before today
    createCronExpression(maintenance: Maintenance, created_at: Date): void {
        this.getCronExpression(maintenance, created_at, 15);
        this.getCronExpression(maintenance, created_at, 10);
        this.getCronExpression(maintenance, created_at, 5);
        this.getCronExpression(maintenance, created_at, 0);
    }

    // Function to remove cron expression for notifications of maintenance in 15, 10, 5 and 0 days if possible

    removeCronExpression(id: number): void {
        try {
            this.schedulerRegistry.deleteCronJob(
                `maintenance ${id} on 15 days`,
            );
        } catch (error) {
            /* empty */
        }

        try {
            this.schedulerRegistry.deleteCronJob(
                `maintenance ${id} on 10 days`,
            );
        } catch (error) {
            /* empty */
        }

        try {
            this.schedulerRegistry.deleteCronJob(`maintenance ${id} on 5 days`);
        } catch (error) {
            /* empty */
        }

        try {
            this.schedulerRegistry.deleteCronJob(`maintenance ${id} on 0 days`);
        } catch (error) {
            /* empty */
        }
    }
}
