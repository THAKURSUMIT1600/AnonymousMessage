import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User.model';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  // Check authentication early
  if (!session || !session.user) {
    return Response.json({ success: false, message: 'Not Authenticated' }, { status: 401 });
  }

  const userId = new mongoose.Types.ObjectId(session.user._id);
  const { acceptMessages } = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      { new: true },
    );

    if (!updatedUser) {
      return Response.json(
        { success: false, message: 'Failed to Update User Status' },
        { status: 404 },
      );
    }

    return Response.json(
      {
        success: true,
        message: 'Message Status Updated',
        isAcceptingMessage: updatedUser.isAcceptingMessage,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error updating message status:', error);
    return Response.json(
      { success: false, message: 'Failed to Update User Status' },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  // Check authentication early
  if (!session || !session.user) {
    return Response.json({ success: false, message: 'Not Authenticated' }, { status: 401 });
  }

  const userId = new mongoose.Types.ObjectId(session.user._id);

  try {
    const foundUser = await UserModel.findById(userId);

    if (!foundUser) {
      return Response.json({ success: false, message: 'Unable to get Status' }, { status: 404 });
    }

    return Response.json(
      {
        success: true,
        message: 'Got Message Status',
        isAcceptingMessage: foundUser.isAcceptingMessage,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error fetching message status:', error);
    return Response.json({ success: false, message: 'Message Status Failed' }, { status: 500 });
  }
}
