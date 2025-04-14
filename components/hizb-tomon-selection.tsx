"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

// Define interfaces for the Quran data structure
interface QuranAyah {
  id: number
  jozz: number
  page: string
  sura_no: number
  sura_name_en: string
  sura_name_ar: string
  line_start: number
  line_end: number
  aya_no: number
  aya_text: string
  tomon_id: number
  tomon: number
  robuu_id: number
  robuu: number
  nisf_id: number
  nisf: number
  hizb: number
}

// Define interfaces for the processed data
interface TomonData {
  robuu: number
  firstVerse: string
}

interface HizbData {
  jozz: number
  tomons: Record<string, TomonData>
  firstVerse: string
}

interface HizbTomonSelectionProps {
  quranData: QuranAyah[]
  processedData: Record<string, any> // Not used in this component but required by parent
  onSelectionConfirm: (startHizb: string, startTomon: string, endHizb: string, endTomon: string) => void
  isSelectionLoading: boolean
}

export function HizbTomonSelection({
  quranData,
  processedData,
  onSelectionConfirm,
  isSelectionLoading,
}: HizbTomonSelectionProps) {
  // State for selected Hizb/Tomon range
  const [startHizb, setStartHizb] = useState("1")
  const [endHizb, setEndHizb] = useState("1")
  const [startTomon, setStartTomon] = useState("1")
  const [endTomon, setEndTomon] = useState("8") // Default to end of first Hizb
  const [isConfirmLoading, setIsConfirmLoading] = useState(false)

  // Process Quran data to get Hizb information using useMemo for performance
  const hizbData = useMemo(() => {
    // Process the Quran data to extract Hizb information
    const hizbs: Record<string, HizbData> = {}

    // Initialize all 60 Hizbs
    for (let i = 1; i <= 60; i++) {
      hizbs[i.toString()] = {
        jozz: Math.ceil(i / 2), // Each Juz has 2 Hizbs
        tomons: {},
        firstVerse: "",
      }
    }

    // Populate Tomons for each Hizb
    quranData.forEach((ayah) => {
      const hizbNo = ayah.hizb.toString()
      const tomonNo = ayah.tomon.toString()

      if (!hizbs[hizbNo].tomons[tomonNo]) {
        hizbs[hizbNo].tomons[tomonNo] = {
          robuu: Math.ceil(Number.parseInt(tomonNo) / 2), // Each Rub' has 2 Tomons
          firstVerse: ayah.aya_text.substring(0, 30) + "...",
        }
      }

      // Set first verse of the Hizb if not set yet
      if (!hizbs[hizbNo].firstVerse) {
        hizbs[hizbNo].firstVerse = ayah.aya_text.substring(0, 30) + "..."
      }
    })

    return hizbs
  }, [quranData]) // Only recalculate when quranData changes

  // Handle Hizb changes with proper typing
  const handleStartHizbChange = (value: string): void => {
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

  const handleEndHizbChange = (value: string): void => {
    setEndHizb(value)

    // If changing to a different Hizb, reset end Tomon to 8 (last)
    if (value !== endHizb) {
      setEndTomon("8")
    }
  }

  // Handle Tomon changes with proper typing
  const handleStartTomonChange = (value: string): void => {
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
  const handleEndTomonChange = (value: string): void => {
    setEndTomon(value)
  }

  // Handle confirmation with async/await pattern
  const handleConfirm = async (): Promise<void> => {
    setIsConfirmLoading(true)
    
    try {
      // Simulate loading delay with Promise
      await new Promise(resolve => setTimeout(resolve, 800))
      onSelectionConfirm(startHizb, startTomon, endHizb, endTomon)
    } catch (error) {
      console.error('Error confirming selection:', error)
    } finally {
      setIsConfirmLoading(false)
    }
  }

  return (
    <Card className="mb-8 relative">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-center">Select Hizb & Tomon Range</h2>

        {isSelectionLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Starting Point</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="startHizb">Hizb</Label>
                  <Select 
                    value={startHizb} 
                    onValueChange={handleStartHizbChange} 
                    disabled={isSelectionLoading}
                    aria-label="Select starting Hizb"
                  >
                    <SelectTrigger id="startHizb">
                      <SelectValue placeholder="Select Hizb" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(hizbData).map((hizbNum) => (
                        <SelectItem key={`start-hizb-${hizbNum}`} value={hizbNum}>
                          Hizb {hizbNum} | Juzz {hizbData[hizbNum]?.jozz} | {hizbData[hizbNum]?.firstVerse}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startTomon">Tomon</Label>
                  <Select 
                    value={startTomon} 
                    onValueChange={handleStartTomonChange} 
                    disabled={isSelectionLoading}
                    aria-label="Select starting Tomon"
                  >
                    <SelectTrigger id="startTomon">
                      <SelectValue placeholder="Select Tomon" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(hizbData[startHizb]?.tomons || {}).map((tomonNum) => (
                        <SelectItem key={`start-tomon-${tomonNum}`} value={tomonNum}>
                          Tomon {tomonNum} | Robuu {hizbData[startHizb]?.tomons[tomonNum]?.robuu} | 
                          {hizbData[startHizb]?.tomons[tomonNum]?.firstVerse}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Ending Point</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="endHizb">Hizb</Label>
                  <Select 
                    value={endHizb} 
                    onValueChange={handleEndHizbChange} 
                    disabled={isSelectionLoading}
                    aria-label="Select ending Hizb"
                  >
                    <SelectTrigger id="endHizb">
                      <SelectValue placeholder="Select Hizb" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(hizbData)
                        .filter((hizbNum) => Number.parseInt(hizbNum) >= Number.parseInt(startHizb))
                        .map((hizbNum) => (
                          <SelectItem key={`end-hizb-${hizbNum}`} value={hizbNum}>
                            Hizb {hizbNum} | Juzz {hizbData[hizbNum]?.jozz} | {hizbData[hizbNum]?.firstVerse}
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
                    disabled={isSelectionLoading}
                    aria-label="Select ending Tomon"
                  >
                    <SelectTrigger id="endTomon">
                      <SelectValue placeholder="Select Tomon" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(hizbData[endHizb]?.tomons || {})
                        .filter(
                          (tomonNum) =>
                            startHizb !== endHizb || Number.parseInt(tomonNum) >= Number.parseInt(startTomon)
                        )
                        .map((tomonNum) => (
                          <SelectItem key={`end-tomon-${tomonNum}`} value={tomonNum}>
                            Tomon {tomonNum} | Robuu {hizbData[endHizb]?.tomons[tomonNum]?.robuu} | 
                            {hizbData[endHizb]?.tomons[tomonNum]?.firstVerse}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={handleConfirm} 
              size="lg" 
              disabled={isConfirmLoading}
              aria-label="Apply Hizb and Tomon selection"
            >
              {isConfirmLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                "Apply Changes"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

