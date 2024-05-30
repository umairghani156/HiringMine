import nodemailer from "nodemailer";
// Function to send OTP via email
const emailConfig = {
    service: "gmail",
    auth: {
        user: process.env.portal_email,
        pass: process.env.portal_password,
    },
    secure: true,
};

async function sendEmailOTP(mail, otp) { //krazadev asdad
    const transporter = nodemailer.createTransport(emailConfig);

    const mailOptions = {
        from: process.env.portal_email,
        to: mail,   //krazadev
        subject: "OTP Verification",
        text: `Your OTP is: ${otp}`,
    };
   console.log("mail",mailOptions);
    try {
        await transporter.sendMail(mailOptions);
        return `OTP sent to ${mail} via email`;
    } catch (error) {
        throw `Error sending OTP to ${mail} via email: ${error}`;
    }
}

export {sendEmailOTP}