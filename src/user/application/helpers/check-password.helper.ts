import { UserDocument } from "src/user/infrastructure/schemas";
import * as argon2 from 'argon2';

export async function checkPassword(user: UserDocument, password: string) {
    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
        user.loginFailureCount++;
        user.save();
        return false;
    }

    // Reset login failure count on successful login
    user.loginFailureCount = 0;
    await user.save();
    return true;
}