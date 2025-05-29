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
          console.log(error);
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
            // Generate random values for required fields since Google login doesn't provide password/verifyCode
            const randomPassword = bcrypt.hashSync(Math.random().toString(36), 10); // hash a random string
            const verifyCode = Math.floor(100000 + Math.random() * 900000).toString(); // e.g., 6-digit code
            const verifyCodeExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

            existingUser = await UserModel.create({
              email: user.email,
              username: user.name?.replace(/\s+/g, '').toLowerCase() || `user${Date.now()}`,
              password: randomPassword,
              verifyCode,
              verifyCodeExpiry,
              isVerified: true, // Google verified
              isAcceptingMessage: true,
              messages: [], // optional field
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
