import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Notification } from 'src/entities/notification.entity';
import { NotificationUser } from 'src/entities/notification-user.entity';
import { User } from 'src/entities/user.entity';
import { Appointment } from 'src/entities/appointment.entity';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Notification,
      NotificationUser,
      User,
      Appointment,
    ]),
  ],
  providers: [NotificationsService, EmailService],
  exports: [NotificationsService, EmailService],
})
export class NotificationsModule {}
