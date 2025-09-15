"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { IconButton, Tooltip } from "@mui/material"
import { Brightness4, Brightness7 } from "@mui/icons-material"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <IconButton size="large"><Brightness7 /></IconButton>
  }

  return (
    <Tooltip title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}>
      <IconButton
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        color="inherit"
        size="large"
      >
        {theme === "light" ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  )
}