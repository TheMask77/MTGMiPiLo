"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createTournament } from "@/app/actions/tournament-actions"
import { toast } from "@/components/ui/use-toast"

interface Deck {
  id: number
  name: string
  format: string
}

interface TournamentType {
  id: number
  name: string
}

interface NewTournamentFormProps {
  decks: Deck[]
  tournamentTypes: TournamentType[]
}

export function NewTournamentForm({ decks, tournamentTypes }: NewTournamentFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: "",
    format: "",
    deck: "",
    date: new Date().toISOString().split("T")[0],
    result: "",
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const isLeague = () => {
    const selectedType = tournamentTypes.find((t) => t.id.toString() === formData.type)
    return selectedType?.name.toLowerCase().includes("league")
  }

  const calculateLeaguePrize = (result: string) => {
    const match = result.match(/^(\d+)-(\d+)$/)
    if (!match) return null

    const wins = parseInt(match[1])
    const prizeTableLeagues: Record<number, { playPoints: number; chests: number; qps: number }> = {
      5: { playPoints: 150, chests: 11, qps: 5 },
      4: { playPoints: 120, chests: 5, qps: 2 },
      3: { playPoints: 100, chests: 1, qps: 1 },
      2: { playPoints: 50, chests: 0, qps: 0 },
      1: { playPoints: 0, chests: 0, qps: 0 },
      0: { playPoints: 0, chests: 0, qps: 0 },
    }

    const prize = prizeTableLeagues[Math.min(wins, 5)]
    const usdEstimate = prize.playPoints * 0.01 + prize.chests * 2.5
    return usdEstimate.toFixed(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value)
      })

      const result = await createTournament(formDataObj)

      if (result.success) {
        toast({
          title: "Tournament added",
          description: "Your tournament has been added successfully.",
        })
        router.push("/tournaments")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add tournament",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableFormats = [...new Set(decks.map((deck) => deck.format))]

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Add New Tournament</CardTitle>
          <CardDescription>Record a new tournament you've played in MTGO</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tournament Type</Label>
              <Select onValueChange={(value) => handleSelectChange("type", value)} required>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select tournament type" />
                </SelectTrigger>
                <SelectContent>
                  {tournamentTypes.length === 0 ? (
                    <SelectItem value="" disabled>
                      No tournament types available
                    </SelectItem>
                  ) : (
                    tournamentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Tournament Format</Label>
              <Select
                onValueChange={(value) => {
                  handleSelectChange("format", value)
                  handleSelectChange("deck", "") // Reset deck when format changes
                }}
                required
              >
                <SelectTrigger id="format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {availableFormats.length === 0 ? (
                    <SelectItem value="" disabled>
                      No formats available
                    </SelectItem>
                  ) : (
                    availableFormats.map((format) => (
                      <SelectItem key={format} value={format}>
                        {format}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deck">Deck Used</Label>
            <Select
              value={formData.deck}
              onValueChange={(value) => handleSelectChange("deck", value)}
              required
            >
              <SelectTrigger id="deck">
                <SelectValue placeholder={formData.format ? "Select deck" : "Select format first"} />
              </SelectTrigger>
              <SelectContent>
                {formData.format === "" ? (
                  <SelectItem value="Modern" disabled>
                    Select a format first
                  </SelectItem>
                ) : (
                  decks
                    .filter((deck) => deck.format === formData.format)
                    .map((deck) => (
                      <SelectItem key={deck.id} value={deck.id.toString()}>
                        {deck.name}
                      </SelectItem>
                    ))
                )}
                <SelectItem value="add_new">
                  <Link href="/decks/new" className="flex w-full">
                    + Add New Deck
                  </Link>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="result">Result (W-L)</Label>
              <Input
                id="result"
                name="result"
                placeholder="3-2"
                value={formData.result}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any additional notes about the tournament..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/tournaments">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || decks.length === 0 || tournamentTypes.length === 0}>
            {isSubmitting ? "Saving..." : "Save Tournament"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
