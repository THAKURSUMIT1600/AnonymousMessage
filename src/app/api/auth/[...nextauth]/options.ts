import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User.model';
import bcrypt from 'bcryptjs';
import GoogleProvider from 'next-auth/providers/google';
import mongoose, { Types } from 'mongoose';

// Custom JWT Token type definition
interface CustomJWT extends JWT {
  _id?: string;
  isVerified?: boolean;
  isAcceptingMessage?: boolean;
  username?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email/Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.email || !credentials.password) {
          throw new Error('Email and password are required');
        }

        try {
          const user = await UserModel.findOne({ email: credentials.email })
            .select('+password')
            .lean();

          if (!user) {
            throw new Error('No user found with this email/username');
          }

          if (!user.isVerified) {
            throw new Error('Please verify your account first');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error('Incorrect password');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            isVerified: user.isVerified,
            isAcceptingMessage: user.isAcceptingMessage,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw new Error('Authentication failed');
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessage = token.isAcceptingMessage;
        session.user.username = token.username;
      }
      return session;
    },

    async jwt({ token, user, account }) {
      await dbConnect();

      // Explicitly type the token as CustomJWT
      const customToken = token as CustomJWT;

      if (user) {
        if (account?.provider === 'google') {
          let existingUser = await UserModel.findOne({ email: user.email });

          if (!existingUser) {
            existingUser = await UserModel.create({
              email: user.email,
              username: user.username,
              isVerified: true,
              isAcceptingMessage: true,
            });
          }

          // Ensure _id is properly casted to string
          customToken._id =
            existingUser._id instanceof mongoose.Types.ObjectId
              ? existingUser._id.toString()
              : String(existingUser._id);

          customToken.isVerified = existingUser.isVerified;
          customToken.isAcceptingMessage = existingUser.isAcceptingMessage;
          customToken.username = existingUser.username;
        } else {
          // For credentials provider, handle user.id properly
          customToken._id = user.id ? String(user.id) : undefined;
          customToken.isVerified = user.isVerified;
          customToken.isAcceptingMessage = user.isAcceptingMessage;
          customToken.username = user.username;
        }
      }

      // Return the token without explicit casting
      return customToken;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXT_AUTH_SECRET,
};
