import { Prop, Schema } from "@nestjs/mongoose";

// Define the file item schema using Schema class
@Schema()
export class FileSchema {
    @Prop({ nullable: true })
    id: string;

    @Prop({ required: true })
    url: string;

    @Prop({ nullable: true })
    title: string;

    @Prop({ nullable: true })
    size: number;
}
