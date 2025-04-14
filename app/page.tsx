"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Shuffle, Loader2, Menu, ArrowRight, Navigation } from "lucide-react"
import quranData from "@/data/quranData.json"
import { useTheme } from "@/components/theme-provider"
import { SideNavigation } from "@/components/side-navigation"
import { NavigationDialog } from "@/components/navigation-dialog"
import { HizbTomonSelection } from "@/components/hizb-tomon-selection"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Process the Quran data for easier access
const processQuranData = () => {
  // Group verses by Surah
  const surahs = {}

  // Create a map of all surahs first
  quranData.forEach((ayah) => {
    const suraNo = ayah.sura_no.toString()
    if (!surahs[suraNo]) {
      surahs[suraNo] = {
        name: ayah.sura_name_ar,
        englishName: ayah.sura_name_en,
        verses: [],
      }
    }
  })

  // Then add all verses to their respective surahs
  quranData.forEach((ayah) => {
    const suraNo = ayah.sura_no.toString()
    surahs[suraNo].verses[ayah.aya_no - 1] = {
      id: ayah.id,
      text: ayah.aya_text,
      jozz: ayah.jozz,
      page: ayah.page,
      ayaNo: ayah.aya_no,
      lineStart: ayah.line_start,
      lineEnd: ayah.line_end,
      tomon: ayah.tomon,
      robuu: ayah.robuu,
      nisf: ayah.nisf,
      hizb: ayah.hizb,
    }
  })

  return surahs
}

