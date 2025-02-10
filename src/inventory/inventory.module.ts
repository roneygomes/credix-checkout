import { Module } from '@nestjs/common';

// TypeOrmModule.forRootAsync({
//   imports: [ConfigModule],
//   useFactory: (configService: ConfigService) => ({
//     type: 'mysql',
//     host: configService.get('HOST'),
//     port: +configService.get('PORT'),
//     username: configService.get('USERNAME'),
//     password: configService.get('PASSWORD'),
//     database: configService.get('DATABASE'),
//     entities: [],
//     synchronize: true,
//   }),
//   inject: [ConfigService],
// });

@Module({})
export class InventoryModule {}
