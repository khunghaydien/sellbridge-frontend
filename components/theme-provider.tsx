"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createTheme } from '@mui/material/styles'
import { useTheme } from 'next-themes'
const components = {
}
// Create light theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'hsl(24.6, 95%, 53.1%)', // --primary from globals.css
    },
    secondary: {
      main: 'hsl(60, 4.8%, 95.9%)', // --secondary from globals.css
    },
    background: {
      default: 'hsl(0, 0%, 100%)', // --background from globals.css
      paper: 'hsl(0, 0%, 100%)', // --card from globals.css
    },
    text: {
      primary: 'hsl(20, 14.3%, 4.1%)', // --foreground from globals.css
      secondary: 'hsl(25, 5.3%, 44.7%)', // --muted-foreground from globals.css
    },
    divider: 'hsl(20, 5.9%, 90%)', // --border from globals.css
    error: {
      main: 'hsl(0, 84.2%, 60.2%)', // --destructive from globals.css
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans)',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
  },
  shape: {
    borderRadius: 8, // Matches --radius: 0.5rem
  },
  components: components,
})

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: 'hsl(20.5, 90.2%, 48.2%)', // --primary dark from globals.css
    },
    secondary: {
      main: 'hsl(12, 6.5%, 15.1%)', // --secondary dark from globals.css
    },
    background: {
      default: 'hsl(20, 14.3%, 4.1%)', // --background dark from globals.css
      paper: 'hsl(20, 14.3%, 4.1%)', // --card dark from globals.css
    },
    text: {
      primary: 'hsl(60, 9.1%, 97.8%)', // --foreground dark from globals.css
      secondary: 'hsl(24, 5.4%, 63.9%)', // --muted-foreground dark from globals.css
    },
    divider: 'hsl(12, 6.5%, 15.1%)', // --border dark from globals.css
    error: {
      main: 'hsl(0, 72.2%, 50.6%)', // --destructive dark from globals.css
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans)',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
  },
  shape: {
    borderRadius: 8,
  },
  components: components,
})

// Internal MUI Theme Provider Component
function MuiThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a theme provider with default theme to avoid hydration mismatch
    return (
      <MuiThemeProvider theme={lightTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    )
  }

  // Determine which theme to use
  const currentTheme = theme === 'system' ? systemTheme : theme
  const muiTheme = currentTheme === 'dark' ? darkTheme : lightTheme

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}

// Main Theme Provider that combines Next Themes and MUI
export function ThemeProvider({ children, ...props }: any) {
  return (
    <NextThemesProvider {...props}>
      <MuiThemeWrapper>
        {children}
      </MuiThemeWrapper>
    </NextThemesProvider>
  )
}