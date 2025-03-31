import mongoose, { Schema, Document } from 'mongoose';
import { Message, MessageSchema } from './Message.model';

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  isVerified: boolean;
  verifyCodeExpiry: Date;
  isAcceptingMessage: boolean;
  messages: Message[];
}

const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, 'Username is Required'],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is Required'],
    unique: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please Use a Valid Email Address'],
  },
  password: {
    type: String,
    required: [true, 'Password is Required'],
    // match: [
    //   /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    //   'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character',
    // ],
  },
  verifyCode: {
    type: String,
    required: [true, 'Verify Code is Required'],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, 'Verify Code Expiry is Required'],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessage: {
    type: Boolean,
    default: true,
  },
  messages: {
    type: [MessageSchema],
    default: [],
  },
});

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>('User', UserSchema);

export default UserModel;
