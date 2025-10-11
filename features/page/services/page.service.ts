import { authApi } from "@/services";

// Page service functions
export class PageService {
    /**
     * Get list of Facebook pages
     */
    static async listPages() {
        try {
            console.log('PageService.listPages called');
            const response = await authApi.get("/facebook/pages");
            console.log('PageService.listPages response:', response);
            return response.data;
        } catch (error: any) {
            console.error('PageService.listPages error:', error);
            throw new Error(error.message);
        }
    }
}

