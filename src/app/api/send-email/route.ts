import { NextResponse } from "next/server";
import mailjet from "node-mailjet";

export async function POST(req: Request) {
  const { to, subject, html } = await req.json();

  const mj = mailjet.apiConnect(
    process.env.MAILJET_API_KEY!,
    process.env.MAILJET_API_SECRET!
  );

  console.log("Sending email with Mailjet:", {
    to,
    subject,
    html,
  });

  try {
    console.log("Request body:", to, subject, html);
    const result = await mj.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_SENDER_EMAIL!,
            Name: "Ballmaster",
          },
          To: [
            {
              Email: to,
            },
          ],
          Subject: subject,
          HTMLPart: html,
        },
      ],
    });

    return NextResponse.json({ success: true, result: result.body });
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error("Mailjet error:", error.message);
    return NextResponse.json({ success: false, error: error.message });
  } else {
    console.error("Unknown error:", error);
    return NextResponse.json({ success: false, error: "Unknown error occurred" });
  }
} {  try { }catch (error: any) {
    console.error("Mailjet error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }}
}