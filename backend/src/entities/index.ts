// Exportar entidades en orden correcto para evitar referencias circulares
// Primero las entidades base (sin dependencias de otras entidades del proyecto)
export { Role } from './role.entity';
export { Service } from './service.entity';

// Luego las entidades que dependen de las anteriores
export { User } from './user.entity';
export { Appointment } from './appointment.entity';

// Entidades que dependen de User y/o Appointment
export { Support } from './support.entity';
export { Subscription } from './subscription.entity';
export { Inventory } from './inventory.entity';
export { BarberSchedule } from './barber-schedule.entity';
export { BarberDateSchedule } from './barber-date-schedule.entity';
export { BarberBreak } from './barber-break.entity';
export { Notification } from './notification.entity';
export { NotificationUser } from './notification-user.entity';

// Entidades de relación
export { AppointmentService } from './appointment-service.entity';
export { AppointmentParticipant } from './appointment-participant.entity';
export { AppointmentRating } from './appointment-rating.entity';
