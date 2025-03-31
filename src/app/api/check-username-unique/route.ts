import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User.model';
import { z } from 'zod';
import { usernameValidation } from '@/schemas/signUpSchema';

const usernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = { username: searchParams.get('username') };
    const result = usernameQuerySchema.safeParse(queryParams);
    console.log(result);
    if (!result.success) {
      return Response.json(
        { success: false, message: result.error.format().username?._errors },
        { status: 500 },
      );
    }
    const { username } = result.data;
    const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true });
    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: 'Username is already Taken',
        },
        { status: 400 },
      );
    }
    return Response.json(
      {
        success: true,
        message: 'Username is Unique',
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return Response.json({ success: false, message: 'Error Checking Username' }, { status: 500 });
  }
}
