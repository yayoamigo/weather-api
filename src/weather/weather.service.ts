import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather } from './schema/weather.schema';
import { firstValueFrom } from 'rxjs';
import * as moment from 'moment';

@Injectable()
export class WeatherService {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Weather.name) private weatherModel: Model<Weather>,
  ) {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.apiUrl = 'https://api.openweathermap.org/data/2.5';
  }
  // Method to find weather data by city and date
  private async findWeatherByCityAndDate(
    city: string,
    date: Date,
  ): Promise<Weather | null> {
    const startOfDay = moment(date).startOf('day').toDate();
    const endOfDay = moment(date).endOf('day').toDate();

    return await this.weatherModel
      .findOne({
        city,
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .exec();
  }
  // Method to get current weather
  async getWeather(city: string): Promise<any> {
    const today = new Date();
    const existingWeather = await this.findWeatherByCityAndDate(city, today);

    if (existingWeather) {
      Logger.log(`Returning cached weather data for ${city} on ${today}`);
      return existingWeather.data;
    }

    const url = `${this.apiUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`;
    const response = await firstValueFrom(this.httpService.get(url));
    const weatherData = response.data;

    try {
      await this.weatherModel.create({
        city,
        data: weatherData,
      });
      Logger.log(`Saved new weather data for ${city} on ${today}`);
    } catch (error) {
      Logger.error(`Failed to save weather data: ${error.message}`);
    }

    return weatherData;
  }
  // Method to get weather forecast
  async getWeatherForecast(city: string): Promise<any> {
    const url = `${this.apiUrl}/forecast?q=${city}&appid=${this.apiKey}&units=metric`;
    const response = await firstValueFrom(this.httpService.get(url));
    const weatherData = response.data;

    return weatherData;
  }
}
