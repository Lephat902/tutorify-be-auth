import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';

// Define the portfolio item schema using Schema class
@Schema()
export class PortfolioItemSchema {
    @Prop({ required: true })
    id: string;

    @Prop({ required: true })
    url: string;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    size: number;
}

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

    @Prop([PortfolioItemSchema])
    tutorPortfolios: PortfolioItemSchema[];
}

// Create a discriminator
UserSchema.discriminator('Tutor', SchemaFactory.createForClass(Tutor));
export const TutorSchema = SchemaFactory.createForClass(Tutor);