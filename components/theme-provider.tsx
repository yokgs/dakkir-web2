"use client"

/**
 * Theme Provider Component
 * 
 * Provides theme context and functionality for the application,
 * allowing components to access and change the current theme.
 */

// Type imports
import type React from "react"

// React imports
import { createContext, useContext, useEffect, useState } from "react"

/**
 * Theme Type
 * 
 * Represents the available theme options: dark, light, or system (auto).
 */
type Theme = "dark" | "light" | "system"

/**
 * ThemeProviderProps Interface
 * 
 * @property children - The child components to be wrapped by the provider
 * @property defaultTheme - The default theme to use if none is stored
 * @property storageKey - The key to use for storing the theme preference in localStorage
 */
type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

/**
 * ThemeProviderState Interface
 * 
 * @property theme - The current theme
 * @property setTheme - Function to update the theme
 */
type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

/**
 * Initial state for the theme context
 */
const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

/**
 * Theme Provider Context
 * 
 * React context for storing and accessing theme state.
 */
const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(storageKey) as Theme) || defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

