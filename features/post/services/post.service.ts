import { authApi } from "@/services";

export interface CreatePostParams {
  pageId: string;
  message: string;
  pageAccessToken: string;
  link?: string;
  published?: boolean;
}

export interface CreatePhotoPostParams {
  pageId: string;
  caption: string;
  url: string;
  pageAccessToken: string;
  published?: boolean;
}

export interface UploadPhotoPostParams {
  pageId: string;
  photo: File;
  caption?: string;
  published?: boolean;
  pageAccessToken: string;
}

export class PostService {
  /**
   * Create a text/link post on Facebook Page feed
   */
  static async createPost(params: CreatePostParams) {
    try {
      const { pageId, message, pageAccessToken, link, published = true } = params;
      
      console.log('PostService.createPost called with:', { pageId, message, link });
      
      const response = await authApi.post(
        `/facebook/pages/${pageId}/feed`,
        {
          message,
          pageAccessToken,
          ...(link && { link }),
          published: published.toString(),
        }
      );
      
      console.log('PostService.createPost response:', response);
      return response.data;
    } catch (error: any) {
      console.error('PostService.createPost error:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Create a photo post from URL
   */
  static async createPhotoPost(params: CreatePhotoPostParams) {
    try {
      const { pageId, caption, url, pageAccessToken, published = true } = params;
      
      console.log('PostService.createPhotoPost called with:', { pageId, caption, url });
      
      const response = await authApi.post(
        `/facebook/pages/${pageId}/photos`,
        {
          caption,
          url,
          pageAccessToken,
          published: published.toString(),
        }
      );
      
      console.log('PostService.createPhotoPost response:', response);
      return response.data;
    } catch (error: any) {
      console.error('PostService.createPhotoPost error:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Upload and create a photo post
   */
  static async uploadPhotoPost(params: UploadPhotoPostParams) {
    try {
      const { pageId, photo, caption, published = true, pageAccessToken } = params;
      
      console.log('PostService.uploadPhotoPost called with:', { pageId, caption, fileName: photo.name });
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('photo', photo);
      formData.append('pageAccessToken', pageAccessToken);
      if (caption) formData.append('caption', caption);
      formData.append('published', published.toString());
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3030'}/facebook/pages/${pageId}/photos/upload`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload photo');
      }
      
      console.log('PostService.uploadPhotoPost response:', data);
      return data;
    } catch (error: any) {
      console.error('PostService.uploadPhotoPost error:', error);
      throw new Error(error.message);
    }
  }
}



