import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Exclude, Expose, Transform } from 'class-transformer';
import { Gender, UserRole } from '@tutorify/shared';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Expose({ name: 'id' })
    @Transform((params) => params.obj._id.toString())
    _id: Types.ObjectId;

    @Prop({ unique: true })
    email: string;

    @Prop({ unique: true })
    username: string;

    @Prop({ required: true })
    @Exclude()
    password: string;

    @Prop({ default: 0 })
    @Exclude()
    loginFailureCount: number;

    @Prop({ default: '' })
    firstName: string;

    @Prop({ default: '' })
    middleName: string;

    @Prop({ default: '' })
    lastName: string;

    @Prop({ enum: Object.values(Gender), default: null })
    gender: Gender;

    @Prop({ default: '' })
    phoneNumber: string;

    @Prop({ default: '' })
    imgUrl: string;

    @Prop({ enum: Object.values(UserRole), default: UserRole.STUDENT })
    role: UserRole;

    @Prop({ default: false })
    emailVerified: boolean;

    @Prop({ default: false })
    isBlocked: boolean;

    @Prop()
    address: string;

    @Prop()
    wardId: string;

    @Prop({ type: { type: String, default: 'Point' }, coordinates: [Number] })
    @Exclude()
    location: { type: string, coordinates: number[] };
}

export const UserSchema = SchemaFactory.createForClass(User);
