import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WeatherModule } from './weather/weather.module';
import { Weather, WeatherSchema } from './weather/schema/weather.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      connectionFactory: (connection) => {
        connection.once('open', () => {});
        connection.on('error', (error) => {
          Logger.error(`MongoDB connection error: ${error}`);
        });
        return connection;
      },
    }),
    MongooseModule.forFeature([{ name: Weather.name, schema: WeatherSchema }]),
    HttpModule,
    WeatherModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {}
}
