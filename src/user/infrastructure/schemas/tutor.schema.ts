import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { FileSchema } from './file.schema';
import { SocialProfile } from './social-profile.schema';
import { Type } from 'class-transformer';

@Schema()
export class Tutor extends User {
    @Prop({ default: '' })
    biography: string;

    @Prop({ default: false })
    isApproved: boolean;

    @Prop({ nullable: true })
    approvedAt: Date;

    @Prop({ default: 0 })
    minimumWage: number;

    @Prop({ default: '' })
    currentWorkplace: string;

    @Prop({ default: '' })
    currentPosition: string;

    @Prop({ default: '' })
    major: string;

    @Prop({ nullable: true })
    graduationYear: number;

    @Prop({ type: [FileSchema], default: [] })
    tutorPortfolios: FileSchema[];

    @Prop({ type: [SocialProfile], default: [] })
    @Type(() => SocialProfile)
    socialProfiles: SocialProfile[];
}

// Create a discriminator
UserSchema.discriminator('Tutor', SchemaFactory.createForClass(Tutor));
export const TutorSchema = SchemaFactory.createForClass(Tutor);