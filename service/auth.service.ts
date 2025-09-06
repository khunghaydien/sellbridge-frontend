import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt, { JwtPayload } from "jsonwebtoken";
import { authApiClient } from "./api.service";

declare module "next-auth" {
    interface JWT {
        sub?: string;
        name?: string;
        email?: string;
        image?: string;
        iat?: number;
        exp?: number;
        [key: string]: any;
    }

    interface Session {
        user: {
            name?: string;
            email?: string;
            image?: string;
            id?: string;
        };
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID as string,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
            authorization: {
                params: {
                    scope: "pages_read_user_content,pages_show_list"
                }
            }
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const response = await authApiClient.post("/auth/sign-in", {
                        email: credentials.email,
                        password: credentials.password,
                    });

                    const user = response.data;
                    if (user?.id) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            image: user.image,
                        };
                    }
                    return null;
                } catch (error) {
                    console.error("Credentials sign-in error:", error);
                    return null;
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
        encode: async ({ token, secret }) => {
            return jwt.sign(token!, secret, {
                algorithm: "HS256",
            });
        },
        decode: async ({ token, secret }) => {
            if (!token) return null;
            try {
                return jwt.verify(token, secret, {
                    algorithms: ["HS256"],
                }) as JwtPayload;
            } catch (error) {
                return null;
            }
        },
    },
    callbacks: {
        // async signIn({ user, account }) {
        //     if (account?.provider === "credentials") {
        //         // For credentials, user is already authenticated in authorize function
        //         return true;
        //     }

        //     // For OAuth providers (Google, Facebook)
        //     if (user) {
        //         try {
        //             const response = await authApiClient.post("/auth/authorization-sign-in", {
        //                 name: user.name,
        //                 email: user.email,
        //                 image: user.image,
        //                 provider: account?.provider,
        //             });

        //             return !!response?.data?.id;
        //         } catch (error) {
        //             console.error("Authorization sign-in error:", error);
        //             return false;
        //         }
        //     }
        //     return false;
        // },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.sub;
            }
            return session;
        },
    },
    pages: {
        signIn: "/authentication",
        error: "/authentication",
    },
};

// Authentication service functions
export class AuthService {
    static async signUp(userData: {
        email: string;
        password: string;
    }) {
        try {
            const response = await authApiClient.post("/auth/sign-up", userData);
            return response.data;
        } catch (error: any) {
            throw new Error(error.message || "Sign up failed");
        }
    }

    static async forgotPassword(email: string) {
        try {
            const response = await authApiClient.post("/auth/forgot-password", { email });
            return response.data;
        } catch (error: any) {
            throw new Error(error.message || "Failed to send reset email");
        }
    }

    static async changePassword(data: {
        currentPassword: string;
        newPassword: string;
    }) {
        try {
            const response = await authApiClient.post("/auth/change-password", data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.message || "Failed to change password");
        }
    }
}
