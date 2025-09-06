import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
	imports: [ConfigModule],
	useFactory: async (configService: ConfigService) => ({
		type: 'postgres',
		host: configService.get<string>('database.host'),
		port: configService.get<number>('database.port'),
		username: configService.get<string>('database.username'),
		password: configService.get<string>('database.password'),
		database: configService.get<string>('database.name'),
		autoLoadEntities: true,
		synchronize: false,
		migrationsRun: true,
		migrations: ['dist/migrations/*.js'],
		logging: ['error', 'warn'],
	}),
	inject: [ConfigService],
};


