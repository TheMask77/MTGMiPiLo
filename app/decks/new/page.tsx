import { NewDeckForm } from "@/components/new-deck-form"
import { getFormats } from "@/app/actions/deck-actions"

export default async function NewDeckPage() {
  const { success, data: formats } = await getFormats()

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto w-full max-w-2xl">
          <NewDeckForm formats={success ? (formats ?? []).map((f: any) => ({ id: f.id, name: f.name })) : []} />
        </div>
      </main>
    </div>
  )
}
