import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/shared/guards/auth/auth.guard';
import { CustomRequest } from 'src/shared/interfaces';
import { SupportService } from './support.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';

@ApiTags('Support')
@ApiBearerAuth('JWT-auth')
@Controller('support')
@UseGuards(AuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new support ticket' })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        subject: { type: 'string' },
        description: { type: 'string' },
        state: { type: 'string', enum: ['open', 'in_progress', 'closed'] },
        reportDate: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createTicket(
    @Req() request: CustomRequest,
    @Body() dto: CreateSupportTicketDto,
  ) {
    const userId = request.user?.id;
    return this.supportService.createTicket(userId!, dto);
  }

  @Get('my-tickets')
  @ApiOperation({ summary: 'Get all tickets created by the logged-in user' })
  @ApiResponse({
    status: 200,
    description: 'List of user tickets',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          subject: { type: 'string' },
          description: { type: 'string' },
          state: { type: 'string', enum: ['open', 'in_progress', 'closed'] },
          reportDate: { type: 'string', format: 'date-time' },
          adminResponse: { type: 'string', nullable: true },
          resolvedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
    },
  })
  getMyTickets(@Req() request: CustomRequest) {
    const userId = request.user?.id;
    return this.supportService.getUserTickets(userId!);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all tickets (admin only)' })
  @ApiQuery({
    name: 'state',
    description: 'Filter tickets by state',
    enum: ['open', 'in_progress', 'closed'],
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all tickets',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          subject: { type: 'string' },
          description: { type: 'string' },
          state: { type: 'string', enum: ['open', 'in_progress', 'closed'] },
          reportDate: { type: 'string', format: 'date-time' },
          adminResponse: { type: 'string', nullable: true },
          resolvedAt: { type: 'string', format: 'date-time', nullable: true },
          usuario: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  getAllTickets(
    @Req() request: CustomRequest,
    @Query('state') state?: 'open' | 'in_progress' | 'closed',
  ) {
    const userId = request.user?.id;
    return this.supportService.getAllTickets(userId!, state);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get ticket statistics (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Ticket statistics',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        open: { type: 'number' },
        inProgress: { type: 'number' },
        closed: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  getTicketStats(@Req() request: CustomRequest) {
    const userId = request.user?.id;
    return this.supportService.getTicketStats(userId!);
  }

  @Get(':ticketId')
  @ApiOperation({ summary: 'Get a specific ticket by ID' })
  @ApiParam({
    name: 'ticketId',
    description: 'UUID of the ticket',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        subject: { type: 'string' },
        description: { type: 'string' },
        state: { type: 'string', enum: ['open', 'in_progress', 'closed'] },
        reportDate: { type: 'string', format: 'date-time' },
        adminResponse: { type: 'string', nullable: true },
        resolvedAt: { type: 'string', format: 'date-time', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  getTicketById(
    @Req() request: CustomRequest,
    @Param('ticketId') ticketId: string,
  ) {
    const userId = request.user?.id;
    return this.supportService.getTicketById(userId!, ticketId);
  }

  @Patch(':ticketId')
  @ApiOperation({ summary: 'Update a ticket (admin only)' })
  @ApiParam({
    name: 'ticketId',
    description: 'UUID of the ticket to update',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        subject: { type: 'string' },
        description: { type: 'string' },
        state: { type: 'string', enum: ['open', 'in_progress', 'closed'] },
        adminResponse: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  updateTicket(
    @Req() request: CustomRequest,
    @Param('ticketId') ticketId: string,
    @Body() dto: UpdateSupportTicketDto,
  ) {
    const userId = request.user?.id;
    return this.supportService.updateTicket(userId!, ticketId, dto);
  }

  @Patch(':ticketId/close')
  @ApiOperation({ summary: 'Close a ticket' })
  @ApiParam({
    name: 'ticketId',
    description: 'UUID of the ticket to close',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket closed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Ticket closed successfully' },
        id: { type: 'string', format: 'uuid' },
        state: { type: 'string', example: 'closed' },
        resolvedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  closeTicket(
    @Req() request: CustomRequest,
    @Param('ticketId') ticketId: string,
  ) {
    const userId = request.user?.id;
    return this.supportService.closeTicket(userId!, ticketId);
  }

  @Delete(':ticketId')
  @ApiOperation({ summary: 'Delete a ticket' })
  @ApiParam({
    name: 'ticketId',
    description: 'UUID of the ticket to delete',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Ticket deleted successfully' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({
    status: 403,
    description: 'Not allowed to delete this ticket',
  })
  deleteTicket(
    @Req() request: CustomRequest,
    @Param('ticketId') ticketId: string,
  ) {
    const userId = request.user?.id;
    return this.supportService.deleteTicket(userId!, ticketId);
  }
}
