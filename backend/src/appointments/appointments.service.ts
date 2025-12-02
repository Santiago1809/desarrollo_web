import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from 'src/entities/appointment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  /**
   *
   * @param userId The ID of the user whose appointments are to be retrieved
   * @returns A promise that resolves to an array of appointments
   */
  getAppointments({ userId }: Readonly<{ userId: string }>) {
    const appointments = this.appointmentRepository.find({
      where: { participants: { id: userId } },
      relations: ['participants', 'services', 'ratings'],
    });
    return appointments;
  }
}
