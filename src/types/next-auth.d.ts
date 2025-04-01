declare module 'next-auth' {
  interface User {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessage?: boolean;
    username?: string;
  }
  interface Session {
    user: DefaultUser & {
      _id: string;
      isVerified: boolean;
      isAcceptingMessage: boolean;
      username: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessage?: boolean;
    username?: string;
  }
}
