"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { IconButton, Tooltip } from "@mui/material"
import IconMoon from "@/icons/icon-moon"
import IconSun from "@/icons/icon-sun"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <IconButton size="large"><IconMoon /></IconButton>
  }

  return (
    <Tooltip title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}>
      <IconButton
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        color="inherit"
        size="large"
      >
        {theme === "light" ? <IconMoon /> : <IconSun />}
      </IconButton>
    </Tooltip>
  )
}