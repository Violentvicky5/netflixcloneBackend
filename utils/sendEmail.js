import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, html) => {
  try {
    const response = await resend.emails.send({
      from: "Vicky <onboarding@resend.dev>", 
      to: to,
      subject: subject,
      html: html,
    });

    console.log("Email sent:", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
