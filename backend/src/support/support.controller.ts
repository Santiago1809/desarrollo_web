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
import { AuthGuard } from 'src/shared/guards/auth/auth.guard';
import { CustomRequest } from 'src/shared/interfaces';
import { SupportService } from './support.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';

@Controller('support')
@UseGuards(AuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  createTicket(
    @Req() request: CustomRequest,
    @Body() dto: CreateSupportTicketDto,
  ) {
    const userId = request.user?.id;
    return this.supportService.createTicket(userId!, dto);
  }

  @Get('my-tickets')
  getMyTickets(@Req() request: CustomRequest) {
    const userId = request.user?.id;
    return this.supportService.getUserTickets(userId!);
  }

  @Get('all')
  getAllTickets(
    @Req() request: CustomRequest,
    @Query('state') state?: 'open' | 'in_progress' | 'closed',
  ) {
    const userId = request.user?.id;
    return this.supportService.getAllTickets(userId!, state);
  }

  @Get('stats')
  getTicketStats(@Req() request: CustomRequest) {
    const userId = request.user?.id;
    return this.supportService.getTicketStats(userId!);
  }

  @Get(':ticketId')
  getTicketById(
    @Req() request: CustomRequest,
    @Param('ticketId') ticketId: string,
  ) {
    const userId = request.user?.id;
    return this.supportService.getTicketById(userId!, ticketId);
  }

  @Patch(':ticketId')
  updateTicket(
    @Req() request: CustomRequest,
    @Param('ticketId') ticketId: string,
    @Body() dto: UpdateSupportTicketDto,
  ) {
    const userId = request.user?.id;
    return this.supportService.updateTicket(userId!, ticketId, dto);
  }

  @Patch(':ticketId/close')
  closeTicket(
    @Req() request: CustomRequest,
    @Param('ticketId') ticketId: string,
  ) {
    const userId = request.user?.id;
    return this.supportService.closeTicket(userId!, ticketId);
  }

  @Delete(':ticketId')
  deleteTicket(
    @Req() request: CustomRequest,
    @Param('ticketId') ticketId: string,
  ) {
    const userId = request.user?.id;
    return this.supportService.deleteTicket(userId!, ticketId);
  }
}
