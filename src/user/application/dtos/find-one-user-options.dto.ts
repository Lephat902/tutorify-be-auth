import { UserDocument } from "src/user/infrastructure/schemas";

export type FindOneUserOptions = Partial<Pick<UserDocument, 'email' | 'id' | 'username'>>;