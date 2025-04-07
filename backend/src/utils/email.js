import nodemailer from "nodemailer";


export const sendOTPEmail = async (email, html ) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    const mailOptions = {
      from: `"CodeVerse Support" <codeverse025@gmail.com>`, 
      to: email,
      subject: "Your OTP Code",
      text: `CodeVerse`,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);

    return { success: true, info: info.response };
  } catch (error) {
    console.error("Error sending email:", error);

    // Return error if the email fails to send
    return { success: false, error };
  }
};
