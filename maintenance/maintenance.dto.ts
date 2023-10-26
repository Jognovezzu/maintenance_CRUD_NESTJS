import { IsDate, IsNumber } from 'class-validator';

export class MaintenanceDto {
    @IsDate()
    schedule: Date;

    @IsNumber()
    plant: number;
}

export class MaintenanceRes {
    id: number;
    schedule: Date;
    start: Date;
    delay: number;
    finish: Date;
    plant: number;
}
