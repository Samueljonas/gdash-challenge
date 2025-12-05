import { Controller, Get, Post, Body, UseGuards, Res } from '@nestjs/common'; // <--- Adicione UseGuards
import { WeatherService } from './weather.service';
import type { Response } from 'express';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { AuthGuard } from 'src/auth/auth.guard'; // <--- Importe o Guardião

@Controller('api/weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  // --- ROTA PÚBLICA (O Worker em Go precisa postar sem login) ---
  // OBS: Em um sistema real, o Go teria uma API Key, mas para simplificar,
  // vamos deixar o POST público ou proteger com uma chave simples depois.
  // Por enquanto, deixamos SEM o Guard aqui para o Go não quebrar.
  @Post('logs')
  create(@Body() createWeatherDto: CreateWeatherDto) {
    return this.weatherService.create(createWeatherDto);
  }

  // --- ROTAS PROTEGIDAS (Apenas Frontend Logado acessa) ---

  @UseGuards(AuthGuard) // <--- CADEADO NESTA ROTA
  @Get('logs')
  findAll() {
    return this.weatherService.findAll();
  }

  @UseGuards(AuthGuard) // <--- CADEADO NESTA ROTA TAMBÉM
  @Get('insights')
  getInsights() {
    return this.weatherService.generateInsights();
  }
  @UseGuards(AuthGuard)
  @Get('export/csv')
  async exportCsv(@Res() res: Response) {
    const csvString = await this.weatherService.getCsvData();
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="gdash_weather_${Date.now()}.csv"`,
    });
    res.send(csvString);
  }
}
