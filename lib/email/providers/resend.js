import { Resend } from "resend";
import { EmailProvider } from "./base";

const resend = new Resend(process.env.RESEND_API_KEY);

export class ResendProvider extends EmailProvider {
  async send({
    to,
    subject,
    html,
    text,
    from = process.env.EMAIL_FROM,
  }) {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}