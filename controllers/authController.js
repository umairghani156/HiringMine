
import nodemailer from "nodemailer";
import { compareSync, genSaltSync, hashSync } from "bcrypt";
import { ALREADYEXISTS, BADREQUEST, CREATED, FORBIDDEN, INTERNALERROR, NOTFOUND, OK } from "../constants/httpStatus.js";
import { responseMessages } from "../constants/responseMessage.js";
import Users from "../models/Users.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { v4 as uuidv4 } from "uuid";
import { GenerateToken } from "../helpers/Token.js";
import { sendEmailOTP } from "../helpers/mailFunc.js";
import pkg from 'jsonwebtoken';
const { verify, decode, sign } = pkg;

// @route   POST api/auth/signup

export const signUp = async (req, res) => {

    // console.log(req.body ,"===>");
    try {
        const { firstName, lastName, userName, email, password, cPassword } = req.body;
        if (!firstName, !lastName, !userName, !email, !password, !cPassword) {
            return res.status(BADREQUEST)
                .send(sendError({ status: false, message: responseMessages.MISSING_FIELDS }))
        }
        const user = await Users.findOne({ email: email })
        if (user) {
            return res.status(ALREADYEXISTS).send(sendError({ status: false, message: responseMessages.EMAIL_EXIST }))
        } else {
            const user = await Users.findOne({ firstName: firstName });
            if (user) {
                return res
                    .status(ALREADYEXISTS).send(sendError({ status: false, message: responseMessages.USER_EXISTS }));
            } else {
                const salt = genSaltSync(10);

                let doc;
                if (password?.length > 7) {
                    doc = new Users({
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        password: hashSync(password, salt),
                    });
                    // console.log(doc);
                    const otp = uuidv4().slice(0, 6);
                    doc.otp = otp
                    doc.expiresIn = Date.now() + 300000;
                    const savedUser = await doc.save()
                    // console.log(savedUser,"===>");
                    if (savedUser.errors) {
                        return res
                            .status(INTERNALERROR)
                            .send(sendError({ status: false, message: error.message, error }));
                    } else {
                        // return res.send(savedUser);
                        console.log(savedUser.password);
                        savedUser.password = undefined;
                        const token = GenerateToken({ data: savedUser, expiresIn: '24h' });

                        console.log("token", token);
                        const emailResponse = await sendEmailOTP(email, otp);
                        console.log(emailResponse, "===>");
                        return res.status(CREATED).json(
                            sendSuccess({
                                status: true,
                                message: responseMessages.SUCCESS_REGISTRATION,
                                token,
                                data: savedUser,
                            })
                        );
                    }
                } else {
                    return res
                        .status(FORBIDDEN)
                        .send(sendError({ status: false, message: responseMessages.UN_AUTHORIZED }));
                }
            }
        }
    } catch (err) {
        return res
            .status(500) //INTERNALERROR
            // .send(sendError({ status: false, message: error.message, error }));
            .send(err.message);
    }
};

// @desc    VERIFY EMAIL
// @route   POST api/auth/verifyEmail
// @access  Private

export const verifyEmail = async (req, res) => {
    //  console.log(req.user);
    try {
        const { otp } = req.body;
        console.log("otp", otp);
        if (otp) {
            const user = await Users.findOne({ otp: otp, _id: req.user._id });
            console.log("user", user);
            if (user) {
                console.log(user, "===>> user")
                console.log(user.expiresIn > Date.now());
                if (user.expiresIn > Date.now()) {
                    user.isVerified = true;
                    user.otp = undefined;
                    user.otpExpires = undefined;
                    await user.save();
                    console.log("user", user);
                    return res.status(OK).send(
                        sendSuccess({
                            status: true,
                            message: 'Email Verified Successfully',
                            data: user,
                        })
                    );
                } else {
                    return res.status(OK).send(
                        sendError({
                            status: false,
                            message: 'OTP has expired. Please request a new OTP',
                        })
                    );
                }
            } else {
                return res
                    .status(FORBIDDEN)
                    .send(sendError({ status: false, message: 'Invalid OTP' }));
            }
        } else {
            return res
                .status(BADREQUEST)
                .send(sendError({ status: false, message: responseMessages.MISSING_FIELDS }));
        }
    } catch (error) {
        return res
            .status(INTERNALERROR)
            .send(sendError({ status: false, message: error.message, error }));
    }
}

