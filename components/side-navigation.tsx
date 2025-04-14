"use client"

/**
 * SideNavigation Component
 * 
 * A sidebar navigation component that provides various settings and options
 * for the Quran Memorization Assistant application.
 */

// React imports
import { useEffect } from "react"

// UI component imports
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

// Icon imports
import { Sun, X, Eye, EyeOff, Brain } from "lucide-react"

// Utility imports
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

/**
 * SideNavigationProps Interface
 * 
 * @property isOpen - Whether the side navigation is open
 * @property onClose - Function to close the side navigation
 * @property qiraatType - The current Qira'at type
 * @property setQiraatType - Function to set the Qira'at type
 * @property showMarkers - Whether to show markers
 * @property setShowMarkers - Function to toggle marker visibility
 * @property memorizationMode - Whether memorization mode is active
 * @property setMemorizationMode - Function to toggle memorization mode
 * @property selectionMode - The current selection mode (surah or hizb)
 * @property setSelectionMode - Function to set the selection mode
 */
interface SideNavigationProps {
  isOpen: boolean
  onClose: () => void
  qiraatType: string
  setQiraatType: (type: string) => void
  showMarkers: boolean
  setShowMarkers: (show: boolean) => void
  memorizationMode: boolean
  setMemorizationMode: (active: boolean) => void
  selectionMode: string
  setSelectionMode: (mode: string) => void
}

/**
 * SideNavigation Component
 * 
 * A sidebar that contains various settings and options for the application.
 */
export function SideNavigation({
  isOpen,
  onClose,
  qiraatType,
  setQiraatType,
  showMarkers,
  setShowMarkers,
  memorizationMode,
  setMemorizationMode,
  selectionMode,
  setSelectionMode,
}: SideNavigationProps) {
  const { theme, setTheme } = useTheme()

  // Close menu when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isOpen && !target.closest(".side-nav") && !target.closest(".menu-trigger")) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Prevent scrolling when menu is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Side Navigation */}
      <div
        className={cn(
          "side-nav fixed top-0 left-0 h-full w-[280px] bg-background border-r z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-semibold">Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Theme Toggle */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Appearance</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <span>Dark Mode</span>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              />
            </div>
          </div>

          {/* Qira'at Selection */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Riwaya</h3>
            <RadioGroup value={qiraatType} onValueChange={setQiraatType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hafs" id="hafs" />
                <Label htmlFor="hafs">Hafs</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="warsh" id="warsh" />
                <Label htmlFor="warsh">Warsh</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Show/Hide Markers */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Display Options</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {showMarkers ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span>Show Quran Markers</span>
              </div>
              <Switch checked={showMarkers} onCheckedChange={setShowMarkers} />
            </div>
          </div>

          {/* Memorization Mode */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Memorization</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>Word-by-Word Mode</span>
              </div>
              <Switch checked={memorizationMode} onCheckedChange={setMemorizationMode} />
            </div>
          </div>

          {/* Selection Mode */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Selection Mode</h3>
            <RadioGroup value={selectionMode} onValueChange={setSelectionMode}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="surah" id="surah-mode" />
                <Label htmlFor="surah-mode">Surah & Verse</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hizb" id="hizb-mode" />
                <Label htmlFor="hizb-mode">Hizb & Tomon</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </>
  )
}

