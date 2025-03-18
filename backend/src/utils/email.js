import nodemailer from "nodemailer";


export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    const mailOptions = {
      from: "sujalpatel4510@gmail.com", 
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    };

    const info = await transporter.sendMail(mailOptions);

    return { success: true, info: info.response };
  } catch (error) {
    console.error("Error sending email:", error);

    // Return error if the email fails to send
    return { success: false, error };
  }
};
