import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
// Define the additional properties for Tutor

@Schema()
export class Tutor extends User {
    @Prop({ default: '' })
    biography: string;

    @Prop({ default: false })
    isApproved: boolean;

    @Prop({ nullable: true })
    approvedAt: Date;

    @Prop({ default: '' })
    minimumWage: string;

    @Prop({ default: '' })
    currentWorkplace: string;

    @Prop({ default: '' })
    currentPosition: string;

    @Prop({ default: '' })
    major: string;

    @Prop({ nullable: true })
    graduationYear: number;
}

// Create a discriminator
UserSchema.discriminator('Tutor', SchemaFactory.createForClass(Tutor));
export const TutorSchema = SchemaFactory.createForClass(Tutor);
