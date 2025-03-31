import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User.model';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/helper/sendVerificationEmail';

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json();
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json({ success: false, message: 'User Exist' }, { status: 400 });
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json({ success: false, message: 'User Already Exist' }, { status: 500 });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = expiryDate;
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        isVerified: false,
        verifyCodeExpiry: expiryDate,
        isAcceptingMessage: true,
        messages: [],
      });
      await newUser.save();

      const emailResponse = await sendVerificationEmail(email, username, verifyCode);
      console.log(emailResponse);
      if (!emailResponse.success) {
        return Response.json({ success: false, message: 'Unable to Send Email' }, { status: 500 });
      }
    }

    return Response.json(
      {
        success: true,
        message: 'User Registered Successfully.Please Verify Email',
      },
      { status: 200 },
    );
  } catch (error) {
    console.log('Error', error);
    return Response.json(
      {
        success: false,
        message: 'Error Registering User',
      },
      {
        status: 500,
      },
    );
  }
}
