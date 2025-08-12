import { NextResponse } from "next/server";
import mailjet from "node-mailjet";

// This file handles sending emails using Mailjet
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
// Validate required fields
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
    // Log the result for debugging
    return NextResponse.json({ success: true, result: result.body });
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error("Mailjet error:", error.message);
    return NextResponse.json({ success: false, error: error.message });
  } else {
    console.error("Unknown error:", error);
    return NextResponse.json({ success: false, error: "Unknown error occurred" });
  }
}
}