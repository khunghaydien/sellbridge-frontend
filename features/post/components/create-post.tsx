"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Tabs, 
  Tab, 
  FormControlLabel, 
  Checkbox,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import { PostService } from "../services";
import { usePages } from "@/features/page/hooks";

interface CreatePostProps {
  pageId: string;
}

type PostType = 'text' | 'photo-url' | 'photo-upload';

export default function CreatePost({ pageId }: CreatePostProps) {
  const router = useRouter();
  const { pages } = usePages();
  const currentPage = pages.find(p => p.id === pageId);

  const [postType, setPostType] = useState<PostType>('text');
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [published, setPublished] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setPhotoFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPage?.access_token) {
      setError('Page access token not found');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let result;

      switch (postType) {
        case 'text':
          if (!message.trim()) {
            setError('Message is required');
            setIsLoading(false);
            return;
          }
          result = await PostService.createPost({
            pageId,
            message: message.trim(),
            pageAccessToken: currentPage.access_token,
            link: link.trim() || undefined,
            published,
          });
          break;

        case 'photo-url':
          if (!photoUrl.trim()) {
            setError('Photo URL is required');
            setIsLoading(false);
            return;
          }
          result = await PostService.createPhotoPost({
            pageId,
            caption: caption.trim(),
            url: photoUrl.trim(),
            pageAccessToken: currentPage.access_token,
            published,
          });
          break;

        case 'photo-upload':
          if (!photoFile) {
            setError('Please select a photo to upload');
            setIsLoading(false);
            return;
          }
          result = await PostService.uploadPhotoPost({
            pageId,
            photo: photoFile,
            caption: caption.trim() || undefined,
            pageAccessToken: currentPage.access_token,
            published,
          });
          break;
      }

      console.log('Post created successfully:', result);
      setSuccess('Post created successfully!');
      
      // Reset form
      setTimeout(() => {
        setMessage("");
        setLink("");
        setPhotoUrl("");
        setPhotoFile(null);
        setCaption("");
        setSuccess(null);
      }, 2000);

    } catch (error: any) {
      console.error('Error creating post:', error);
      setError(error.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentPage) {
    return (
      <Box p={4}>
        <Alert severity="warning">
          Page not found. Please go back and select a page.
        </Alert>
        <Button variant="outlined" onClick={() => router.push('/')} sx={{ mt: 2 }}>
          Back to Pages
        </Button>
      </Box>
    );
  }

  return (
    <Box p={4} maxWidth="800px" mx="auto">
      {/* Header */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <div>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Create Post
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Post to: {currentPage.name}
          </Typography>
        </div>
        <Button variant="outlined" onClick={() => router.back()}>
          Back
        </Button>
      </Box>

      {/* Post Type Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs 
            value={postType} 
            onChange={(_, newValue) => setPostType(newValue)}
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Text Post" value="text" />
            <Tab label="Photo from URL" value="photo-url" />
            <Tab label="Upload Photo" value="photo-upload" />
          </Tabs>

          <form onSubmit={handleSubmit}>
            {/* Text Post */}
            {postType === 'text' && (
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Message"
                  multiline
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  required
                  fullWidth
                />
                <TextField
                  label="Link (Optional)"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://example.com"
                  fullWidth
                />
              </Box>
            )}

            {/* Photo from URL */}
            {postType === 'photo-url' && (
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Photo URL"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  required
                  fullWidth
                />
                <TextField
                  label="Caption"
                  multiline
                  rows={4}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption with hashtags..."
                  fullWidth
                />
                {/* Preview */}
                {photoUrl && (
                  <Box mt={2}>
                    <Typography variant="caption" color="textSecondary" gutterBottom display="block">
                      Preview:
                    </Typography>
                    <img 
                      src={photoUrl} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '300px',
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        setError('Invalid image URL');
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}

            {/* Upload Photo */}
            {postType === 'photo-upload' && (
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ py: 2 }}
                >
                  {photoFile ? photoFile.name : 'Choose Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                </Button>
                
                {photoFile && (
                  <Box>
                    <Typography variant="caption" color="textSecondary" gutterBottom display="block">
                      Preview:
                    </Typography>
                    <img 
                      src={URL.createObjectURL(photoFile)} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '300px',
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                )}

                <TextField
                  label="Caption"
                  multiline
                  rows={4}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption with hashtags..."
                  fullWidth
                />
              </Box>
            )}

            {/* Published Checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
              }
              label="Publish immediately"
              sx={{ mt: 2 }}
            />

            {/* Error/Success Messages */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}

            {/* Submit Button */}
            <Box mt={3} display="flex" gap={2}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoading}
                sx={{ py: 1.5 }}
              >
                {isLoading ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Creating Post...</span>
                  </Box>
                ) : (
                  'Create Post'
                )}
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.back()}
                disabled={isLoading}
                sx={{ py: 1.5, minWidth: 100 }}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tips:
          </Typography>
          <Typography variant="body2" color="textSecondary" component="div">
            <ul style={{ paddingLeft: '20px' }}>
              <li><strong>Text Post:</strong> Create a text post with optional link</li>
              <li><strong>Photo from URL:</strong> Post a photo from an external URL</li>
              <li><strong>Upload Photo:</strong> Upload and post a photo from your device (max 5MB)</li>
              <li><strong>Publish:</strong> Uncheck to save as draft</li>
            </ul>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}



