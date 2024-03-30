import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Transform, Expose } from 'class-transformer';

// Define the file item schema using Schema class
@Schema()
export class SocialProfile {
  @Expose({ name: 'id' })
  @Transform((params) => params.obj._id.toString())
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;
}