export default function QuranMemorizer() {
  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isSelectionLoading, setIsSelectionLoading] = useState(false)
  const [isConfirmLoading, setIsConfirmLoading] = useState(false)

  // Process the Quran data
  const [processedData, setProcessedData] = useState({})
  const { theme, setTheme } = useTheme()

  // State to control initial setup and dialog
  const [initialSetup, setInitialSetup] = useState(true)

  // Side navigation state
  const [isSideNavOpen, setIsSideNavOpen] = useState(false)
  
  // Navigation dialog state
  const [isNavigationDialogOpen, setIsNavigationDialogOpen] = useState(false)

  // Qira'at selection state
  const [qiraatType, setQiraatType] = useState("hafs")

  // Marker visibility state
  const [showMarkers, setShowMarkers] = useState(true)

  // Memorization mode state
  const [memorizationMode, setMemorizationMode] = useState(false)
  const [revealedWords, setRevealedWords] = useState(0)

  // Selection mode state (surah or hizb)
  const [selectionMode, setSelectionMode] = useState("surah")

  // State for selected Surah range
  const [startSurah, setStartSurah] = useState("1")
  const [endSurah, setEndSurah] = useState("1")
  const [startVerse, setStartVerse] = useState("1")
  const [endVerse, setEndVerse] = useState("7") // Default to end of Al-Fatiha

  // State for selected Hizb/Tomon range
  const [startHizb, setStartHizb] = useState("1")
  const [endHizb, setEndHizb] = useState("1")
  const [startTomon, setStartTomon] = useState("1")
  const [endTomon, setEndTomon] = useState("8") // Default to end of first Hizb

  // State for current position
  const [currentSurah, setCurrentSurah] = useState("1")
  const [currentVerse, setCurrentVerse] = useState("1")

  // State for verse limits
  const [startVerseMax, setStartVerseMax] = useState(7)
  const [endVerseMax, setEndVerseMax] = useState(7)
  const [startVerseMin, setStartVerseMin] = useState(1)
  const [endVerseMin, setEndVerseMin] = useState(1)

  // Initialize data with loading state
  useEffect(() => {
    setIsLoading(true)
    // Simulate loading delay
    setTimeout(() => {
      setProcessedData(processQuranData())
      setIsLoading(false)
    }, 1000)
  }, [])

  // Load user preferences from localStorage
  useEffect(() => {
    const savedQiraatType = localStorage.getItem("qiraatType")
    if (savedQiraatType) {
      setQiraatType(savedQiraatType)
    }

    const savedShowMarkers = localStorage.getItem("showMarkers")
    if (savedShowMarkers !== null) {
      setShowMarkers(savedShowMarkers === "true")
    }

    const savedSelectionMode = localStorage.getItem("selectionMode")
    if (savedSelectionMode) {
      setSelectionMode(savedSelectionMode)
    }
  }, [])

  // Save user preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem("qiraatType", qiraatType)
    localStorage.setItem("showMarkers", showMarkers.toString())
    localStorage.setItem("selectionMode", selectionMode)
  }, [qiraatType, showMarkers, selectionMode])

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

  // Initialize current position when range changes
  useEffect(() => {
    setCurrentSurah(startSurah)
    setCurrentVerse(startVerse)
  }, [startSurah, startVerse])

  // Reset revealed words when verse changes or memorization mode is toggled
  useEffect(() => {
    setRevealedWords(0)
  }, [currentSurah, currentVerse, memorizationMode])

  // Handle navigation
  const goToNextVerse = () => {
    const currentSurahNum = Number.parseInt(currentSurah)
    const currentVerseNum = Number.parseInt(currentVerse)
    const endSurahNum = Number.parseInt(endSurah)
    const endVerseNum = Number.parseInt(endVerse)

    // If we're at the last verse of the current Surah
    if (currentVerseNum >= processedData[currentSurah].verses.length) {
      // If we're not at the last Surah in our range
      if (currentSurahNum < endSurahNum) {
        setCurrentSurah((currentSurahNum + 1).toString())
        setCurrentVerse("1")
      }
    } else {
      // If we're at the end of our range
      if (currentSurahNum === endSurahNum && currentVerseNum >= endVerseNum) {
        // Do nothing or loop back to start
        return
      }
      // Otherwise, go to next verse
      setCurrentVerse((currentVerseNum + 1).toString())
    }
  }

  const goToPrevVerse = () => {
    const currentSurahNum = Number.parseInt(currentSurah)
    const currentVerseNum = Number.parseInt(currentVerse)
    const startSurahNum = Number.parseInt(startSurah)
    const startVerseNum = Number.parseInt(startVerse)

    // If we're at the first verse of the current Surah
    if (currentVerseNum <= 1) {
      // If we're not at the first Surah in our range
      if (currentSurahNum > startSurahNum) {
        const prevSurah = (currentSurahNum - 1).toString()
        setCurrentSurah(prevSurah)
        setCurrentVerse(processedData[prevSurah].verses.length.toString())
      }
    } else {
      // If we're at the start of our range
      if (currentSurahNum === startSurahNum && currentVerseNum <= startVerseNum) {
        // Do nothing or loop to end
        return
      }
      // Otherwise, go to previous verse
      setCurrentVerse((currentVerseNum - 1).toString())
    }
  }

  const goToRandomVerse = () => {
    // Get all verse IDs in the selected range
    const allVerses = quranData.filter((ayah) => {
      const surahNum = ayah.sura_no
      const verseNum = ayah.aya_no

      return (
        (surahNum > Number(startSurah) || (surahNum === Number(startSurah) && verseNum >= Number(startVerse))) &&
        (surahNum < Number(endSurah) || (surahNum === Number(endSurah) && verseNum <= Number(endVerse)))
      )
    })

    if (allVerses.length === 0) return

    // Pick a random verse from the filtered list
    const randomAyah = allVerses[Math.floor(Math.random() * allVerses.length)]

    // Update the current Surah and verse
    setCurrentSurah(randomAyah.sura_no.toString())
    setCurrentVerse(randomAyah.aya_no.toString())
  }

  // Handle start memorizing (hide initial setup)
  const startMemorizing = () => {
    setIsConfirmLoading(true)
    // Simulate loading delay
    setTimeout(() => {
      setInitialSetup(false)
      setIsConfirmLoading(false)
    }, 800)
  }

  // Handle start Surah change
  const handleStartSurahChange = (value) => {
    setIsSelectionLoading(true)
    setStartSurah(value)
    setStartVerse("1")

    // If the new start Surah is after the current end Surah, update end Surah
    if (Number.parseInt(value) > Number.parseInt(endSurah)) {
      setEndSurah(value)
      const endAya = processedData[value].verses.length.toString()
      setEndVerse(endAya)
    }

    // Simulate loading delay
    setTimeout(() => {
      setIsSelectionLoading(false)
    }, 500)
  }

  // Handle end Surah change
  const handleEndSurahChange = (value) => {
    setIsSelectionLoading(true)
    setEndSurah(value)

    // If changing to a different Surah, reset end verse to 1
    if (value !== endSurah) {
      const endAya = processedData[value].verses.length.toString()
      setEndVerse(endAya)
    }

    // Simulate loading delay
    setTimeout(() => {
      setIsSelectionLoading(false)
    }, 500)
  }

  // Handle start verse change
  const handleStartVerseChange = (newValue) => {
    setIsSelectionLoading(true)
    setStartVerse(newValue)

    // Ensure endVerse stays valid
    if (startSurah === endSurah && Number.parseInt(newValue) > Number.parseInt(endVerse)) {
      setEndVerse(newValue)
    }

    // Simulate loading delay
    setTimeout(() => {
      setIsSelectionLoading(false)
    }, 300)
  }

  // Handle Hizb/Tomon selection confirmation
  const handleHizbTomonConfirm = (startHizb, startTomon, endHizb, endTomon) => {
    setStartHizb(startHizb)
    setStartTomon(startTomon)
    setEndHizb(endHizb)
    setEndTomon(endTomon)

    // Find the first verse that matches the starting Hizb and Tomon
    const startVerse = quranData.find(
      (ayah) => ayah.hizb.toString() === startHizb && ayah.tomon.toString() === startTomon,
    )

    // Find the last verse that matches the ending Hizb and Tomon
    const endVerses = quranData.filter((ayah) => ayah.hizb.toString() === endHizb && ayah.tomon.toString() === endTomon)
    const endVerse = endVerses[endVerses.length - 1]

    if (startVerse && endVerse) {
      // Update the Surah and Verse ranges to match the selected Hizb/Tomon range
      setStartSurah(startVerse.sura_no.toString())
      setStartVerse(startVerse.aya_no.toString())
      setEndSurah(endVerse.sura_no.toString())
      setEndVerse(endVerse.aya_no.toString())

      // Set current position to the start
      setCurrentSurah(startVerse.sura_no.toString())
      setCurrentVerse(startVerse.aya_no.toString())
    }

    // Hide the initial setup
    setInitialSetup(false)
  }

  // Handle revealing next word in memorization mode
  const revealNextWord = () => {
    const currentVerseObj = processedData[currentSurah]?.verses[Number.parseInt(currentVerse) - 1]
    const currentVerseText = currentVerseObj?.text || ""
    const words = currentVerseText.split(" ")

    if (revealedWords < words.length) {
      setRevealedWords(revealedWords + 1)
    } else {
      // If all words are revealed, go to the next aya
      goToNextVerse()
      // Reset revealed words for the new aya
      setRevealedWords(0)
    }
  }

  // Get current verse information
  const currentVerseObj = processedData[currentSurah]?.verses[Number.parseInt(currentVerse) - 1]
  const currentVerseText = currentVerseObj?.text || ""
  const currentSurahName = processedData[currentSurah]?.name || ""
  const currentSurahEnglishName = processedData[currentSurah]?.englishName || ""

  // Additional metadata from the new structure
  const currentJozz = currentVerseObj?.jozz || ""
  const currentPage = currentVerseObj?.page || ""
  const currentTomon = currentVerseObj?.tomon || ""
  const currentRobuu = currentVerseObj?.robuu || ""
  const currentNisf = currentVerseObj?.nisf || ""
  const currentHizb = currentVerseObj?.hizb || ""

  // Process verse text for word-by-word mode
  const processVerseForMemorization = (text) => {
    if (!memorizationMode) return text

    const words = text.split(" ")
    return words.map((word, index) => (
      <span key={index} className={index < revealedWords ? "opacity-100" : "opacity-0"}>
        {word}{" "}
      </span>
    ))
  }

  // Loading screen
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="text-xl font-semibold">Loading Quran Data...</h2>
        </div>
      </div>
    )
  }

  // If we're in initial setup, show the appropriate selection UI based on mode
  if (initialSetup) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full menu-trigger"
            onClick={() => setIsSideNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
          <h1 className="text-3xl font-bold text-right">مراجعة القرآن الكريم</h1>
        </div>

        {/* Side Navigation */}
        <SideNavigation
          isOpen={isSideNavOpen}
          onClose={() => setIsSideNavOpen(false)}
          qiraatType={qiraatType}
          setQiraatType={setQiraatType}
          showMarkers={showMarkers}
          setShowMarkers={setShowMarkers}
          memorizationMode={memorizationMode}
          setMemorizationMode={setMemorizationMode}
          selectionMode={selectionMode}
          setSelectionMode={setSelectionMode}
        />

        {selectionMode === "surah" ? (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-center">Select Verse Range</h2>
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
                        <Label htmlFor="startSurah">Surah</Label>
                        <Select value={startSurah} onValueChange={handleStartSurahChange} disabled={isSelectionLoading}>
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
                        <Select value={startVerse} onValueChange={handleStartVerseChange} disabled={isSelectionLoading}>
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
                    <h3 className="text-lg font-semibold mb-4">Ending Point</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="endSurah">Surah</Label>
                        <Select value={endSurah} onValueChange={handleEndSurahChange} disabled={isSelectionLoading}>
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
                        <Select
                          value={endVerse}
                          onValueChange={(value) => setEndVerse(value)}
                          disabled={isSelectionLoading}
                        >
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

                <div className="flex justify-center">
                  <Button onClick={startMemorizing} size="lg" disabled={isConfirmLoading}>
                    {isConfirmLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      "Start Memorizing"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <HizbTomonSelection
            quranData={quranData}
            processedData={processedData}
            onSelectionConfirm={handleHizbTomonConfirm}
            isSelectionLoading={isSelectionLoading}
          />
        )}
      </div>
    )
  }

  // Main app UI
  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen">
        <div className="w-full max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full menu-trigger"
              onClick={() => setIsSideNavOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
            <h1 className="text-3xl font-bold text-right">مراجعة القرآن الكريم</h1>
          </div>

          {/* Side Navigation */}
          <SideNavigation
            isOpen={isSideNavOpen}
            onClose={() => setIsSideNavOpen(false)}
            qiraatType={qiraatType}
            setQiraatType={setQiraatType}
            showMarkers={showMarkers}
            setShowMarkers={setShowMarkers}
            memorizationMode={memorizationMode}
            setMemorizationMode={setMemorizationMode}
            selectionMode={selectionMode}
            setSelectionMode={setSelectionMode}
          />

          {/* Range Selection - Inline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Start Range - Left */}
            <div className="flex flex-col space-y-2">
              <h3 className="text-sm font-medium">Starting Point</h3>
              <div className="flex space-x-2">
                <div className="w-3/5">
                  <Select value={startSurah} onValueChange={handleStartSurahChange} disabled={isSelectionLoading}>
                    <SelectTrigger id="startSurah" className="h-9">
                      <SelectValue placeholder="Surah" />
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
                <div className="w-2/5">
                  <Select value={startVerse} onValueChange={handleStartVerseChange} disabled={isSelectionLoading}>
                    <SelectTrigger id="startVerse" className="h-9">
                      <SelectValue placeholder="Verse" />
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

            {/* End Range - Right */}
            <div className="flex flex-col space-y-2">
              <h3 className="text-sm font-medium text-right">Ending Point</h3>
              <div className="flex space-x-2">
                <div className="w-3/5">
                  <Select value={endSurah} onValueChange={handleEndSurahChange} disabled={isSelectionLoading}>
                    <SelectTrigger id="endSurah" className="h-9">
                      <SelectValue placeholder="Surah" />
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
                <div className="w-2/5">
                  <Select value={endVerse} onValueChange={(value) => setEndVerse(value)} disabled={isSelectionLoading}>
                    <SelectTrigger id="endVerse" className="h-9">
                      <SelectValue placeholder="Verse" />
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

          {/* Verse Display */}
          <Card className="w-full mb-8">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {currentSurahName} ({currentSurahEnglishName})
                </h2>
              </div>

              <div className="flex justify-center space-x-4 mt-1 mb-6">
                {showMarkers ? (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Juzz {currentJozz}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Hizb {currentHizb}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nisf {currentNisf}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Robuu {currentRobuu}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tomon {currentTomon}</p>
                  </>
                ) : (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Juzz ?</p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Juzz {currentJozz}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Hizb ?</p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Hizb {currentHizb}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Nisf ?</p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Nisf {currentNisf}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Robuu ?</p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Robuu {currentRobuu}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tomon ?</p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tomon {currentTomon}</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">Verse {currentVerse}</p>
              </div>

              <div className="flex justify-center items-center my-12">
                <div className="max-h-48 overflow-y-auto p-4">
                  <p className="text-2xl text-center leading-loose font-arabic" dir="rtl">
                    {memorizationMode ? processVerseForMemorization(currentVerseText) : currentVerseText}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Dialog */}
        <NavigationDialog
          isOpen={isNavigationDialogOpen}
          onClose={() => setIsNavigationDialogOpen(false)}
          processedData={processedData}
          quranData={quranData}
          onSurahSelect={(surah) => {
            // Set the current surah and start from the first verse
            setCurrentSurah(surah)
            setCurrentVerse("1")
            // Update the range to cover the entire surah
            setStartSurah(surah)
            setStartVerse("1")
            setEndSurah(surah)
            setEndVerse(processedData[surah].verses.length.toString())
          }}
          onAyaIntervalSelect={(startSurah, startVerse, endSurah, endVerse) => {
            // Set the current position to the start of the selected range
            setCurrentSurah(startSurah)
            setCurrentVerse(startVerse)
            // Update the range
            setStartSurah(startSurah)
            setStartVerse(startVerse)
            setEndSurah(endSurah)
            setEndVerse(endVerse)
          }}
          onHizbTomonSelect={(startHizb, startTomon, endHizb, endTomon) => {
            // Handle Hizb/Tomon selection similar to the existing handleHizbTomonConfirm function
            setStartHizb(startHizb)
            setStartTomon(startTomon)
            setEndHizb(endHizb)
            setEndTomon(endTomon)

            // Find the first verse that matches the starting Hizb and Tomon
            const startVerse = quranData.find(
              (ayah) => ayah.hizb.toString() === startHizb && ayah.tomon.toString() === startTomon,
            )

            // Find the last verse that matches the ending Hizb and Tomon
            const endVerses = quranData.filter((ayah) => ayah.hizb.toString() === endHizb && ayah.tomon.toString() === endTomon)
            const endVerse = endVerses[endVerses.length - 1]

            if (startVerse && endVerse) {
              // Update the Surah and Verse ranges to match the selected Hizb/Tomon range
              setStartSurah(startVerse.sura_no.toString())
              setStartVerse(startVerse.aya_no.toString())
              setEndSurah(endVerse.sura_no.toString())
              setEndVerse(endVerse.aya_no.toString())

              // Set current position to the start
              setCurrentSurah(startVerse.sura_no.toString())
              setCurrentVerse(startVerse.aya_no.toString())
            }
          }}
          currentSurah={currentSurah}
          currentVerse={currentVerse}
          isSelectionLoading={isSelectionLoading}
        />

        {/* Navigation Controls - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 py-4 shadow-lg flex justify-center space-x-4">
          <Button onClick={goToPrevVerse} variant="outline" size="icon" className="h-12 w-12 rounded-full">
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous Verse</span>
          </Button>

          <Button onClick={goToRandomVerse} variant="secondary" size="icon" className="h-12 w-12 rounded-full">
            <Shuffle className="h-6 w-6" />
            <span className="sr-only">Random Verse</span>
          </Button>

          <Button 
            onClick={() => setIsNavigationDialogOpen(true)} 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 rounded-full"
          >
            <Navigation className="h-6 w-6" />
            <span className="sr-only">Navigate</span>
          </Button>

          {memorizationMode && (
            <Button
              onClick={revealNextWord}
              variant={revealedWords > 0 ? "default" : "outline"}
              size="icon"
              className="h-12 w-12 rounded-full"
            >
              <ArrowRight className="h-6 w-6" />
              <span className="sr-only">Show Next Word</span>
            </Button>
          )}

          <Button onClick={goToNextVerse} size="icon" className="h-12 w-12 rounded-full">
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next Verse</span>
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}

