// Authentication service functions
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;
export class AuthService {
    static async signUp(userData: {
        email: string;
        password: string;
    }) {
        try {
            const response = await fetch(`${BASE_URL}/auth/sign-up`, {
                method: "POST",
                body: JSON.stringify(userData),
            });
            return response.json();
        } catch (error: any) {
            throw new Error(error.message || "Sign up failed");
        }
    }
    static async forgotPassword(email: string) {
        try {
            const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
                method: "POST",
                body: JSON.stringify({ email }),
            });
            return response.json();
        } catch (error: any) {
            throw new Error(error.message || "Failed to send reset email");
        }
    }
    static async changePassword(data: {
        currentPassword: string;
        newPassword: string;
    }) {
        try {
            const response = await fetch(`${BASE_URL}/auth/change-password`, {
                method: "POST",
                body: JSON.stringify(data),
            });
            return response.json();
        } catch (error: any) {
            throw new Error(error.message || "Failed to change password");
        }
    }
}
