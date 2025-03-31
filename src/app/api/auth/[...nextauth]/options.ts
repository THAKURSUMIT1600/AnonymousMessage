import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User.model';
import bcrypt from 'bcryptjs';
import { User } from '@/model/User.model';
import GoogleProvider from 'next-auth/providers/google';
export interface Credentials {
  email: string; // The user can log in using email or username
  password: string;
}
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text ' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [{ email: credentials.identifier }, { username: credentials.identifier }],
          });
          if (!user) {
            throw new Error('No User Found');
          }
          if (!user.isVerified) {
            throw new Error('Please Verify Your Password ');
          }
          console.log(user);
          const passwordCorrect = await bcrypt.compare(credentials.password, user.password);
          if (passwordCorrect) {
            return user;
          }
          throw new Error('Incorrect Password');
        } catch (error) {
          throw new Error(error);
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
      console.log('JWT Callback - User:', user);
      console.log('JWT Callback - Token before update:', token);

      if (user) {
        console.log('JWT - Processing User:', user);

        if (account?.provider === 'google') {
          let existingUser = await UserModel.findOne({ email: user.email });
          console.log('JWT - Existing Google User:', existingUser);

          if (!existingUser) {
            existingUser = await UserModel.create({
              email: user.email,
              username: user.email.split('@')[0], // Generate a username
              isVerified: true,
              isAcceptingMessage: true,
            });
            console.log('JWT - New Google User Created:', existingUser);
          }

          token.sub = existingUser._id.toString();
          token._id = existingUser._id.toString();
          token.isVerified = existingUser.isVerified;
          token.isAcceptingMessage = existingUser.isAcceptingMessage;
          token.username = existingUser.username;
        } else {
          console.log('JWT - Credentials User Found:', user);

          token._id = user._id?.toString();
          token.sub = user._id.toString();
          token.isVerified = user.isVerified;
          token.isAcceptingMessage = user.isAcceptingMessage;
          token.username = user.username;
        }
      }

      console.log('JWT Callback - Token after update:', token);
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
