/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiRoutesSwagger, ControllerAndSwagger, message } from 'common';
import { MaintenanceService } from './maintenance.service';
import { Get, Param, Post, Body, Patch } from '@nestjs/common';
import { MaintenanceCreateDto } from './maintenance-create.dto';
import { SwaggerMaintenanceRoute } from 'common/constant/swagger/route/swagger.maintenance.routes.constants';

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
    async getAll(): Promise<any> {
        return await this.maintenanceService.getAll();
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
     * This method is responsible for getting days left to next maintenance
     *
     */
    async daysleft(): Promise<number> {
        return await this.maintenanceService.daysleft();
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
        @Body() data: MaintenanceCreateDto,
    ): Promise<message> {
        return await this.maintenanceService.update(id, data);
    }
}
