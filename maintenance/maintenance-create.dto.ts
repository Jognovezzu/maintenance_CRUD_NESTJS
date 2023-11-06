import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class MaintenanceCreateDto {
    @IsDateString()
    schedule: Date;

    @IsNumber()
    plant: number;
}

export class MaintenanceUpdateDto {
    @IsDateString()
    schedule: Date;

    @IsNumber()
    @IsOptional()
    plant: number;
}
