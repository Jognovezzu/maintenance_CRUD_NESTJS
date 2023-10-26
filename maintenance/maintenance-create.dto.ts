import { IsDateString, IsNumber } from 'class-validator';

export class MaintenanceCreateDto {
    @IsDateString()
    schedule: Date;

    @IsNumber()
    plant: number;
}
