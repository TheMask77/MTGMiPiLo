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
    deck: "",
    date: new Date().toISOString().split("T")[0],
    cost: "",
    result: "",
    prize: "",
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
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

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Add New Tournament</CardTitle>
          <CardDescription>Record a new tournament you've played in MtGO</CardDescription>
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
              <Label htmlFor="deck">Deck Used</Label>
              <Select onValueChange={(value) => handleSelectChange("deck", value)} required>
                <SelectTrigger id="deck">
                  <SelectValue placeholder="Select deck" />
                </SelectTrigger>
                <SelectContent>
                  {decks.length === 0 ? (
                    <SelectItem value="" disabled>
                      No decks available
                    </SelectItem>
                  ) : (
                    decks.map((deck) => (
                      <SelectItem key={deck.id} value={deck.id.toString()}>
                        {deck.name} ({deck.format})
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Entry Cost ($)</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                placeholder="8.00"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="prize">Prize Value ($)</Label>
              <Input
                id="prize"
                name="prize"
                type="number"
                placeholder="12.00"
                min="0"
                step="0.01"
                value={formData.prize}
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
