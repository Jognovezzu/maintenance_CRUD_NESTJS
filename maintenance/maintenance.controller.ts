/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiRoutesSwagger, ControllerAndSwagger, message } from 'common';
import { MaintenanceService } from './maintenance.service';
import { Get, Param, Post, Body, Patch, Headers } from '@nestjs/common';
import {
    MaintenanceCreateDto,
    MaintenanceUpdateDto,
} from './maintenance-create.dto';
import { SwaggerMaintenanceRoute } from 'common/constant/swagger/route/swagger.maintenance.routes.constants';
import { Language } from 'common/util/types/language.type';
import { MaintenanceRes } from './maintenance.dto';

@ApiBearerAuth()
@ControllerAndSwagger('maintenance')
export class MaintenanceController {
    constructor(private readonly maintenanceService: MaintenanceService) {}

    @Get()
    @ApiRoutesSwagger(SwaggerMaintenanceRoute.getAll)

    /*
     * @returns Maintenance[]
     * @description
     * This method is responsible for getting all maintenances ordered by end_maintenance and schedule
     *
     */
    async getAll(
        @Headers('Accept-Language') language: string,
    ): Promise<MaintenanceRes[]> {
        return await this.maintenanceService.getAll(new Language(language));
    }

    @Post()
    @ApiRoutesSwagger(SwaggerMaintenanceRoute.create)

    /*
     * @param schedule and plant
     * @returns message
     * @description
     * This method is responsible for creating a maintenance
     *
     * Body:
     *     schedule: Date (example: '2021-05-29')
     *     plant: number
     *
     */
    create(@Body() data: MaintenanceCreateDto): Promise<message> {
        return this.maintenanceService.create(data);
    }

    @Get('daysleft')
    @ApiRoutesSwagger(SwaggerMaintenanceRoute.getDaysLeft)

    /*
     * @returns number
     * @description
     * This method is responsible for getting data of next maintenance
     *
     */
    async daysleft(
        @Headers('Accept-Language') language: string,
    ): Promise<MaintenanceRes | 0> {
        return await this.maintenanceService.daysleft(new Language(language));
    }

    @Post(':id/start')
    @ApiRoutesSwagger(SwaggerMaintenanceRoute.start)

    /*
     * @param id
     * @returns message
     * @description
     * This method is responsible for starting a maintenance by id
     *
     * Body:
     *   id: number
     */
    async start(@Param('id') id: number): Promise<any> {
        return await this.maintenanceService.start(id);
    }

    @Post(':id/finish')
    @ApiRoutesSwagger(SwaggerMaintenanceRoute.finish)

    /*
     * @param id
     * @returns message
     * @description
     * This method is responsible for finishing a maintenance by id
     *
     * Body:
     *    id: number
     *
     */
    async finish(@Param('id') id: number): Promise<any> {
        return await this.maintenanceService.finish(id);
    }

    @Patch(':id')
    @ApiRoutesSwagger(SwaggerMaintenanceRoute.update)

    /*
     * @param id and schedule
     * @returns message
     * @description
     * This method is responsible for updating a maintenance by id
     *
     * Body:
     *    id: number
     *    schedule: Date (example: '2021-05-29')
     *
     */
    async update(
        @Param('id') id: number,
        @Body() data: MaintenanceUpdateDto,
    ): Promise<message> {
        return await this.maintenanceService.update(id, data);
    }
}
