"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createTheme } from '@mui/material/styles'
import { useTheme } from 'next-themes'
const getcomponent = (isDark: boolean) => ({
  MuiOutlinedInput: {
    styleOverrides: {
      input: {
        height: "50px",
        padding: "0 12px",
      },
      root: {
        borderRadius: 8,
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: isDark ? "hsl(20, 5.9%, 90%)" : "hsl(20, 5.9%, 90%)",
        },
        "&:hover": {
          "& .MuiOutlinedInput-notchedOutline": {
            border: `1px solid ${isDark ? "hsl(20, 5.9%, 90%)" : "hsl(20, 5.9%, 90%)"}`,
          },
        },
        "&.Mui-focused": {
          "& .MuiOutlinedInput-notchedOutline": {
            border: `1px solid ${isDark ? "hsl(20, 5.9%, 90%)" : "hsl(20, 5.9%, 90%)"}`,
          },
        },
      },
    },
  },
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "16px",
          fontWeight: 600,
          height: "50px",
          borderRadius: 8,
          textTransform: "none" as const,
        },
        containedPrimary: {
          color: "#ffffff !important",
          "&:hover": {
            color: "#ffffff !important",
          },
          "&:focus": {
            color: "#ffffff !important",
          },
          "&:active": {
            color: "#ffffff !important",
          },
        },
      },
    },
  MuiTabs: {
    styleOverrides: {
      root: {
        borderBottom: "none",
      },
      indicator: {
        backgroundColor: isDark ? "hsl(20.5, 90.2%, 48.2%)" : "hsl(24.6, 95%, 53.1%)",
        height: 2,
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: "none" as const,
        fontSize: "16px",
        fontWeight: 500,
        color: isDark ? "hsl(24, 5.4%, 63.9%)" : "hsl(25, 5.3%, 44.7%)",
        "&.Mui-selected": {
          color: isDark ? "hsl(60, 9.1%, 97.8%)" : "hsl(20, 14.3%, 4.1%)",
          fontWeight: 600,
        },
        "&:hover": {
          color: isDark ? "hsl(20.5, 90.2%, 48.2%)" : "hsl(24.6, 95%, 53.1%)",
        },
      },
    },
  },
  MuiCheckbox: {
    styleOverrides: {
      root: {
        color: isDark ? "hsl(24, 5.4%, 63.9%)" : "hsl(25, 5.3%, 44.7%)",
        "&.Mui-checked": {
          color: isDark ? "hsl(20.5, 90.2%, 48.2%)" : "hsl(24.6, 95%, 53.1%)",
        },
        "&:hover": {
          backgroundColor: isDark ? "hsl(20.5, 90.2%, 48.2%, 0.1)" : "hsl(24.6, 95%, 53.1%, 0.1)",
        },
      },
    },
  },
  MuiFormControlLabel: {
    styleOverrides: {
      label: {
        fontSize: "14px",
        color: isDark ? "hsl(60, 9.1%, 97.8%)" : "hsl(20, 14.3%, 4.1%)",
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: {
        textDecoration: "none",
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        width: "40px",
        height: "40px",
        borderRadius: "8px",
        transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        color: isDark ? "hsl(24, 5.4%, 63.9%)" : "hsl(25, 5.3%, 44.7%)",
        "&:hover": {
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          color: isDark ? "hsl(60, 9.1%, 97.8%)" : "hsl(20, 14.3%, 4.1%)",
          transform: "scale(1.05)",
        },
        "&.Mui-selected, &[aria-pressed='true']": {
          backgroundColor: isDark ? "hsl(20.5, 90.2%, 48.2%)" : "hsl(24.6, 95%, 53.1%)",
          color: "#ffffff",
          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          transform: "scale(1.05)",
          "&:hover": {
            backgroundColor: isDark ? "hsl(20.5, 90.2%, 48.2%)" : "hsl(24.6, 95%, 53.1%)",
            color: "#ffffff",
          },
        },
        // Custom size variants
        "&.MuiIconButton-sizeSmall": {
          width: "32px",
          height: "32px",
          "& .MuiSvgIcon-root": {
            fontSize: "1.25rem",
          },
        },
        "&.MuiIconButton-sizeLarge": {
          width: "48px",
          height: "48px",
          "& .MuiSvgIcon-root": {
            fontSize: "2rem",
          },
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: isDark ? "hsl(60, 9.1%, 97.8%)" : "hsl(20, 14.3%, 4.1%)",
        color: isDark ? "hsl(20, 14.3%, 4.1%)" : "hsl(60, 9.1%, 97.8%)",
        fontSize: "0.75rem",
        fontWeight: 400,
        padding: "4px 8px",
        borderRadius: "4px",
        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        maxWidth: "none",
        whiteSpace: "nowrap",
      },
      arrow: {
        color: isDark ? "hsl(60, 9.1%, 97.8%)" : "hsl(20, 14.3%, 4.1%)",
      },
    },
  },
})

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
  components: getcomponent(false),
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
  components: getcomponent(true),
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