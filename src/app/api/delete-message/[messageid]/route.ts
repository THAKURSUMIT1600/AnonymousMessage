import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import { User as NextAuthUser } from 'next-auth';
import UserModel from '@/model/User.model';
import { authOptions } from '../../auth/[...nextauth]/options';

export async function DELETE(request: Request) {
  const messageid = request.url.split('/').pop();
  await dbConnect();

  // Get the session
  const session = await getServerSession(authOptions);
  const _user: NextAuthUser = session?.user;

  // Ensure user is authenticated
  if (!session || !_user) {
    return Response.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Try to update user messages
    const updateResult = await UserModel.updateOne(
      { _id: _user._id },
      { $pull: { messages: { _id: messageid } } },
    );

    if (updateResult.modifiedCount === 0) {
      return Response.json(
        { message: 'Message not found or already deleted', success: false },
        { status: 404 },
      );
    }

    return Response.json({ message: 'Message deleted', success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting message:', error);
    return Response.json({ message: 'Error deleting message', success: false }, { status: 500 });
  }
}
