import { NewTournamentForm } from "@/components/new-tournament-form"
import { getDecks } from "@/app/actions/deck-actions"
import { getTournamentTypes } from "@/app/actions/tournament-type-actions"

export default async function NewTournamentPage() {
  const { success: decksSuccess, data: decks } = await getDecks()
  const { success: typesSuccess, data: tournamentTypes } = await getTournamentTypes()

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto w-full max-w-2xl">
          <NewTournamentForm decks={decksSuccess ? decks : []} tournamentTypes={typesSuccess ? tournamentTypes : []} />
        </div>
      </main>
    </div>
  )
}
