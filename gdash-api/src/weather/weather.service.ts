import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { WeatherLog } from './schemas/weather-log.schema';

@Injectable()
export class WeatherService {
  // Dependency Injection: NestJS provides us with the ready-to-use Mongo model
  constructor(
    @InjectModel(WeatherLog.name) private weatherModel: Model<WeatherLog>,
  ) {}

  // --- EXISTING METHODS ---
  async getCsvData(): Promise<string> {
    const logs = await this.findAll(); // Fetches all data

    // 1. The CSV Header
    const header =
      'DateTime,Temperature(C),Humidity(%),Precipitation(mm),Latitude,Longitude';

    // 2. The Data Rows
    const rows = logs.map((log) => {
      // Format the date to ISO or Local, avoid commas within the date field!
      const date = new Date(log.timestamp).toISOString();
      return `${date},${log.temperature},${log.humidity},${log.precipitation},${log.latitude},${log.longitude}`;
    });

    // 3. Join everything with a newline character (\n)
    return [header, ...rows].join('\n');
  }

  async create(createWeatherDto: CreateWeatherDto): Promise<WeatherLog> {
    const createdLog = new this.weatherModel(createWeatherDto);
    return createdLog.save();
  }

  async findAll(): Promise<WeatherLog[]> {
    // Fetches everything, sorts by the newest (-1 on createdAt)
    return this.weatherModel.find().sort({ createdAt: -1 }).exec();
  }

  // --- NEW METHOD: THE "AI" RULES ENGINE ---

  async generateInsights() {
    // 1. We fetch the last 20 records to have a basis for analysis
    const logs = await this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();

    // If there isn't enough data, we return a default insight
    if (logs.length === 0) {
      return {
        summary: 'Waiting for data for analysis...',
        alerts: [],
      };
    }

    const current = logs[0]; // The most recent data
    const alerts: string[] = []; // List of alerts that we will populate

    // --- ANALYSIS 1: Average Temperature ---
    // reduce: Iterates through the array summing the temperatures
    const totalTemp = logs.reduce((acc, log) => acc + log.temperature, 0);
    const avgTemp = (totalTemp / logs.length).toFixed(1); // Rounds to 1 decimal place

    // --- ANALYSIS 2: Anomaly Detection (Business Rules) ---

    // Rule: Heat
    if (current.temperature > 30) {
      alerts.push(
        '🔥 Heat Alert: Temperature above 30°C. Panel efficiency may decrease.',
      );
    } else if (current.temperature < 15) {
      alerts.push('❄️ Cold Alert: Low temperature detected.');
    }

    // Rule: Humidity and Rain
    if (current.humidity > 80 || current.precipitation > 0) {
      alerts.push(
        '💧 Rain/Humidity Risk: Check external electrical insulation.',
      );
    }

    // Rule: Stability (Comparing the current with the average)
    let stabilityCheck = '';
    if (Math.abs(current.temperature - Number(avgTemp)) > 5) {
      stabilityCheck = 'The weather is unstable, with abrupt variations.';
    } else {
      stabilityCheck =
        'The weather remains stable relative to the recent average.';
    }

    // 3. We assemble the final response
    return {
      summary: `In the last few hours, the average temperature was ${avgTemp}°C. ${stabilityCheck}`,
      alerts:
        alerts.length > 0
          ? alerts
          : ['✅ Everything operating within normality.'],
    };
  }
}
