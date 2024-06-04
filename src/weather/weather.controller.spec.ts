import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { getModelToken } from '@nestjs/mongoose';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { Weather } from './schema/weather.schema';

describe('WeatherController', () => {
  let controller: WeatherController;
  let service: WeatherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
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
          },
        },
      ],
    }).compile();

    controller = module.get<WeatherController>(WeatherController);
    service = module.get<WeatherService>(WeatherService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrentWeather', () => {
    it('should return weather data', async () => {
      const city = 'Quito';
      const weatherData = { weather: [{ description: 'clear sky' }] };

      jest.spyOn(service, 'getWeather').mockResolvedValueOnce(weatherData);

      const result = await controller.getCurrentWeather(city);

      expect(result).toEqual(weatherData);
      expect(service.getWeather).toHaveBeenCalledWith(city);
    });
  });

  describe('getWeatherForecast', () => {
    it('should return weather forecast data', async () => {
      const city = 'Quito';
      const weatherData = {
        list: [{ weather: [{ description: 'clear sky' }] }],
      };

      jest
        .spyOn(service, 'getWeatherForecast')
        .mockResolvedValueOnce(weatherData);

      const result = await controller.getWeatherForecast(city);

      expect(result).toEqual(weatherData);
      expect(service.getWeatherForecast).toHaveBeenCalledWith(city);
    });
  });
});
