import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User.model';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user = session?.user as any; // Ensure _id is accessible

  if (!session || !_user || !_user._id) {
    return new Response(JSON.stringify({ success: false, message: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const userId = new mongoose.Types.ObjectId(_user._id);
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      {
        $project: {
          messages: { $ifNull: ['$messages', []] }, // Ensures no error if messages don't exist
        },
      },
      { $unwind: { path: '$messages', preserveNullAndEmptyArrays: true } }, // Prevents user from being removed
      { $sort: { 'messages.createdAt': -1 } },
      {
        $group: {
          _id: '$_id',
          messages: { $push: '$messages' },
        },
      },
    ]).exec();

    if (!user || user.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        messages: user?.[0]?.messages ?? [], // ✅ Safe Access
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
