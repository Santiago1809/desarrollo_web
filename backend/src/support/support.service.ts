import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Support } from 'src/entities/support.entity';
import { User } from 'src/entities/user.entity';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(Support)
    private readonly supportRepository: Repository<Support>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new support ticket
   */
  async createTicket(
    userId: string,
    dto: CreateSupportTicketDto,
  ): Promise<Support> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const ticket = this.supportRepository.create({
      description: dto.description,
      subject: dto.subject || 'Soporte General',
      usuario: user,
      state: 'open',
    });

    return this.supportRepository.save(ticket);
  }

  /**
   * Get all tickets for a specific user
   */
  async getUserTickets(userId: string): Promise<Support[]> {
    return this.supportRepository.find({
      where: { usuario: { id: userId } },
      order: { reportDate: 'DESC' },
    });
  }

  /**
   * Get all tickets (admin only)
   */
  async getAllTickets(
    userId: string,
    state?: 'open' | 'in_progress' | 'closed',
  ): Promise<Support[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || user.role !== 3) {
      throw new ForbiddenException('Only admins can view all tickets');
    }

    const whereCondition = state ? { state } : {};

    return this.supportRepository.find({
      where: whereCondition,
      relations: ['usuario'],
      order: { reportDate: 'DESC' },
    });
  }

  /**
   * Get a single ticket by ID
   */
  async getTicketById(userId: string, ticketId: string): Promise<Support> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const ticket = await this.supportRepository.findOne({
      where: { id: ticketId },
      relations: ['usuario'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Only the owner or admin can view the ticket
    if (ticket.usuario.id !== userId && user.role !== 3) {
      throw new ForbiddenException('You can only view your own tickets');
    }

    return ticket;
  }

  /**
   * Update a ticket (admin only for state changes)
   */
  async updateTicket(
    userId: string,
    ticketId: string,
    dto: UpdateSupportTicketDto,
  ): Promise<Support> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const ticket = await this.supportRepository.findOne({
      where: { id: ticketId },
      relations: ['usuario'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Only admins can update ticket state and add responses
    if (user.role !== 3) {
      throw new ForbiddenException('Only admins can update tickets');
    }

    if (dto.state) {
      ticket.state = dto.state;
      if (dto.state === 'closed') {
        ticket.resolvedAt = new Date();
      }
    }

    if (dto.adminResponse) {
      ticket.adminResponse = dto.adminResponse;
    }

    return this.supportRepository.save(ticket);
  }

  /**
   * Close a ticket (by user or admin)
   */
  async closeTicket(userId: string, ticketId: string): Promise<Support> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const ticket = await this.supportRepository.findOne({
      where: { id: ticketId },
      relations: ['usuario'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Only the owner or admin can close the ticket
    if (ticket.usuario.id !== userId && user.role !== 3) {
      throw new ForbiddenException('You can only close your own tickets');
    }

    if (ticket.state === 'closed') {
      throw new BadRequestException('Ticket is already closed');
    }

    ticket.state = 'closed';
    ticket.resolvedAt = new Date();

    return this.supportRepository.save(ticket);
  }

  /**
   * Delete a ticket (admin only)
   */
  async deleteTicket(userId: string, ticketId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || user.role !== 3) {
      throw new ForbiddenException('Only admins can delete tickets');
    }

    const ticket = await this.supportRepository.findOne({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    await this.supportRepository.remove(ticket);
  }

  /**
   * Get ticket statistics (admin only)
   */
  async getTicketStats(userId: string): Promise<{
    total: number;
    open: number;
    inProgress: number;
    closed: number;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || user.role !== 3) {
      throw new ForbiddenException('Only admins can view statistics');
    }

    const [total, open, inProgress, closed] = await Promise.all([
      this.supportRepository.count(),
      this.supportRepository.count({ where: { state: 'open' } }),
      this.supportRepository.count({ where: { state: 'in_progress' } }),
      this.supportRepository.count({ where: { state: 'closed' } }),
    ]);

    return { total, open, inProgress, closed };
  }
}
