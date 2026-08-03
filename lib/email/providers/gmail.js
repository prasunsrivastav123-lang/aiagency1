import { google } from "googleapis";

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_BASE_URL + "/api/auth/callback/google"
);

export async function sendGmail({
    refreshToken,
    to,
    subject,
    html,
    text = ""
}) {

    oAuth2Client.setCredentials({
        refresh_token: refreshToken
    });

    const gmail = google.gmail({
        version: "v1",
        auth: oAuth2Client
    });

    const message = [
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        `To: ${to}`,
        `Subject: ${subject}`,
        "",
        html || text
    ].join("\n");

    const encodedMessage = Buffer
        .from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: encodedMessage
        }
    });

    return res.data;
}