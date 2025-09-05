import { ThemeToggle } from "../components/theme-toggle";
import { 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Box, 
  AppBar, 
  Toolbar,
  Paper,
  Chip
} from "@mui/material";
import { Add, Favorite, Share } from "@mui/icons-material";
import { useTranslations } from "next-intl";
export default function Home() {
  const t = useTranslations();
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
           {t('hello')}
          </Typography>
          <ThemeToggle />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to Next.js + MUI + Next Themes! 🎨
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            This app demonstrates the integration of Material-UI components with next-themes for seamless light/dark mode switching.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  MUI Components
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Here are some Material-UI components that automatically adapt to your theme:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip label="Primary" color="primary" />
                  <Chip label="Secondary" color="secondary" />
                  <Chip label="Success" color="success" />
                  <Chip label="Error" color="error" />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button variant="contained" startIcon={<Add />} sx={{ color: 'white' }}>
                    Add Item
                  </Button>
                  <Button variant="outlined" startIcon={<Favorite />}>
                    Like
                  </Button>
                  <Button variant="text" startIcon={<Share />}>
                    Share
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Theme Features
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Automatic light/dark mode switching
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • System preference detection
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Consistent colors across Tailwind and MUI
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Smooth theme transitions
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
