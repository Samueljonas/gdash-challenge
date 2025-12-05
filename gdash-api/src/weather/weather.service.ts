import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { WeatherLog } from './schemas/weather-log.schema';

@Injectable()
export class WeatherService {
  // Injeção de Dependência: O NestJS nos entrega o modelo do Mongo pronto para usar
  constructor(
    @InjectModel(WeatherLog.name) private weatherModel: Model<WeatherLog>,
  ) {}

  // --- MÉTODOS EXISTENTES ---
  async getCsvData(): Promise<string> {
    const logs = await this.findAll(); // Busca todos os dados

    // 1. O Cabeçalho do CSV
    const header =
      'Data/Hora,Temperatura(C),Umidade(%),Precipitacao(mm),Latitude,Longitude';

    // 2. As Linhas de Dados
    const rows = logs.map((log) => {
      // Formata a data para ISO ou Local, evite vírgulas dentro do campo data!
      const date = new Date(log.timestamp).toISOString();
      return `${date},${log.temperature},${log.humidity},${log.precipitation},${log.latitude},${log.longitude}`;
    });

    // 3. Junta tudo com quebra de linha (\n)
    return [header, ...rows].join('\n');
  }

  async create(createWeatherDto: CreateWeatherDto): Promise<WeatherLog> {
    const createdLog = new this.weatherModel(createWeatherDto);
    return createdLog.save();
  }

  async findAll(): Promise<WeatherLog[]> {
    // Busca tudo, ordena pelo mais novo (-1 no createdAt)
    return this.weatherModel.find().sort({ createdAt: -1 }).exec();
  }

  // --- NOVO MÉTODO: A "IA" DE REGRAS ---

  async generateInsights() {
    // 1. Buscamos os últimos 20 registros para ter base de análise
    const logs = await this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();

    // Se não tiver dados suficientes, retornamos um insight padrão
    if (logs.length === 0) {
      return {
        summary: 'Aguardando dados para análise...',
        alerts: [],
      };
    }

    const current = logs[0]; // O dado mais recente
    const alerts: string[] = []; // Lista de alertas que vamos preencher

    // --- ANÁLISE 1: Média de Temperatura ---
    // reduce: Percorre o array somando as temperaturas
    const totalTemp = logs.reduce((acc, log) => acc + log.temperature, 0);
    const avgTemp = (totalTemp / logs.length).toFixed(1); // Arredonda para 1 casa decimal

    // --- ANÁLISE 2: Detecção de Anomalias (Regras de Negócio) ---

    // Regra: Calor
    if (current.temperature > 30) {
      alerts.push(
        '🔥 Alerta de Calor: Temperatura acima de 30°C. Eficiência dos painéis pode cair.',
      );
    } else if (current.temperature < 15) {
      alerts.push('❄️ Alerta de Frio: Temperatura baixa detectada.');
    }

    // Regra: Umidade e Chuva
    if (current.humidity > 80 || current.precipitation > 0) {
      alerts.push(
        '💧 Risco de Chuva/Umidade: Verifique isolamento elétrico externo.',
      );
    }

    // Regra: Estabilidade (Comparando o atual com a média)
    let stabilityCheck = '';
    if (Math.abs(current.temperature - Number(avgTemp)) > 5) {
      stabilityCheck = 'O clima está instável, com variações bruscas.';
    } else {
      stabilityCheck = 'O clima segue estável em relação à média recente.';
    }

    // 3. Montamos a resposta final
    return {
      summary: `Nas últimas horas, a temperatura média foi de ${avgTemp}°C. ${stabilityCheck}`,
      alerts:
        alerts.length > 0
          ? alerts
          : ['✅ Tudo operando dentro da normalidade.'],
    };
  }
}
