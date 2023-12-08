import NextAuth from "next-auth"
import type {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  debug: true,
  session: {strategy: "jwt"},
  providers: [
    CredentialsProvider({

      name: "Log in",

      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add logic here to look up the user from the credentials supplied
        const user = { id: "1", name: "Narumiya", password: "Narumiya" }
       
        if (user.name === credentials?.username && user.password === credentials?.password) {
          console.log("OK");
          return {id: user.id, name: user.name, email: user.password, role: "admin"};
        } else {
          console.log("NG");
          return Promise.resolve(null);
        }
      }
    })

  ],
  /*
  callbacks: {
    jwt: async ({token, user, account, profile, isNewUser}) => {
        // 注意: トークンをログ出力してはダメです。
        console.log('in jwt', {user, token, account, profile})

        if (user) {
            token.user = user;
            const u = user as any
            token.role = u.role;
        }
        if (account) {
            token.accessToken = account.access_token
        }
        return token;
    },
    session: ({session, token}) => {
        console.log("in session", {session, token});
        token.accessToken
        return {
            ...session,
            user: {
                ...session.user,
                role: token.role,
            },
        };
    },
  },*/
  pages: {
    signIn: '/login',
  },
}

export default NextAuth(authOptions)