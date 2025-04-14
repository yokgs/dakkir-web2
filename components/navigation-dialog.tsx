"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface NavigationDialogProps {
  isOpen: boolean
  onClose: () => void
  processedData: Record<string, any>
  quranData: any[]
  onSurahSelect: (surah: string) => void
  onAyaIntervalSelect: (startSurah: string, startVerse: string, endSurah: string, endVerse: string) => void
  onHizbTomonSelect: (startHizb: string, startTomon: string, endHizb: string, endTomon: string) => void
  currentSurah: string
  currentVerse: string
  isSelectionLoading: boolean
}

export function NavigationDialog({
  isOpen,
  onClose,
  processedData,
  quranData,
  onSurahSelect,
  onAyaIntervalSelect,
  onHizbTomonSelect,
  currentSurah,
  currentVerse,
  isSelectionLoading,
}: NavigationDialogProps) {
  // Navigation mode state
  const [navigationMode, setNavigationMode] = useState<"surah" | "aya" | "hizb">("surah")

  // Surah selection state
  const [selectedSurah, setSelectedSurah] = useState(currentSurah)

  // Aya interval selection state
  const [startSurah, setStartSurah] = useState(currentSurah)
  const [endSurah, setEndSurah] = useState(currentSurah)
  const [startVerse, setStartVerse] = useState(currentVerse)
  const [endVerse, setEndVerse] = useState(currentVerse)

  // Hizb/Tomon selection state
  const [startHizb, setStartHizb] = useState("1")
  const [endHizb, setEndHizb] = useState("1")
  const [startTomon, setStartTomon] = useState("1")
  const [endTomon, setEndTomon] = useState("8")

  // Verse limits
  const [startVerseMax, setStartVerseMax] = useState(7)
  const [endVerseMax, setEndVerseMax] = useState(7)
  const [startVerseMin, setStartVerseMin] = useState(1)
  const [endVerseMin, setEndVerseMin] = useState(1)

  // Process Quran data to get Hizb information
  const hizbData = {};

  // Initialize all 60 Hizbs
  for (let i = 1; i <= 60; i++) {
    hizbData[i.toString()] = {
      jozz: Math.ceil(i / 2), // Each Juz has 2 Hizbs
      tomons: {},
      firstVerse: "",
    }
  }

  // Populate Tomons for each Hizb
  if (quranData && quranData.length > 0) {
    quranData.forEach((ayah) => {
      const hizbNo = ayah.hizb.toString()
      const tomonNo = ayah.tomon.toString()

      if (!hizbData[hizbNo].tomons[tomonNo]) {
        hizbData[hizbNo].tomons[tomonNo] = {
          robuu: Math.ceil(Number.parseInt(tomonNo) / 2), // Each Rub' has 2 Tomons
          firstVerse: ayah.aya_text.substring(0, 30) + "...",
        }
      }

      // Set first verse of the Hizb if not set yet
      if (!hizbData[hizbNo].firstVerse) {
        hizbData[hizbNo].firstVerse = ayah.aya_text.substring(0, 30) + "..."
      }
    })
  }

  // Update verse limits when Surahs change
  useEffect(() => {
    if (processedData[startSurah]) {
      setStartVerseMax(processedData[startSurah].verses.length)
    }
    if (processedData[endSurah]) {
      setEndVerseMax(processedData[endSurah].verses.length)
    }

    // If start and end Surahs are the same, update min/max values
    if (startSurah === endSurah) {
      setEndVerseMin(Number.parseInt(startVerse))

      // If end verse is less than start verse, update it
      if (Number.parseInt(endVerse) < Number.parseInt(startVerse)) {
        setEndVerse(startVerse)
      }
    } else {
      setEndVerseMin(1)
    }
  }, [startSurah, endSurah, startVerse, endVerse, processedData])

  // Handle start Surah change
  const handleStartSurahChange = (value) => {
    setStartSurah(value)
    setStartVerse("1")

    // If the new start Surah is after the current end Surah, update end Surah
    if (Number.parseInt(value) > Number.parseInt(endSurah)) {
      setEndSurah(value)
      const endAya = processedData[value].verses.length.toString()
      setEndVerse(endAya)
    }
  }

  // Handle end Surah change
  const handleEndSurahChange = (value) => {
    setEndSurah(value)

    // If changing to a different Surah, reset end verse to last verse
    if (value !== endSurah) {
      const endAya = processedData[value].verses.length.toString()
      setEndVerse(endAya)
    }
  }

  // Handle start verse change
  const handleStartVerseChange = (newValue) => {
    setStartVerse(newValue)

    // Ensure endVerse stays valid
    if (startSurah === endSurah && Number.parseInt(newValue) > Number.parseInt(endVerse)) {
      setEndVerse(newValue)
    }
  }

  // Handle Hizb changes
  const handleStartHizbChange = (value) => {
    setStartHizb(value)
    
    // Always reset to first Tomon when changing Hizb
    setStartTomon("1")

    // If the new start Hizb is after the current end Hizb, update end Hizb
    const startHizbNum = Number.parseInt(value)
    const endHizbNum = Number.parseInt(endHizb)
    
    if (startHizbNum > endHizbNum) {
      setEndHizb(value)
      setEndTomon("8") // Default to last Tomon
    }
  }

  const handleEndHizbChange = (value) => {
    setEndHizb(value)

    // If changing to a different Hizb, reset end Tomon to 8 (last)
    if (value !== endHizb) {
      setEndTomon("8")
    }
  }

  // Handle Tomon changes
  const handleStartTomonChange = (value) => {
    setStartTomon(value)

    // Ensure endTomon stays valid when in the same Hizb
    if (startHizb === endHizb) {
      const startTomonNum = Number.parseInt(value)
      const endTomonNum = Number.parseInt(endTomon)
      
      if (startTomonNum > endTomonNum) {
        setEndTomon(value)
      }
    }
  }
  
  // Handle end Tomon changes
  const handleEndTomonChange = (value) => {
    setEndTomon(value)
  }

  // Handle navigation selection
  const handleNavigate = () => {
    switch (navigationMode) {
      case "surah":
        onSurahSelect(selectedSurah)
        break
      case "aya":
        onAyaIntervalSelect(startSurah, startVerse, endSurah, endVerse)
        break
      case "hizb":
        onHizbTomonSelect(startHizb, startTomon, endHizb, endTomon)
        break
    }
    onClose()
  }

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setNavigationMode("surah")
      setSelectedSurah(currentSurah)
      setStartSurah(currentSurah)
      setEndSurah(currentSurah)
      setStartVerse(currentVerse)
      setEndVerse(currentVerse)
    }
  }, [isOpen, currentSurah, currentVerse])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Navigate to</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Navigation Mode Selection */}
          <RadioGroup value={navigationMode} onValueChange={(value: "surah" | "aya" | "hizb") => setNavigationMode(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="surah" id="surah-mode" />
              <Label htmlFor="surah-mode">Surah</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="aya" id="aya-mode" />
              <Label htmlFor="aya-mode">Aya Interval</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hizb" id="hizb-mode" />
              <Label htmlFor="hizb-mode">Hizb/Tomon</Label>
            </div>
          </RadioGroup>

          {/* Surah Selection */}
          {navigationMode === "surah" && (
            <div className="space-y-4">
              <Label htmlFor="surah">Select Surah</Label>
              <Select value={selectedSurah} onValueChange={setSelectedSurah}>
                <SelectTrigger id="surah">
                  <SelectValue placeholder="Select Surah" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(processedData).map((surahNum) => (
                    <SelectItem key={`surah-${surahNum}`} value={surahNum}>
                      {surahNum}. {processedData[surahNum].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Aya Interval Selection */}
          {navigationMode === "aya" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Starting Point</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="startSurah">Surah</Label>
                      <Select value={startSurah} onValueChange={handleStartSurahChange}>
                        <SelectTrigger id="startSurah">
                          <SelectValue placeholder="Select Surah" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(processedData).map((surahNum) => (
                            <SelectItem key={`start-${surahNum}`} value={surahNum}>
                              {surahNum}. {processedData[surahNum].name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="startVerse">Verse</Label>
                      <Select value={startVerse} onValueChange={handleStartVerseChange}>
                        <SelectTrigger id="startVerse">
                          <SelectValue placeholder="Select Verse" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: startVerseMax }, (_, i) => i + 1).map((verseNum) => (
                            <SelectItem key={`start-verse-${verseNum}`} value={verseNum.toString()}>
                              {verseNum}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Ending Point</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="endSurah">Surah</Label>
                      <Select value={endSurah} onValueChange={handleEndSurahChange}>
                        <SelectTrigger id="endSurah">
                          <SelectValue placeholder="Select Surah" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(processedData)
                            .filter((surahNum) => Number.parseInt(surahNum) >= Number.parseInt(startSurah))
                            .map((surahNum) => (
                              <SelectItem key={`end-${surahNum}`} value={surahNum}>
                                {surahNum}. {processedData[surahNum].name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="endVerse">Verse</Label>
                      <Select value={endVerse} onValueChange={(value) => setEndVerse(value)}>
                        <SelectTrigger id="endVerse">
                          <SelectValue placeholder="Select Verse" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: endVerseMax - endVerseMin + 1 }, (_, i) => i + endVerseMin).map(
                            (verseNum) => (
                              <SelectItem key={`end-verse-${verseNum}`} value={verseNum.toString()}>
                                {verseNum}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hizb/Tomon Selection */}
          {navigationMode === "hizb" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Starting Point</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="startHizb">Hizb</Label>
                      <Select value={startHizb} onValueChange={handleStartHizbChange}>
                        <SelectTrigger id="startHizb">
                          <SelectValue placeholder="Select Hizb" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(hizbData).map((hizbNum) => (
                            <SelectItem key={`start-hizb-${hizbNum}`} value={hizbNum}>
                              Hizb {hizbNum} | Juzz {hizbData[hizbNum]?.jozz}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="startTomon">Tomon</Label>
                      <Select value={startTomon} onValueChange={handleStartTomonChange}>
                        <SelectTrigger id="startTomon">
                          <SelectValue placeholder="Select Tomon" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((tomonNum) => (
                            <SelectItem key={`start-tomon-${tomonNum}`} value={tomonNum.toString()}>
                              Tomon {tomonNum}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Ending Point</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="endHizb">Hizb</Label>
                      <Select value={endHizb} onValueChange={handleEndHizbChange}>
                        <SelectTrigger id="endHizb">
                          <SelectValue placeholder="Select Hizb" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(hizbData)
                            .filter((hizbNum) => Number.parseInt(hizbNum) >= Number.parseInt(startHizb))
                            .map((hizbNum) => (
                              <SelectItem key={`end-hizb-${hizbNum}`} value={hizbNum}>
                                Hizb {hizbNum} | Juzz {hizbData[hizbNum]?.jozz}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="endTomon">Tomon</Label>
                      <Select 
                        value={endTomon} 
                        onValueChange={handleEndTomonChange}
                        disabled={startHizb === endHizb && Number.parseInt(startTomon) > Number.parseInt(endTomon)}
                      >
                        <SelectTrigger id="endTomon">
                          <SelectValue placeholder="Select Tomon" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8]
                            .filter(tomonNum => !(startHizb === endHizb && tomonNum < Number.parseInt(startTomon)))
                            .map((tomonNum) => (
                              <SelectItem key={`end-tomon-${tomonNum}`} value={tomonNum.toString()}>
                                Tomon {tomonNum}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleNavigate} disabled={isSelectionLoading}>
            {isSelectionLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Navigate"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}