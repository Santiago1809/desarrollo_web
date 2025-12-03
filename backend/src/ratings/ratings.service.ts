import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentRating } from 'src/entities/appointment-rating.entity';
import { Appointment } from 'src/entities/appointment.entity';
import { User } from 'src/entities/user.entity';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(AppointmentRating)
    private readonly ratingRepository: Repository<AppointmentRating>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a rating for an appointment
   */
  async createRating(
    userId: string,
    dto: CreateRatingDto,
  ): Promise<AppointmentRating> {
    // Find the appointment with participants
    const appointment = await this.appointmentRepository.findOne({
      where: { id: dto.appointmentId },
      relations: ['participants', 'participants.user', 'ratings'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Check if the user is the client of this appointment
    const clientParticipant = appointment.participants.find(
      (p) => p.role === 'client' && p.user.id === userId,
    );

    if (!clientParticipant) {
      throw new BadRequestException('Only the client can rate an appointment');
    }

    // Check if appointment is completed
    if (appointment.state !== 'completed') {
      throw new BadRequestException('Can only rate completed appointments');
    }

    // Check if already rated by this user
    const existingRating = appointment.ratings?.find(
      (r) => r.client?.id === userId,
    );

    if (existingRating) {
      throw new BadRequestException('You have already rated this appointment');
    }

    // Get client entity
    const client = await this.userRepository.findOne({ where: { id: userId } });
    if (!client) {
      throw new NotFoundException('User not found');
    }

    // Create rating
    const rating = this.ratingRepository.create({
      appointment,
      client,
      rating: dto.rating,
      comment: dto.comment,
    });

    return this.ratingRepository.save(rating);
  }

  /**
   * Get ratings for a specific barber
   */
  async getBarberRatings(barberId: string): Promise<{
    ratings: AppointmentRating[];
    averageRating: number;
    totalRatings: number;
  }> {
    const ratings = await this.ratingRepository
      .createQueryBuilder('rating')
      .innerJoin('rating.appointment', 'appointment')
      .innerJoin('appointment.participants', 'participant')
      .innerJoin('participant.user', 'barber')
      .leftJoinAndSelect('rating.client', 'client')
      .leftJoinAndSelect('rating.appointment', 'apt')
      .leftJoinAndSelect('apt.services', 'services')
      .leftJoinAndSelect('services.service', 'service')
      .where('participant.role = :role', { role: 'barber' })
      .andWhere('barber.id = :barberId', { barberId })
      .orderBy('rating.createdAt', 'DESC')
      .getMany();

    const totalRatings = ratings.length;
    const averageRating =
      totalRatings > 0
        ? ratings.reduce((sum, r) => sum + Number(r.rating), 0) / totalRatings
        : 0;

    return {
      ratings,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
    };
  }

  /**
   * Get all ratings for appointments of a client
   */
  async getClientRatings(clientId: string): Promise<AppointmentRating[]> {
    return this.ratingRepository.find({
      where: { client: { id: clientId } },
      relations: [
        'appointment',
        'appointment.services',
        'appointment.services.service',
        'appointment.participants',
        'appointment.participants.user',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get rating by appointment ID
   */
  async getRatingByAppointment(
    appointmentId: string,
  ): Promise<AppointmentRating | null> {
    return this.ratingRepository.findOne({
      where: { appointment: { id: appointmentId } },
      relations: ['client', 'appointment'],
    });
  }

  /**
   * Update an existing rating
   */
  async updateRating(
    userId: string,
    ratingId: string,
    dto: Partial<CreateRatingDto>,
  ): Promise<AppointmentRating> {
    const rating = await this.ratingRepository.findOne({
      where: { id: ratingId },
      relations: ['client'],
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (rating.client.id !== userId) {
      throw new BadRequestException('You can only update your own ratings');
    }

    if (dto.rating !== undefined) {
      rating.rating = dto.rating;
    }
    if (dto.comment !== undefined) {
      rating.comment = dto.comment;
    }

    return this.ratingRepository.save(rating);
  }

  /**
   * Delete a rating
   */
  async deleteRating(userId: string, ratingId: string): Promise<void> {
    const rating = await this.ratingRepository.findOne({
      where: { id: ratingId },
      relations: ['client'],
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (rating.client.id !== userId) {
      throw new BadRequestException('You can only delete your own ratings');
    }

    await this.ratingRepository.remove(rating);
  }

  /**
   * Check if a user can rate an appointment
   */
  async canUserRateAppointment(
    userId: string,
    appointmentId: string,
  ): Promise<{ canRate: boolean; reason?: string }> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: [
        'participants',
        'participants.user',
        'ratings',
        'ratings.client',
      ],
    });

    if (!appointment) {
      return { canRate: false, reason: 'Appointment not found' };
    }

    // Check if user is the client
    const isClient = appointment.participants.some(
      (p) => p.role === 'client' && p.user.id === userId,
    );

    if (!isClient) {
      return { canRate: false, reason: 'Only the client can rate' };
    }

    // Check if appointment is completed
    if (appointment.state !== 'completed') {
      return { canRate: false, reason: 'Appointment is not completed' };
    }

    // Check if already rated
    const alreadyRated = appointment.ratings?.some(
      (r) => r.client?.id === userId,
    );

    if (alreadyRated) {
      return { canRate: false, reason: 'Already rated' };
    }

    return { canRate: true };
  }
}
