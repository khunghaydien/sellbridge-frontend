"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePages } from '../hooks';
import { useAuth } from '@/hooks/use-auth';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, Grid, Button, Checkbox } from '@mui/material';
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
    hasPages,
    clearPagesError,
    selectedPageIds,
    toggleSelectPage,
    setSelectedPages,
  } = usePages();

  const handleToggleSelect = (pageId: string) => {
    toggleSelectPage(pageId);
  };

  const handleGoMessages = () => {
    // Route to inbox page; inbox will use selectedPageIds from Redux
    router.push(`/inbox`);
  };

  const handleGoCreatePost = () => {
    if (selectedPageIds.length === 0) {
      alert('Please select at least one page to create a post');
      return;
    }
    if (selectedPageIds.length > 1) {
      alert('Please select only one page to create a post');
      return;
    }
    // Route to post page; CreatePost will use the single selected page
    router.push(`/post`);
  };

  // Fetch pages khi component mount và đã authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadPages();
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
        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={() => loadPages()}>
            Refresh
          </Button>
          <Button variant="contained" onClick={handleGoMessages}>
            Inbox
          </Button>
          <Button variant="contained" color="secondary" onClick={handleGoCreatePost}>
            Create Post
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {pages.map((page: any) => (
          <Grid item xs={12} sm={6} md={4} key={page.id}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: selectedPageIds.includes(page.id) ? '2px solid' : '1px solid',
                borderColor: selectedPageIds.includes(page.id) ? 'primary.main' : 'divider',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
              onClick={() => handleToggleSelect(page.id)}
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
                <Box mt={1} display="flex" alignItems="center" gap={1}>
                  <Checkbox
                    checked={selectedPageIds.includes(page.id)}
                    onChange={() => handleToggleSelect(page.id)}
                    onClick={(e) => e.stopPropagation()}
                    size="small"
                  />
                  <Typography variant="caption" color="textSecondary">
                    {selectedPageIds.includes(page.id) ? 'Selected' : 'Click to select'}
                  </Typography>
                </Box>
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
                
                {/* No per-item action buttons; selection only */}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedPageIds.length > 0 && (
        <Box mt={4} p={3} bgcolor="background.paper" borderRadius={2} boxShadow={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">
              Selected Pages ({selectedPageIds.length})
            </Typography>
            <Box display="flex" gap={1}>
              <Button 
                variant="contained"
                size="small"
                onClick={handleGoCreatePost}
                disabled={selectedPageIds.length !== 1}
              >
                Create Post {selectedPageIds.length !== 1 && `(${selectedPageIds.length} selected)`}
              </Button>
              <Button 
                variant="outlined"
                size="small"
                onClick={handleGoMessages}
              >
                Messages
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => setSelectedPages([])}
              >
                Deselect All
              </Button>
            </Box>
          </Box>
          
          <Grid container spacing={2}>
            {selectedPageIds.map((pageId) => {
              const page = pages.find(p => p.id === pageId);
              if (!page) return null;
              
              return (
                <Grid item xs={12} md={6} key={pageId}>
                  <Box p={2} border={1} borderColor="divider" borderRadius={1}>
                    <Typography variant="h6" gutterBottom>
                      {page.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <strong>ID:</strong> {page.id}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <strong>Category:</strong> {page.category}
                    </Typography>
                    {page.tasks && page.tasks.length > 0 && (
                      <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
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
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
    </Box>
  );
}

