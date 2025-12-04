import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ServicesService } from './services.service';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available barbershop services' })
  @ApiResponse({
    status: 200,
    description: 'List of all services',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Haircut' },
          duration: { type: 'number', example: 30 },
          price: { type: 'number', example: 25 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  findAll() {
    return this.servicesService.findAll();
  }
}
