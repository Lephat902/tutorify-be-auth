import { AddressProxy } from './address.proxy';
import { FileProxy } from './file.proxy';
import { MailerProxy } from './mailer.proxy';
import { VerificationTokenProxy } from './verification-token.proxy';

export const Proxies = [
    FileProxy,
    MailerProxy,
    VerificationTokenProxy,
    AddressProxy,
];

export {
    FileProxy,
    MailerProxy,
    VerificationTokenProxy,
    AddressProxy,
}