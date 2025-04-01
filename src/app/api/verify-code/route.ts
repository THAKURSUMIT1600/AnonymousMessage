import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User.model';
import { verifySchema } from '@/schemas/verifySchema';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();
    const verify = verifySchema.safeParse({ code });

    if (!verify.success) {
      return Response.json(
        { success: false, message: verify.error.errors[0].message },
        { status: 400 },
      );
    }

    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Check if the code is correct or if the user has used the fallback code "000000"
    const isCodeValid = user.verifyCode === code || code === '000000';
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      // Update the user's verification status
      user.isVerified = true;
      await user.save();

      return Response.json(
        { success: true, message: 'Account verified successfully' },
        { status: 200 },
      );
    } else if (!isCodeNotExpired) {
      // Code has expired
      return Response.json(
        {
          success: false,
          message: 'Verification code has expired. Please sign up again to get a new code.',
        },
        { status: 400 },
      );
    } else {
      // Code is incorrect (not expired and not "000000")
      return Response.json(
        { success: false, message: 'Incorrect verification code' },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error('Error verifying user:', error);
    return Response.json({ success: false, message: 'Error verifying user' }, { status: 500 });
  }
}
