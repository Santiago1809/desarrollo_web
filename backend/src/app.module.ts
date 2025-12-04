import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ServicesModule } from './services/services.module';
import { UsersModule } from './users/users.module';
import { RatingsModule } from './ratings/ratings.module';
import { SupportModule } from './support/support.module';
import { SeedersModule } from './seeders/seeders.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RefreshTokenInterceptor } from './shared/interceptors/refresh-token/refresh-token.interceptor';
import { JwtModule } from '@nestjs/jwt';
import {
  Role,
  User,
  Service,
  Appointment,
  Support,
  Subscription,
  Inventory,
  BarberSchedule,
  BarberDateSchedule,
  BarberBreak,
  Notification,
  NotificationUser,
  AppointmentService,
  AppointmentParticipant,
  AppointmentRating,
} from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number.parseInt(configService.get<string>('DB_PORT', '5432')),
        username: configService.get<string>('DB_USER', 'dev_user'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_NAME', ''),
        entities: [
          Role,
          User,
          Support,
          Subscription,
          Appointment,
          AppointmentService,
          AppointmentParticipant,
          AppointmentRating,
          BarberSchedule,
          BarberDateSchedule,
          BarberBreak,
          Inventory,
          NotificationUser,
          Notification,
          Service,
        ],
        autoLoadEntities: true,
        synchronize: configService.get<string>('DB_SYNC') === 'true',
        logging: true,
        ssl:
          configService.get<string>('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    AppointmentsModule,
    ServicesModule,
    UsersModule,
    RatingsModule,
    SupportModule,
    SeedersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RefreshTokenInterceptor,
    },
  ],
})
export class AppModule {}