export const login = async (req, res) => {
    try {

        const { email, password } = req.body;
        if (email && password) {
            const user = await Users.findOne({ email: email });
            console.log("user", user);

            if (user) {
                const isValid = compareSync(password, user.password);
                if (user.email === email && isValid) {
                    user.password = undefined;
                    const token = GenerateToken({ data: user, expiresIn: '24h' });
                    res.cookie("token", token, { httpOnly: true });
                    res.status(OK).send(
                        sendSuccess({
                            status: true,
                            message: 'Login Successful',
                            token,
                            data: user,
                        })
                    );
                } else {
                    return res
                        .status(OK)
                        .send(sendError({ status: false, message: responseMessages.UN_AUTHORIZED }));
                };
            } else {
                return res
                    .status(NOTFOUND)
                    .send(sendError({ status: false, message: responseMessages.NO_USER }));
            };

        } else {
            return res
                .status(BADREQUEST) //BADREQUEST
                .send(sendError({ status: false, message: MISSING_FIELDS }));

        };

    } catch (error) {
        res.status(INTERNALERROR).send({
            status: false,
            message: error.message
        })
    }
};

//route /api/v1/auth/forgotPassword
export const forgotPasswordEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (email) {
            const user = await Users.findOne({ email: email });
            if (user) {
                const secret = user._id + process.env.JWT_SECRET_KEY;
                const token = GenerateToken({ data: secret, expiresIn: '30m' });
                // res.send(token)
                const link = `${process.env.WEB_LINK}/api/auth/resetPassword/${user._id}/${token}`;
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.PORTAL_EMAIL,
                        pass: process.env.PORTAL_PASSWORD,
                    },
                });

                const mailOptions = {
                    from: process.env.PORTAL_EMAIL,
                    to: email,
                    subject: 'Reset Password',
                    text: `Please click on the link to reset your password ${link}`,
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                        return res
                            .status(INTERNALERROR)
                            .send(sendError({ status: false, message: error.message }));
                    } else {
                        console.log('Email sent: ' + info.response);
                        return res.status(OK).send(
                            sendSuccess({
                                status: true,
                                message: 'Reset Password Link Generated'
                            })
                        );
                    }
                });

            } else {
                return res
                    .status(NOTFOUND)
                    .send(sendError({ status: false, message: responseMessages.NO_USER_FOUND }));
            }
        } else {
            return res
                .status(BADREQUEST)
                .send(sendError({ status: false, message: responseMessages.MISSING_FIELD_EMAIL }));
        }

    } catch (error) {
        res.status(INTERNALERROR).send({
            status: false,
            message: error.message,
            data: null
        })
    }
};

//Reset Password

export const resetPasswordEmail = async (req, res) => {
    try {
        const { newPassword, confirmNewPassword, token } = req.body;

        if (newPassword && confirmNewPassword && token) {
            const { result } = verify(token, process.env.JWT_SECRET_KEY);
            const userId = result._id;
            const user = await Users.findById(userId);
            console.log(user);
            if (user) {
                const salt = genSaltSync(10);
                const hashedPassword = hashSync(newPassword, salt);
                console.log("hashedPassword", hashedPassword);
                await Users.findByIdAndUpdate(userId, {
                    $set: { password: hashedPassword },
                });
                return res.status(OK).send(
                    sendSuccess({
                        status: true,
                        message: 'Password Updated Successfully',
                    })
                );
            } else {
                return res
                    .status(NOTFOUND)
                    .send(sendError({ status: false, message: responseMessages.NO_USER }));
            }
        } else {
            return res
                .status(BADREQUEST)
                .send(sendError({ status: false, message: responseMessages.MISSING_FIELDS }));
        }

    } catch (error) {

    }
}

export const getUser =async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token == null) return res.sendStatus(401);
        let data;
        verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
            if (err) return res.status(BADREQUEST).send("Token is not valid");
            data = user;
        });
        console.log(data);
        const currentUser = await Users.findById({_id: data.result._id})
        if(currentUser){
            const otp = uuidv4().slice(0, 6);
            currentUser.otp = otp
            currentUser.expiresIn = Date.now() + 60000;
            const savedUser = await currentUser.save()
            if(savedUser.errors){
                    return res
                        .status(INTERNALERROR)
                        .send(sendError({ status: false, message: error.message, error }));

            }else{
                    // return res.send(savedUser);
                    const token2 = GenerateToken({ data: savedUser, expiresIn: '24h' });
                        console.log("token", token);
                        const emailResponse = await sendEmailOTP(savedUser.email, otp);
                            console.log(emailResponse, "===>");
                            return res.status(OK).json(
                                sendSuccess({
                                    status: true,
                                    message: "Otp regenerated Successfully",
                                    token2,
                                    data: savedUser,
                                })
                            );
            }
        }else{
            return res
                    .status(NOTFOUND)
                    .send(sendError({ status: false, message: responseMessages.NO_USER }));
        }

    } catch (error) {
        res.send(INTERNALERROR).send({
            status: false,
            message: error.message
        })
    }
}