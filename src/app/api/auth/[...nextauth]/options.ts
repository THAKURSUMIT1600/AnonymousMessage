import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User.model';
import bcrypt from 'bcryptjs';
import GoogleProvider from 'next-auth/providers/google';

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

          token._id = existingUser._id.toString();
          token.isVerified = existingUser.isVerified;
          token.isAcceptingMessage = existingUser.isAcceptingMessage;
          token.username = existingUser.username;
        } else {
          token._id = user.id;
          token.isVerified = user.isVerified;
          token.isAcceptingMessage = user.isAcceptingMessage;
          token.username = user.username;
        }
      }

      return token;
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
