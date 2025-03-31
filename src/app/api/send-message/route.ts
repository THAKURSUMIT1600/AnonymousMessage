import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User.model';
import { Message } from '@/model/Message.model';

export async function POST(request: Request) {
  await dbConnect();
  const { username, content } = await request.json();
  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: 'User not Found',
        },
        { status: 500 },
      );
    }
    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: 'User not Accepting Message',
        },
        { status: 403 },
      );
    }
    const newMessage = { content, createdAt: new Date() };
    user.messages.push(newMessage as Message);
    await user.save();
    return Response.json(
      {
        success: true,
        message: 'Message Sent Successfully',
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return Response.json(
      {
        success: false,
        message: 'Error Adding Messages',
      },
      { status: 500 },
    );
  }
}
