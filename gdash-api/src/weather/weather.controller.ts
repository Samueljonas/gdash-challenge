import { Controller, Get, Post, Body, UseGuards, Res } from '@nestjs/common';
import { WeatherService } from './weather.service';
import type { Response } from 'express';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('api/weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  // --- PUBLIC ROUTE (The Go Worker needs to post without login) ---
  // NOTE: In a real system, the Go worker would have an API Key, but to simplify,
  // we'll leave the POST public or protect it with a simple key later.
  // For now, we're leaving it WITHOUT the Guard so the Go worker doesn't break.
  @Post('logs')
  create(@Body() createWeatherDto: CreateWeatherDto) {
    return this.weatherService.create(createWeatherDto);
  }

  // --- PROTECTED ROUTES (Only Logged-in Frontend can access) ---

  @UseGuards(AuthGuard)
  @Get('logs')
  findAll() {
    return this.weatherService.findAll();
  }

  @UseGuards(AuthGuard)
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
