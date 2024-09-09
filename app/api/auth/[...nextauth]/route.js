import connectMongoDB from "@lib/mongodb.mjs";
import User from "@models/user.mjs";
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {},

            async authorize(credentials) {
                const { email, password } = credentials;

                try {
                    await connectMongoDB();
                    const user = await User.findOne({ email });

                    if (!user) {
                        console.log("No user found with email:", email);
                        return null;
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (!passwordsMatch) {
                        console.log("Password does not match for user:", email);
                        return null;
                    }

                    return user;
                } catch (error) {
                    console.log("Error in authorize function:", error);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/sign-in",
    },
    callbacks: {
        async jwt({ token, user }) {
            // If it's the first time signing in, add the user id to the token
            if (user) {
                token.id = user.id;
                token.admin = user.admin
                // console.log("JWT callback - user added to token:", token);
            } else {
                // console.log("JWT callback - existing token:", token);
            }
            return token;
        },
        async session({ session, token }) {
            // Include the user id in the session
            if (token) {
                session.user.id = token.id;
                session.user.admin = token.admin;
                // console.log("Session callback - session updated:", session);
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };