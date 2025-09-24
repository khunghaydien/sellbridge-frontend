import NextAuth from "next-auth";
import { authOptions } from "@/features/auth/services/next-auth.service";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
