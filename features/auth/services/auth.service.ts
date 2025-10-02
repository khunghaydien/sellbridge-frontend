import { publicApi } from "@/services";

// Authentication service functions
export class AuthService {
    static async signUp(userData: {
        email: string;
        password: string;
    }) {
        try {
            const response = await publicApi.post("/auth/sign-up", userData);
            return response.data;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    static async signIn(userData: {
        email: string;
        password: string;
    }) {
        try {
            const response = await publicApi.post("/auth/sign-in", userData);
            return response.data;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    static async googleSignIn() {
        try {
            const response = await publicApi.get("/auth/google/url");
            return response.data;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    static async facebookSignIn() {
        try {
            const response = await publicApi.get("/auth/facebook/url");
            return response.data;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    static async forgotPassword(email: string) {
        try {
            const response = await publicApi.post("/auth/forgot-password", { email });
            return response.data;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    static async changePassword(data: {
        currentPassword: string;
        newPassword: string;
    }) {
        try {
            const response = await publicApi.post("/auth/change-password", data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    static async signOut() {
        try {
            const response = await publicApi.post("/auth/sign-out");
            return response.data;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    static async getMe() {
        try {
            const response = await publicApi.get("/auth/me");
            return response.data;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}
