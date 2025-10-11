"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePages } from '../hooks';
import { useAuth } from '@/hooks/use-auth';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, Grid, Button } from '@mui/material';
import { useTranslations } from 'next-intl';

export default function PageList() {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { 
    pages, 
    isLoading, 
    error, 
    loadPages,
    selectPage,
    selectedPage,
    hasPages,
    clearPagesError
  } = usePages();

  const handlePageClick = (pageId: string) => {
    console.log('Page clicked:', pageId);
    selectPage(pageId);
    // Small delay to ensure state is updated
    setTimeout(() => {
      router.push(`/page/${pageId}`);
    }, 100);
  };

  const handleCreatePost = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    console.log('Create post clicked for page:', pageId);
    selectPage(pageId);
    router.push(`/page/${pageId}/create-post`);
  };

  // Fetch pages khi component mount và đã authenticated
  useEffect(() => {
    console.log('PageList mounted');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('authLoading:', authLoading);
    
    if (!authLoading && isAuthenticated) {
      console.log('Calling loadPages...');
      loadPages();
    } else {
      console.log('Skipping loadPages - not ready yet');
    }
  }, [isAuthenticated, authLoading]);

  // Auth loading state
  if (authLoading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        alignItems="center" 
        justifyContent="center" 
        minHeight="400px"
        gap={2}
      >
        <CircularProgress />
        <Typography color="textSecondary">
          Authenticating...
        </Typography>
      </Box>
    );
  }

  // Check if not authenticated
  if (!isAuthenticated) {
    return (
      <Box p={4}>
        <Alert severity="warning">
          You need to be logged in to view Facebook pages. Please login first.
        </Alert>
      </Box>
    );
  }

  // Pages loading state
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        alignItems="center" 
        justifyContent="center" 
        minHeight="400px"
        gap={2}
      >
        <CircularProgress />
        <Typography color="textSecondary">
          Loading pages...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box p={4}>
        <Alert 
          severity="error" 
          onClose={clearPagesError}
          action={
            <Button color="inherit" size="small" onClick={() => loadPages()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Empty state
  if (!hasPages) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        alignItems="center" 
        justifyContent="center" 
        minHeight="400px"
        gap={2}
        p={4}
      >
        <Typography variant="h6" color="textSecondary">
          No Facebook pages found
        </Typography>
        <Button variant="contained" onClick={() => loadPages()}>
          Refresh
        </Button>
      </Box>
    );
  }

  return (
    <Box p={4} maxWidth="1200px" width="100%">
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h1" fontWeight="bold">
          Facebook Pages
        </Typography>
        <Button variant="outlined" onClick={() => loadPages()}>
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        {pages.map((page: any) => (
          <Grid item xs={12} sm={6} md={4} key={page.id}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: selectedPage?.id === page.id ? '2px solid primary.main' : '1px solid',
                borderColor: selectedPage?.id === page.id ? 'primary.main' : 'divider',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
              onClick={() => handlePageClick(page.id)}
            >
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom noWrap>
                  {page.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {page.category}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                  ID: {page.id}
                </Typography>
                {page.tasks && page.tasks.length > 0 && (
                  <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
                    {page.tasks.slice(0, 3).map((task: string) => (
                      <Typography
                        key={task}
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.25,
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          borderRadius: 1,
                          fontSize: '0.65rem',
                        }}
                      >
                        {task}
                      </Typography>
                    ))}
                    {page.tasks.length > 3 && (
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.25,
                          bgcolor: 'grey.300',
                          borderRadius: 1,
                          fontSize: '0.65rem',
                        }}
                      >
                        +{page.tasks.length - 3}
                      </Typography>
                    )}
                  </Box>
                )}
                
                {/* Action Buttons */}
                <Box mt={2} display="flex" gap={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePageClick(page.id);
                    }}
                    fullWidth
                  >
                    Messages
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={(e) => handleCreatePost(page.id, e)}
                    fullWidth
                  >
                    Create Post
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedPage && (
        <Box mt={4} p={3} bgcolor="background.paper" borderRadius={2} boxShadow={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">
              Selected Page
            </Typography>
            <Box display="flex" gap={1}>
              <Button 
                variant="contained"
                size="small"
                onClick={() => router.push(`/page/${selectedPage.id}/create-post`)}
              >
                Create Post
              </Button>
              <Button 
                variant="outlined"
                size="small"
                onClick={() => router.push(`/page/${selectedPage.id}`)}
              >
                Messages
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => selectPage(null)}
              >
                Deselect
              </Button>
            </Box>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {selectedPage.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>ID:</strong> {selectedPage.id}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Category:</strong> {selectedPage.category}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="body1" gutterBottom>
                <strong>Tasks:</strong>
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                {selectedPage.tasks.map((task: string) => (
                  <Typography
                    key={task}
                    variant="body2"
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      borderRadius: 1,
                      fontSize: '0.75rem',
                    }}
                  >
                    {task}
                  </Typography>
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary" sx={{ 
                wordBreak: 'break-all',
                fontSize: '0.7rem',
                mt: 1,
                p: 1,
                bgcolor: 'grey.100',
                borderRadius: 1,
              }}>
                <strong>Access Token:</strong> {selectedPage.access_token}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
}

