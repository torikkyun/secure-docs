import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              googleId: account?.providerAccountId,
              avatarUrl: user.image,
            }),
          }
        );
        console.log(response);
      } catch (err) {
        return false;
      }
      return true;
    },
  },
});

export { handler as GET, handler as POST };
