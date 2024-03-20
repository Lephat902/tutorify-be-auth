import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';

// Define the additional properties for Student
@Schema()
export class Student extends User {
    @Prop({ default: '' })
    parentEmail: string;

    @Prop({ default: '' })
    parentFirstName: string;

    @Prop({ default: '' })
    parentMiddleName: string;

    @Prop({ default: '' })
    parentLastName: string;
}

// Create a discriminator
UserSchema.discriminator('Student', SchemaFactory.createForClass(Student));
export const StudentSchema = SchemaFactory.createForClass(Student);