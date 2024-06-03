import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Weather extends Document {
  @Prop({ required: true })
  city: string;

  @Prop({ type: Object, required: true })
  data: any;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
