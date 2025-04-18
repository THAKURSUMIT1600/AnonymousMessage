import mongoose, { Schema, Document } from 'mongoose';
export interface Message extends Document {
  content: string;
  createdAt: Date;
}
export const MessageSchema: Schema<Message> = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});
