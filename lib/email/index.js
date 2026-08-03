import { sendGmail } from "./providers/gmail";

export async function sendEmail(options) {
    return sendGmail(options);
}