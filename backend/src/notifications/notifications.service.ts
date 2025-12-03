import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationUser } from '../entities/notification-user.entity';
import { User } from '../entities/user.entity';
import { Appointment } from '../entities/appointment.entity';
import { EmailService } from './email.service';

export type NotificationType =
  | 'appointment_created'
  | 'appointment_rescheduled'
  | 'appointment_cancelled';

export interface AppointmentNotificationData {
  appointment: Appointment;
  clientEmail: string;
  clientName: string;
  barberEmail: string;
  barberName: string;
  services: string[];
  date: string;
  time: string;
  previousDate?: string;
  previousTime?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationUser)
    private readonly notificationUserRepository: Repository<NotificationUser>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  async notifyAppointmentCreated(
    data: AppointmentNotificationData,
  ): Promise<void> {
    await this.createNotification(
      'appointment_created',
      `Nueva cita programada para ${data.date} a las ${data.time}`,
      data.appointment,
    );

    // Email to client
    await this.emailService.sendEmail({
      to: data.clientEmail,
      subject: '✅ Tu cita ha sido confirmada - Edge Timer',
      html: this.getClientCreatedEmailTemplate(data),
    });

    // Email to barber
    await this.emailService.sendEmail({
      to: data.barberEmail,
      subject: '📅 Nueva cita programada - Edge Timer',
      html: this.getBarberCreatedEmailTemplate(data),
    });

    this.logger.log(
      `Appointment created notifications sent for appointment ${data.appointment.id}`,
    );
  }

  async notifyAppointmentRescheduled(
    data: AppointmentNotificationData,
  ): Promise<void> {
    await this.createNotification(
      'appointment_rescheduled',
      `Cita reprogramada de ${data.previousDate} ${data.previousTime} a ${data.date} ${data.time}`,
      data.appointment,
    );

    // Email to client
    await this.emailService.sendEmail({
      to: data.clientEmail,
      subject: '🔄 Tu cita ha sido reprogramada - Edge Timer',
      html: this.getClientRescheduledEmailTemplate(data),
    });

    // Email to barber
    await this.emailService.sendEmail({
      to: data.barberEmail,
      subject: '🔄 Cita reprogramada - Edge Timer',
      html: this.getBarberRescheduledEmailTemplate(data),
    });

    this.logger.log(
      `Appointment rescheduled notifications sent for appointment ${data.appointment.id}`,
    );
  }

  async notifyAppointmentCancelled(
    data: AppointmentNotificationData,
  ): Promise<void> {
    await this.createNotification(
      'appointment_cancelled',
      `Cita cancelada que estaba programada para ${data.date} a las ${data.time}`,
      data.appointment,
    );

    // Email to client
    await this.emailService.sendEmail({
      to: data.clientEmail,
      subject: '❌ Tu cita ha sido cancelada - Edge Timer',
      html: this.getClientCancelledEmailTemplate(data),
    });

    // Email to barber
    await this.emailService.sendEmail({
      to: data.barberEmail,
      subject: '❌ Cita cancelada - Edge Timer',
      html: this.getBarberCancelledEmailTemplate(data),
    });

    this.logger.log(
      `Appointment cancelled notifications sent for appointment ${data.appointment.id}`,
    );
  }

  private async createNotification(
    type: NotificationType,
    message: string,
    appointment: Appointment,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      type,
      message,
      appointment,
      sentDate: new Date(),
    });

    return this.notificationRepository.save(notification);
  }

  // Email Templates
  private getBaseEmailStyles(): string {
    return `
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .appointment-card { background-color: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 4px solid #d4af37; }
        .appointment-card h3 { margin: 0 0 15px; color: #1a1a2e; }
        .detail-row { display: flex; margin: 10px 0; }
        .detail-label { font-weight: 600; color: #666; width: 100px; }
        .detail-value { color: #333; }
        .services-list { list-style: none; padding: 0; margin: 0; }
        .services-list li { padding: 5px 0; color: #333; }
        .services-list li::before { content: "✂️ "; }
        .footer { background-color: #1a1a2e; color: white; padding: 20px; text-align: center; font-size: 14px; }
        .footer a { color: #d4af37; text-decoration: none; }
        .badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .badge-success { background-color: #d4edda; color: #155724; }
        .badge-warning { background-color: #fff3cd; color: #856404; }
        .badge-danger { background-color: #f8d7da; color: #721c24; }
        .old-value { text-decoration: line-through; color: #999; margin-right: 10px; }
        .new-value { color: #28a745; font-weight: 600; }
      </style>
    `;
  }

  private getClientCreatedEmailTemplate(
    data: AppointmentNotificationData,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>${this.getBaseEmailStyles()}</head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✂️ Edge Timer</h1>
            <p>Tu barbería de confianza</p>
          </div>
          <div class="content">
            <h2>¡Hola ${data.clientName}!</h2>
            <p>Tu cita ha sido confirmada exitosamente. Te esperamos.</p>
            
            <div class="appointment-card">
              <h3>📋 Detalles de tu cita</h3>
              <div class="detail-row">
                <span class="detail-label">📅 Fecha:</span>
                <span class="detail-value">${data.date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🕐 Hora:</span>
                <span class="detail-value">${data.time}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">💈 Barbero:</span>
                <span class="detail-value">${data.barberName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">✂️ Servicios:</span>
                <span class="detail-value">
                  <ul class="services-list">
                    ${data.services.map((s) => `<li>${s}</li>`).join('')}
                  </ul>
                </span>
              </div>
            </div>
            
            <p><strong>Recuerda:</strong> Si necesitas cancelar o reprogramar tu cita, hazlo con al menos 24 horas de anticipación.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Edge Timer Barbershop</p>
            <p>Este es un correo automático, por favor no respondas.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getBarberCreatedEmailTemplate(
    data: AppointmentNotificationData,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>${this.getBaseEmailStyles()}</head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✂️ Edge Timer</h1>
            <p>Panel del Barbero</p>
          </div>
          <div class="content">
            <h2>¡Hola ${data.barberName}!</h2>
            <p>Tienes una nueva cita programada.</p>
            
            <div class="appointment-card">
              <h3>📋 Detalles de la cita</h3>
              <span class="badge badge-success">Nueva Cita</span>
              <div class="detail-row">
                <span class="detail-label">📅 Fecha:</span>
                <span class="detail-value">${data.date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🕐 Hora:</span>
                <span class="detail-value">${data.time}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">👤 Cliente:</span>
                <span class="detail-value">${data.clientName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">✂️ Servicios:</span>
                <span class="detail-value">
                  <ul class="services-list">
                    ${data.services.map((s) => `<li>${s}</li>`).join('')}
                  </ul>
                </span>
              </div>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Edge Timer Barbershop</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getClientRescheduledEmailTemplate(
    data: AppointmentNotificationData,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>${this.getBaseEmailStyles()}</head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✂️ Edge Timer</h1>
            <p>Tu barbería de confianza</p>
          </div>
          <div class="content">
            <h2>¡Hola ${data.clientName}!</h2>
            <p>Tu cita ha sido reprogramada. Aquí están los nuevos detalles:</p>
            
            <div class="appointment-card">
              <h3>📋 Nueva fecha y hora</h3>
              <span class="badge badge-warning">Reprogramada</span>
              <div class="detail-row">
                <span class="detail-label">📅 Fecha:</span>
                <span class="detail-value">
                  <span class="old-value">${data.previousDate}</span>
                  <span class="new-value">→ ${data.date}</span>
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🕐 Hora:</span>
                <span class="detail-value">
                  <span class="old-value">${data.previousTime}</span>
                  <span class="new-value">→ ${data.time}</span>
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">💈 Barbero:</span>
                <span class="detail-value">${data.barberName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">✂️ Servicios:</span>
                <span class="detail-value">
                  <ul class="services-list">
                    ${data.services.map((s) => `<li>${s}</li>`).join('')}
                  </ul>
                </span>
              </div>
            </div>
            
            <p><strong>Importante:</strong> Asegúrate de anotar la nueva fecha y hora.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Edge Timer Barbershop</p>
            <p>Este es un correo automático, por favor no respondas.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getBarberRescheduledEmailTemplate(
    data: AppointmentNotificationData,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>${this.getBaseEmailStyles()}</head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✂️ Edge Timer</h1>
            <p>Panel del Barbero</p>
          </div>
          <div class="content">
            <h2>¡Hola ${data.barberName}!</h2>
            <p>Una cita ha sido reprogramada.</p>
            
            <div class="appointment-card">
              <h3>📋 Cita Reprogramada</h3>
              <span class="badge badge-warning">Reprogramada</span>
              <div class="detail-row">
                <span class="detail-label">📅 Fecha:</span>
                <span class="detail-value">
                  <span class="old-value">${data.previousDate}</span>
                  <span class="new-value">→ ${data.date}</span>
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🕐 Hora:</span>
                <span class="detail-value">
                  <span class="old-value">${data.previousTime}</span>
                  <span class="new-value">→ ${data.time}</span>
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">👤 Cliente:</span>
                <span class="detail-value">${data.clientName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">✂️ Servicios:</span>
                <span class="detail-value">
                  <ul class="services-list">
                    ${data.services.map((s) => `<li>${s}</li>`).join('')}
                  </ul>
                </span>
              </div>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Edge Timer Barbershop</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getClientCancelledEmailTemplate(
    data: AppointmentNotificationData,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>${this.getBaseEmailStyles()}</head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✂️ Edge Timer</h1>
            <p>Tu barbería de confianza</p>
          </div>
          <div class="content">
            <h2>¡Hola ${data.clientName}!</h2>
            <p>Tu cita ha sido cancelada.</p>
            
            <div class="appointment-card">
              <h3>📋 Cita Cancelada</h3>
              <span class="badge badge-danger">Cancelada</span>
              <div class="detail-row">
                <span class="detail-label">📅 Fecha:</span>
                <span class="detail-value">${data.date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🕐 Hora:</span>
                <span class="detail-value">${data.time}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">💈 Barbero:</span>
                <span class="detail-value">${data.barberName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">✂️ Servicios:</span>
                <span class="detail-value">
                  <ul class="services-list">
                    ${data.services.map((s) => `<li>${s}</li>`).join('')}
                  </ul>
                </span>
              </div>
            </div>
            
            <p>Si deseas agendar una nueva cita, visita nuestra plataforma.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Edge Timer Barbershop</p>
            <p>Este es un correo automático, por favor no respondas.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getBarberCancelledEmailTemplate(
    data: AppointmentNotificationData,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>${this.getBaseEmailStyles()}</head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✂️ Edge Timer</h1>
            <p>Panel del Barbero</p>
          </div>
          <div class="content">
            <h2>¡Hola ${data.barberName}!</h2>
            <p>Una cita ha sido cancelada.</p>
            
            <div class="appointment-card">
              <h3>📋 Cita Cancelada</h3>
              <span class="badge badge-danger">Cancelada</span>
              <div class="detail-row">
                <span class="detail-label">📅 Fecha:</span>
                <span class="detail-value">${data.date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🕐 Hora:</span>
                <span class="detail-value">${data.time}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">👤 Cliente:</span>
                <span class="detail-value">${data.clientName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">✂️ Servicios:</span>
                <span class="detail-value">
                  <ul class="services-list">
                    ${data.services.map((s) => `<li>${s}</li>`).join('')}
                  </ul>
                </span>
              </div>
            </div>
            
            <p>Este horario ahora está disponible para nuevas citas.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Edge Timer Barbershop</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
