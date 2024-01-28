import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { Types } from 'mongoose';

// Define the additional properties for Student
@Schema()
export class Student extends User {
    @Prop({ default: '' })
    parentFirstName: string;
  
    @Prop({ default: '' })
    parentMiddleName: string;
  
    @Prop({ default: '' })
    parentLastName: string;  

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Tutor' }] })
    favoriteTutors: Types.ObjectId[];
}

// Create a discriminator
UserSchema.discriminator('Student', SchemaFactory.createForClass(Student));
export const StudentSchema = SchemaFactory.createForClass(Student);