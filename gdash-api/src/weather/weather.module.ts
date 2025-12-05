import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { WeatherLog, WeatherLogSchema } from './schemas/weather-log.schema';
import { AuthModule } from 'src/auth/auth.module'; // <--- Importe o Módulo de Auth

@Module({
  imports: [
    // O Módulo de Clima precisa conhecer o Módulo de Auth
    AuthModule,

    // Conexão com o Banco
    MongooseModule.forFeature([
      { name: WeatherLog.name, schema: WeatherLogSchema },
    ]),
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}
