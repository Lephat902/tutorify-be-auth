import { Prop, Schema } from "@nestjs/mongoose";

// Define the portfolio item schema using Schema class
@Schema()
export class FileSchema {
    @Prop({ required: true })
    id: string;

    @Prop({ required: true })
    url: string;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    size: number;
}