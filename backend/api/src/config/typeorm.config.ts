import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    type: 'postgres',
    url: configService.get<string>('DATABASE_URL'), // Supabase connection string
    autoLoadEntities: true,
    synchronize: false,          // keep false for safety
    migrationsRun: true,
    migrations: ['dist/migrations/*.js'],
    logging: ['error', 'warn'],
    ssl: {
      rejectUnauthorized: false, // required for Supabase
    },
  }),
};
