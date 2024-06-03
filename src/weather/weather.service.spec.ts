import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherService } from './weather.service';
import { Weather } from './schema/weather.schema';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import * as moment from 'moment';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpService: HttpService;
  let weatherModel: Model<Weather>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: getModelToken(Weather.name),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn().mockReturnValue({
              exec: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    httpService = module.get<HttpService>(HttpService);
    weatherModel = module.get<Model<Weather>>(getModelToken(Weather.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWeather', () => {
    it('should return weather data and save it to the database if not cached', async () => {
      const city = 'Quito';
      const weatherData = { weather: [{ description: 'clear sky' }] };
      const response: AxiosResponse = {
        data: weatherData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };

      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(response));
      jest.spyOn(weatherModel.findOne(), 'exec').mockResolvedValueOnce(null);
      jest
        .spyOn(weatherModel, 'create')
        .mockResolvedValueOnce({ toObject: () => weatherData } as any);

      const result = await service.getWeather(city);

      expect(result).toEqual(weatherData);
      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining(`q=${city}`),
      );
      expect(weatherModel.create).toHaveBeenCalledWith({
        city,
        data: weatherData,
      });
    });

    it('should return cached weather data if available', async () => {
      const city = 'Quito';
      const weatherData = { weather: [{ description: 'clear sky' }] };
      const cachedWeather = {
        city,
        data: weatherData,
        createdAt: new Date(),
      };

      jest
        .spyOn(weatherModel.findOne(), 'exec')
        .mockResolvedValueOnce(cachedWeather as any);

      const result = await service.getWeather(city);

      expect(result).toEqual(weatherData);
      expect(weatherModel.findOne).toHaveBeenCalledWith({
        city,
        createdAt: {
          $gte: moment().startOf('day').toDate(),
          $lte: moment().endOf('day').toDate(),
        },
      });
      expect(httpService.get).not.toHaveBeenCalled();
    });
  });

  describe('getWeatherForecast', () => {
    it('should return weather forecast data', async () => {
      const city = 'Quito';
      const weatherData = {
        list: [{ weather: [{ description: 'clear sky' }] }],
      };
      const response: AxiosResponse = {
        data: weatherData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };

      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(response));

      const result = await service.getWeatherForecast(city);

      expect(result).toEqual(weatherData);
      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining(`q=${city}`),
      );
    });
  });
});
