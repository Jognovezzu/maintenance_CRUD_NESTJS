import { IsDate, IsNumber } from 'class-validator';

export class MaintenanceDto {
    @IsDate()
    schedule: Date;

    @IsNumber()
    plant: number;
}

export class MaintenanceRes {
    id: number;
    schedule: string;
    start_maintenance: string;
    end_maintenance: string;
    delay: number;
    plant: number;
    daysleft?: number;
}
