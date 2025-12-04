import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('barbers')
  @ApiOperation({ summary: 'Get all barbers' })
  @ApiResponse({
    status: 200,
    description: 'List of all barbers',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'John Barber' },
          email: { type: 'string', example: 'john.barber@example.com' },
          dni: { type: 'string', example: '12345678' },
          role: { type: 'number', example: 2 },
        },
      },
    },
  })
  findBarbers() {
    return this.usersService.findBarbers();
  }
}
