import { google } from "googleapis";
import nodemailer from "nodemailer";

const CLIENT_ID = process.env.GMAIL_CLIENT_ID!;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET!;
const REDIRECT_URI = "https://developers.google.com/oauthplayground"; // Or your real redirect URI
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN!;
const SENDER_EMAIL = process.env.SENDER_EMAIL!;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export async function sendEmailReceipt(to: string, subject: string, text: string, html?: string) {
  const accessToken = await oAuth2Client.getAccessToken();

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: SENDER_EMAIL,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken.token!,
    },
  });

  const mailOptions = {
    from: `Ballmaster <${SENDER_EMAIL}>`,
    to,
    subject,
    text,
    html,
  };

  const result = await transport.sendMail(mailOptions);
  return result;
}